"use server";

import { actionUser } from "@/lib/safe-action-client";
import { getStatsType } from "@/database/stat-type/get-stats-type";

export const getKickStatTypesAction = actionUser.action(async () => {
  try {
    const result = await getStatsType({
      valueType: "Number",
      gamePhase: "Foot",
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Erreur lors de la récupération des types de statistiques",
        statTypes: [],
      };
    }

    return {
      success: true,
      statTypes: result.statTypes,
    };
  } catch (error) {
    console.error("Error in getKickStatTypesAction:", error);
    return {
      success: false,
      error: "Erreur inattendue lors de la récupération des types de statistiques",
      statTypes: [],
    };
  }
});