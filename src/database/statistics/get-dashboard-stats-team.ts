import { prisma } from "@/lib/prisma";

export interface TeamStatsResult {
  winRate: {
    wins: number;
    draws: number;
    losses: number;
    winPercentage: number;
    totalMatches: number;
  };
  averagePenaltiesConceded: number | null;
}

export const getTeamWinRate = async (teamId: number | undefined) => {
  if (!teamId) {
    return {
      wins: 0,
      draws: 0,
      losses: 0,
      winPercentage: 0,
      totalMatches: 0,
    };
  }

  try {
    // Récupérer la saison 2025-2026
    const season = await prisma.season.findFirst({
      where: {
        name: "2025-2026",
      },
    });

    if (!season) {
      return {
        wins: 0,
        draws: 0,
        losses: 0,
        winPercentage: 0,
        totalMatches: 0,
      };
    }

    // Récupérer tous les matchs terminés de l'équipe pour la saison en cours
    const matches = await prisma.match.findMany({
      where: {
        AND: [
          {
            OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
          },
          {
            status: "Finish",
          },
          {
            seasonLeagueMatch: {
              seasonLeague: {
                seasonId: season.id,
              },
            },
          },
        ],
      },
      select: {
        result: true,
        homeTeamId: true,
        awayTeamId: true,
      },
    });

    if (matches.length === 0) {
      return {
        wins: 0,
        draws: 0,
        losses: 0,
        winPercentage: 0,
        totalMatches: 0,
      };
    }

    let wins = 0;
    let draws = 0;
    let losses = 0;

    matches.forEach((match) => {
      const isHomeTeam = match.homeTeamId === teamId;
      const result = match.result;

      if (result === "Draw") {
        draws++;
      } else if (
        (result === "Home_Win" && isHomeTeam) ||
        (result === "Away_Win" && !isHomeTeam)
      ) {
        wins++;
      } else {
        losses++;
      }
    });

    const totalMatches = matches.length;
    const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    return {
      wins,
      draws,
      losses,
      winPercentage,
      totalMatches,
    };
  } catch (error) {
    console.error("Error fetching team win rate:", error);
    return {
      wins: 0,
      draws: 0,
      losses: 0,
      winPercentage: 0,
      totalMatches: 0,
    };
  }
};

export const getAveragePenaltiesConceded = async (teamId: number | undefined) => {
  if (!teamId) return null;

  try {
    // Récupérer la saison 2025-2026
    const season = await prisma.season.findFirst({
      where: {
        name: "2025-2026",
      },
    });

    if (!season) return null;

    // Récupérer le type de statistique "Pénalités concédées"
    const penaltyStatType = await prisma.statType.findFirst({
      where: {
        name: "Pénalités concédées",
      },
    });

    if (!penaltyStatType) return null;

    // Récupérer tous les matchs terminés de l'équipe pour la saison en cours
    const finishedMatches = await prisma.match.findMany({
      where: {
        AND: [
          {
            OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
          },
          {
            status: "Finish",
          },
          {
            seasonLeagueMatch: {
              seasonLeague: {
                seasonId: season.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (finishedMatches.length === 0) return null;

    const matchIds = finishedMatches.map((match) => match.id);

    // Récupérer les statistiques de pénalités concédées pour l'équipe sur ces matchs
    const penaltyStats = await prisma.stat.findMany({
      where: {
        matchId: { in: matchIds },
        teamId: teamId,
        statTypeId: penaltyStatType.id,
      },
      select: {
        value: true,
      },
    });

    if (penaltyStats.length === 0) return null;

    const totalPenalties = penaltyStats.reduce((sum, stat) => sum + stat.value, 0);
    const averagePenalties = totalPenalties / finishedMatches.length;

    // Retourner avec un seul décimal si nécessaire, sinon entier
    return Math.round(averagePenalties * 10) / 10;
  } catch (error) {
    console.error("Error fetching average penalties conceded:", error);
    return null;
  }
};

export const getTeamDashboardStats = async (teamId: number | undefined): Promise<TeamStatsResult> => {
  const [winRate, averagePenaltiesConceded] = await Promise.all([
    getTeamWinRate(teamId),
    getAveragePenaltiesConceded(teamId),
  ]);

  return {
    winRate,
    averagePenaltiesConceded,
  };
};