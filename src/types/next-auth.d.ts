import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: "STUDENT" | "ADMIN";
  }

  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "ADMIN";
  }
}
