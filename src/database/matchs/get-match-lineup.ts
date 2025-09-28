import { prisma } from "@/lib/prisma";

export interface MatchLineupPlayer {
  id: number;
  number: number;
  player: {
    id: string;
    firstname: string;
    lastname: string;
  };
  team: {
    id: number;
    name: string;
    club: {
      id: number;
      name: string;
    };
  };
  match: {
    id: number;
    ulid: string;
  };
}

export const getMatchLineup = async (matchUlid: string, teamId?: number) => {
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
        lineup: [],
      };
    }

    const whereClause: {
      matchId: number;
      teamId?: number;
    } = {
      matchId: match.id,
    };

    if (teamId) {
      whereClause.teamId = teamId;
    }

    const lineup = await prisma.matchLineup.findMany({
      where: whereClause,
      include: {
        player: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
        team: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        match: {
          select: {
            id: true,
            ulid: true,
          },
        },
      },
      orderBy: [
        { teamId: "asc" },
        { number: "asc" },
      ],
    });

    return {
      success: true,
      lineup: lineup as MatchLineupPlayer[],
    };
  } catch (error) {
    console.error("Error fetching match lineup:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de la composition",
      lineup: [],
    };
  }
};