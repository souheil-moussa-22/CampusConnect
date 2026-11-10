import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword } from "@/services/user.service";
import { getStudentProfile } from "@/services/profile.service";
import { createUserSchema } from "@/validators/user.schema";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = createUserSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await findUserByEmail(parsed.data.email);
        if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
          return null;
        }

        const profile = await getStudentProfile(user.id);
        return {
          id: user.id,
          email: user.email,
          name: profile?.full_name ?? user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    }
  }
};
