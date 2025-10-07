import { StatValueType } from "@/generated/prisma";
import { getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export interface UpdateMatchOpponentStatsParams {
  matchId: number;
  opponentTeamId: number;
  stats: {
    statTypeId: number;
    newValue: number;
  }[];
}

// Fonction pour calculer les pourcentages automatiquement pour l'équipe adverse
const calculateOpponentPercentageStats = async (
  matchId: number,
  teamId: number
) => {
  try {
    // Récupérer tous les types de stats pour calculer les pourcentages
    const allStatTypes = await prisma.statType.findMany({
      select: { id: true, name: true, valueType: true },
    });

    // Récupérer toutes les stats actuelles de l'équipe adverse pour ce match
    const currentStats = await prisma.stat.findMany({
      where: {
        matchId,
        teamId,
        playerId: null, // Stats d'équipe uniquement
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

    // Calculer et mettre à jour les pourcentages
    const percentageUpdates = [];

    // % réussite des passes
    const passesTentees = statsMap.get("Passes tentées") || 0;
    const passesReussies = statsMap.get("Passes réussies") || 0;
    const passesPourcentage =
      passesTentees > 0
        ? Math.round((passesReussies / passesTentees) * 100)
        : 0;

    const passesPourcentageType = allStatTypes.find(
      (st) => st.name === "% réussite des passes"
    );
    if (passesPourcentageType) {
      percentageUpdates.push({
        statTypeId: passesPourcentageType.id,
        newValue: passesPourcentage,
      });
    }

    // % efficacité des plaquages
    const plaquagesTentes = statsMap.get("Plaquages tentés") || 0;
    const plaquagesReussis = statsMap.get("Plaquages réussis") || 0;
    const plaquagesPourcentage =
      plaquagesTentes > 0
        ? Math.round((plaquagesReussis / plaquagesTentes) * 100)
        : 0;

    const plaquagesPourcentageType = allStatTypes.find(
      (st) => st.name === "% efficacité des plaquages"
    );
    if (plaquagesPourcentageType) {
      percentageUpdates.push({
        statTypeId: plaquagesPourcentageType.id,
        newValue: plaquagesPourcentage,
      });
    }

    // % réussite dans les rucks
    const rucksGagnes = statsMap.get("Rucks gagnés") || 0;
    const rucksPerdus = statsMap.get("Rucks perdus") || 0;
    const rucksTotal = rucksGagnes + rucksPerdus;
    const rucksPourcentage =
      rucksTotal > 0 ? Math.round((rucksGagnes / rucksTotal) * 100) : 0;

    const rucksPourcentageType = allStatTypes.find(
      (st) => st.name === "% réussite dans les rucks"
    );
    if (rucksPourcentageType) {
      percentageUpdates.push({
        statTypeId: rucksPourcentageType.id,
        newValue: rucksPourcentage,
      });
    }

    // % réussite dans les mêlée
    const meleesGagnes = statsMap.get("Mêlées gagnées") || 0;
    const meleesPerdus = statsMap.get("Mêlées perdues") || 0;
    const meleesTotal = meleesGagnes + meleesPerdus;
    const meleesPourcentage =
      meleesTotal > 0 ? Math.round((meleesGagnes / meleesTotal) * 100) : 0;

    const meleesPourcentageType = allStatTypes.find(
      (st) => st.name === "% réussite en mêlée"
    );
    if (meleesPourcentageType) {
      percentageUpdates.push({
        statTypeId: meleesPourcentageType.id,
        newValue: meleesPourcentage,
      });
    }

    // % réussite dans le jeu au pied (sur drops/pénalités/transformations)
    const dropsTentes = statsMap.get("Drops tentés") || 0;
    const penalitesTentees = statsMap.get("Pénalités tentées") || 0;
    const transformationsTentees = statsMap.get("Transformations tentées") || 0;
    const dropsReussis = statsMap.get("Drops réussis") || 0;
    const penalitesReussies = statsMap.get("Pénalités réussies") || 0;
    const transformationsReussies =
      statsMap.get("Transformations réussies") || 0;

    const footTotal = dropsTentes + penalitesTentees + transformationsTentees;
    const footSuccessTotal =
      dropsReussis + penalitesReussies + transformationsReussies;
    const footPercentage =
      footTotal > 0 ? Math.round((footSuccessTotal / footTotal) * 100) : 0;

    const footPercentageType = allStatTypes.find(
      (st) => st.name === "% réussite au pied"
    );
    if (footPercentageType) {
      percentageUpdates.push({
        statTypeId: footPercentageType.id,
        newValue: footPercentage,
      });
    }

    // Appliquer les mises à jour des pourcentages
    for (const update of percentageUpdates) {
      const existingStat = await prisma.stat.findFirst({
        where: {
          matchId,
          teamId,
          playerId: null,
          statTypeId: update.statTypeId,
        },
      });

      if (existingStat) {
        await prisma.stat.update({
          where: { id: existingStat.id },
          data: { value: update.newValue },
        });
      } else {
        await prisma.stat.create({
          data: {
            matchId,
            teamId,
            playerId: null,
            statTypeId: update.statTypeId,
            value: update.newValue,
          },
        });
      }
    }

    return percentageUpdates;
  } catch (error) {
    console.error("Error calculating opponent percentage stats:", error);
    return [];
  }
};

export const createOrUpdateOpponentStats = async (
  params: UpdateMatchOpponentStatsParams
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
        homeTeam: { select: { clubId: true } },
        awayTeam: { select: { clubId: true } },
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

    // Vérifier que l'équipe fait bien partie du match
    if (
      params.opponentTeamId !== match.homeTeamId &&
      params.opponentTeamId !== match.awayTeamId
    ) {
      return {
        success: false,
        error: "L'équipe spécifiée ne fait pas partie de ce match.",
      };
    }

    // Vérifier que c'est bien l'équipe adverse (pas celle de l'utilisateur)
    const userTeam =
      match.homeTeam.clubId === currentUser.clubId
        ? match.homeTeamId
        : match.awayTeamId;
    if (params.opponentTeamId === userTeam) {
      return {
        success: false,
        error:
          "Vous ne pouvez pas modifier les statistiques de votre propre équipe ici.",
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

      // Vérifier que la stat est bien de type "Team" ou "All"
      if (statType.group !== "Team" && statType.group !== "All") {
        continue;
      }

      // Vérifier si la statistique existe déjà
      const existingStat = await prisma.stat.findFirst({
        where: {
          matchId: params.matchId,
          teamId: params.opponentTeamId,
          playerId: null, // Stats d'équipe uniquement
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
              teamId: params.opponentTeamId,
              playerId: null, // Stats d'équipe uniquement
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
    const percentageUpdates = await calculateOpponentPercentageStats(
      params.matchId,
      params.opponentTeamId
    );

    return {
      success: true,
      stats: results,
      updatedStats,
      percentageUpdates,
      message: `${updatedStats.length} statistique(s) mise(s) à jour et ${percentageUpdates.length} pourcentage(s) recalculé(s).`,
    };
  } catch (error) {
    console.error("Error creating/updating opponent stats:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des statistiques.",
    };
  }
};
