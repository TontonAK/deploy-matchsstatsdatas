import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface StatType {
  id: number;
  name: string;
}

interface Stat {
  id: number;
  value: number;
  statType: StatType;
  matchId: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params;

    const playerData = await prisma.user.findUnique({
      where: { id: playerId },
      include: {
        stats: {
          include: {
            statType: true,
            match: true,
          },
        },
        teams: {
          include: {
            team: {
              include: {
                club: true,
              },
            },
          },
        },
      },
    });

    if (!playerData) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    // Prendre la première équipe du joueur
    const primaryTeam = playerData.teams[0]?.team;
    if (!primaryTeam) {
      return NextResponse.json(
        { error: "Player has no team" },
        { status: 400 }
      );
    }

    // Agréger les statistiques par type
    const statsMap = new Map<string, { values: number[]; statType: StatType }>();
    const matchIds = new Set<number>();

    playerData.stats.forEach((stat: Stat) => {
      matchIds.add(stat.matchId);

      if (!statsMap.has(stat.statType.name)) {
        statsMap.set(stat.statType.name, {
          values: [],
          statType: stat.statType,
        });
      }
      const statData = statsMap.get(stat.statType.name);
      if (statData) {
        statData.values.push(stat.value);
      }
    });

    const aggregatedStats: Record<string, {
        totalValue: number;
        averageValue: number;
        statType: StatType;
      }> = {};

    statsMap.forEach((data, statName) => {
      const total = data.values.reduce((sum, val) => sum + val, 0);
      const average = total / data.values.length;

      aggregatedStats[statName] = {
        totalValue: total,
        averageValue: Math.round(average * 100) / 100, // 2 décimales
        statType: data.statType,
      };
    });

    const result = {
      playerId: playerData.id,
      playerName: `${playerData.firstname} ${playerData.lastname}`,
      playerSlug: playerData.slug,
      team: {
        name: primaryTeam.name,
        club: {
          name: primaryTeam.club.name,
        },
      },
      totalMatches: matchIds.size,
      stats: aggregatedStats,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}