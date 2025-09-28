import { getMatchDetails } from "@/database/matchs/get-matchs";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ulid: string }> }
) {
  const { ulid } = await params;
  const matchStats = await getMatchDetails(ulid);
}
