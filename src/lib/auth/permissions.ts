import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

export async function requireRole(role: "STUDENT" | "ADMIN") {
  const user = await requireAuth();
  if (user.role !== role) throw new Error("Insufficient permissions.");
  return user;
}

export async function requireStudent() {
  return requireRole("STUDENT");
}
