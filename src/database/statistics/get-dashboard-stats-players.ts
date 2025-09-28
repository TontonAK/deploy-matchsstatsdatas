import { prisma } from "@/lib/prisma";

export interface PlayerStat {
  playerId: string;
  playerName: string;
  playerImage: string | null;
  value: number;
  displayValue: string;
}

export interface PlayerStatsResult {
  topTryScorer: PlayerStat | null;
  topKicker: PlayerStat | null;
  topPasser: PlayerStat | null;
  topTackler: PlayerStat | null;
}

// Fonction utilitaire pour formatter le nom du joueur
const formatPlayerName = (firstname: string, lastname: string) => {
  return `${firstname} ${lastname}`;
};

// Fonction utilitaire pour calculer le pourcentage
const calculatePercentage = (successful: number, attempted: number): number => {
  if (attempted === 0) return 0;
  return Math.round((successful / attempted) * 100);
};

export const getTopTryScorer = async (teamId: number | undefined): Promise<PlayerStat | null> => {
  if (!teamId) return null;

  try {
    // Récupérer la saison 2025-2026
    const season = await prisma.season.findFirst({
      where: { name: "2025-2026" },
    });

    if (!season) return null;

    // Récupérer le type de statistique "Essais"
    const tryStatType = await prisma.statType.findFirst({
      where: { name: "Essais" },
    });

    if (!tryStatType) return null;

    // Récupérer les matchs terminés de l'équipe pour la saison
    const finishedMatches = await prisma.match.findMany({
      where: {
        AND: [
          { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
          { status: "Finish" },
          {
            seasonLeagueMatch: {
              seasonLeague: { seasonId: season.id },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (finishedMatches.length === 0) return null;

    const matchIds = finishedMatches.map((match) => match.id);

    // Récupérer les statistiques d'essais et grouper par joueur
    const tryStats = await prisma.stat.groupBy({
      by: ["playerId"],
      where: {
        matchId: { in: matchIds },
        teamId: teamId,
        statTypeId: tryStatType.id,
        playerId: { not: null },
      },
      _sum: {
        value: true,
      },
      orderBy: {
        _sum: {
          value: "desc",
        },
      },
      take: 1,
    });

    if (tryStats.length === 0) return null;

    const topStat = tryStats[0];
    if (!topStat.playerId || !topStat._sum.value) return null;

    // Récupérer les infos du joueur
    const player = await prisma.user.findUnique({
      where: { id: topStat.playerId },
      select: {
        firstname: true,
        lastname: true,
        image: true,
      },
    });

    if (!player) return null;

    return {
      playerId: topStat.playerId,
      playerName: formatPlayerName(player.firstname, player.lastname),
      playerImage: player.image,
      value: topStat._sum.value,
      displayValue: `${topStat._sum.value} essais`,
    };
  } catch (error) {
    console.error("Error fetching top try scorer:", error);
    return null;
  }
};

export const getTopKicker = async (teamId: number | undefined): Promise<PlayerStat | null> => {
  if (!teamId) return null;

  try {
    // Récupérer la saison 2025-2026
    const season = await prisma.season.findFirst({
      where: { name: "2025-2026" },
    });

    if (!season) return null;

    // Récupérer les types de statistiques pour les coups de pied
    const statTypes = await prisma.statType.findMany({
      where: {
        name: {
          in: [
            "Drops tentés",
            "Drops réussis",
            "Transformations tentées",
            "Transformations réussies",
            "Pénalités tentées",
            "Pénalités réussies",
          ],
        },
      },
    });

    if (statTypes.length === 0) return null;

    const attemptedTypes = statTypes.filter((type) =>
      type.name.includes("tentés") || type.name.includes("tentées")
    );
    const successfulTypes = statTypes.filter((type) =>
      type.name.includes("réussis") || type.name.includes("réussies")
    );

    // Récupérer les matchs terminés de l'équipe pour la saison
    const finishedMatches = await prisma.match.findMany({
      where: {
        AND: [
          { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
          { status: "Finish" },
          {
            seasonLeagueMatch: {
              seasonLeague: { seasonId: season.id },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (finishedMatches.length === 0) return null;

    const matchIds = finishedMatches.map((match) => match.id);

    // Récupérer toutes les stats de coups de pied
    const kickStats = await prisma.stat.findMany({
      where: {
        matchId: { in: matchIds },
        teamId: teamId,
        statTypeId: { in: statTypes.map((type) => type.id) },
        playerId: { not: null },
      },
      select: {
        playerId: true,
        statTypeId: true,
        value: true,
      },
    });

    // Grouper par joueur et calculer les totaux
    const playerStats = new Map<string, { attempted: number; successful: number }>();

    kickStats.forEach((stat) => {
      if (!stat.playerId) return;

      const statType = statTypes.find((type) => type.id === stat.statTypeId);
      if (!statType) return;

      if (!playerStats.has(stat.playerId)) {
        playerStats.set(stat.playerId, { attempted: 0, successful: 0 });
      }

      const current = playerStats.get(stat.playerId);
      if (!current) return;

      if (attemptedTypes.some((type) => type.id === stat.statTypeId)) {
        current.attempted += stat.value;
      }
      if (successfulTypes.some((type) => type.id === stat.statTypeId)) {
        current.successful += stat.value;
      }
    });

    // Trouver le meilleur pourcentage (minimum 1 tentative)
    let bestPlayer: { playerId: string; percentage: number; successful: number; attempted: number } | null = null;

    for (const [playerId, stats] of playerStats.entries()) {
      if (stats.attempted > 0) {
        const percentage = calculatePercentage(stats.successful, stats.attempted);
        if (!bestPlayer || percentage > bestPlayer.percentage) {
          bestPlayer = { playerId, percentage, successful: stats.successful, attempted: stats.attempted };
        }
      }
    }

    if (!bestPlayer) return null;

    // Récupérer les infos du joueur
    const player = await prisma.user.findUnique({
      where: { id: bestPlayer.playerId },
      select: {
        firstname: true,
        lastname: true,
        image: true,
      },
    });

    if (!player) return null;

    return {
      playerId: bestPlayer.playerId,
      playerName: formatPlayerName(player.firstname, player.lastname),
      playerImage: player.image,
      value: bestPlayer.percentage,
      displayValue: `${bestPlayer.percentage}%`,
    };
  } catch (error) {
    console.error("Error fetching top kicker:", error);
    return null;
  }
};

export const getTopPasser = async (teamId: number | undefined): Promise<PlayerStat | null> => {
  if (!teamId) return null;

  try {
    // Récupérer la saison 2025-2026
    const season = await prisma.season.findFirst({
      where: { name: "2025-2026" },
    });

    if (!season) return null;

    // Récupérer les types de statistiques pour les passes
    const statTypes = await prisma.statType.findMany({
      where: {
        name: { in: ["Passes tentées", "Passes réussies"] },
      },
    });

    if (statTypes.length !== 2) return null;

    const attemptedType = statTypes.find((type) => type.name === "Passes tentées");
    const successfulType = statTypes.find((type) => type.name === "Passes réussies");

    if (!attemptedType || !successfulType) return null;

    // Récupérer les matchs terminés de l'équipe pour la saison
    const finishedMatches = await prisma.match.findMany({
      where: {
        AND: [
          { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
          { status: "Finish" },
          {
            seasonLeagueMatch: {
              seasonLeague: { seasonId: season.id },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (finishedMatches.length === 0) return null;

    const matchIds = finishedMatches.map((match) => match.id);

    // Récupérer les stats de passes groupées par joueur
    const passStats = await prisma.stat.findMany({
      where: {
        matchId: { in: matchIds },
        teamId: teamId,
        statTypeId: { in: [attemptedType.id, successfulType.id] },
        playerId: { not: null },
      },
      select: {
        playerId: true,
        statTypeId: true,
        value: true,
      },
    });

    // Grouper par joueur et calculer les totaux
    const playerStats = new Map<string, { attempted: number; successful: number }>();

    passStats.forEach((stat) => {
      if (!stat.playerId) return;

      if (!playerStats.has(stat.playerId)) {
        playerStats.set(stat.playerId, { attempted: 0, successful: 0 });
      }

      const current = playerStats.get(stat.playerId);
      if (!current) return;

      if (stat.statTypeId === attemptedType.id) {
        current.attempted += stat.value;
      }
      if (stat.statTypeId === successfulType.id) {
        current.successful += stat.value;
      }
    });

    // Trouver le meilleur pourcentage (minimum 1 tentative)
    let bestPlayer: { playerId: string; percentage: number } | null = null;

    for (const [playerId, stats] of playerStats.entries()) {
      if (stats.attempted > 0) {
        const percentage = calculatePercentage(stats.successful, stats.attempted);
        if (!bestPlayer || percentage > bestPlayer.percentage) {
          bestPlayer = { playerId, percentage };
        }
      }
    }

    if (!bestPlayer) return null;

    // Récupérer les infos du joueur
    const player = await prisma.user.findUnique({
      where: { id: bestPlayer.playerId },
      select: {
        firstname: true,
        lastname: true,
        image: true,
      },
    });

    if (!player) return null;

    return {
      playerId: bestPlayer.playerId,
      playerName: formatPlayerName(player.firstname, player.lastname),
      playerImage: player.image,
      value: bestPlayer.percentage,
      displayValue: `${bestPlayer.percentage}%`,
    };
  } catch (error) {
    console.error("Error fetching top passer:", error);
    return null;
  }
};

export const getTopTackler = async (teamId: number | undefined): Promise<PlayerStat | null> => {
  if (!teamId) return null;

  try {
    // Récupérer la saison 2025-2026
    const season = await prisma.season.findFirst({
      where: { name: "2025-2026" },
    });

    if (!season) return null;

    // Récupérer les types de statistiques pour les plaquages
    const statTypes = await prisma.statType.findMany({
      where: {
        name: { in: ["Plaquages tentés", "Plaquages réussis"] },
      },
    });

    if (statTypes.length !== 2) return null;

    const attemptedType = statTypes.find((type) => type.name === "Plaquages tentés");
    const successfulType = statTypes.find((type) => type.name === "Plaquages réussis");

    if (!attemptedType || !successfulType) return null;

    // Récupérer les matchs terminés de l'équipe pour la saison
    const finishedMatches = await prisma.match.findMany({
      where: {
        AND: [
          { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
          { status: "Finish" },
          {
            seasonLeagueMatch: {
              seasonLeague: { seasonId: season.id },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (finishedMatches.length === 0) return null;

    const matchIds = finishedMatches.map((match) => match.id);

    // Récupérer les stats de plaquages groupées par joueur
    const tackleStats = await prisma.stat.findMany({
      where: {
        matchId: { in: matchIds },
        teamId: teamId,
        statTypeId: { in: [attemptedType.id, successfulType.id] },
        playerId: { not: null },
      },
      select: {
        playerId: true,
        statTypeId: true,
        value: true,
      },
    });

    // Grouper par joueur et calculer les totaux
    const playerStats = new Map<string, { attempted: number; successful: number }>();

    tackleStats.forEach((stat) => {
      if (!stat.playerId) return;

      if (!playerStats.has(stat.playerId)) {
        playerStats.set(stat.playerId, { attempted: 0, successful: 0 });
      }

      const current = playerStats.get(stat.playerId);
      if (!current) return;

      if (stat.statTypeId === attemptedType.id) {
        current.attempted += stat.value;
      }
      if (stat.statTypeId === successfulType.id) {
        current.successful += stat.value;
      }
    });

    // Trouver le meilleur pourcentage (minimum 1 tentative)
    let bestPlayer: { playerId: string; percentage: number } | null = null;

    for (const [playerId, stats] of playerStats.entries()) {
      if (stats.attempted > 0) {
        const percentage = calculatePercentage(stats.successful, stats.attempted);
        if (!bestPlayer || percentage > bestPlayer.percentage) {
          bestPlayer = { playerId, percentage };
        }
      }
    }

    if (!bestPlayer) return null;

    // Récupérer les infos du joueur
    const player = await prisma.user.findUnique({
      where: { id: bestPlayer.playerId },
      select: {
        firstname: true,
        lastname: true,
        image: true,
      },
    });

    if (!player) return null;

    return {
      playerId: bestPlayer.playerId,
      playerName: formatPlayerName(player.firstname, player.lastname),
      playerImage: player.image,
      value: bestPlayer.percentage,
      displayValue: `${bestPlayer.percentage}%`,
    };
  } catch (error) {
    console.error("Error fetching top tackler:", error);
    return null;
  }
};

export const getPlayerDashboardStats = async (teamId: number | undefined): Promise<PlayerStatsResult> => {
  const [topTryScorer, topKicker, topPasser, topTackler] = await Promise.all([
    getTopTryScorer(teamId),
    getTopKicker(teamId),
    getTopPasser(teamId),
    getTopTackler(teamId),
  ]);

  return {
    topTryScorer,
    topKicker,
    topPasser,
    topTackler,
  };
};