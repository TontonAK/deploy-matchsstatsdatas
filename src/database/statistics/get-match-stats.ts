import { StatTypeGamePhase, StatValueType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface MatchStatsSummary {
  statTypeId: number;
  statTypeName: string;
  statTypeValue: StatValueType;
  gamePhase: StatTypeGamePhase | null;
  homeTeamValue: number;
  awayTeamValue: number;
}

export const getMatchStats = async (
  matchUlid: string
): Promise<MatchStatsSummary[]> => {
  try {
    // Récupérer l'ID du match à partir de l'ULID
    const match = await prisma.match.findUnique({
      where: { ulid: matchUlid },
      select: { id: true },
    });

    if (!match) {
      return [];
    }

    // Récupérer les types de statistiques configurés pour ce match, uniquement pour les groupes "Team" et "All"
    const matchStatsTypes = await prisma.matchStatsType.findMany({
      where: {
        matchId: match.id,
        statType: {
          group: {
            in: ["Team", "All"],
          },
        },
      },
      include: {
        statType: true,
      },
      orderBy: [
        {
          statType: {
            gamePhase: "asc",
          },
        },
        {
          statType: {
            valueType: "asc",
          },
        },
        {
          statType: {
            id: "asc",
          },
        },
      ],
    });

    // Pour chaque type de statistique, calculer les valeurs totales par équipe
    const statsPromises = matchStatsTypes.map(async (matchStatType) => {
      // Récupérer les informations sur les équipes du match
      const matchDetails = await prisma.match.findUnique({
        where: { id: match.id },
        select: {
          homeTeamId: true,
          awayTeamId: true,
        },
      });

      if (!matchDetails) {
        return {
          statTypeId: matchStatType.statTypeId,
          statTypeName: matchStatType.statType.name,
          statTypeValue: matchStatType.statType.valueType,
          gamePhase: matchStatType.statType.gamePhase,
          homeTeamValue: 0,
          awayTeamValue: 0,
        };
      }

      // Calculer la somme des statistiques pour l'équipe domicile
      const homeTeamStats = await prisma.stat.aggregate({
        where: {
          matchId: match.id,
          teamId: matchDetails.homeTeamId,
          statTypeId: matchStatType.statTypeId,
        },
        _sum: {
          value: true,
        },
      });

      // Calculer la somme des statistiques pour l'équipe visiteur
      const awayTeamStats = await prisma.stat.aggregate({
        where: {
          matchId: match.id,
          teamId: matchDetails.awayTeamId,
          statTypeId: matchStatType.statTypeId,
        },
        _sum: {
          value: true,
        },
      });

      return {
        statTypeId: matchStatType.statTypeId,
        statTypeName: matchStatType.statType.name,
        statTypeValue: matchStatType.statType.valueType,
        gamePhase: matchStatType.statType.gamePhase,
        homeTeamValue: homeTeamStats._sum.value || 0,
        awayTeamValue: awayTeamStats._sum.value || 0,
      };
    });

    const stats = await Promise.all(statsPromises);
    return stats;
  } catch (error) {
    console.error("Error fetching match stats:", error);
    return [];
  }
};
