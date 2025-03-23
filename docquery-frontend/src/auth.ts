import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id as string;
        // Store GitHub username from the profile
        token.githubUsername = (profile as any).login;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      // Make GitHub username available in the session
      session.user.githubUsername = token.githubUsername;
      return session;
    },
  },
});
