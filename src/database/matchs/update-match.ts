import { MatchStatus, MatchEndingStatus, MatchResult } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface UpdateMatchScoreParams {
  matchId: number;
  homeTeamScoreToAdd?: number;
  awayTeamScoreToAdd?: number;
}

export interface UpdateMatchStatusParams {
  matchId: number;
  status?: MatchStatus;
  endingStatus?: MatchEndingStatus;
}

export interface UpdateMatchFinalScoreParams {
  matchId: number;
  homeScore: number;
  awayScore: number;
  result: MatchResult;
}

export const updateMatchScore = async (params: UpdateMatchScoreParams) => {
  try {
    // Récupérer le match actuel pour obtenir les scores
    const currentMatch = await prisma.match.findUnique({
      where: { id: params.matchId },
      select: {
        scoreHomeTeam: true,
        scoreAwayTeam: true,
      },
    });

    if (!currentMatch) {
      return {
        success: false,
        error: "Match non trouvé",
      };
    }

      const data: {
      scoreHomeTeam?: number;
      scoreAwayTeam?: number;
    } = {};

    if (params.homeTeamScoreToAdd) {
      data.scoreHomeTeam = (currentMatch.scoreHomeTeam || 0) + params.homeTeamScoreToAdd;
    }

    if (params.awayTeamScoreToAdd) {
      data.scoreAwayTeam = (currentMatch.scoreAwayTeam || 0) + params.awayTeamScoreToAdd;
    }

    const updatedMatch = await prisma.match.update({
      where: { id: params.matchId },
      data,
    });

    return {
      success: true,
      match: updatedMatch,
    };
  } catch (error) {
    console.error("Error updating match score:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du score",
    };
  }
};

export const updateMatchStatus = async (params: UpdateMatchStatusParams) => {
  try {
      const data: {
      status?: MatchStatus;
      endingStatus?: MatchEndingStatus;
    } = {};

    if (params.status) {
      data.status = params.status;
    }

    if (params.endingStatus) {
      data.endingStatus = params.endingStatus;
    }

    const updatedMatch = await prisma.match.update({
      where: { id: params.matchId },
      data,
    });

    return {
      success: true,
      match: updatedMatch,
    };
  } catch (error) {
    console.error("Error updating match status:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du statut du match",
    };
  }
};

export const updateMatchFinalScore = async (params: UpdateMatchFinalScoreParams) => {
  try {
    // Vérifier que le match existe
    const currentMatch = await prisma.match.findUnique({
      where: { id: params.matchId },
      select: {
        id: true,
        status: true,
        endingStatus: true,
      },
    });

    if (!currentMatch) {
      return {
        success: false,
        error: "Match non trouvé",
      };
    }

    // Mettre à jour le score final, le résultat et les statuts
    const updatedMatch = await prisma.match.update({
      where: { id: params.matchId },
      data: {
        scoreHomeTeam: params.homeScore,
        scoreAwayTeam: params.awayScore,
        result: params.result,
        status: MatchStatus.Finish,
        endingStatus: MatchEndingStatus.Stat_Not_Sending,
      },
    });

    return {
      success: true,
      match: updatedMatch,
    };
  } catch (error) {
    console.error("Error updating match final score:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du score final",
    };
  }
};