import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { campusApplication, passwordHasher } from '@/presentation/server/services';

const credentialsSchema = z.object({ email: z.email(), password: z.string().min(6) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    authorize: async credentials => {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;
      return campusApplication.authenticate(parsed.data, passwordHasher);
    },
  })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as 'STUDENT' | 'ADMIN';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'STUDENT' | 'ADMIN';
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
});
