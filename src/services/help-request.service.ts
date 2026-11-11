import "server-only";

import { query } from "@/lib/db";
import type {
  CreateHelpRequestInput,
  HelpRequestFilters,
  UpdateHelpRequestInput
} from "@/validators/help-request.schema";
import type { HelpRequestStatus } from "@/types/help-request.types";

export type HelpRequest = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  subject: string;
  academic_level: string;
  availability: string;
  status: HelpRequestStatus;
  created_at: Date;
  updated_at: Date;
};

export type PublicHelpRequest = HelpRequest & {
  author_name: string;
  author_specialty: string | null;
};

export type PaginatedHelpRequests = {
  data: PublicHelpRequest[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export async function createHelpRequest(
  authorId: string,
  input: CreateHelpRequestInput
): Promise<HelpRequest> {
  const result = await query<HelpRequest>(
    `INSERT INTO help_requests
       (author_id, title, description, subject, academic_level, availability, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
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

const sortColumns = {
  newest: "hr.created_at DESC",
  oldest: "hr.created_at ASC"
} as const;

export async function listHelpRequests(
  filters: HelpRequestFilters = {}
): Promise<PaginatedHelpRequests> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`(hr.title ILIKE $${values.length} OR hr.description ILIKE $${values.length})`);
  }
  if (filters.subject) {
    values.push(filters.subject);
    conditions.push(`hr.subject = $${values.length}`);
  }
  if (filters.academicLevel) {
    values.push(filters.academicLevel);
    conditions.push(`hr.academic_level = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`hr.status = $${values.length}`);
  }
  if (filters.authorId) {
    values.push(filters.authorId);
    conditions.push(`hr.author_id = $${values.length}`);
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sort = sortColumns[filters.sort ?? "newest"];

  values.push(limit, offset);
  const result = await query<PublicHelpRequest & { total_count: string }>(
    `SELECT
       hr.*,
       sp.full_name AS author_name,
       sp.specialty AS author_specialty,
       COUNT(*) OVER() AS total_count
     FROM help_requests hr
     JOIN users u ON u.id = hr.author_id
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     ${where}
     ORDER BY ${sort}, hr.id DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  const totalItems = result.rows.length ? Number(result.rows[0].total_count) : 0;
  return {
    data: result.rows.map(({ total_count: _totalCount, ...request }) => request),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  };
}

export async function getHelpRequestById(id: string): Promise<PublicHelpRequest | null> {
  const result = await query<PublicHelpRequest>(
    `SELECT
       hr.*,
       sp.full_name AS author_name,
       sp.specialty AS author_specialty
     FROM help_requests hr
     JOIN users u ON u.id = hr.author_id
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     WHERE hr.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function listHelpRequestsByAuthor(
  authorId: string,
  filters: Pick<HelpRequestFilters, "status" | "page" | "limit" | "sort"> = {}
): Promise<PaginatedHelpRequests> {
  return listHelpRequests({ ...filters, authorId });
}

export async function updateHelpRequest(
  id: string,
  authorId: string,
  input: UpdateHelpRequestInput
): Promise<{ kind: "updated"; request: HelpRequest } | { kind: "not_found" | "forbidden" | "closed" }> {
  const existing = await query<{ author_id: string; status: HelpRequestStatus }>(
    "SELECT author_id, status FROM help_requests WHERE id = $1",
    [id]
  );
  const current = existing.rows[0];
  if (!current) return { kind: "not_found" };
  if (current.author_id !== authorId) return { kind: "forbidden" };
  if (current.status !== "OPEN") return { kind: "closed" };

  const result = await query<HelpRequest>(
    `UPDATE help_requests
     SET title = $1, description = $2, subject = $3,
         academic_level = $4, availability = $5, updated_at = NOW()
     WHERE id = $6 AND author_id = $7 AND status = 'OPEN'
     RETURNING *`,
    [
      input.title,
      input.description,
      input.subject,
      input.academicLevel,
      input.availability,
      id,
      authorId
    ]
  );

  if (result.rows[0]) return { kind: "updated", request: result.rows[0] };
  return { kind: "closed" };
}
