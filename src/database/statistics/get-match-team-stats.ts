import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-session";
import { StatValueType, StatTypeGamePhase, StatTypeGroup } from "@/generated/prisma";

export interface MatchTeamStat {
  id: number;
  statTypeId: number;
  statTypeName: string;
  value: number;
  valueType: StatValueType;
  gamePhase: StatTypeGamePhase | null;
  group: StatTypeGroup;
}

export interface MatchTeamStatsResult {
  matchId: number;
  teamId: number;
  teamName: string;
  stats: MatchTeamStat[];
}

export const getMatchTeamStats = async (
  matchId: number,
  teamId: number
): Promise<MatchTeamStatsResult | null> => {
  try {
    // Vérifier l'utilisateur connecté
    const currentUser = await getUser();
    if (!currentUser) return null;

    // Vérifier que le match existe et est terminé avec les bonnes conditions
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true,
        endingStatus: true,
        homeTeamId: true,
        awayTeamId: true,
      },
    });

    if (!match || match.status !== "Finish" || match.endingStatus === "Waiting_End") {
      return null;
    }

    // Vérifier que l'équipe existe et appartient au même club
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        clubId: true,
      },
    });

    if (!team || team.clubId !== currentUser.clubId) {
      return null;
    }

    // Vérifier que l'équipe fait partie du match
    if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) {
      return null;
    }

    // Récupérer tous les types de statistiques avec group "Team" ou gamePhase "Discipline"
    const statTypes = await prisma.statType.findMany({
      where: {
        OR: [
          { group: "Team" },
          { gamePhase: "Discipline" },
        ],
      },
      orderBy: [
        { gamePhase: "asc" },
        { name: "asc" },
      ],
    });

    // Récupérer les statistiques existantes pour cette équipe dans ce match
    const existingStats = await prisma.stat.findMany({
      where: {
        matchId: matchId,
        teamId: teamId,
        playerId: null,
        statType: {
          OR: [
            { group: "Team" },
            { gamePhase: "Discipline" },
          ],
        },
      },
      include: {
        statType: true,
      },
    });

    // Créer un map des statistiques existantes
    const existingStatsMap = new Map<number, number>();
    existingStats.forEach(stat => {
      existingStatsMap.set(stat.statTypeId, stat.value);
    });

    // Construire la liste complète des statistiques (avec valeurs 0 si non existantes)
    const stats: MatchTeamStat[] = statTypes.map(statType => ({
      id: existingStats.find(s => s.statTypeId === statType.id)?.id || 0,
      statTypeId: statType.id,
      statTypeName: statType.name,
      value: existingStatsMap.get(statType.id) || 0,
      valueType: statType.valueType,
      gamePhase: statType.gamePhase,
      group: statType.group,
    }));

    return {
      matchId: match.id,
      teamId: team.id,
      teamName: team.name,
      stats: stats,
    };
  } catch (error) {
    console.error("Error fetching match team stats:", error);
    return null;
  }
};
