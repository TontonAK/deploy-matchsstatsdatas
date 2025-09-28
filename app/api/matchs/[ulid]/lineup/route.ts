import { NextRequest, NextResponse } from "next/server";
import { getMatchLineup } from "@/database/matchs/get-matchs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ulid: string }> }
) {
  try {
    const { ulid } = await params;
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    const lineup = await getMatchLineup(
      ulid,
      clubId ? parseInt(clubId) : undefined
    );

    if (!lineup) {
      return NextResponse.json(
        { error: "Lineup not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(lineup);
  } catch (error) {
    console.error("Error fetching lineup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}