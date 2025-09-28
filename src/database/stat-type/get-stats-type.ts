import { prisma } from "@/lib/prisma";
import { StatValueType, StatTypeGamePhase, StatTypeGroup } from "@/generated/prisma";

export interface GetStatsTypeParams {
  valueType?: StatValueType;
  gamePhase?: StatTypeGamePhase;
  group?: StatTypeGroup;
}

export const getStatsType = async (params: GetStatsTypeParams = {}) => {
  try {
    const whereConditions: Record<string, unknown> = {};

    if (params.valueType) {
      whereConditions.valueType = params.valueType;
    }

    if (params.gamePhase) {
      whereConditions.gamePhase = params.gamePhase;
    }

    if (params.group) {
      whereConditions.group = params.group;
    }

    const statTypes = await prisma.statType.findMany({
      where: whereConditions,
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      statTypes,
    };
  } catch (error) {
    console.error("Error fetching stat types:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des types de statistiques",
      statTypes: [],
    };
  }
};