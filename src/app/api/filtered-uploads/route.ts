import { NextRequest, NextResponse } from "next/server";

import { getUploads } from "@/db/querys/uploads-querys";

import type { FilterState } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filters = {
      searchText: searchParams.get("searchText") || "",
      sortBy: (searchParams.get("sortBy") as FilterState["sortBy"]) || "newest",
      platform: searchParams.get("platform") || undefined,
      releaseYear: searchParams.get("releaseYear") || undefined,
      inMyCollections: searchParams.get("inMyCollections") === "1",
      tags: searchParams.get("tags")
        ? searchParams
            .get("tags")!
            .split(",")
            .filter((t) => !!t)
        : [],
    };

    const data = await getUploads({ limit, cursor, filters });

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error in /api/uploads:", error);
    return NextResponse.json(
      { message: "Error al obtener uploads." },
      { status: 500 },
    );
  }
}
