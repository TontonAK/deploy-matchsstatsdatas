import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface StatType {
  id: number;
  name: string;
}

interface Player {
  id: string;
  firstname: string;
  lastname: string;
  slug: string;
}

interface Stat {
  id: number;
  value: number;
  statType: StatType;
  player: Player | null;
  matchId: number;
}

interface TeamWithStats {
  id: number;
  name: string;
  club: {
    id: number;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    logo: string | null;
  };
  stats: Stat[];
}

interface PlayerStatsData {
  playerId: string;
  playerName: string;
  playerSlug: string;
  stats: Record<string, { value: number; statType: StatType }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ulid: string }> }
) {
  try {
    const { ulid } = await params;

    const matchData = await prisma.match.findFirst({
      where: { ulid },
      include: {
        homeTeam: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                primaryColor: true,
                secondaryColor: true,
                logo: true,
              },
            },
            stats: {
              where: { match: { ulid } },
              include: {
                statType: true,
                player: true,
              },
            },
          },
        },
        awayTeam: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                primaryColor: true,
                secondaryColor: true,
                logo: true,
              },
            },
            stats: {
              where: { match: { ulid } },
              include: {
                statType: true,
                player: true,
              },
            },
          },
        },
        stadium: true,
        periodType: true,
        seasonLeagueMatch: {
          include: {
            seasonLeague: true,
          },
        },
      },
    });

    if (!matchData) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Transformer les données pour le format attendu par le hook
    const processTeamStats = (team: TeamWithStats) => {
      const teamStats: Record<string, { value: number; statType: StatType }> = {};
      const playerStatsMap = new Map<string, PlayerStatsData>();

      team.stats.forEach((stat: Stat) => {
        if (!stat.player) {
          // Statistique d'équipe
          teamStats[stat.statType.name] = {
            value: stat.value,
            statType: stat.statType,
          };
        } else {
          // Statistique de joueur
          if (!playerStatsMap.has(stat.player.id)) {
            playerStatsMap.set(stat.player.id, {
              playerId: stat.player.id,
              playerName: `${stat.player.firstname} ${stat.player.lastname}`,
              playerSlug: stat.player.slug,
              stats: {},
            });
          }

          const playerStats = playerStatsMap.get(stat.player.id);
          if (!playerStats) return;
          playerStats.stats[stat.statType.name] = {
            value: stat.value,
            statType: stat.statType,
          };
        }
      });

      return {
        id: team.id,
        name: team.name,
        club: {
          name: team.club.name,
          primaryColor: team.club.primaryColor,
          secondaryColor: team.club.secondaryColor,
          logo: team.club.logo,
        },
        stats: teamStats,
        playerStats: Array.from(playerStatsMap.values()),
      };
    };

    const result = {
      matchId: matchData.id,
      homeTeam: processTeamStats(matchData.homeTeam),
      awayTeam: processTeamStats(matchData.awayTeam),
      match: {
        schedule: matchData.schedule,
        status: matchData.status,
        endingStatus: matchData.endingStatus,
        result: matchData.result || undefined,
        stadium: {
          id: matchData.stadium.id,
          name: matchData.stadium.name,
        },
        periodType: {
          id: matchData.periodType.id,
          name: matchData.periodType.name,
          numberPeriod: matchData.periodType.numberPeriod,
          durationPeriod: matchData.periodType.durationPeriod,
          extratimeNumberPeriod:
            matchData.periodType.extratimeNumberPeriod || undefined,
          extratimeDurationPeriod:
            matchData.periodType.extratimeDurationPeriod || undefined,
        },
        scoreHomeTeam: matchData.scoreHomeTeam || undefined,
        scoreAwayTeam: matchData.scoreAwayTeam || undefined,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching match data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
