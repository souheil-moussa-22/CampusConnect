import "server-only";

import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import type { CreateUserInput } from "@/validators/user.schema";

export type User = {
  id: string;
  email: string;
  password_hash: string;
  role: "STUDENT" | "ADMIN";
  created_at: Date;
  updated_at: Date;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    "SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    "SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createUser(input: CreateUserInput): Promise<Omit<User, "password_hash">> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const result = await query<Omit<User, "password_hash">>(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, role, created_at, updated_at`,
    [input.email, passwordHash]
  );
  return result.rows[0];
}
