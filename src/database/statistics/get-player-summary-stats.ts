import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-session";

export interface PlayerSummaryStats {
  matchesPlayed: number;
  globalStats: {
    statTypeId: number;
    statTypeName: string;
    totalValue: number;
  }[];
  percentageStats: {
    statName: string;
    percentage: number;
    successful: number;
    attempted: number;
  }[];
}

// Fonction utilitaire pour calculer le pourcentage
const calculatePercentage = (successful: number, attempted: number): number => {
  if (attempted === 0) return 0;
  return Math.round((successful / attempted) * 100);
};

export const getPlayerSummaryStats = async (
  playerId: string
): Promise<PlayerSummaryStats | null> => {
  try {
    // Vérifier l'utilisateur connecté et ses permissions
    const currentUser = await getUser();
    if (!currentUser) return null;

    // Récupérer le joueur cible et vérifier qu'il appartient au même club
    const targetPlayer = await prisma.user.findUnique({
      where: { id: playerId },
      select: {
        clubId: true,
        positions: {
          where: { isMainPosition: true },
          select: {
            position: {
              select: {
                type: true,
              },
            },
          },
        },
      },
    });

    if (!targetPlayer || targetPlayer.clubId !== currentUser.clubId) {
      return null;
    }

    // Récupérer la saison actuelle (2025-2026)
    const currentSeason = await prisma.season.findFirst({
      where: { name: "2025-2026" },
    });

    if (!currentSeason) return null;

    // Récupérer les matchs terminés où le joueur a participé pour la saison actuelle
    const playerMatches = await prisma.matchLineup.findMany({
      where: {
        playerId: playerId,
        match: {
          status: "Finish",
          seasonLeagueMatch: {
            seasonLeague: { seasonId: currentSeason.id },
          },
        },
      },
      select: {
        matchId: true,
        teamId: true,
      },
    });

    const matchesPlayed = playerMatches.length;
    const matchIds = playerMatches.map((m) => m.matchId);

    if (matchIds.length === 0) {
      return {
        matchesPlayed: 0,
        globalStats: [],
        percentageStats: [],
      };
    }

    // Récupérer les types de statistiques avec group "Player" ou "All"
    const statTypes = await prisma.statType.findMany({
      where: {
        group: { in: ["Player", "All"] },
      },
    });

    // Calculer les statistiques globales (sommes)
    const globalStatsPromises = statTypes.map(async (statType) => {
      const totalValue = await prisma.stat.aggregate({
        where: {
          matchId: { in: matchIds },
          playerId: playerId,
          statTypeId: statType.id,
        },
        _sum: {
          value: true,
        },
      });

      return {
        statTypeId: statType.id,
        statTypeName: statType.name,
        totalValue: totalValue._sum.value || 0,
      };
    });

    const globalStats = await Promise.all(globalStatsPromises);

    // Calculer les statistiques de pourcentage
    const percentageStats: {
      statName: string;
      percentage: number;
      successful: number;
      attempted: number;
    }[] = [];

    // Stats communes à tous
    const commonStats = [
      {
        name: "Pourcentage d'efficacité sur les passes",
        attempted: "Passes tentées",
        successful: "Passes réussies",
      },
      {
        name: "Pourcentage d'efficacité au plaquage",
        attempted: "Plaquages tentés",
        successful: "Plaquages réussis",
      },
    ];

    // Déterminer si le joueur est un avant ou un arrière
    const mainPosition = targetPlayer.positions[0];
    const isForward = mainPosition?.position.type === "Forwards";
    const isBack = mainPosition?.position.type === "Backs";

    // Ajouter les stats spécifiques aux avants
    let specificStats: {
      name: string;
      attempted: string[];
      successful: string[];
    }[] = [];

    if (isForward) {
      specificStats = [
        {
          name: "Pourcentage de mêlée gagné",
          attempted: ["Mêlées gagnées", "Mêlées perdues"],
          successful: ["Mêlées gagnées"],
        },
        {
          name: "Pourcentage de touche gagné",
          attempted: ["Touches gagnées", "Touches perdues"],
          successful: ["Touches gagnées"],
        },
      ];
    } else if (isBack) {
      specificStats = [
        {
          name: "Pourcentage de réussite au pied",
          attempted: ["Drops tentés", "Transformations tentées", "Pénalités tentées"],
          successful: ["Drops réussis", "Transformations réussies", "Pénalités réussies"],
        },
      ];
    }

    // Calculer les pourcentages pour les stats communes
    for (const stat of commonStats) {
      const attemptedStat = globalStats.find(s => s.statTypeName === stat.attempted);
      const successfulStat = globalStats.find(s => s.statTypeName === stat.successful);

      const attempted = attemptedStat?.totalValue || 0;
      const successful = successfulStat?.totalValue || 0;

      percentageStats.push({
        statName: stat.name,
        percentage: calculatePercentage(successful, attempted),
        successful,
        attempted,
      });
    }

    // Calculer les pourcentages pour les stats spécifiques
    for (const stat of specificStats) {
      const attemptedTotal = stat.attempted.reduce((sum, statName) => {
        const statValue = globalStats.find(s => s.statTypeName === statName);
        return sum + (statValue?.totalValue || 0);
      }, 0);

      const successfulTotal = stat.successful.reduce((sum, statName) => {
        const statValue = globalStats.find(s => s.statTypeName === statName);
        return sum + (statValue?.totalValue || 0);
      }, 0);

      percentageStats.push({
        statName: stat.name,
        percentage: calculatePercentage(successfulTotal, attemptedTotal),
        successful: successfulTotal,
        attempted: attemptedTotal,
      });
    }

    return {
      matchesPlayed,
      globalStats: globalStats.filter(stat => stat.totalValue > 0),
      percentageStats: percentageStats.filter(stat => stat.attempted > 0),
    };
  } catch (error) {
    console.error("Error fetching player summary stats:", error);
    return null;
  }
};