import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = parseInt(params.id);

    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: "Invalid team ID" },
        { status: 400 }
      );
    }

    const teamData = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        club: true,
        stats: {
          include: {
            statType: true,
            match: true,
          },
        },
        homeMatches: {
          select: {
            id: true,
            result: true,
          },
        },
        awayMatches: {
          select: {
            id: true,
            result: true,
          },
        },
      },
    });

    if (!teamData) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    // Calculer les statistiques de matches
    const totalMatches = teamData.homeMatches.length + teamData.awayMatches.length;
    let wins = 0, draws = 0, losses = 0;

    teamData.homeMatches.forEach((match: any) => {
      if (match.result === "Home_Win") wins++;
      else if (match.result === "Draw") draws++;
      else if (match.result === "Away_Win") losses++;
    });

    teamData.awayMatches.forEach((match: any) => {
      if (match.result === "Away_Win") wins++;
      else if (match.result === "Draw") draws++;
      else if (match.result === "Home_Win") losses++;
    });

    // Agréger les statistiques par type
    const statsMap = new Map<string, { values: number[]; statType: any }>();

    teamData.stats.forEach((stat: any) => {
      if (!statsMap.has(stat.statType.name)) {
        statsMap.set(stat.statType.name, {
          values: [],
          statType: stat.statType,
        });
      }
      statsMap.get(stat.statType.name)!.values.push(stat.value);
    });

    const aggregatedStats: Record<string, { value: number; statType: any }> = {};
    statsMap.forEach((data, statName) => {
      const total = data.values.reduce((sum, val) => sum + val, 0);
      aggregatedStats[statName] = {
        value: total,
        statType: data.statType,
      };
    });

    const result = {
      teamId: teamData.id,
      teamName: teamData.name,
      club: {
        name: teamData.club.name,
        primaryColor: teamData.club.primaryColor,
        secondaryColor: teamData.club.secondaryColor,
        logo: teamData.club.logo,
      },
      totalMatches,
      wins,
      draws,
      losses,
      stats: aggregatedStats,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}