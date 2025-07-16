import { NextResponse } from "next/server";

import { getAllUploads } from "@/db/querys/uploads-querys";

export async function GET() {
  try {
    const uploads = await getAllUploads();

    return NextResponse.json(uploads);
  } catch (error) {
    console.error("API error in /api/uploads:", error);
    return NextResponse.json(
      { message: "Error al obtener uploads." },
      { status: 500 },
    );
  }
}
