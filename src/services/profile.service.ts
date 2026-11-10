import "server-only";

import { query } from "@/lib/db";

export type StudentProfile = {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string | null;
  academic_level: string | null;
  bio: string | null;
  availability: string | null;
  created_at: Date;
  updated_at: Date;
  email: string;
};

export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  const result = await query<StudentProfile>(
    `SELECT sp.*, u.email
     FROM student_profiles sp
     JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = $1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function updateStudentProfile(
  userId: string,
  input: Pick<StudentProfile, "full_name" | "specialty" | "academic_level" | "bio" | "availability">
): Promise<StudentProfile> {
  const result = await query<StudentProfile>(
    `WITH updated AS (
       INSERT INTO student_profiles
         (user_id, full_name, specialty, academic_level, bio, availability)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         specialty = EXCLUDED.specialty,
         academic_level = EXCLUDED.academic_level,
         bio = EXCLUDED.bio,
         availability = EXCLUDED.availability,
         updated_at = NOW()
       RETURNING *
     )
     SELECT updated.*, u.email
     FROM updated
     JOIN users u ON u.id = updated.user_id`,
    [
      userId,
      input.full_name,
      input.specialty,
      input.academic_level,
      input.bio,
      input.availability
    ]
  );
  return result.rows[0];
}
