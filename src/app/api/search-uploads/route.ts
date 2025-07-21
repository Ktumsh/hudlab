import { NextRequest, NextResponse } from "next/server";

import { searchUploads } from "@/db/querys/uploads-querys";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limitParam = searchParams.get("limit");

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 12;
    const uploads = await searchUploads(query, limit);

    return NextResponse.json(uploads);
  } catch (error) {
    console.error("Error in search uploads API:", error);
    return NextResponse.json(
      { error: "Error searching uploads" },
      { status: 500 },
    );
  }
}
