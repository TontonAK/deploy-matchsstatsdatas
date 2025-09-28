import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const getClubsWithTeams = async () => {
  try {
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, clubs };
  } catch (error) {
    console.error("Erreur lors de la récupération des clubs:", error);
    return { success: false, error: "Erreur lors de la récupération des clubs" };
  }
};