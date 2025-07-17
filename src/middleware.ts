import { NextRequest, NextResponse } from "next/server";

import { auth } from "./app/auth/auth";

const PUBLIC_AUTH_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/account-deleted",
];

const PROTECTED_ROUTES = [
  "/account",
  "/settings/subscriptions",
  "/settings/notifications",
  "/settings/account-profile",
  "/profiles",
  "/payment/success",
  "/payment/canceled",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = await auth();
  const userId = session?.user?.id as string;

  if (userId && PUBLIC_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !userId) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/(login|signup|reset-password|verify-email|account-deleted)"],
};
