import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-session";
import { StatValueType, StatTypeGamePhase, StatTypeGroup } from "@/generated/prisma";

export interface MatchOpponentStat {
  id: number;
  statTypeId: number;
  statTypeName: string;
  value: number;
  valueType: StatValueType;
  gamePhase: StatTypeGamePhase | null;
  group: StatTypeGroup;
}

export interface MatchOpponentStatsResult {
  teamId: number;
  teamName: string;
  clubName: string;
  matchId: number;
  stats: MatchOpponentStat[];
}

export const getMatchOpponentStats = async (
  matchId: number,
  opponentTeamId: number
): Promise<MatchOpponentStatsResult | null> => {
  try {
    // Vérifier l'utilisateur connecté et qu'il est admin
    const currentUser = await getUser();
    if (!currentUser || currentUser.role !== "admin") {
      return null;
    }

    // Vérifier que le match existe et est terminé avec les bonnes conditions
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true,
        endingStatus: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: { select: { name: true } }
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: { select: { name: true } }
          }
        },
      },
    });

    if (!match || match.status !== "Finish" || match.endingStatus === "Waiting_End") {
      return null;
    }

    // Vérifier que l'équipe adverse existe et fait partie du match
    if (opponentTeamId !== match.homeTeamId && opponentTeamId !== match.awayTeamId) {
      return null;
    }

    // Déterminer quelle est l'équipe de l'utilisateur pour s'assurer qu'on récupère bien l'adversaire
    const userTeam = match.homeTeam.clubId === currentUser.clubId ? match.homeTeam : match.awayTeam;
    const opponentTeam = userTeam.id === match.homeTeam.id ? match.awayTeam : match.homeTeam;

    // Vérifier que l'équipe demandée est bien l'équipe adverse
    if (opponentTeamId !== opponentTeam.id) {
      return null;
    }

    // Récupérer tous les types de statistiques avec group "Team" ou "All"
    const statTypes = await prisma.statType.findMany({
      where: {
        group: { in: ["Team", "All"] },
      },
      orderBy: [
        { gamePhase: "asc" },
        { name: "asc" },
      ],
    });

    // Récupérer les statistiques existantes pour l'équipe adverse dans ce match
    const existingStats = await prisma.stat.findMany({
      where: {
        matchId: matchId,
        teamId: opponentTeamId,
        playerId: null, // Stats d'équipe uniquement
        statType: {
          group: { in: ["Team", "All"] },
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
    const stats: MatchOpponentStat[] = statTypes.map(statType => ({
      id: existingStats.find(s => s.statTypeId === statType.id)?.id || 0,
      statTypeId: statType.id,
      statTypeName: statType.name,
      value: existingStatsMap.get(statType.id) || 0,
      valueType: statType.valueType,
      gamePhase: statType.gamePhase,
      group: statType.group,
    }));

    return {
      teamId: opponentTeam.id,
      teamName: opponentTeam.name,
      clubName: opponentTeam.club.name,
      matchId: match.id,
      stats: stats,
    };
  } catch (error) {
    console.error("Error fetching match opponent stats:", error);
    return null;
  }
};
