import { prisma } from "@/lib/prisma";

export interface CreateOrUpdateHalftimeScoreParams {
  matchId: number;
  homeScore: number;
  awayScore: number;
}

export const createOrUpdateHalftimeScore = async (
  params: CreateOrUpdateHalftimeScoreParams
) => {
  try {
    // Vérifier que le match existe
    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
      select: {
        id: true,
        halfTimeScore: {
          select: {
            id: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    });

    if (!match) {
      return {
        success: false,
        error: "Match non trouvé",
      };
    }

    // Si le score de mi-temps existe déjà, le mettre à jour
    if (match.halfTimeScore) {
      const updatedHalftimeScore = await prisma.matchScoreHalfTime.update({
        where: { matchId: params.matchId },
        data: {
          homeScore: params.homeScore,
          awayScore: params.awayScore,
        },
      });

      return {
        success: true,
        halftimeScore: updatedHalftimeScore,
        isUpdate: true,
      };
    }

    // Sinon, créer un nouveau score de mi-temps
    const newHalftimeScore = await prisma.matchScoreHalfTime.create({
      data: {
        matchId: params.matchId,
        homeScore: params.homeScore,
        awayScore: params.awayScore,
      },
    });

    return {
      success: true,
      halftimeScore: newHalftimeScore,
      isUpdate: false,
    };
  } catch (error) {
    console.error("Error creating or updating halftime score:", error);
    return {
      success: false,
      error: "Erreur lors de la création ou mise à jour du score à la mi-temps",
    };
  }
};

export const getHalftimeScore = async (matchId: number) => {
  try {
    const halftimeScore = await prisma.matchScoreHalfTime.findUnique({
      where: { matchId },
      include: {
        match: {
          select: {
            id: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
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
                club: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      halftimeScore,
    };
  } catch (error) {
    console.error("Error getting halftime score:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du score à la mi-temps",
    };
  }
};