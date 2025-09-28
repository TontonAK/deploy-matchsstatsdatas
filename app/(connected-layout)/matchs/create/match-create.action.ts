"use server";

import { createMatch } from "@/database/matchs/create-match";
import { actionUser, SafeError } from "@/lib/safe-action-client";
import { MatchCreateSchema } from "@/schemas/match-create.schema";

export const createMatchSafeAction = actionUser
  .inputSchema(MatchCreateSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier que l'utilisateur a les permissions nécessaires
    if (user.role !== "admin") {
      throw new SafeError("Vous devez avoir le rôle admin pour créer un match");
    }

    /*if (user.job !== "Coach" && user.job !== "Admin") {
      throw new SafeError(
        "Vous n'avez pas les permissions nécessaires pour créer un match"
      );
    }*/

    // Créer le match
    const result = await createMatch({
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
      leagueId: input.leagueId,
      leaguePoolId: input.leaguePoolId,
      typeMatchId: input.typeMatchId,
      stadiumId: input.stadiumId,
      schedule: input.schedule,
      nbPlayerLineup: input.nbPlayerLineup,
      periodTypeId: input.periodTypeId,
      statTypeIds: input.statTypeIds,
      seasonLeagueId: input.seasonLeagueId,
    });

    if (!result.success) {
      throw new SafeError(
        result.error ?? "Une erreur est survenue lors de la création du match"
      );
    }

    return {
      success: true,
      match: result.match,
    };
  });
