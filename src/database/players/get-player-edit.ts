import { prisma } from "@/lib/prisma";

export const getPlayerForEdit = async (userId: string) => {
  try {
    const player = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        slug: true,
        firstname: true,
        lastname: true,
        name: true,
        image: true,
        job: true,
        clubId: true,
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        teams: {
          select: {
            teamId: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        positions: {
          select: {
            positionId: true,
            isMainPosition: true,
            position: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
        },
      },
    });

    if (!player) {
      return { success: false, error: "Joueur non trouvé" };
    }

    return { success: true, player };
  } catch (error) {
    console.error("Erreur lors de la récupération du joueur:", error);
    return { success: false, error: "Erreur lors de la récupération du joueur" };
  }
};
