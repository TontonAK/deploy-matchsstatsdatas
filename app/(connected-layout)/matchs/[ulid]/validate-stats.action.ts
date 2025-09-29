"use server";

import { updateMatchStatus } from "@/database/matchs/update-match";
import { actionUser } from "@/lib/safe-action-client";
import { SafeActionError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const validateStatsSchema = z.object({
  matchId: z.number().positive("L'ID du match est requis"),
});

export const validateMatchStatsAction = actionUser
  .inputSchema(validateStatsSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier que l'utilisateur a le rôle Admin
    if (user.job !== "Admin") {
      throw new SafeActionError("Seuls les administrateurs peuvent valider les statistiques");
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
      throw new SafeActionError("Match non trouvé");
    }

    // Vérifier que le match est terminé et que les stats ne sont pas encore envoyées
    if (match.status !== "Finish") {
      throw new SafeActionError("Seuls les matchs terminés peuvent avoir leurs statistiques validées");
    }

    if (match.endingStatus !== "Stat_Not_Sending") {
      throw new SafeActionError("Les statistiques de ce match ont déjà été validées ou sont en cours de traitement");
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
        throw new SafeActionError("Vous n'avez pas l'autorisation de valider les statistiques de ce match");
      }
    }

    // Mettre à jour le endingStatus du match à "Stat_Send"
    const result = await updateMatchStatus({
      matchId: input.matchId,
      endingStatus: "Stat_Send",
    });

    if (!result.success) {
      throw new SafeActionError(result.error || "Erreur lors de la validation des statistiques");
    }

    return {
      success: true,
      message: "Statistiques validées avec succès",
      match: result.match,
    };
  });