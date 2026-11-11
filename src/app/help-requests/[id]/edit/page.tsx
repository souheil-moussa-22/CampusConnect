"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HelpRequestForm } from "@/components/help-requests/HelpRequestForm";
import type { PublicHelpRequest } from "@/types/help-request.types";
export default function EditHelpRequestPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const { data: session } = useSession(); const [request, setRequest] = useState<PublicHelpRequest | null>(null); const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/help-requests/${id}`).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setRequest(body.helpRequest); }).catch((reason: Error) => setError(reason.message)); }, [id]);
  if (error) return <AppShell><main className="content"><p className="alert" role="alert">{error}</p></main></AppShell>; if (!request) return <AppShell><main className="content"><div className="loading">Loading help request...</div></main></AppShell>; if (session?.user?.id !== request.author_id) return <AppShell><main className="content"><p className="alert">You are not authorized to edit this request.</p></main></AppShell>; if (request.status !== "OPEN") return <AppShell><main className="content"><p className="alert">This request is no longer open and cannot be edited.</p></main></AppShell>;
  return <AppShell><main className="content"><div className="page-heading"><div><Link className="link" href={`/help-requests/${id}`}>← Back to request</Link><h1 style={{ marginTop: 16 }}>Edit help request</h1><p>Update the details your classmates will see.</p></div></div><div className="card form-card"><HelpRequestForm submitLabel="Save changes" initialValues={{ title: request.title, description: request.description, subject: request.subject, academicLevel: request.academic_level, availability: request.availability }} onSubmit={async (values) => { const response = await fetch(`/api/help-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Unable to update help request."); router.push(`/help-requests/${id}`); }} /></div></main></AppShell>;
}
