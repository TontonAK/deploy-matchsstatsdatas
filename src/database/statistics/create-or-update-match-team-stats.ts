import { StatValueType } from "@/generated/prisma";
import { getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export interface UpdateMatchTeamStatsParams {
  matchId: number;
  teamId: number;
  stats: {
    statTypeId: number;
    newValue: number;
  }[];
}

// Fonction helper pour créer ou mettre à jour une statistique
const upsertStat = async (
  matchId: number,
  teamId: number,
  playerId: string | null,
  statTypeId: number,
  value: number
) => {
  const existingStat = await prisma.stat.findFirst({
    where: { matchId, teamId, playerId, statTypeId },
  });

  if (existingStat) {
    if (existingStat.value !== value) {
      await prisma.stat.update({
        where: { id: existingStat.id },
        data: { value },
      });
    }
  } else {
    await prisma.stat.create({
      data: { matchId, teamId, playerId, statTypeId, value },
    });
  }
};

// Interface pour les configurations de calcul de pourcentage
interface PercentageCalculation {
  name: string;
  numeratorStats: string[];
  denominatorStats: string[];
  calculate: (numerator: number, denominator: number) => number;
}

// Configuration des calculs de pourcentages pour les stats d'équipe uniquement
const teamPercentageCalculations: PercentageCalculation[] = [
  {
    name: "% réussite dans les rucks",
    numeratorStats: ["Rucks gagnés"],
    denominatorStats: ["Rucks gagnés", "Rucks perdus"],
    calculate: (numerator, denominator) =>
      denominator > 0 ? Math.round((numerator / denominator) * 100) : 0,
  },
  {
    name: "% réussite des mêlées",
    numeratorStats: ["Mêlées gagnées"],
    denominatorStats: ["Mêlées gagnées", "Mêlées perdues"],
    calculate: (numerator, denominator) =>
      denominator > 0 ? Math.round((numerator / denominator) * 100) : 0,
  },
];

// Fonction pour calculer les pourcentages automatiquement pour les stats d'équipe
const calculateTeamPercentageStats = async (
  matchId: number,
  teamId: number
) => {
  try {
    // Récupérer tous les types de stats pour calculer les pourcentages
    const allStatTypes = await prisma.statType.findMany({
      select: { id: true, name: true, valueType: true },
    });

    // Récupérer toutes les stats actuelles de l'équipe pour ce match
    const currentStats = await prisma.stat.findMany({
      where: {
        matchId,
        teamId,
        playerId: null,
      },
      include: {
        statType: true,
      },
    });

    // Créer un map pour faciliter la récupération des valeurs
    const statsMap = new Map<string, number>();
    currentStats.forEach((stat) => {
      statsMap.set(stat.statType.name, stat.value);
    });

    const percentageUpdates = [];

    // Calculer chaque pourcentage selon la configuration
    for (const config of teamPercentageCalculations) {
      const numerator = config.numeratorStats.reduce(
        (sum, statName) => sum + (statsMap.get(statName) || 0),
        0
      );
      const denominator = config.denominatorStats.reduce(
        (sum, statName) => sum + (statsMap.get(statName) || 0),
        0
      );
      const percentage = config.calculate(numerator, denominator);

      const percentageType = allStatTypes.find((st) => st.name === config.name);
      if (percentageType) {
        await upsertStat(matchId, teamId, null, percentageType.id, percentage);
        percentageUpdates.push({
          statTypeId: percentageType.id,
          newValue: percentage,
        });
      }
    }

    return percentageUpdates;
  } catch (error) {
    console.error("Error calculating team percentage stats:", error);
    return [];
  }
};

export const createOrUpdateMatchTeamStats = async (
  params: UpdateMatchTeamStatsParams
) => {
  try {
    // Vérifier l'utilisateur connecté et ses permissions
    const currentUser = await getUser();
    if (!currentUser || currentUser.role !== "admin") {
      return {
        success: false,
        error:
          "Permission insuffisante. Seuls les administrateurs peuvent modifier les statistiques.",
      };
    }

    // Vérifier que le match existe et est terminé
    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
      select: {
        id: true,
        status: true,
        endingStatus: true,
        homeTeamId: true,
        awayTeamId: true,
      },
    });

    if (
      !match ||
      match.status !== "Finish" ||
      match.endingStatus === "Waiting_End"
    ) {
      return {
        success: false,
        error:
          "Le match doit être terminé et en état de modification des statistiques.",
      };
    }

    // Vérifier que l'équipe fait partie du match
    if (
      match.homeTeamId !== params.teamId &&
      match.awayTeamId !== params.teamId
    ) {
      return {
        success: false,
        error: "L'équipe ne fait pas partie de ce match.",
      };
    }

    // Vérifier que l'équipe appartient au club de l'utilisateur
    const team = await prisma.team.findUnique({
      where: { id: params.teamId },
      select: { clubId: true },
    });

    if (!team || team.clubId !== currentUser.clubId) {
      return {
        success: false,
        error: "Vous ne pouvez modifier que les statistiques de votre équipe.",
      };
    }

    const results = [];
    const updatedStats = [];

    // Traiter chaque statistique (uniquement celles de type Number)
    for (const stat of params.stats) {
      // Récupérer le type de statistique
      const statType = await prisma.statType.findUnique({
        where: { id: stat.statTypeId },
      });

      if (!statType) {
        console.warn(`Type de statistique non trouvé: ${stat.statTypeId}`);
        continue;
      }

      // Ne traiter que les stats de type Number
      if (statType.valueType !== StatValueType.Number) {
        continue;
      }

      // Vérifier si la statistique existe déjà
      const existingStat = await prisma.stat.findFirst({
        where: {
          matchId: params.matchId,
          teamId: params.teamId,
          playerId: null,
          statTypeId: stat.statTypeId,
        },
      });

      let result;

      if (existingStat) {
        // Ne mettre à jour que si la valeur a changé
        if (existingStat.value !== stat.newValue) {
          result = await prisma.stat.update({
            where: { id: existingStat.id },
            data: { value: stat.newValue },
            include: { statType: true },
          });
          updatedStats.push({
            statTypeId: stat.statTypeId,
            oldValue: existingStat.value,
            newValue: stat.newValue,
          });
        }
      } else {
        // Créer une nouvelle statistique si la valeur n'est pas 0
        if (stat.newValue !== 0) {
          result = await prisma.stat.create({
            data: {
              matchId: params.matchId,
              teamId: params.teamId,
              playerId: null,
              statTypeId: stat.statTypeId,
              value: stat.newValue,
            },
            include: { statType: true },
          });
          updatedStats.push({
            statTypeId: stat.statTypeId,
            oldValue: 0,
            newValue: stat.newValue,
          });
        }
      }

      if (result) {
        results.push(result);
      }
    }

    // Calculer et mettre à jour les pourcentages automatiquement
    const percentageUpdates = await calculateTeamPercentageStats(
      params.matchId,
      params.teamId
    );

    return {
      success: true,
      stats: results,
      updatedStats,
      percentageUpdates,
      message: `${updatedStats.length} statistique(s) mise(s) à jour et ${percentageUpdates.length} pourcentage(s) recalculé(s).`,
    };
  } catch (error) {
    console.error("Error creating/updating match team stats:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des statistiques.",
    };
  }
};
