import { MatchResult, Prisma } from "@/generated/prisma";
import type { MatchStats } from "@/hooks/use-match-data";
import { prisma } from "@/lib/prisma";

const SELECT_QUERY = {
  id: true,
  ulid: true,
  schedule: true,
  result: true,
  scoreHomeTeam: true,
  scoreAwayTeam: true,
  stadium: {
    select: {
      name: true,
    },
  },
  seasonLeagueMatch: {
    select: {
      seasonLeague: {
        select: {
          league: {
            select: {
              name: true,
            },
          },
          leaguePool: {
            select: {
              pool: true,
            },
          },
          typeMatch: {
            select: {
              name: true,
            },
          },
          gameDay: true,
        },
      },
    },
  },
  homeTeam: {
    select: {
      name: true,
      club: {
        select: {
          name: true,
          primaryColor: true,
          secondaryColor: true,
          logo: true,
        },
      },
    },
  },
  awayTeam: {
    select: {
      name: true,
      club: {
        select: {
          name: true,
          primaryColor: true,
          secondaryColor: true,
          logo: true,
        },
      },
    },
  },
};

export interface MatchWithRelations {
  id: number;
  ulid: string;
  schedule: Date;
  status: string;
  endingStatus: string;
  result: MatchResult | null;
  nbPlayerLineup: number;
  scoreHomeTeam: number | null;
  scoreAwayTeam: number | null;
  stadium: {
    id: number;
    name: string;
  };
  seasonLeagueMatch: {
    seasonLeague: {
      league: {
        name: string;
      } | null;
      leaguePool: {
        pool: string;
      } | null;
      typeMatch: {
        name: string;
      };
      gameDay: number | null;
    };
  } | null;
  homeTeam: {
    id: number;
    name: string;
    club: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logo: string | null;
    };
  };
  awayTeam: {
    id: number;
    name: string;
    club: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logo: string | null;
    };
  };
}

export interface GetMatchsResult {
  success: boolean;
  data?: {
    matches: MatchWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}

export interface GetFilteredMatchsParams {
  page?: number;
  seasonId?: number;
  clubId?: number;
  teamId?: number;
}

export const getNextMatch = async (teamId: number | undefined) => {
  const match = await prisma.match.findFirst({
    where: {
      AND: [
        {
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        },
        {
          schedule: {
            gte: new Date(), // On récupère les matchs dont la date est supérieure ou égale à maintenant
          },
        },
      ],
    },
    orderBy: {
      schedule: "asc", // On veut le match le plus proche dans le futur
    },
    select: SELECT_QUERY,
  });

  if (!match) {
    return null;
  }

  return match;
};

export const getLastFiveMatchs = async (teamId: number | undefined) => {
  return await prisma.match.findMany({
    take: 5,
    where: {
      AND: [
        {
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        },
        {
          schedule: {
            lt: new Date(), // On ne prend que les matchs déjà joués (antérieurs à maintenant)
          },
        },
      ],
    },
    orderBy: {
      schedule: "asc",
    },
    select: SELECT_QUERY,
  });
};

export const getMatchDetails = async (
  ulid: string
): Promise<MatchStats | null> => {
  try {
    const match = await prisma.match.findFirst({
      where: { ulid: ulid },
      select: {
        id: true,
        ulid: true,
        schedule: true,
        status: true,
        endingStatus: true,
        result: true,
        nbPlayerLineup: true,
        scoreHomeTeam: true,
        scoreAwayTeam: true,
        stadium: {
          select: {
            id: true,
            name: true,
          },
        },
        periodType: {
          select: {
            id: true,
            name: true,
            numberPeriod: true,
            durationPeriod: true,
            extratimeNumberPeriod: true,
            extratimeDurationPeriod: true,
          },
        },
        seasonLeagueMatch: {
          select: {
            seasonLeague: {
              select: {
                league: {
                  select: {
                    name: true,
                  },
                },
                leaguePool: {
                  select: {
                    pool: true,
                  },
                },
                typeMatch: {
                  select: {
                    name: true,
                  },
                },
                gameDay: true,
              },
            },
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            club: {
              select: {
                name: true,
                primaryColor: true,
                secondaryColor: true,
                logo: true,
              },
            },
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            club: {
              select: {
                name: true,
                primaryColor: true,
                secondaryColor: true,
                logo: true,
              },
            },
          },
        },
        halfTimeScore: {
          select: {
            id: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    });

    if (!match) {
      return null;
    }

    // Transform to match MatchStats interface
    return {
      matchId: match.id,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        club: {
          name: match.homeTeam.club.name,
          primaryColor: match.homeTeam.club.primaryColor,
          secondaryColor: match.homeTeam.club.secondaryColor,
          logo: match.homeTeam.club.logo ?? "/default-logo.png",
        },
        stats: {}, // TODO: Add team stats
        playerStats: [], // TODO: Add player stats
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        club: {
          name: match.awayTeam.club.name,
          primaryColor: match.awayTeam.club.primaryColor,
          secondaryColor: match.awayTeam.club.secondaryColor,
          logo: match.awayTeam.club.logo ?? "/default-logo.png",
        },
        stats: {}, // TODO: Add team stats
        playerStats: [], // TODO: Add player stats
      },
      match: {
        schedule: match.schedule,
        status: match.status,
        endingStatus: match.endingStatus,
        result: match.result,
        nbPlayerLineup: match.nbPlayerLineup,
        stadium: {
          id: match.stadium.id,
          name: match.stadium.name,
        },
        periodType: {
          id: match.periodType.id,
          name: match.periodType.name,
          numberPeriod: match.periodType.numberPeriod,
          durationPeriod: match.periodType.durationPeriod,
          extratimeNumberPeriod: match.periodType.extratimeNumberPeriod,
          extratimeDurationPeriod: match.periodType.extratimeDurationPeriod,
        },
        scoreHomeTeam: match.scoreHomeTeam,
        scoreAwayTeam: match.scoreAwayTeam,
        seasonLeagueMatch: match.seasonLeagueMatch
          ? {
              seasonLeague: {
                league: match.seasonLeagueMatch.seasonLeague.league
                  ? {
                      name: match.seasonLeagueMatch.seasonLeague.league.name,
                    }
                  : undefined,
                leaguePool: match.seasonLeagueMatch.seasonLeague.leaguePool
                  ? {
                      pool: match.seasonLeagueMatch.seasonLeague.leaguePool
                        .pool,
                    }
                  : undefined,
                typeMatch: {
                  name: match.seasonLeagueMatch.seasonLeague.typeMatch.name,
                },
                gameDay: match.seasonLeagueMatch.seasonLeague.gameDay,
              },
            }
          : undefined,
        halfTimeScore: match.halfTimeScore
          ? {
              homeScore: match.halfTimeScore.homeScore,
              awayScore: match.halfTimeScore.awayScore,
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching match details:", error);
    return null;
  }
};

export const getFilteredMatchs = async ({
  page = 1,
  seasonId,
  clubId,
  teamId,
}: GetFilteredMatchsParams): Promise<GetMatchsResult> => {
  try {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const whereClause: Prisma.MatchWhereInput = {};

    // Filter by season
    if (seasonId) {
      whereClause.seasonLeagueMatch = {
        seasonLeague: {
          seasonId: seasonId,
        },
      };
    }

    // Filter by team (home or away)
    if (teamId) {
      whereClause.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    } else if (clubId) {
      // Filter by club (home or away team's club)
      whereClause.OR = [
        {
          homeTeam: {
            clubId: clubId,
          },
        },
        {
          awayTeam: {
            clubId: clubId,
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.match.count({
      where: whereClause,
    });

    // Get matches with pagination
    const matches = await prisma.match.findMany({
      where: whereClause,
      select: {
        id: true,
        ulid: true,
        schedule: true,
        status: true,
        endingStatus: true,
        result: true,
        nbPlayerLineup: true,
        scoreHomeTeam: true,
        scoreAwayTeam: true,
        stadium: {
          select: {
            id: true,
            name: true,
          },
        },
        seasonLeagueMatch: {
          select: {
            seasonLeague: {
              select: {
                league: {
                  select: {
                    name: true,
                  },
                },
                leaguePool: {
                  select: {
                    pool: true,
                  },
                },
                typeMatch: {
                  select: {
                    name: true,
                  },
                },
                gameDay: true,
              },
            },
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            club: {
              select: {
                name: true,
                primaryColor: true,
                secondaryColor: true,
                logo: true,
              },
            },
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            club: {
              select: {
                name: true,
                primaryColor: true,
                secondaryColor: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: {
        schedule: "asc",
      },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        matches,
        total,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching filtered matches:", error);
    return {
      success: false,
      error: "Failed to fetch matches",
    };
  }
};

export interface MatchLineupPlayer {
  id: string;
  number: number;
  lastname: string;
  firstname: string;
  image: string | null;
  positions: {
    position: {
      name: string;
      shortName: string;
    };
    isMainPosition: boolean;
  }[];
}

export interface TeamLineup {
  teamId: number;
  teamName: string;
  club: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    logo: string | null;
  };
  players: MatchLineupPlayer[];
}

export const getMatchLineup = async (
  matchUlid: string,
  userClubId?: number
): Promise<TeamLineup | null> => {
  try {
    const match = await prisma.match.findFirst({
      where: { ulid: matchUlid },
      select: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: {
              select: {
                name: true,
                primaryColor: true,
                secondaryColor: true,
                logo: true,
              },
            },
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: {
              select: {
                name: true,
                primaryColor: true,
                secondaryColor: true,
                logo: true,
              },
            },
          },
        },
        matchsLineup: {
          select: {
            number: true,
            teamId: true,
            player: {
              select: {
                id: true,
                lastname: true,
                firstname: true,
                image: true,
                positions: {
                  select: {
                    position: {
                      select: {
                        name: true,
                        shortName: true,
                      },
                    },
                    isMainPosition: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!match) {
      return null;
    }

    // Determine which team to show based on user's club
    let targetTeam;
    if (userClubId) {
      if (match.homeTeam.clubId === userClubId) {
        targetTeam = match.homeTeam;
      } else if (match.awayTeam.clubId === userClubId) {
        targetTeam = match.awayTeam;
      } else {
        // User's club doesn't participate in this match, show home team by default
        targetTeam = match.homeTeam;
      }
    } else {
      // No user club provided, show home team by default
      targetTeam = match.homeTeam;
    }

    // Filter lineup for the target team and sort by number
    const teamPlayers = match.matchsLineup
      .filter((lineup) => lineup.teamId === targetTeam.id)
      .map((lineup) => ({
        id: lineup.player.id,
        number: lineup.number,
        lastname: lineup.player.lastname,
        firstname: lineup.player.firstname,
        image: lineup.player.image,
        positions: lineup.player.positions,
      }))
      .sort((a, b) => a.number - b.number);

    return {
      teamId: targetTeam.id,
      teamName: targetTeam.name,
      club: targetTeam.club,
      players: teamPlayers,
    };
  } catch (error) {
    console.error("Error fetching match lineup:", error);
    return null;
  }
};
