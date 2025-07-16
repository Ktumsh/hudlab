import { compare } from "bcrypt-ts";
import NextAuth, { Session, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { createUser, getUserByEmail } from "@/db/querys/user-querys";
import { generateUsername } from "@/lib";

import { authConfig } from "./auth.config";

interface ExtendedSession extends Session {
  user: User;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize({ email, password }: any) {
        const user = await getUserByEmail(email);
        if (!user) return null;
        const passwordsMatch = await compare(password, user.password!);
        if (!passwordsMatch) return null;
        return user;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await getUserByEmail(user.email!);

        if (dbUser) {
          token.id = dbUser.id;
        } else if (account?.provider === "google") {
          const newUser = await createUser({
            email: user.email!,
            password: "",
            username: generateUsername(user.email!),
            displayName: user.name ?? user.email!.split("@")[0],
            provider: "google",
            providerId: account.providerAccountId,
          });

          token.id = newUser.id;
        }
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token?: string | object;
    }) {
      if (token) {
        const { id } = token as { id: string };
        const { user } = session;

        session = { ...session, user: { ...user, id } };
      }

      return session;
    },
  },
  trustHost: true,
});
