import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-session";
import { StatValueType, StatTypeGamePhase, StatTypeGroup } from "@/generated/prisma";

export interface MatchPlayerStat {
  id: number;
  statTypeId: number;
  statTypeName: string;
  value: number;
  valueType: StatValueType;
  gamePhase: StatTypeGamePhase | null;
  group: StatTypeGroup;
}

export interface MatchPlayerStatsResult {
  playerId: string;
  playerName: string;
  matchId: number;
  teamId: number;
  stats: MatchPlayerStat[];
}

export const getMatchPlayerStats = async (
  matchId: number,
  playerId: string,
  teamId: number
): Promise<MatchPlayerStatsResult | null> => {
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

    // Vérifier que le joueur existe et appartient au même club
    const player = await prisma.user.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        clubId: true,
      },
    });

    if (!player || player.clubId !== currentUser.clubId) {
      return null;
    }

    // Vérifier que le joueur fait partie de la lineup pour ce match
    const lineup = await prisma.matchLineup.findFirst({
      where: {
        matchId: matchId,
        playerId: playerId,
        teamId: teamId,
      },
    });

    if (!lineup) {
      return null;
    }

    // Récupérer tous les types de statistiques avec group "Player" ou "All"
    const statTypes = await prisma.statType.findMany({
      where: {
        group: { in: ["Player", "All"] },
      },
      orderBy: [
        { gamePhase: "asc" },
        { name: "asc" },
      ],
    });

    // Récupérer les statistiques existantes pour ce joueur dans ce match
    const existingStats = await prisma.stat.findMany({
      where: {
        matchId: matchId,
        teamId: teamId,
        playerId: playerId,
        statType: {
          group: { in: ["Player", "All"] },
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
    const stats: MatchPlayerStat[] = statTypes.map(statType => ({
      id: existingStats.find(s => s.statTypeId === statType.id)?.id || 0,
      statTypeId: statType.id,
      statTypeName: statType.name,
      value: existingStatsMap.get(statType.id) || 0,
      valueType: statType.valueType,
      gamePhase: statType.gamePhase,
      group: statType.group,
    }));

    return {
      playerId: player.id,
      playerName: `${player.firstname} ${player.lastname}`,
      matchId: match.id,
      teamId: teamId,
      stats: stats,
    };
  } catch (error) {
    console.error("Error fetching match player stats:", error);
    return null;
  }
};