import { getSeasonLeagueGameDays } from "@/database/matchs/create-match";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const seasonId = searchParams.get("seasonId");
    const leagueId = searchParams.get("leagueId");
    const leaguePoolId = searchParams.get("leaguePoolId");
    const typeMatchId = searchParams.get("typeMatchId");

    if (!seasonId || !leagueId || !typeMatchId) {
      return NextResponse.json(
        { error: "Paramètres manquants (seasonId, leagueId, typeMatchId requis)" },
        { status: 400 }
      );
    }

    const result = await getSeasonLeagueGameDays(
      parseInt(seasonId),
      parseInt(leagueId),
      leaguePoolId ? parseInt(leaguePoolId) : undefined,
      parseInt(typeMatchId)
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        seasonLeagues: result.seasonLeagues,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur API season-leagues/game-days:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}