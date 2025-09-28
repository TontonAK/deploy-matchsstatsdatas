import { prisma } from "@/lib/prisma";

interface CreateClubTeam {
  name: string;
  leagueId: number;
  leaguePoolId?: number;
}

interface CreateClubData {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  aliases?: string[];
  stadiums: string[];
  logo?: string;
  teams: CreateClubTeam[];
}

export async function createClub(data: CreateClubData) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Créer le club
      const club = await tx.club.create({
        data: {
          name: data.name,
          slug: data.name.toLowerCase().replace(/\s+/g, "-"),
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          logo: data.logo,
        },
      });

      // Créer les alias
      let alias;
      if (data.aliases && data.aliases.length > 0) {
        const aliases = data.aliases.join();
        alias = await tx.clubAlias.create({
          data: {
            alias: aliases,
            clubId: club.id,
          },
        });
      }

      // Créer les stades
      const stadiums = await Promise.all(
        data.stadiums.map((stadiumName) =>
          tx.stadium.create({
            data: {
              name: stadiumName,
              clubId: club.id,
            },
          })
        )
      );

      // Créer les équipes
      const teams = await Promise.all(
        data.teams.map(async (teamData) => {
          const team = await tx.team.create({
            data: {
              name: teamData.name,
              clubId: club.id,
            },
          });

          // Créer la relation LeagueTeams
          await tx.leagueTeams.create({
            data: {
              teamId: team.id,
              leagueId: teamData.leagueId,
              leaguePoolId: teamData.leaguePoolId,
            },
          });

          return team;
        })
      );

      return {
        club,
        alias,
        stadiums,
        teams,
      };
    });

    return {
      success: true,
      club: result.club,
      aliases: result.alias,
      stadiums: result.stadiums,
      teams: result.teams,
    };
  } catch (error) {
    console.error("Erreur lors de la création du club:", error);
    return {
      success: false,
      error: "Erreur lors de la création du club",
    };
  }
}

// Fonction pour récupérer les données nécessaires au formulaire de création de club
export async function getClubFormData() {
  try {
    const [leagues, leaguePools] = await Promise.all([
      // Récupérer toutes les leagues
      prisma.league.findMany({
        orderBy: {
          name: "asc",
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
              name: "asc",
            },
          },
          {
            pool: "asc",
          },
        ],
      }),
    ]);

    return {
      success: true,
      data: {
        leagues,
        leaguePools,
      },
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données du formulaire:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
  }
}
