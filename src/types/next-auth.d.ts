import 'next-auth';
declare module 'next-auth' {
  interface User { role?: 'STUDENT' | 'ADMIN'; }
  interface Session { user: { id: string; role: 'STUDENT' | 'ADMIN'; name?: string | null; email?: string | null; image?: string | null }; }
}
declare module 'next-auth/jwt' { interface JWT { id?: string; role?: 'STUDENT' | 'ADMIN'; } }
