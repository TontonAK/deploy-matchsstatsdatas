"use server";

import { updateMatchStatus } from "@/database/matchs/update-match";
import { actionUser, SafeError } from "@/lib/safe-action-client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const finishMatchSchema = z.object({
  matchId: z.number().positive("L'ID du match est requis"),
});

export const finishMatchAction = actionUser
  .inputSchema(finishMatchSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier les permissions de l'utilisateur
    if (user.role !== "admin") {
      throw new SafeError("Vous devez avoir le rôle admin pour terminer le match");
    }

    if (user.job !== "Coach" && user.job !== "Admin") {
      throw new SafeError(
        "Vous n'avez pas les permissions nécessaires pour terminer le match"
      );
    }

    // Récupérer les détails du match
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      select: {
        id: true,
        status: true,
        homeTeamId: true,
        awayTeamId: true,
      },
    });

    if (!match) {
      throw new SafeError("Match non trouvé");
    }

    // Vérifier que le match est en statut "Live"
    if (match.status !== "Live") {
      throw new SafeError("Seuls les matchs en cours peuvent être terminés");
    }

    // Vérifier que l'utilisateur appartient à une des équipes du match
    const userTeams = await prisma.playerTeams.findMany({
      where: {
        playerId: user.id,
      },
    });

    const isUserInMatchTeam = userTeams.some(
      (team) => team.teamId === match.homeTeamId || team.teamId === match.awayTeamId
    );

    if (!isUserInMatchTeam) {
      throw new SafeError(
        "Vous n'avez pas l'autorisation de terminer ce match"
      );
    }

    // Mettre à jour le statut du match à "Finish" et endingStatus à "Stat_Not_Sending"
    const result = await updateMatchStatus({
      matchId: input.matchId,
      status: "Finish",
      endingStatus: "Stat_Not_Sending",
    });

    if (!result.success) {
      throw new SafeError(result.error || "Erreur lors de la fin du match");
    }

    return {
      success: true,
      message: "Match terminé avec succès",
    };
  });