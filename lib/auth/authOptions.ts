import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import {
  isLockedOut,
  registerFailure,
  clearFailures,
} from "@/lib/auth/rateLimit";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        // Enforce the confirmed brute-force policy server-side before
        // touching the database or running bcrypt.
        if (isLockedOut(email).locked) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          registerFailure(email);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          registerFailure(email);
          return null;
        }

        clearFailures(email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        return token;
      }

      // Existing (previously issued) token: revoke it if the account's
      // sessionVersion has been bumped (password change) or the user no
      // longer exists. Keeps role claims in sync with the database.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { sessionVersion: true, role: true },
        });
        if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
          // Clear the token so the session is treated as signed out.
          return {} as typeof token;
        }
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      // A cleared token carries no identity — return the session untouched
      // (no user) so getServerSession reports the user as signed out.
      if (!token.id) return session;
      session.user = {
        id: token.id,
        name: session.user?.name ?? "",
        email: session.user?.email ?? "",
        role: token.role,
        sessionVersion: token.sessionVersion,
      };
      return session;
    },
  },
};
