import { prisma } from "@/lib/prisma";

/**
 * Met à jour le pourcentage de réussite en touche pour une équipe dans un match
 * Calcule le taux de réussite basé sur toutes les touches (gagnées vs perdues)
 */
export const updateLineoutSuccessRateForTeam = async (
  matchId: number,
  teamId: number
): Promise<{ success: boolean; percentage?: number; error?: string }> => {
  try {
    // Récupérer toutes les statistiques détaillées de touche pour ce match/équipe
    const lineoutStats = await prisma.lineoutStatGround.findMany({
      where: {
        stat: {
          matchId,
          teamId,
          statType: {
            name: {
              contains: "Touches",
            },
          },
        },
      },
    });

    // Calculer le pourcentage de réussite
    const totalLineouts = lineoutStats.length;
    const successfulLineouts = lineoutStats.filter(
      (stat) => stat.success === true
    ).length;
    const successRate =
      totalLineouts > 0
        ? Math.round((successfulLineouts / totalLineouts) * 100)
        : 0;

    // Récupérer le type de statistique "% réussite en touche"
    const statType = await prisma.statType.findFirst({
      where: {
        name: "% réussite en touche",
      },
    });

    if (!statType) {
      return {
        success: false,
        error:
          "Type de statistique '% réussite en touche' non trouvé en base de données",
      };
    }

    // Vérifier si une statistique existe déjà pour ce match/équipe
    const existingStat = await prisma.stat.findFirst({
      where: {
        matchId,
        teamId,
        playerId: null, // Stat d'équipe, pas de joueur spécifique
        statTypeId: statType.id,
      },
    });

    if (existingStat) {
      // Mettre à jour la statistique existante
      await prisma.stat.update({
        where: { id: existingStat.id },
        data: { value: successRate },
      });
    } else {
      // Créer une nouvelle statistique
      await prisma.stat.create({
        data: {
          matchId,
          teamId,
          playerId: null, // Stat d'équipe
          statTypeId: statType.id,
          value: successRate,
        },
      });
    }

    return {
      success: true,
      percentage: successRate,
    };
  } catch (error) {
    console.error("Error updating lineout success rate:", error);
    return {
      success: false,
      error:
        "Erreur lors de la mise à jour du pourcentage de réussite en touche",
    };
  }
};

/**
 * Met à jour le pourcentage de réussite au pied pour une équipe dans un match
 * Calcule le taux de réussite basé sur les drops, pénalités et transformations
 */
export const updateKickSuccessRateForTeam = async (
  matchId: number,
  teamId: number
): Promise<{ success: boolean; percentage?: number; error?: string }> => {
  try {
    // Récupérer les statistiques de tentatives au pied (drops, pénalités, transformations)
    const [dropsStats, conversionsStats, penaltiesStats] = await Promise.all([
      // Drops
      Promise.all([
        prisma.stat.aggregate({
          where: {
            matchId,
            teamId,
            statType: { name: "Drops tentés" },
          },
          _sum: { value: true },
        }),
        prisma.stat.aggregate({
          where: {
            matchId,
            teamId,
            statType: { name: "Drops réussis" },
          },
          _sum: { value: true },
        }),
      ]),
      // Transformations
      Promise.all([
        prisma.stat.aggregate({
          where: {
            matchId,
            teamId,
            statType: { name: "Transformations tentées" },
          },
          _sum: { value: true },
        }),
        prisma.stat.aggregate({
          where: {
            matchId,
            teamId,
            statType: { name: "Transformations réussies" },
          },
          _sum: { value: true },
        }),
      ]),
      // Pénalités
      Promise.all([
        prisma.stat.aggregate({
          where: {
            matchId,
            teamId,
            statType: { name: "Pénalités tentées" },
          },
          _sum: { value: true },
        }),
        prisma.stat.aggregate({
          where: {
            matchId,
            teamId,
            statType: { name: "Pénalités réussies" },
          },
          _sum: { value: true },
        }),
      ]),
    ]);

    // Calculer le total des tentatives et des réussites
    const dropsAttempted = dropsStats[0]._sum.value || 0;
    const dropsSuccessful = dropsStats[1]._sum.value || 0;
    const conversionsAttempted = conversionsStats[0]._sum.value || 0;
    const conversionsSuccessful = conversionsStats[1]._sum.value || 0;
    const penaltiesAttempted = penaltiesStats[0]._sum.value || 0;
    const penaltiesSuccessful = penaltiesStats[1]._sum.value || 0;

    const totalAttempted =
      dropsAttempted + conversionsAttempted + penaltiesAttempted;
    const totalSuccessful =
      dropsSuccessful + conversionsSuccessful + penaltiesSuccessful;
    const kickSuccessRate =
      totalAttempted > 0
        ? Math.round((totalSuccessful / totalAttempted) * 100)
        : 0;

    // Récupérer le type de statistique "% réussite au pied"
    const statType = await prisma.statType.findFirst({
      where: {
        name: "% réussite au pied",
      },
    });

    if (!statType) {
      return {
        success: false,
        error:
          "Type de statistique '% réussite au pied' non trouvé en base de données",
      };
    }

    // Vérifier si une statistique existe déjà pour ce match/équipe
    const existingStat = await prisma.stat.findFirst({
      where: {
        matchId,
        teamId,
        playerId: null, // Stat d'équipe, pas de joueur spécifique
        statTypeId: statType.id,
      },
    });

    if (existingStat) {
      // Mettre à jour la statistique existante
      await prisma.stat.update({
        where: { id: existingStat.id },
        data: { value: kickSuccessRate },
      });
    } else {
      // Créer une nouvelle statistique
      await prisma.stat.create({
        data: {
          matchId,
          teamId,
          playerId: null, // Stat d'équipe
          statTypeId: statType.id,
          value: kickSuccessRate,
        },
      });
    }

    return {
      success: true,
      percentage: kickSuccessRate,
    };
  } catch (error) {
    console.error("Error updating kick success rate:", error);
    return {
      success: false,
      error:
        "Erreur lors de la mise à jour du pourcentage de réussite au pied",
    };
  }
};
