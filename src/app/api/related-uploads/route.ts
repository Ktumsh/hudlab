import { NextRequest } from "next/server";

import { getRelatedUploadsPaginated } from "@/db/querys/uploads-querys";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  const tags = searchParams.get("tags");
  const excludeId = searchParams.get("excludeId");
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit")) || 20;

  if (!gameId) {
    return new Response(JSON.stringify({ error: "Missing gameId" }), {
      status: 400,
    });
  }

  const result = await getRelatedUploadsPaginated({
    gameId,
    tags,
    excludeId: excludeId || undefined,
    limit,
    cursor: cursor || undefined,
  });

  return Response.json(result);
}
