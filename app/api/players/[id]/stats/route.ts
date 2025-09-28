import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;

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
    const statsMap = new Map<string, { values: number[]; statType: any }>();
    const matchIds = new Set<number>();

    playerData.stats.forEach((stat: any) => {
      matchIds.add(stat.matchId);

      if (!statsMap.has(stat.statType.name)) {
        statsMap.set(stat.statType.name, {
          values: [],
          statType: stat.statType,
        });
      }
      statsMap.get(stat.statType.name)!.values.push(stat.value);
    });

    const aggregatedStats: Record<string, { 
        totalValue: number; 
        averageValue: number; 
        statType: any; 
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