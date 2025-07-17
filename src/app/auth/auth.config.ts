import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/signup",
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
