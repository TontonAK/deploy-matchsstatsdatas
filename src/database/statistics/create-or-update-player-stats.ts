import { prisma } from "@/lib/prisma";

export interface UpdatePlayerStatParams {
  matchId: number;
  teamId: number;
  playerId?: string; // null pour les stats d'équipe
  statTypeName: string;
  valueToAdd: number;
}

export interface UpdatePlayerStatsParams {
  matchId: number;
  teamId: number;
  playerId?: string; // null pour les stats d'équipe
  stats: {
    statTypeName: string;
    valueToAdd: number;
  }[];
}

export const createOrUpdatePlayerStats = async (params: UpdatePlayerStatsParams) => {
  try {
    const results = [];

    // Traiter chaque statistique
    for (const stat of params.stats) {
      // Récupérer le type de statistique
      const statType = await prisma.statType.findFirst({
        where: {
          name: stat.statTypeName,
        },
      });

      if (!statType) {
        console.warn(`Type de statistique non trouvé: ${stat.statTypeName}`);
        continue;
      }

      // Vérifier si la statistique existe déjà
      const existingStat = await prisma.stat.findFirst({
        where: {
          matchId: params.matchId,
          teamId: params.teamId,
          playerId: params.playerId || null,
          statTypeId: statType.id,
        },
      });

      let result;

      if (existingStat) {
        // Mettre à jour la statistique existante
        result = await prisma.stat.update({
          where: {
            id: existingStat.id,
          },
          data: {
            value: existingStat.value + stat.valueToAdd,
          },
          include: {
            statType: true,
          },
        });
      } else {
        // Créer une nouvelle statistique
        result = await prisma.stat.create({
          data: {
            matchId: params.matchId,
            teamId: params.teamId,
            playerId: params.playerId || null,
            statTypeId: statType.id,
            value: stat.valueToAdd,
          },
          include: {
            statType: true,
          },
        });
      }

      results.push(result);
    }

    return {
      success: true,
      stats: results,
    };
  } catch (error) {
    console.error("Error creating/updating player stats:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des statistiques",
    };
  }
};