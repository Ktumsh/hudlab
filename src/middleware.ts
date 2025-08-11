import { NextRequest, NextResponse } from "next/server";

// Verificación ligera de token HMAC (opcional). Para evitar duplicar lógica compleja, implementamos
// una versión mínima en frontend que solo valida estructura temporal (no seguridad real, heurística).
function tryParseHmacPart(token: string) {
  // token original no está disponible (firmado en backend), aquí solo comprobamos expiración si
  // viene en formato uid:username:exp (espejo). No se confía para autorización.
  const parts = token.split(":");
  if (parts.length < 3) return null;
  const [uid, username, expStr] = parts;
  const exp = Number(expStr);
  if (!uid || !exp || isNaN(exp) || Date.now() > exp) return null;
  return { id: uid, profile: { username } } as CurrentUserPayload;
}

// Rutas públicas de autenticación (ya no se usa la constante directamente para flexibilidad)

const PROTECTED_ROUTES = [
  "/account",
  "/settings/subscriptions",
  "/settings/notifications",
  "/settings/account-profile",
  "/profiles",
  "/payment/success",
  "/payment/canceled",
];

// (apiUrl eliminado: no podemos usar fetch cross-domain con cookies en middleware)

interface CurrentUserPayload {
  id: string;
  email: string;
  profile?: {
    username?: string;
  };
}

// Ya que el dominio del API es distinto (vercel.app separado), el middleware no recibe cookies AuthJS.
// Estrategia: usar una cookie espejo (no sensible) colocada por el frontend (ej: hudlab_auth=uid:username:exp)
// únicamente para heurística de redirecciones suaves. No se usa para autorización real.
function parseMirrorCookie(request: NextRequest) {
  const raw = request.cookies.get("hudlab_auth")?.value;

  // Debug logs for production issues
  if (process.env.NODE_ENV === "production") {
    console.log("🔍 Middleware Debug - Cookie raw:", raw);
    console.log("🔍 Middleware Debug - All cookies:", request.cookies.getAll());
  }

  if (!raw) return null;
  const result = tryParseHmacPart(raw);

  if (process.env.NODE_ENV === "production") {
    console.log("🔍 Middleware Debug - Parsed result:", result);
  }

  return result;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const user = parseMirrorCookie(request);
  const isAuthenticated = !!user;

  // Debug log for production
  if (process.env.NODE_ENV === "production" && pathname.startsWith("/me")) {
    console.log(
      "🔍 Middleware Debug - Path:",
      pathname,
      "Auth:",
      isAuthenticated,
      "User:",
      user,
    );
  }

  // Normalización de rutas propias: /:username(/huds|/collections)? -> /me/...
  // Solo si autenticado y la ruta sigue el patrón esperado.
  if (isAuthenticated && user?.profile?.username) {
    // Normalizamos rutas /:username(/huds|/collections)? a /me/... solo si coincide exactamente con su username
    const { username } = user.profile;
    const profileRegex = new RegExp(`^/${username}(?:/(huds|collections))?$`);
    const match = pathname.match(profileRegex);
    if (match) {
      const section = match[1];
      const target = section ? `/me/${section}` : `/me/huds`;
      if (pathname !== target) {
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
  }

  if (isAuthenticated) {
    if (pathname.startsWith("/auth") && !pathname.startsWith("/auth/logout")) {
      return NextResponse.redirect(new URL("/feed", request.url));
    }
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !isAuthenticated) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Bloquear acceso directo a /me/* no autenticado
  if (pathname.startsWith("/me") && !isAuthenticated) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
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
    "/me/:path*",
    "/:username((?!api|_next|static|favicon.ico).*)",
  ],
};
