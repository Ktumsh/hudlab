import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/signup",
    error: "/auth/login", // Redirigir errores OAuth al login
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  providers: [],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/auth/login");
      const isOnSignup = nextUrl.pathname.startsWith("/auth/signup");

      if (isLoggedIn && (isOnLogin || isOnSignup)) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isOnLogin || isOnSignup) {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;
