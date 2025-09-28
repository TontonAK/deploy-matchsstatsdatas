import { prisma } from "@/lib/prisma";

export const getMatchLineupData = async (matchUlid: string) => {
  try {
    const match = await prisma.match.findUnique({
      where: {
        ulid: matchUlid,
      },
      include: {
        homeTeam: {
          include: {
            club: true,
          },
        },
        awayTeam: {
          include: {
            club: true,
          },
        },
        matchsLineup: {
          include: {
            player: true,
            team: true,
          },
          orderBy: {
            number: 'asc',
          },
        },
      },
    });

    if (!match) {
      return {
        success: false,
        error: "Match non trouvé",
      };
    }

    // Organiser les lineups par équipe
    const homeLineup = match.matchsLineup.filter(
      (lineup) => lineup.teamId === match.homeTeamId
    );
    const awayLineup = match.matchsLineup.filter(
      (lineup) => lineup.teamId === match.awayTeamId
    );

    return {
      success: true,
      match: {
        id: match.id,
        ulid: match.ulid,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeLineup,
        awayLineup,
      },
    };
  } catch (error) {
    console.error("Error getting match lineup data:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données du match",
    };
  }
};