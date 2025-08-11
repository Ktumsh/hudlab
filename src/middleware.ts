import { NextRequest, NextResponse } from "next/server";

const PUBLIC_AUTH_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function checkAuthentication(request: NextRequest): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/api/user`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthenticated = await checkAuthentication(request);

  // Normalización de rutas propias: /:username(/huds|/collections)? -> /me/...
  // Solo si autenticado y la ruta sigue el patrón esperado.
  if (isAuthenticated) {
    // Extraer username actual consultando API ligera (reuse checkAuthentication? necesitamos username)
    try {
      const meResp = await fetch(`${apiUrl}/api/user`, {
        headers: { Cookie: request.headers.get("cookie") || "" },
        cache: "no-store",
      });
      if (meResp.ok) {
        const user = await meResp.json();
        const currentUsername = user?.profile?.username;
        if (currentUsername) {
          const profileRegex = new RegExp(
            `^/${currentUsername}(?:/(huds|collections))?$`,
          );
          const match = pathname.match(profileRegex);
          if (match) {
            const section = match[1];
            const target = section ? `/me/${section}` : `/me/huds`;
            if (pathname !== target) {
              return NextResponse.redirect(new URL(target, request.url));
            }
          }
        }
      }
    } catch {
      // Ignorar errores silenciosamente
    }
  }

  if (isAuthenticated && PUBLIC_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/(login|signup|forgot-password|reset-password|verify-email|account-deleted)",
    "/account/:path*",
    "/settings/:path*",
    "/profiles/:path*",
    "/payment/:path*",
    "/:path*",
  ],
};
