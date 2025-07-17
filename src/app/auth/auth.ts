import { compare } from "bcrypt-ts";
import NextAuth, { Session, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

import {
  addUserAccount,
  createUser,
  getUserByEmail,
  hasUserAccount,
  saveLastSession,
  updateLastUsedAccount,
} from "@/db/querys/user-querys";
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
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        const dbUser = await getUserByEmail(user.email!);

        if (dbUser) {
          token.id = dbUser.id;

          // Si es OAuth y no tiene cuenta con este provider, agregar
          if (account?.provider && account.provider !== "credentials") {
            const hasAccount = await hasUserAccount(
              dbUser.id,
              account.provider,
            );
            if (!hasAccount) {
              await addUserAccount(
                dbUser.id,
                account.provider,
                account.providerAccountId,
              );
            } else {
              // Actualizar última vez usado
              await updateLastUsedAccount(dbUser.id, account.provider);
            }
          }

          // Guardar información para "última sesión" (simulamos fingerprint)
          if (account?.provider && dbUser.profile) {
            try {
              // Usar una combinación simple como fingerprint
              const simpleFingerprint = `${account.provider}_${dbUser.id}`;
              await saveLastSession(
                simpleFingerprint,
                dbUser.id,
                account.provider,
                dbUser.profile.displayName || dbUser.profile.username,
                dbUser.profile.avatarUrl || undefined,
              );
            } catch (error) {
              console.log("Error saving last session:", error);
            }
          }
        } else if (account?.provider === "google") {
          const username = await generateUniqueUsername(user.email!);
          const newUser = await createUser({
            email: user.email!,
            password: "",
            username,
            displayName: user.name ?? user.email!.split("@")[0],
            provider: account.provider,
            providerId: account.providerAccountId,
            avatarUrl: profile?.picture,
          });

          token.id = newUser.id;
        } else if (account?.provider === "discord") {
          const username = await generateUniqueUsername(user.email!);
          const newUser = await createUser({
            email: user.email!,
            password: "",
            username:
              typeof profile?.display_name === "string"
                ? profile.display_name
                : username,
            displayName:
              typeof profile?.username === "string"
                ? profile.username
                : user.email!.split("@")[0],
            provider: account.provider,
            providerId: account.providerAccountId,
            avatarUrl:
              typeof profile?.image_url === "string"
                ? profile.image_url
                : profile?.avatar
                  ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp`
                  : undefined,
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
