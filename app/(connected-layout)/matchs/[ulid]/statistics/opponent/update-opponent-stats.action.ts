"use server";

import { createOrUpdateOpponentStats } from "@/database/statistics/create-or-update-opponent-stats";
import { actionUser } from "@/lib/safe-action-client";
import { SafeActionError } from "@/lib/errors";
import { MatchOpponentStatsUpdateSchema } from "@/schemas/match-opponent-stats-update.schema";

export const updateMatchOpponentStatsAction = actionUser
  .inputSchema(MatchOpponentStatsUpdateSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier que l'utilisateur a les droits d'admin
    if (user.role !== "admin") {
      throw new SafeActionError(
        "Seuls les administrateurs peuvent modifier les statistiques"
      );
    }

    // Appeler la fonction de mise à jour
    const result = await createOrUpdateOpponentStats({
      matchId: input.matchId,
      opponentTeamId: input.opponentTeamId,
      stats: input.stats,
    });

    if (!result.success) {
      throw new SafeActionError(
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
