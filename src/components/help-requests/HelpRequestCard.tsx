"use client";

import Link from "next/link";
import type { PublicHelpRequest } from "@/types/help-request.types";

export function HelpRequestCard({ request, canEdit = false }: { request: PublicHelpRequest; canEdit?: boolean }) {
  return (
    <article>
      <h2><Link href={`/help-requests/${request.id}`}>{request.title}</Link></h2>
      <p>{request.description.length > 180 ? `${request.description.slice(0, 180)}...` : request.description}</p>
      <p>{request.subject} · {request.academic_level} · {request.status}</p>
      <p>By {request.author_name}{request.author_specialty ? ` (${request.author_specialty})` : ""} · {new Date(request.created_at).toLocaleDateString()}</p>
      {canEdit && request.status === "OPEN" && <Link href={`/help-requests/${request.id}/edit`}>Edit</Link>}
    </article>
  );
}
