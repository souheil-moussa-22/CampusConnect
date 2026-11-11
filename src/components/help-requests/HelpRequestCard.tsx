"use client";

import Link from "next/link";
import type { PublicHelpRequest } from "@/types/help-request.types";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function HelpRequestCard({ request, canEdit = false }: { request: PublicHelpRequest; canEdit?: boolean }) {
  return (
    <article className="card request-card">
      <div className="request-meta"><span>{request.subject}</span><span>·</span><span>{request.academic_level}</span><StatusBadge status={request.status} /></div>
      <h3><Link href={`/help-requests/${request.id}`}>{request.title}</Link></h3>
      <p>{request.description.length > 180 ? `${request.description.slice(0, 180)}...` : request.description}</p>
      <div className="request-footer"><div className="request-author"><span className="avatar">{request.author_name.slice(0, 2).toUpperCase()}</span><span>{request.author_name}<br /><span className="muted">{new Date(request.created_at).toLocaleDateString()}</span></span></div>{canEdit && request.status === "OPEN" && <Link className="link" href={`/help-requests/${request.id}/edit`}>Edit</Link>}</div>
    </article>
  );
}
