"use server";

import { createOrUpdateMatchTeamStats } from "@/database/statistics/create-or-update-match-team-stats";
import { actionUser } from "@/lib/safe-action-client";
import { SafeActionError } from "@/lib/errors";
import { MatchTeamStatsUpdateSchema } from "@/schemas/match-team-stats-update.schema";

export const updateMatchTeamStatsAction = actionUser
  .inputSchema(MatchTeamStatsUpdateSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier que l'utilisateur a les droits d'admin
    if (user.role !== "admin") {
      throw new SafeActionError(
        "Seuls les administrateurs peuvent modifier les statistiques"
      );
    }

    // Appeler la fonction de mise à jour
    const result = await createOrUpdateMatchTeamStats({
      matchId: input.matchId,
      teamId: input.teamId,
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
