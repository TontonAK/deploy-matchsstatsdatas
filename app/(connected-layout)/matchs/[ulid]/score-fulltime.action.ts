"use server";

import { actionUser, SafeError } from "@/lib/safe-action-client";
import { updateMatchFinalScore } from "@/database/matchs/update-match";
import { prisma } from "@/lib/prisma";
import { MatchResult } from "@/generated/prisma";
import { z } from "zod";

const scoreFulltimeSchema = z.object({
  matchId: z.number().positive("L'ID du match est requis"),
  homeScore: z.number().min(0, "Le score de l'équipe à domicile doit être positif ou nul"),
  awayScore: z.number().min(0, "Le score de l'équipe à l'extérieur doit être positif ou nul"),
  result: z.nativeEnum(MatchResult, {
    errorMap: () => ({ message: "Le résultat du match est requis" }),
  }),
});

export const scoreFulltimeAction = actionUser
  .inputSchema(scoreFulltimeSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier les permissions : Admin ou Coach
    if (user.job !== "Admin" && user.job !== "Coach") {
      throw new SafeError("Seuls les administrateurs et entraîneurs peuvent modifier le score final");
    }

    // Récupérer les détails du match
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      select: {
        id: true,
        status: true,
        endingStatus: true,
        scoreHomeTeam: true,
        scoreAwayTeam: true,
        result: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: {
              select: {
                name: true,
              },
            },
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new SafeError("Match non trouvé");
    }

    // Vérifier que l'utilisateur appartient à une des équipes du match ou est admin global
    if (user.role !== "admin") {
      const userTeams = await prisma.playerTeams.findMany({
        where: {
          playerId: user.id,
        },
        include: {
          team: {
            select: {
              clubId: true,
            },
          },
        },
      });

      const userClubIds = userTeams.map(team => team.team.clubId);
      const matchClubIds = [match.homeTeam.clubId, match.awayTeam.clubId];

      const hasAccess = userClubIds.some(clubId => matchClubIds.includes(clubId));

      if (!hasAccess) {
        throw new SafeError("Vous n'avez pas l'autorisation de modifier le score final pour ce match");
      }
    }

    // Valider la cohérence entre les scores et le résultat
    const { homeScore, awayScore, result } = input;
    let expectedResult: MatchResult;

    if (homeScore > awayScore) {
      expectedResult = MatchResult.Home_Win;
    } else if (homeScore < awayScore) {
      expectedResult = MatchResult.Away_Win;
    } else {
      expectedResult = MatchResult.Draw;
    }

    if (result !== expectedResult) {
      const resultLabels = {
        [MatchResult.Home_Win]: `Victoire ${match.homeTeam.club.name}`,
        [MatchResult.Away_Win]: `Victoire ${match.awayTeam.club.name}`,
        [MatchResult.Draw]: "Match nul",
      };

      throw new SafeError(
        `Le résultat sélectionné "${resultLabels[result]}" ne correspond pas aux scores saisis (${homeScore}-${awayScore}). Le résultat devrait être "${resultLabels[expectedResult]}".`
      );
    }

    try {
      // Mettre à jour le score final, le résultat et les statuts
      const updateResult = await updateMatchFinalScore({
        matchId: input.matchId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        result: input.result,
      });

      if (!updateResult.success) {
        throw new SafeError(updateResult.error || "Erreur lors de l'enregistrement du score final");
      }

      const hasExistingScore = match.scoreHomeTeam !== null && match.scoreAwayTeam !== null;

      return {
        success: true,
        message: hasExistingScore
          ? "Score final mis à jour avec succès"
          : "Score final enregistré avec succès",
        data: {
          finalScore: {
            homeScore: input.homeScore,
            awayScore: input.awayScore,
            result: input.result,
          },
          isUpdate: hasExistingScore,
          match: {
            homeTeam: {
              name: match.homeTeam.name,
              clubName: match.homeTeam.club.name,
            },
            awayTeam: {
              name: match.awayTeam.name,
              clubName: match.awayTeam.club.name,
            },
          },
        },
      };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du score final:", error);
      if (error instanceof SafeError) {
        throw error;
      }
      throw new SafeError("Erreur lors de l'enregistrement du score final");
    }
  });