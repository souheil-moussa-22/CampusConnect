import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const credentialsSchema = z.object({ email: z.email(), password: z.string().min(6) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() }, include: { profile: true } });
      if (!user || user.status !== 'ACTIVE') return null;
      if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image };
    }
  })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: 'STUDENT' | 'ADMIN' }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'STUDENT' | 'ADMIN';
      }
      return session;
    }
  },
  pages: { signIn: '/login' }
});
