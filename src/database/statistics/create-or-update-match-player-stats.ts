import { StatValueType } from "@/generated/prisma";
import { getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export interface UpdateMatchPlayerStatParams {
  matchId: number;
  teamId: number;
  playerId: string;
  statTypeId: number;
  newValue: number;
}

export interface UpdateMatchPlayerStatsParams {
  matchId: number;
  teamId: number;
  playerId: string;
  stats: {
    statTypeId: number;
    newValue: number;
  }[];
}

// Fonction pour calculer les pourcentages automatiquement
const calculatePercentageStats = async (
  matchId: number,
  teamId: number,
  playerId: string
) => {
  try {
    // Récupérer tous les types de stats pour calculer les pourcentages
    const allStatTypes = await prisma.statType.findMany({
      select: { id: true, name: true, valueType: true },
    });

    // Récupérer toutes les stats actuelles du joueur pour ce match
    const currentStats = await prisma.stat.findMany({
      where: {
        matchId,
        teamId,
        playerId,
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
          playerId,
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
            playerId,
            statTypeId: update.statTypeId,
            value: update.newValue,
          },
        });
      }
    }

    return percentageUpdates;
  } catch (error) {
    console.error("Error calculating percentage stats:", error);
    return [];
  }
};

export const createOrUpdateMatchPlayerStats = async (
  params: UpdateMatchPlayerStatsParams
) => {
  try {
    // Vérifier l'utilisateur connecté et ses permissions
    const currentUser = await getUser();
    /*if (!currentUser || currentUser.job !== "Admin") {
      return {
        success: false,
        error: "Permission insuffisante. Seuls les administrateurs peuvent modifier les statistiques.",
      };
    }*/

    // Vérifier que le match existe et est terminé
    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
      select: {
        id: true,
        status: true,
        endingStatus: true,
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

    // Vérifier que le joueur fait partie de la lineup
    const lineup = await prisma.matchLineup.findFirst({
      where: {
        matchId: params.matchId,
        playerId: params.playerId,
        teamId: params.teamId,
      },
    });

    if (!lineup) {
      return {
        success: false,
        error: "Le joueur ne fait pas partie de la composition pour ce match.",
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
          playerId: params.playerId,
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
              playerId: params.playerId,
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
    const percentageUpdates = await calculatePercentageStats(
      params.matchId,
      params.teamId,
      params.playerId
    );

    return {
      success: true,
      stats: results,
      updatedStats,
      percentageUpdates,
      message: `${updatedStats.length} statistique(s) mise(s) à jour et ${percentageUpdates.length} pourcentage(s) recalculé(s).`,
    };
  } catch (error) {
    console.error("Error creating/updating match player stats:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des statistiques.",
    };
  }
};
