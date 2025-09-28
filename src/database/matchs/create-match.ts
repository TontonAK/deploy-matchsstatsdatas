import { prisma } from "@/lib/prisma";

interface CreateMatchData {
  homeTeamId: number;
  awayTeamId: number;
  leagueId?: number;
  leaguePoolId?: number;
  typeMatchId: number;
  stadiumId: number;
  schedule: Date;
  nbPlayerLineup: number;
  periodTypeId: number;
  statTypeIds: number[];
  seasonLeagueId?: number;
}

export async function createMatch(data: CreateMatchData) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Créer le match
      const match = await tx.match.create({
        data: {
          homeTeamId: data.homeTeamId,
          awayTeamId: data.awayTeamId,
          stadiumId: data.stadiumId,
          schedule: data.schedule,
          nbPlayerLineup: data.nbPlayerLineup,
          periodTypeId: data.periodTypeId,
        },
      });

      // Créer la relation SeasonLeagueMatch
      let seasonLeagueId: number;

      if (data.seasonLeagueId) {
        // Utiliser directement le seasonLeagueId fourni (pour les matchs de Championnat)
        seasonLeagueId = data.seasonLeagueId;
      } else {
        // Ancienne logique pour les matchs Amicaux
        // D'abord, récupérer la saison 2025-2026
        const season = await tx.season.findFirst({
          where: {
            name: "2025-2026",
          },
        });

        if (!season) {
          throw new Error("La saison 2025-2026 n'a pas été trouvée en base de données");
        }

        // Chercher la SeasonLeague correspondante
        const seasonLeague = await tx.seasonLeague.findFirst({
          where: {
            seasonId: season.id,
            leagueId: data.leagueId,
            leaguePoolId: data.leaguePoolId,
            typeMatchId: data.typeMatchId,
          },
        });

        if (!seasonLeague) {
          throw new Error(
            `Aucune SeasonLeague trouvée pour la saison ${season.name}, ` +
            `leagueId: ${data.leagueId}, leaguePoolId: ${data.leaguePoolId}, typeMatchId: ${data.typeMatchId}`
          );
        }

        seasonLeagueId = seasonLeague.id;
      }

      // Créer la relation SeasonLeagueMatch
      await tx.seasonLeagueMatch.create({
        data: {
          seasonLeagueId: seasonLeagueId,
          matchId: match.id,
        },
      });

      // Créer les statistiques à suivre pour ce match
      const matchStatsTypes = await Promise.all(
        data.statTypeIds.map((statTypeId) =>
          tx.matchStatsType.create({
            data: {
              matchId: match.id,
              statTypeId: statTypeId,
            },
          })
        )
      );

      return {
        match,
        matchStatsTypes,
      };
    });

    return {
      success: true,
      match: result.match,
      matchStatsTypes: result.matchStatsTypes,
    };
  } catch (error) {
    console.error("Erreur lors de la création du match:", error);
    return {
      success: false,
      error: "Erreur lors de la création du match",
    };
  }
}

// Fonction pour récupérer les données nécessaires au formulaire
export async function getMatchFormData() {
  try {
    const [teams, leagues, leaguePools, matchTypes, periodTypes, statTypes, stadiums] = await Promise.all([
      // Récupérer toutes les équipes avec leurs clubs et relations de league
      prisma.team.findMany({
        include: {
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
              stadiums: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          league: {
            include: {
              league: {
                select: {
                  id: true,
                  name: true,
                },
              },
              leaguePool: {
                select: {
                  id: true,
                  pool: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            club: {
              name: 'asc',
            },
          },
          {
            name: 'asc',
          },
        ],
      }),
      
      // Récupérer toutes les ligues
      prisma.league.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
      
      // Récupérer toutes les poules de league
      prisma.leaguePool.findMany({
        include: {
          league: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          {
            league: {
              name: 'asc',
            },
          },
          {
            pool: 'asc',
          },
        ],
      }),
      
      // Récupérer tous les types de match
      prisma.matchType.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
      
      // Récupérer tous les types de période
      prisma.matchPeriodType.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
      
      // Récupérer tous les types de statistiques
      prisma.statType.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
      
      // Récupérer tous les stades
      prisma.stadium.findMany({
        include: {
          club: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          {
            club: {
              name: 'asc',
            },
          },
          {
            name: 'asc',
          },
        ],
      }),
    ]);

    return {
      success: true,
      data: {
        teams,
        leagues,
        leaguePools,
        matchTypes,
        periodTypes,
        statTypes,
        stadiums,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données du formulaire:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
  }
}

// Fonction pour récupérer les journées d'une compétition
export async function getSeasonLeagueGameDays(
  seasonId: number, 
  leagueId: number, 
  leaguePoolId: number | undefined, 
  typeMatchId: number
) {
  try {
    const seasonLeagues = await prisma.seasonLeague.findMany({
      where: {
        seasonId: seasonId,
        leagueId: leagueId,
        leaguePoolId: leaguePoolId,
        typeMatchId: typeMatchId,
        gameDay: {
          not: null,
        },
      },
      select: {
        id: true,
        gameDay: true,
      },
      orderBy: {
        gameDay: 'asc',
      },
    });

    return {
      success: true,
      seasonLeagues,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des journées:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des journées",
    };
  }
}

// Fonction pour récupérer les équipes d'un utilisateur (pour les coaches)
export async function getUserTeams(userId: string) {
  try {
    const userTeams = await prisma.playerTeams.findMany({
      where: {
        playerId: userId,
      },
      include: {
        team: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      teams: userTeams.map(pt => pt.team),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes de l'utilisateur:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des équipes",
    };
  }
}