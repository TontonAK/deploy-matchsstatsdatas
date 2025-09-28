import { prisma } from "@/lib/prisma";

export interface CreateEventParams {
  matchId: number;
  eventTypeId: number;
  teamId: number;
  mainPlayerId?: string;
  secondPlayerId?: string;
  minute: number;
  description: string | null;
}

export const createEvent = async (params: CreateEventParams) => {
  try {
    const event = await prisma.matchEvent.create({
      data: {
        matchId: params.matchId,
        eventTypeId: params.eventTypeId,
        teamId: params.teamId,
        mainPlayerId: params.mainPlayerId || null,
        secondPlayerId: params.secondPlayerId || null,
        minute: params.minute,
        description: params.description,
      },
      include: {
        eventType: true,
        team: {
          include: {
            club: true,
          },
        },
        mainPlayer: true,
        secondPlayer: true,
      },
    });

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: "Erreur lors de la création de l'événement",
    };
  }
};