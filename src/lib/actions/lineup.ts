"use server";

import { createOrUpdateLineup } from "@/database/matchs/create-or-update-lineup";
import { getMatchDetails } from "@/database/matchs/get-matchs";
import { getRequiredUser } from "@/lib/auth-session";
import { actionClient } from "@/lib/safe-action-client";
import { z } from "zod";

const lineupPlayerSchema = z.object({
  playerId: z.string(),
  number: z.number().min(1).max(50),
});

const saveLineupSchema = z.object({
  matchUlid: z.string(),
  teamId: z.number(),
  lineup: z.array(lineupPlayerSchema),
});

export const saveLineupAction = actionClient
  .inputSchema(saveLineupSchema)
  .action(async ({ parsedInput: { matchUlid, teamId, lineup } }) => {
    const user = await getRequiredUser();

    /*if (
      user.role !== "admin" ||
      (user.job !== "Coach" && user.job !== "Admin")
    ) {
      throw new Error("Accès non autorisé");
    }*/

    const matchData = await getMatchDetails(matchUlid);
    if (!matchData) {
      throw new Error("Match non trouvé");
    }

    if (matchData.match.status !== "Planned") {
      throw new Error(
        "Impossible de modifier la composition d'un match qui n'est pas planifié"
      );
    }

    // Vérifier que l'utilisateur appartient à l'équipe
    const { prisma } = await import("@/lib/prisma");
    const userTeams = await prisma.playerTeams.findMany({
      where: {
        playerId: user.id,
      },
    });
    const isUserInTeam = userTeams.some((team) => team.teamId === teamId);

    if (!isUserInTeam) {
      throw new Error(
        "Vous n'avez pas l'autorisation de modifier cette composition"
      );
    }

    // Vérifier que l'équipe participe au match
    if (matchData.homeTeam.id !== teamId && matchData.awayTeam.id !== teamId) {
      throw new Error("L'équipe ne participe pas à ce match");
    }

    const result = await createOrUpdateLineup({
      matchId: matchData.matchId,
      teamId,
      lineup,
    });

    if (!result.success) {
      throw new Error(result.error || "Erreur lors de la sauvegarde");
    }

    return { success: true };
  });
