import { prisma } from "@/lib/prisma";

export const getMatchEventTypes = async () => {
  try {
    const eventTypes = await prisma.matchEventType.findMany({
      orderBy: [
        { group: "asc" },
        { name: "asc" },
      ],
    });

    return {
      success: true,
      eventTypes,
    };
  } catch (error) {
    console.error("Error fetching match event types:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des types d'événements",
      eventTypes: [],
    };
  }
};