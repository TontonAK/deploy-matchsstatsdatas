"use server";

import { actionUser, SafeError } from "@/lib/safe-action-client";
import { LineoutStatCreateSchema } from "@/schemas/lineout-stat-create.schema";
import { createOrUpdatePlayerStats } from "@/database/statistics/create-or-update-player-stats";
import { createLineoutStat } from "@/database/statistics/create-or-update-lineout-stat";
import { getMatchLineupData } from "@/database/matches/get-match-lineup-data";

export const createLineoutStatAction = actionUser
  .inputSchema(LineoutStatCreateSchema)
  .action(async ({ parsedInput: data }) => {
    const matchUlid = data.matchUlid;

    try {
      // Récupérer les données du match
      const matchData = await getMatchLineupData(matchUlid);
      
      if (!matchData.success || !matchData.match) {
        throw new SafeError("Match non trouvé");
      }

      const match = matchData.match;

      // Déterminer le nom de la statistique selon le succès
      const statTypeName = data.success ? "Touches gagnées" : "Touches perdues";

      // Créer ou mettre à jour la statistique
      const statResult = await createOrUpdatePlayerStats({
        matchId: match.id,
        teamId: data.teamId,
        playerId: data.playerId || undefined,
        stats: [
          {
            statTypeName,
            valueToAdd: 1,
          },
        ],
      });

      if (!statResult.success || !statResult.stats || statResult.stats.length === 0) {
        throw new SafeError("Erreur lors de la création de la statistique");
      }

      const createdStat = statResult.stats[0];

      // Créer la statistique détaillée de lineout
      const lineoutStatResult = await createLineoutStat({
        statId: createdStat.id,
        area: data.area,
        nbPlayer: data.nbPlayer,
        catchBlockArea: data.catchBlockArea,
        success: data.success,
        failReason: data.success ? undefined : data.failReason,
      });

      if (!lineoutStatResult.success) {
        throw new SafeError(lineoutStatResult.error || "Erreur lors de la création des détails de touche");
      }

      return {
        success: true,
        statId: createdStat.id,
        lineoutStatId: lineoutStatResult.lineoutStat?.id,
      };
    } catch (error) {
      if (error instanceof SafeError) {
        throw error;
      }
      console.error("Error in lineout stat creation:", error);
      throw new SafeError("Une erreur inattendue s'est produite");
    }
  });