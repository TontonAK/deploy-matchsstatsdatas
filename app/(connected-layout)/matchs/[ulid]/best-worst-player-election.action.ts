"use server";

import { actionUser, SafeError } from "@/lib/safe-action-client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bestWorstPlayerElectionSchema = z.object({
  matchId: z.number().positive("L'ID du match est requis"),
  bestPlayerId: z.string().min(1, "Le Greg of the match doit être sélectionné"),
  worstPlayerId: z.string().min(1, "Le Boulichon doit être sélectionné"),
  worstPlayerReason: z.string().optional(),
});

export const bestWorstPlayerElectionAction = actionUser
  .inputSchema(bestWorstPlayerElectionSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier les permissions : Admin ou Coach
    if (user.job !== "Admin" && user.job !== "Coach") {
      throw new SafeError("Seuls les administrateurs et entraîneurs peuvent effectuer cette élection");
    }

    // Récupérer les détails du match
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      select: {
        id: true,
        status: true,
        endingStatus: true,
        homeTeamId: true,
        awayTeamId: true,
        bestPlayer: true,
        worstPlayer: true,
        homeTeam: {
          select: {
            clubId: true,
          },
        },
        awayTeam: {
          select: {
            clubId: true,
          },
        },
      },
    });

    if (!match) {
      throw new SafeError("Match non trouvé");
    }

    // Vérifier que le match est terminé et que les stats ne sont pas encore envoyées
    if (match.status !== "Finish" || match.endingStatus !== "Stat_Not_Sending") {
      throw new SafeError("Cette élection n'est possible que pour les matchs terminés en attente de validation des statistiques");
    }

    // Vérifier si les élections ont déjà été faites
    if (match.bestPlayer || match.worstPlayer) {
      throw new SafeError("Les élections ont déjà été effectuées pour ce match");
    }

    // Vérifier que l'utilisateur appartient à une des équipes du match ou est admin global
    if (user.role !== "admin") {
      const userTeams = await prisma.playerTeams.findMany({
        where: {
          playerId: user.id,
        },
        include: {
          team: {
            select: {
              clubId: true,
            },
          },
        },
      });

      const userClubIds = userTeams.map(team => team.team.clubId);
      const matchClubIds = [match.homeTeam.clubId, match.awayTeam.clubId];

      const hasAccess = userClubIds.some(clubId => matchClubIds.includes(clubId));

      if (!hasAccess) {
        throw new SafeError("Vous n'avez pas l'autorisation d'effectuer cette élection pour ce match");
      }
    }

    // Vérifier que les joueurs sélectionnés sont dans la lineup du match
    const lineup = await prisma.matchLineup.findMany({
      where: {
        matchId: input.matchId,
        playerId: {
          in: [input.bestPlayerId, input.worstPlayerId],
        },
      },
    });

    if (lineup.length !== 2) {
      throw new SafeError("Les joueurs sélectionnés doivent faire partie de la feuille de match");
    }

    // Vérifier que les joueurs appartiennent à l'équipe de l'utilisateur (sauf admin global)
    if (user.role !== "admin") {
      const userTeams = await prisma.playerTeams.findMany({
        where: {
          playerId: user.id,
        },
        include: {
          team: {
            select: {
              clubId: true,
            },
          },
        },
      });

      const userClubIds = userTeams.map(team => team.team.clubId);

      // Vérifier que les joueurs sélectionnés appartiennent à une équipe du même club que l'utilisateur
      const selectedPlayersTeams = await prisma.playerTeams.findMany({
        where: {
          playerId: {
            in: [input.bestPlayerId, input.worstPlayerId],
          },
        },
        include: {
          team: {
            select: {
              clubId: true,
            },
          },
        },
      });

      const selectedPlayersClubIds = selectedPlayersTeams.map(pt => pt.team.clubId);
      const hasAccessToSelectedPlayers = selectedPlayersClubIds.every(clubId =>
        userClubIds.includes(clubId)
      );

      if (!hasAccessToSelectedPlayers) {
        throw new SafeError("Vous ne pouvez élire que des joueurs de votre club");
      }
    }

    try {
      // Enregistrer les élections dans une transaction
      const result = await prisma.$transaction(async (tx) => {
        // Créer l'enregistrement pour le meilleur joueur
        const bestPlayer = await tx.matchBestPlayer.create({
          data: {
            matchId: input.matchId,
            playerId: input.bestPlayerId,
          },
          include: {
            player: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                slug: true,
              },
            },
          },
        });

        // Créer l'enregistrement pour le pire joueur
        const worstPlayer = await tx.matchWorstPlayer.create({
          data: {
            matchId: input.matchId,
            playerId: input.worstPlayerId,
            reason: input.worstPlayerReason,
          },
          include: {
            player: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                slug: true,
              },
            },
          },
        });

        return { bestPlayer, worstPlayer };
      });

      return {
        success: true,
        message: "Élections enregistrées avec succès",
        data: {
          bestPlayer: {
            id: result.bestPlayer.id,
            player: {
              id: result.bestPlayer.player.id,
              name: `${result.bestPlayer.player.firstname} ${result.bestPlayer.player.lastname}`,
              slug: result.bestPlayer.player.slug,
            },
          },
          worstPlayer: {
            id: result.worstPlayer.id,
            player: {
              id: result.worstPlayer.player.id,
              name: `${result.worstPlayer.player.firstname} ${result.worstPlayer.player.lastname}`,
              slug: result.worstPlayer.player.slug,
            },
            reason: result.worstPlayer.reason,
          },
        },
      };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des élections:", error);
      throw new SafeError("Erreur lors de l'enregistrement des élections");
    }
  });