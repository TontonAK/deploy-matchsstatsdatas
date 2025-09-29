import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ulid: string }> }
) {
  const { ulid } = await params;
  // TODO: Implement PDF resume functionality
  return NextResponse.json({ message: "PDF resume endpoint not implemented yet", ulid });
}
