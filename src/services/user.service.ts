import "server-only";

import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { withTransaction } from "@/lib/db/transaction";
import type { CreateUserInput } from "@/validators/user.schema";
import type { RegisterUserInput } from "@/validators/user.schema";

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

export async function registerStudent(input: RegisterUserInput): Promise<{
  id: string;
  email: string;
  role: User["role"];
  name: string;
  specialty: string;
  academicLevel: string;
}> {
  const passwordHash = await bcrypt.hash(input.password, 12);

  return withTransaction(async (client) => {
    const userResult = await client.query<Omit<User, "password_hash">>(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'STUDENT')
       RETURNING id, email, role, created_at, updated_at`,
      [input.email, passwordHash]
    );
    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO student_profiles (user_id, full_name, specialty, academic_level)
       VALUES ($1, $2, $3, $4)`,
      [user.id, input.fullName, input.specialty, input.academicLevel]
    );

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: input.fullName,
      specialty: input.specialty,
      academicLevel: input.academicLevel
    };
  });
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
