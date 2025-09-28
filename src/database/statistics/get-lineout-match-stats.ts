import { CatchBlockAreaLineout, GroundArea } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface LineoutDetailedStat {
  id: number;
  playerName: string | null | undefined;
  area: GroundArea;
  nbPlayer: number;
  catchBlockArea: CatchBlockAreaLineout;
  success: boolean | null;
  failReason: string | null;
}

export interface LineoutTeamStats {
  teamId: number;
  teamName: string;
  clubName: string;
  clubLogo: string | null;
  totalLineouts: number;
  successRate: number;
  topAreas: { area: GroundArea; count: number; percentage: number }[];
  mostCommonNbPlayer: number;
  catchBlockAreaStats: {
    area: CatchBlockAreaLineout;
    count: number;
    percentage: number;
  }[];
  detailedStats: LineoutDetailedStat[];
}

export interface LineoutMatchStats {
  homeTeam: LineoutTeamStats;
  awayTeam: LineoutTeamStats;
}

const calculateTopAreas = (
  areas: GroundArea[]
): { area: GroundArea; count: number; percentage: number }[] => {
  const areaCount = areas.reduce((acc, area) => {
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<GroundArea, number>);

  const total = areas.length;
  const sortedAreas = Object.entries(areaCount)
    .map(([area, count]) => ({
      area: area as GroundArea,
      count: count as number,
      percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return sortedAreas;
};

const calculateCatchBlockAreaStats = (
  areas: CatchBlockAreaLineout[]
): { area: CatchBlockAreaLineout; count: number; percentage: number }[] => {
  const areaCount = areas.reduce((acc, area) => {
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<CatchBlockAreaLineout, number>);

  const total = areas.length;
  return Object.entries(areaCount)
    .map(([area, count]) => ({
      area: area as CatchBlockAreaLineout,
      count: count as number,
      percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
};

const getMostCommonNbPlayer = (nbPlayers: number[]): number => {
  const nbPlayerCount = nbPlayers.reduce((acc, nb) => {
    acc[nb] = (acc[nb] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const mostCommon = Object.entries(nbPlayerCount).sort(
    ([, a], [, b]) => b - a
  )[0];

  return mostCommon ? parseInt(mostCommon[0]) : 0;
};

const getTeamLineoutStats = async (
  matchId: number,
  teamId: number
): Promise<LineoutTeamStats | null> => {
  try {
    // Récupérer les informations de l'équipe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        club: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!team) return null;

    // Récupérer les statistiques de lineout pour cette équipe dans ce match
    const lineoutStats = await prisma.lineoutStatGround.findMany({
      where: {
        stat: {
          matchId: matchId,
          teamId: teamId,
          statType: {
            name: {
              contains: "Touches",
            },
          },
        },
      },
      include: {
        stat: {
          include: {
            player: {
              select: {
                firstname: true,
                lastname: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const totalLineouts = lineoutStats.length;
    const successfulLineouts = lineoutStats.filter(
      (stat) => stat.success === true
    ).length;
    const successRate =
      totalLineouts > 0
        ? Math.round((successfulLineouts / totalLineouts) * 100)
        : 0;

    // Calculer les statistiques détaillées
    const areas = lineoutStats.map((stat) => stat.area);
    const nbPlayers = lineoutStats.map((stat) => stat.nbPlayer);
    const catchBlockAreas = lineoutStats.map((stat) => stat.catchBlockArea);

    const topAreas = calculateTopAreas(areas);
    const mostCommonNbPlayer = getMostCommonNbPlayer(nbPlayers);
    const catchBlockAreaStats = calculateCatchBlockAreaStats(catchBlockAreas);

    // Construire les stats détaillées
    const detailedStats: LineoutDetailedStat[] = lineoutStats.map((stat) => ({
      id: stat.id,
      playerName: stat.stat.player?.name,
      area: stat.area,
      nbPlayer: stat.nbPlayer,
      catchBlockArea: stat.catchBlockArea,
      success: stat.success,
      failReason: stat.failReason,
    }));

    return {
      teamId: team.id,
      teamName: team.name,
      clubName: team.club.name,
      clubLogo: team.club.logo,
      totalLineouts,
      successRate,
      topAreas,
      mostCommonNbPlayer,
      catchBlockAreaStats,
      detailedStats,
    };
  } catch (error) {
    console.error(`Error fetching lineout stats for team ${teamId}:`, error);
    return null;
  }
};

export const getLineoutMatchStats = async (
  matchUlid: string
): Promise<LineoutMatchStats | null> => {
  try {
    // Récupérer les informations du match
    const match = await prisma.match.findUnique({
      where: { ulid: matchUlid },
      select: {
        id: true,
        homeTeamId: true,
        awayTeamId: true,
      },
    });

    if (!match) return null;

    // Récupérer les stats pour les deux équipes en parallèle
    const [homeTeamStats, awayTeamStats] = await Promise.all([
      getTeamLineoutStats(match.id, match.homeTeamId),
      getTeamLineoutStats(match.id, match.awayTeamId),
    ]);

    // Si on ne peut pas récupérer les stats pour au moins une équipe, on crée des stats vides
    const createEmptyStats = (teamId: number): LineoutTeamStats => ({
      teamId,
      teamName: "",
      clubName: "",
      clubLogo: null,
      totalLineouts: 0,
      successRate: 0,
      topAreas: [],
      mostCommonNbPlayer: 0,
      catchBlockAreaStats: [],
      detailedStats: [],
    });

    return {
      homeTeam: homeTeamStats || createEmptyStats(match.homeTeamId),
      awayTeam: awayTeamStats || createEmptyStats(match.awayTeamId),
    };
  } catch (error) {
    console.error("Error fetching lineout match stats:", error);
    return null;
  }
};
