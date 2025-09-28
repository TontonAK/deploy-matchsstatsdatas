"use server";

import { createOrUpdateMatchPlayerStats } from "@/database/statistics/create-or-update-match-player-stats";
import { actionUser, SafeError } from "@/lib/safe-action-client";
import { MatchPlayerStatsUpdateSchema } from "@/schemas/match-player-stats-update.schema";

export const updateMatchPlayerStatsAction = actionUser
  .inputSchema(MatchPlayerStatsUpdateSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier que l'utilisateur a les droits d'admin
    /*if (user.job !== "Admin") {
      throw new SafeError("Seuls les administrateurs peuvent modifier les statistiques");
    }*/

    // Appeler la fonction de mise à jour
    const result = await createOrUpdateMatchPlayerStats({
      matchId: input.matchId,
      teamId: input.teamId,
      playerId: input.playerId,
      stats: input.stats,
    });

    if (!result.success) {
      throw new SafeError(
        result.error ?? "Erreur lors de la mise à jour des statistiques"
      );
    }

    return {
      success: true,
      message: result.message,
      updatedStats: result.updatedStats,
      percentageUpdates: result.percentageUpdates,
    };
  });
