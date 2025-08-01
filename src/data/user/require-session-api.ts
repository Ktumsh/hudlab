import "server-only";

import { NextResponse } from "next/server";

import { getServerAuth } from "@/lib/server-auth";

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

export async function requireSessionApi(): Promise<NextResponse | AuthSession> {
  const session = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
