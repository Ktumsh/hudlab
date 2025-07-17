import { compare } from "bcrypt-ts";
import NextAuth, { Session, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { createUser, getUserByEmail } from "@/db/querys/user-querys";
import { generateUniqueUsername } from "@/lib";

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
        if (!user) throw new Error("Invalid email or password");
        const passwordsMatch = await compare(password, user.password!);
        if (!passwordsMatch) throw new Error("Invalid email or password");
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
          const username = await generateUniqueUsername(user.email!);
          const newUser = await createUser({
            email: user.email!,
            password: "",
            username,
            displayName: user.name ?? user.email!.split("@")[0],
            provider: account.provider,
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
