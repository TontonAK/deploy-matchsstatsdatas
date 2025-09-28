import type { PositionGroup, Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface GetPlayersParams {
  search?: string;
  clubId?: number;
  sortBy?: "name" | "club";
  page?: number;
  limit?: number;
}

export interface PlayerWithRelations {
  id: string;
  firstname: string;
  lastname: string;
  name: string | null;
  email: string;
  image: string | null;
  job: Role;
  club: {
    id: number;
    name: string;
    logo: string | null;
  };
  positions: {
    position: {
      id: number;
      name: string;
      shortName: string;
    };
    isMainPosition: boolean;
  }[];
}

export interface GetPlayersResult {
  success: boolean;
  data?: {
    players: PlayerWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}

export const getPlayers = async ({
  search = "",
  clubId,
  sortBy = "name",
  page = 1,
  limit = 10,
}: GetPlayersParams = {}): Promise<GetPlayersResult> => {
  try {
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    // Search filter (firstname, lastname, or name)
    if (search) {
      whereClause.OR = [
        {
          firstname: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastname: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Club filter
    if (clubId) {
      whereClause.clubId = clubId;
    }

    // Build order by clause
    let orderBy: Record<string, unknown> | Record<string, unknown>[];
    switch (sortBy) {
      case "name":
        orderBy = [{ firstname: "asc" }, { lastname: "asc" }];
        break;
      case "club":
        orderBy = {
          club: {
            name: "asc",
          },
        };
        break;
      default:
        orderBy = { firstname: "asc" };
    }

    // Get total count
    const total = await prisma.user.count({
      where: whereClause,
    });

    // Get players with relations
    const players = await prisma.user.findMany({
      where: whereClause,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        name: true,
        email: true,
        image: true,
        job: true,
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        positions: {
          select: {
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

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        players,
        total,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching players:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des joueurs",
    };
  }
};

export interface TeamPlayerWithPosition {
  id: string;
  firstname: string;
  lastname: string;
  name: string | null;
  image: string | null;
  positions: {
    position: {
      id: number;
      name: string;
      shortName: string;
      group: PositionGroup;
    };
    isMainPosition: boolean;
  }[];
}

export type PlayersGroupedByPosition = Record<string, TeamPlayerWithPosition[]>;

export const getTeamPlayersGroupedByPosition = async (
  teamId: number
): Promise<PlayersGroupedByPosition> => {
  try {
    const players = await prisma.user.findMany({
      where: {
        teams: {
          some: {
            teamId: teamId,
          },
        },
        job: "Player",
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        name: true,
        image: true,
        positions: {
          select: {
            isMainPosition: true,
            position: {
              select: {
                id: true,
                name: true,
                shortName: true,
                group: true,
              },
            },
          },
        },
      },
      orderBy: [{ firstname: "asc" }, { lastname: "asc" }],
    });

    // Grouper les joueurs par position
    const groupedPlayers: PlayersGroupedByPosition = {};

    players.forEach((player) => {
      // Pour chaque joueur, on regarde ses positions
      if (player.positions.length === 0) {
        // Joueur sans position assignée
        if (!groupedPlayers["No_Position"]) {
          groupedPlayers["No_Position"] = [];
        }
        groupedPlayers["No_Position"].push(player);
      } else {
        // Grouper par la position principale d'abord, sinon par la première position
        const mainPosition = player.positions.find((p) => p.isMainPosition);
        const positionToUse = mainPosition || player.positions[0];
        const groupKey = positionToUse.position.group;

        if (!groupedPlayers[groupKey]) {
          groupedPlayers[groupKey] = [];
        }
        groupedPlayers[groupKey].push(player);
      }
    });

    return groupedPlayers;
  } catch (error) {
    console.error("Error fetching team players grouped by position:", error);
    return {};
  }
};
