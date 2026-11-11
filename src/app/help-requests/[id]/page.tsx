"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PublicHelpRequest } from "@/types/help-request.types";
export default function HelpRequestDetailsPage() {
  const { id } = useParams<{ id: string }>(); const { data: session } = useSession(); const [request, setRequest] = useState<PublicHelpRequest | null>(null); const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/help-requests/${id}`).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setRequest(body.helpRequest); }).catch((reason: Error) => setError(reason.message)); }, [id]);
  if (error) return <AppShell><main className="content"><p className="alert" role="alert">{error}</p></main></AppShell>; if (!request) return <AppShell><main className="content"><div className="loading">Loading help request...</div></main></AppShell>;
  const isAuthor = session?.user?.id === request.author_id;
  return <AppShell><main className="content"><div className="page-heading"><div><Link className="link" href="/help-requests">← Back to requests</Link><h1 style={{ marginTop: 16 }}>{request.title}</h1><p>Published {new Date(request.created_at).toLocaleDateString()}</p></div>{isAuthor && request.status === "OPEN" && <Link className="button-secondary" href={`/help-requests/${request.id}/edit`}>Edit request</Link>}</div><div className="detail-layout"><article className="card"><div className="request-meta"><StatusBadge status={request.status} /><span>{request.subject}</span><span>·</span><span>{request.academic_level}</span></div><p className="detail-copy">{request.description}</p><h3 style={{ marginTop: 30 }}>Availability</h3><p className="detail-copy">{request.availability}</p></article><aside className="card detail-side"><div className="request-author"><span className="avatar">{request.author_name.slice(0, 2).toUpperCase()}</span><strong>{request.author_name}</strong></div><dl><div className="info-row"><dt>Specialty</dt><dd>{request.author_specialty || "Not specified"}</dd></div><div className="info-row"><dt>Published</dt><dd>{new Date(request.created_at).toLocaleDateString()}</dd></div><div className="info-row"><dt>Status</dt><dd><StatusBadge status={request.status} /></dd></div></dl></aside></div></main></AppShell>;
}
