"use server";

import { actionUser, SafeError } from "@/lib/safe-action-client";
import { KickStatCreateSchema } from "@/schemas/kick-stat-create.schema";
import { createOrUpdatePlayerStats } from "@/database/statistics/create-or-update-player-stats";
import { createKickStat } from "@/database/statistics/create-or-update-kick-stat";
import { getMatchLineupData } from "@/database/matches/get-match-lineup-data";
import { prisma } from "@/lib/prisma";

export const createKickStatAction = actionUser
  .inputSchema(KickStatCreateSchema)
  .action(async ({ parsedInput: data }) => {
    const matchUlid = data.matchUlid;

    try {
      // Récupérer les données du match
      const matchData = await getMatchLineupData(matchUlid);
      
      if (!matchData.success || !matchData.match) {
        throw new SafeError("Match non trouvé");
      }

      const match = matchData.match;

      // Récupérer le type de statistique sélectionné
      const statType = await prisma.statType.findUnique({
        where: { id: data.statTypeId },
      });

      if (!statType) {
        throw new SafeError("Type de statistique non trouvé");
      }

      // Créer les statistiques à mettre à jour
      const statsToUpdate: { statTypeName: string; valueToAdd: number }[] = [];

      // Ajouter la statistique principale (toujours le type "tenté")
      statsToUpdate.push({
        statTypeName: statType.name,
        valueToAdd: 1,
      });

      // Si c'est réussi et que c'est un type "tenté", ajouter la statistique "réussi"
      if (data.success) {
        const successStatTypeNames: Record<string, string> = {
          "Drops tentés": "Drops réussis",
          "Transformations tentées": "Transformations réussies", 
          "Pénalités tentées": "Pénalités réussies",
        };

        const successStatName = successStatTypeNames[statType.name];
        if (successStatName) {
          statsToUpdate.push({
            statTypeName: successStatName,
            valueToAdd: 1,
          });
        }
      }

      // Créer ou mettre à jour les statistiques
      const statResult = await createOrUpdatePlayerStats({
        matchId: match.id,
        teamId: data.teamId,
        playerId: data.playerId || undefined,
        stats: statsToUpdate,
      });

      if (!statResult.success || !statResult.stats || statResult.stats.length === 0) {
        throw new SafeError("Erreur lors de la création des statistiques");
      }

      // Utiliser la première statistique créée/mise à jour (qui correspond au type principal)
      const mainStat = statResult.stats[0];

      // Créer la statistique détaillée de coup de pied
      const kickStatResult = await createKickStat({
        statId: mainStat.id,
        startAreaKick: data.startAreaKick,
        endAreaKick: data.endAreaKick,
        deadBall: data.deadBall,
        success: data.success,
        comment: data.comment,
      });

      if (!kickStatResult.success) {
        throw new SafeError(kickStatResult.error || "Erreur lors de la création des détails de coup de pied");
      }

      return {
        success: true,
        statId: mainStat.id,
        kickStatId: kickStatResult.kickStat?.id,
        updatedStats: statResult.stats.length,
      };
    } catch (error) {
      if (error instanceof SafeError) {
        throw error;
      }
      console.error("Error in kick stat creation:", error);
      throw new SafeError("Une erreur inattendue s'est produite");
    }
  });