import "server-only";

import { query } from "@/lib/db";
import type { CreateHelpRequestInput } from "@/validators/help-request.schema";

export type HelpRequest = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  subject: string;
  academic_level: string;
  availability: string;
  status: "OPEN" | "HELP_ACCEPTED" | "COMPLETED";
  created_at: Date;
  updated_at: Date;
};

export async function createHelpRequest(
  authorId: string,
  input: CreateHelpRequestInput
): Promise<HelpRequest> {
  const result = await query<HelpRequest>(
    `INSERT INTO help_requests
       (author_id, title, description, subject, academic_level, availability)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      authorId,
      input.title,
      input.description,
      input.subject,
      input.academicLevel,
      input.availability
    ]
  );
  return result.rows[0];
}

export async function listOpenHelpRequests(): Promise<HelpRequest[]> {
  return listHelpRequests({ status: "OPEN" });
}

export async function getHelpRequestById(id: string): Promise<HelpRequest | null> {
  const result = await query<HelpRequest>("SELECT * FROM help_requests WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function listHelpRequests(filters: {
  subject?: string;
  academicLevel?: string;
  status?: HelpRequest["status"];
} = {}): Promise<HelpRequest[]> {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.subject) {
    values.push(filters.subject);
    conditions.push(`subject = $${values.length}`);
  }
  if (filters.academicLevel) {
    values.push(filters.academicLevel);
    conditions.push(`academic_level = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await query<HelpRequest>(
    `SELECT * FROM help_requests ${where} ORDER BY created_at DESC`,
    values
  );
  return result.rows;
}

export async function listHelpRequestsByAuthor(authorId: string): Promise<HelpRequest[]> {
  const result = await query<HelpRequest>(
    "SELECT * FROM help_requests WHERE author_id = $1 ORDER BY created_at DESC",
    [authorId]
  );
  return result.rows;
}
