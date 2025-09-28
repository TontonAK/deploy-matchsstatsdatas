import { prisma } from "@/lib/prisma";

export interface LineupPlayer {
  playerId: string;
  number: number;
}

export interface CreateOrUpdateLineupParams {
  matchId: number;
  teamId: number;
  lineup: LineupPlayer[];
}

export interface CreateOrUpdateLineupResult {
  success: boolean;
  error?: string;
}

export const createOrUpdateLineup = async ({
  matchId,
  teamId,
  lineup,
}: CreateOrUpdateLineupParams): Promise<CreateOrUpdateLineupResult> => {
  try {
    // Utiliser une transaction pour s'assurer de la cohérence
    await prisma.$transaction(async (tx) => {
      // Supprimer l'ancien lineup pour cette équipe et ce match
      await tx.matchLineup.deleteMany({
        where: {
          matchId,
          teamId,
        },
      });

      // Créer le nouveau lineup
      if (lineup.length > 0) {
        const lineupData = lineup.map((player) => ({
          matchId,
          teamId,
          playerId: player.playerId,
          number: player.number,
        }));

        await tx.matchLineup.createMany({
          data: lineupData,
        });
      }
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error creating or updating lineup:", error);
    return {
      success: false,
      error: "Erreur lors de la sauvegarde de la composition",
    };
  }
};

export const getMatchLineup = async (
  matchId: number,
  teamId: number
) => {
  try {
    const lineup = await prisma.matchLineup.findMany({
      where: {
        matchId,
        teamId,
      },
      include: {
        player: {
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
        },
      },
      orderBy: {
        number: "asc",
      },
    });

    return lineup;
  } catch (error) {
    console.error("Error fetching match lineup:", error);
    return [];
  }
};