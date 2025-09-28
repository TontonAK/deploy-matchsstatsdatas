import { GroundArea } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface KickDetailedStat {
  id: number;
  playerName: string | null | undefined;
  startAreaKick: GroundArea;
  endAreaKick: GroundArea | null;
  deadBall: boolean | null;
  success: boolean | null;
  comment: string | null;
}

export interface KickTeamStats {
  teamId: number;
  teamName: string;
  clubName: string;
  clubLogo: string | null;
  // Stats de jeu au pied (5 stats)
  occupationKickStartAreas: { area: GroundArea; count: number; percentage: number }[];
  occupationKickEndAreas: { area: GroundArea; count: number; percentage: number }[];
  touchKickStartAreas: { area: GroundArea; count: number; percentage: number }[];
  touchKickEndAreas: { area: GroundArea; count: number; percentage: number }[];
  fieldKickSuccessRate: number;
  // Stats de tentatives au pied (4 stats)
  dropsRatio: { attempted: number; successful: number; percentage: number };
  penaltiesRatio: { attempted: number; successful: number; percentage: number };
  conversionsRatio: { attempted: number; successful: number; percentage: number };
  overallKickSuccessRate: number;
  detailedStats: KickDetailedStat[];
}

export interface KickMatchStats {
  homeTeam: KickTeamStats;
  awayTeam: KickTeamStats;
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

const getTeamKickStats = async (
  matchId: number,
  teamId: number
): Promise<KickTeamStats | null> => {
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

    // Récupérer les statistiques de coup de pied détaillées (KickStatGround)
    const kickStats = await prisma.kickStatGround.findMany({
      where: {
        stat: {
          matchId: matchId,
          teamId: teamId,
          statType: {
            name: {
              in: ["Jeu au pied (occupation)", "Jeu au pied (touches)"],
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
            statType: {
              select: {
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

    // Récupérer les statistiques de tentatives (Drops, Transformations, Pénalités)
    const [dropsStats, conversionsStats, penaltiesStats] = await Promise.all([
      // Drops
      Promise.all([
        prisma.stat.aggregate({
          where: {
            matchId: matchId,
            teamId: teamId,
            statType: { name: "Drops tentés" },
          },
          _sum: { value: true },
        }),
        prisma.stat.aggregate({
          where: {
            matchId: matchId,
            teamId: teamId,
            statType: { name: "Drops réussis" },
          },
          _sum: { value: true },
        }),
      ]),
      // Transformations
      Promise.all([
        prisma.stat.aggregate({
          where: {
            matchId: matchId,
            teamId: teamId,
            statType: { name: "Transformations tentées" },
          },
          _sum: { value: true },
        }),
        prisma.stat.aggregate({
          where: {
            matchId: matchId,
            teamId: teamId,
            statType: { name: "Transformations réussies" },
          },
          _sum: { value: true },
        }),
      ]),
      // Pénalités
      Promise.all([
        prisma.stat.aggregate({
          where: {
            matchId: matchId,
            teamId: teamId,
            statType: { name: "Pénalités tentées" },
          },
          _sum: { value: true },
        }),
        prisma.stat.aggregate({
          where: {
            matchId: matchId,
            teamId: teamId,
            statType: { name: "Pénalités réussies" },
          },
          _sum: { value: true },
        }),
      ]),
    ]);

    // Calculer les ratios de tentatives
    const dropsAttempted = dropsStats[0]._sum.value || 0;
    const dropsSuccessful = dropsStats[1]._sum.value || 0;
    const dropsPercentage = dropsAttempted > 0 ? Math.round((dropsSuccessful / dropsAttempted) * 100) : 0;

    const conversionsAttempted = conversionsStats[0]._sum.value || 0;
    const conversionsSuccessful = conversionsStats[1]._sum.value || 0;
    const conversionsPercentage = conversionsAttempted > 0 ? Math.round((conversionsSuccessful / conversionsAttempted) * 100) : 0;

    const penaltiesAttempted = penaltiesStats[0]._sum.value || 0;
    const penaltiesSuccessful = penaltiesStats[1]._sum.value || 0;
    const penaltiesPercentage = penaltiesAttempted > 0 ? Math.round((penaltiesSuccessful / penaltiesAttempted) * 100) : 0;

    // Calculer le pourcentage global de réussite des tentatives
    const totalAttempted = dropsAttempted + conversionsAttempted + penaltiesAttempted;
    const totalSuccessful = dropsSuccessful + conversionsSuccessful + penaltiesSuccessful;
    const overallKickSuccessRate = totalAttempted > 0 ? Math.round((totalSuccessful / totalAttempted) * 100) : 0;

    // Séparer les coups de pieds d'occupation et de touche
    const occupationKicks = kickStats.filter(kick => kick.stat.statType.name === "Jeu au pied (occupation)");
    const touchKicks = kickStats.filter(kick => kick.stat.statType.name === "Jeu au pied (touches)");

    // Calculer les zones de départ et d'arrivée pour l'occupation
    const occupationStartAreas = occupationKicks.map(kick => kick.startAreaKick);
    const occupationEndAreas = occupationKicks
      .filter(kick => kick.endAreaKick !== null)
      .map(kick => kick.endAreaKick as GroundArea);

    // Calculer les zones de départ et d'arrivée pour les touches
    const touchStartAreas = touchKicks.map(kick => kick.startAreaKick);
    const touchEndAreas = touchKicks
      .filter(kick => kick.endAreaKick !== null)
      .map(kick => kick.endAreaKick as GroundArea);

    // Calculer le pourcentage de réussite du jeu au pied dans le jeu courant
    const allFieldKicks = [...occupationKicks, ...touchKicks];
    const successfulFieldKicks = allFieldKicks.filter(kick => kick.success === true).length;
    const fieldKickSuccessRate = allFieldKicks.length > 0 ? Math.round((successfulFieldKicks / allFieldKicks.length) * 100) : 0;

    // Construire les stats détaillées
    const detailedStats: KickDetailedStat[] = kickStats.map((kick) => ({
      id: kick.id,
      playerName: kick.stat.player?.name,
      startAreaKick: kick.startAreaKick,
      endAreaKick: kick.endAreaKick,
      deadBall: kick.deadBall,
      success: kick.success,
      comment: kick.comment,
    }));

    return {
      teamId: team.id,
      teamName: team.name,
      clubName: team.club.name,
      clubLogo: team.club.logo,
      occupationKickStartAreas: calculateTopAreas(occupationStartAreas),
      occupationKickEndAreas: calculateTopAreas(occupationEndAreas),
      touchKickStartAreas: calculateTopAreas(touchStartAreas),
      touchKickEndAreas: calculateTopAreas(touchEndAreas),
      fieldKickSuccessRate,
      dropsRatio: {
        attempted: dropsAttempted,
        successful: dropsSuccessful,
        percentage: dropsPercentage,
      },
      penaltiesRatio: {
        attempted: penaltiesAttempted,
        successful: penaltiesSuccessful,
        percentage: penaltiesPercentage,
      },
      conversionsRatio: {
        attempted: conversionsAttempted,
        successful: conversionsSuccessful,
        percentage: conversionsPercentage,
      },
      overallKickSuccessRate,
      detailedStats,
    };
  } catch (error) {
    console.error(`Error fetching kick stats for team ${teamId}:`, error);
    return null;
  }
};

export const getKickMatchStats = async (
  matchUlid: string
): Promise<KickMatchStats | null> => {
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
      getTeamKickStats(match.id, match.homeTeamId),
      getTeamKickStats(match.id, match.awayTeamId),
    ]);

    // Si on ne peut pas récupérer les stats pour au moins une équipe, on crée des stats vides
    const createEmptyStats = (teamId: number): KickTeamStats => ({
      teamId,
      teamName: "",
      clubName: "",
      clubLogo: null,
      occupationKickStartAreas: [],
      occupationKickEndAreas: [],
      touchKickStartAreas: [],
      touchKickEndAreas: [],
      fieldKickSuccessRate: 0,
      dropsRatio: { attempted: 0, successful: 0, percentage: 0 },
      penaltiesRatio: { attempted: 0, successful: 0, percentage: 0 },
      conversionsRatio: { attempted: 0, successful: 0, percentage: 0 },
      overallKickSuccessRate: 0,
      detailedStats: [],
    });

    return {
      homeTeam: homeTeamStats || createEmptyStats(match.homeTeamId),
      awayTeam: awayTeamStats || createEmptyStats(match.awayTeamId),
    };
  } catch (error) {
    console.error("Error fetching kick match stats:", error);
    return null;
  }
};