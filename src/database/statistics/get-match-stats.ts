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

      let homeTeamValue = 0;
      let awayTeamValue = 0;

      // Si c'est un pourcentage, récupérer la valeur de l'équipe (playerId = null)
      if (matchStatType.statType.valueType === StatValueType.Percentage) {
        const homeTeamStat = await prisma.stat.findFirst({
          where: {
            matchId: match.id,
            teamId: matchDetails.homeTeamId,
            playerId: null,
            statTypeId: matchStatType.statTypeId,
          },
        });

        const awayTeamStat = await prisma.stat.findFirst({
          where: {
            matchId: match.id,
            teamId: matchDetails.awayTeamId,
            playerId: null,
            statTypeId: matchStatType.statTypeId,
          },
        });

        homeTeamValue = homeTeamStat?.value || 0;
        awayTeamValue = awayTeamStat?.value || 0;
      } else {
        // Si c'est un nombre, faire la somme des stats des joueurs
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

        homeTeamValue = homeTeamStats._sum.value || 0;
        awayTeamValue = awayTeamStats._sum.value || 0;
      }

      return {
        statTypeId: matchStatType.statTypeId,
        statTypeName: matchStatType.statType.name,
        statTypeValue: matchStatType.statType.valueType,
        gamePhase: matchStatType.statType.gamePhase,
        homeTeamValue,
        awayTeamValue,
      };
    });

    const stats = await Promise.all(statsPromises);
    return stats;
  } catch (error) {
    console.error("Error fetching match stats:", error);
    return [];
  }
};
