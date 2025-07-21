import { NextRequest, NextResponse } from "next/server";

import { searchUsers } from "@/db/querys/user-querys";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limitParam = searchParams.get("limit");

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 8;
    const users = await searchUsers(query, limit);

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error in search users API:", error);
    return NextResponse.json(
      { error: "Error searching users" },
      { status: 500 },
    );
  }
}
