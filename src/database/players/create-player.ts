import { PrismaClient, Role } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

interface CreatePlayerParams {
  email?: string;
  password?: string;
  firstname: string;
  lastname: string;
  job: Role;
  clubId: number;
  teamId: number;
  image?: string;
  mainPositionId?: number;
  secondaryPositionIds?: number[];
}

export const createPlayer = async (params: CreatePlayerParams) => {
  try {
    let newPlayer;

    // Si c'est un Coach ou Admin, utiliser Better Auth Admin plugin
    if (params.job === Role.Coach || params.job === Role.Admin) {
      if (!params.email || !params.password) {
        return {
          success: false,
          error:
            "Email et mot de passe sont requis pour les coachs et administrateurs",
        };
      }

      // Créer l'utilisateur avec Better Auth Admin plugin
      const createdUser = await auth.api.createUser({
        body: {
          email: params.email,
          password: params.password,
          name: `${params.firstname} ${params.lastname}`,
          role: "admin",
          data: {
            firstname: params.firstname,
            lastname: params.lastname,
            slug: `${params.firstname.toLowerCase()}-${params.lastname.toLowerCase()}`,
            clubId: params.clubId,
            job: params.job,
          },
        },
      });

      if (!createdUser) {
        return {
          success: false,
          error: "Erreur lors de la création de l'utilisateur",
        };
      }

      // Mettre à jour l'utilisateur créé par Better Auth
      newPlayer = await prisma.user.update({
        where: {
          email: params.email,
        },
        data: {
          emailVerified: true,
          image: params.image || null,
        },
      });
    } else {
      // Si c'est un Player, créer directement avec Prisma
      const playerSlug = `${params.firstname.toLowerCase()}-${params.lastname.toLowerCase()}`;

      newPlayer = await prisma.user.create({
        data: {
          emailVerified: false, // Les joueurs n'ont pas d'email réel
          firstname: params.firstname,
          lastname: params.lastname,
          name: `${params.firstname} ${params.lastname}`,
          slug: playerSlug,
          clubId: params.clubId,
          job: params.job,
          role: "user",
          image: params.image || null,
        },
      });
    }

    // Associer l'utilisateur à l'équipe
    await prisma.playerTeams.create({
      data: {
        playerId: newPlayer.id,
        teamId: params.teamId,
      },
    });

    // Si l'utilisateur est un joueur, associer les positions
    if (params.job === Role.Player && params.mainPositionId) {
      // Position principale
      await prisma.playersPositions.create({
        data: {
          playerId: newPlayer.id,
          positionId: params.mainPositionId,
          isMainPosition: true,
        },
      });

      // Positions secondaires
      if (
        params.secondaryPositionIds &&
        params.secondaryPositionIds.length > 0
      ) {
        await prisma.playersPositions.createMany({
          data: params.secondaryPositionIds.map((positionId) => ({
            playerId: newPlayer.id,
            positionId,
            isMainPosition: false,
          })),
        });
      }
    }

    return { success: true, user: newPlayer };
  } catch (error) {
    console.error("Erreur lors de la création du joueur:", error);
    return { success: false, error: "Erreur lors de la création du joueur" };
  }
};
