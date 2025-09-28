import { prisma } from "@/lib/prisma";

export interface MatchEventWithDetails {
  id: number;
  minute: number;
  description: string | null;
  eventType: {
    id: number;
    name: string;
    group: string | null;
  };
  team: {
    id: number;
    name: string;
    club: {
      id: number;
      name: string;
      primaryColor: string;
      secondaryColor: string;
    };
  };
  mainPlayer: {
    id: string;
    firstname: string;
    lastname: string;
  } | null;
  secondPlayer: {
    id: string;
    firstname: string;
    lastname: string;
  } | null;
}

export const getMatchEvents = async (matchUlid: string) => {
  try {
    // Récupérer l'ID du match à partir de l'ULID
    const match = await prisma.match.findUnique({
      where: { ulid: matchUlid },
      select: { id: true },
    });

    if (!match) {
      return {
        success: false,
        error: "Match non trouvé",
        events: [],
      };
    }

    const events = await prisma.matchEvent.findMany({
      where: {
        matchId: match.id,
      },
      include: {
        eventType: {
          select: {
            id: true,
            name: true,
            group: true,
          },
        },
        team: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                primaryColor: true,
                secondaryColor: true,
              },
            },
          },
        },
        mainPlayer: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
        secondPlayer: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: [
        { minute: "asc" },
        { id: "asc" },
      ],
    });

    return {
      success: true,
      events: events as MatchEventWithDetails[],
    };
  } catch (error) {
    console.error("Error fetching match events:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des événements",
      events: [],
    };
  }
};