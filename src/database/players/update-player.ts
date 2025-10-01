import { PrismaClient, Role } from "@/generated/prisma";

const prisma = new PrismaClient();

interface UpdatePlayerParams {
  userId: string;
  firstname: string;
  lastname: string;
  job: Role;
  clubId: number;
  teamId: number;
  image?: string;
  mainPositionId?: number;
  secondaryPositionIds?: number[];
}

export const updatePlayer = async (params: UpdatePlayerParams) => {
  try {
    // Mettre à jour les informations de base de l'utilisateur
    const slug = `${params.firstname.toLowerCase()}-${params.lastname.toLowerCase()}`;

    const updatedPlayer = await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        firstname: params.firstname,
        lastname: params.lastname,
        name: `${params.firstname} ${params.lastname}`,
        slug: slug,
        clubId: params.clubId,
        job: params.job,
        ...(params.image && { image: params.image }),
      },
    });

    // Mettre à jour l'équipe du joueur
    // D'abord, supprimer l'ancienne association d'équipe
    await prisma.playerTeams.deleteMany({
      where: {
        playerId: params.userId,
      },
    });

    // Créer la nouvelle association
    await prisma.playerTeams.create({
      data: {
        playerId: params.userId,
        teamId: params.teamId,
      },
    });

    // Si l'utilisateur est un joueur, mettre à jour les positions
    if (params.job === Role.Player) {
      // Supprimer toutes les anciennes positions
      await prisma.playersPositions.deleteMany({
        where: {
          playerId: params.userId,
        },
      });

      // Ajouter la position principale si présente
      if (params.mainPositionId) {
        await prisma.playersPositions.create({
          data: {
            playerId: params.userId,
            positionId: params.mainPositionId,
            isMainPosition: true,
          },
        });

        // Ajouter les positions secondaires
        if (
          params.secondaryPositionIds &&
          params.secondaryPositionIds.length > 0
        ) {
          await prisma.playersPositions.createMany({
            data: params.secondaryPositionIds.map((positionId) => ({
              playerId: params.userId,
              positionId,
              isMainPosition: false,
            })),
          });
        }
      }
    } else {
      // Si ce n'est pas un joueur, supprimer toutes les positions
      await prisma.playersPositions.deleteMany({
        where: {
          playerId: params.userId,
        },
      });
    }

    return { success: true, user: updatedPlayer };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du joueur:", error);
    return { success: false, error: "Erreur lors de la mise à jour du joueur" };
  }
};
