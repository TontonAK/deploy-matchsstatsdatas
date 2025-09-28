"use server";

import { updateMatchStatus } from "@/database/matchs/update-match";
import { actionUser, SafeError } from "@/lib/safe-action-client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const startLiveSchema = z.object({
  matchId: z.number().positive("L'ID du match est requis"),
});

export const startLiveAction = actionUser
  .inputSchema(startLiveSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier les permissions de l'utilisateur
    if (user.role !== "admin") {
      throw new SafeError("Vous devez avoir le rôle admin pour démarrer le live");
    }

    if (user.job !== "Coach" && user.job !== "Admin") {
      throw new SafeError(
        "Vous n'avez pas les permissions nécessaires pour démarrer le live"
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

    // Vérifier que le match est en statut "Planned"
    if (match.status !== "Planned") {
      throw new SafeError("Seuls les matchs planifiés peuvent être démarrés en live");
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
        "Vous n'avez pas l'autorisation de démarrer le live pour ce match"
      );
    }

    // Mettre à jour le statut du match à "Live"
    const result = await updateMatchStatus({
      matchId: input.matchId,
      status: "Live",
    });

    if (!result.success) {
      throw new SafeError(result.error || "Erreur lors du démarrage du live");
    }

    return {
      success: true,
      message: "Live démarré avec succès",
    };
  });