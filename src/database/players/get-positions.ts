import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const getPositions = async () => {
  try {
    const positions = await prisma.position.findMany({
      select: {
        id: true,
        name: true,
        shortName: true,
        group: true,
      },
      orderBy: [
        {
          group: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return { success: true, positions };
  } catch (error) {
    console.error("Erreur lors de la récupération des positions:", error);
    return { success: false, error: "Erreur lors de la récupération des positions" };
  }
};