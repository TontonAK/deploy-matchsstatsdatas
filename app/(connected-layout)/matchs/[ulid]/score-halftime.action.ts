"use server";

import { actionUser, SafeError } from "@/lib/safe-action-client";
import { createOrUpdateHalftimeScore } from "@/database/matchs/create-or-update-score-halftime";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const scoreHalftimeSchema = z.object({
  matchId: z.number().positive("L'ID du match est requis"),
  homeScore: z.number().min(0, "Le score de l'équipe à domicile doit être positif ou nul"),
  awayScore: z.number().min(0, "Le score de l'équipe à l'extérieur doit être positif ou nul"),
});

export const scoreHalftimeAction = actionUser
  .inputSchema(scoreHalftimeSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier les permissions : Admin ou Coach
    if (user.job !== "Admin" && user.job !== "Coach") {
      throw new SafeError("Seuls les administrateurs et entraîneurs peuvent modifier le score à la mi-temps");
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
        homeTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: {
              select: {
                name: true,
              },
            },
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: {
              select: {
                name: true,
              },
            },
          },
        },
        halfTimeScore: {
          select: {
            id: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    });

    if (!match) {
      throw new SafeError("Match non trouvé");
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
        throw new SafeError("Vous n'avez pas l'autorisation de modifier le score à la mi-temps pour ce match");
      }
    }

    try {
      // Créer ou mettre à jour le score à la mi-temps
      const result = await createOrUpdateHalftimeScore({
        matchId: input.matchId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
      });

      if (!result.success) {
        throw new SafeError(result.error || "Erreur lors de l'enregistrement du score à la mi-temps");
      }

      return {
        success: true,
        message: result.isUpdate
          ? "Score à la mi-temps mis à jour avec succès"
          : "Score à la mi-temps enregistré avec succès",
        data: {
          halftimeScore: result.halftimeScore,
          isUpdate: result.isUpdate,
          match: {
            homeTeam: {
              name: match.homeTeam.name,
              clubName: match.homeTeam.club.name,
            },
            awayTeam: {
              name: match.awayTeam.name,
              clubName: match.awayTeam.club.name,
            },
          },
        },
      };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du score à la mi-temps:", error);
      if (error instanceof SafeError) {
        throw error;
      }
      throw new SafeError("Erreur lors de l'enregistrement du score à la mi-temps");
    }
  });