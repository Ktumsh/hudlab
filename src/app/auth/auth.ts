import { compare } from "bcrypt-ts";
import NextAuth, { type Session, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

import {
  addUserAccount,
  createUser,
  getUserByEmail,
  hasUserAccount,
  updateLastUsedAccount,
} from "@/db/querys/user-querys";
import { isDevelopmentEnvironment } from "@/lib/consts";
import { generateUniqueUsername } from "@/lib/utils";

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
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Manejo especial para errores de OAuth
      try {
        if (account?.provider === "google" || account?.provider === "discord") {
          // Verificar que tenemos los datos necesarios
          if (!user.email) {
            console.error("OAuth sign-in failed: No email provided");
            return false;
          }
          return true;
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        try {
          const dbUser = await getUserByEmail(user.email!);

          if (dbUser) {
            token.id = dbUser.id;

            // Si es OAuth y no tiene cuenta con este provider, agregar
            if (account?.provider && account.provider !== "credentials") {
              try {
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
              } catch (error) {
                console.error("Error managing user account:", error);
              }
            }
          } else if (account?.provider === "google") {
            try {
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
            } catch (error) {
              console.error("Error creating Google user:", error);
              throw error;
            }
          } else if (account?.provider === "discord") {
            try {
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
            } catch (error) {
              console.error("Error creating Discord user:", error);
              throw error;
            }
          }
        } catch (error) {
          console.error("Error in JWT callback:", error);
          // En caso de error, mantener el token básico si existe
          if (!token.id && user.email) {
            // Intentar obtener el usuario una vez más
            try {
              const fallbackUser = await getUserByEmail(user.email);
              if (fallbackUser) {
                token.id = fallbackUser.id;
              }
            } catch (fallbackError) {
              console.error("Fallback user lookup failed:", fallbackError);
            }
          }
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
  debug: isDevelopmentEnvironment,
  trustHost: true,
});
