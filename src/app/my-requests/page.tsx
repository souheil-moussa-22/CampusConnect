"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HelpRequestCard } from "@/components/help-requests/HelpRequestCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { HelpRequestListResponse, HelpRequestStatus } from "@/types/help-request.types";
export default function MyRequestsPage() {
  const [status, setStatus] = useState<HelpRequestStatus | "">(""); const [result, setResult] = useState<HelpRequestListResponse | null>(null); const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/help-requests/my-requests${status ? `?status=${status}` : ""}`).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setResult(body); }).catch((reason: Error) => setError(reason.message)); }, [status]);
  return <AppShell><main className="content"><div className="page-heading"><div><div className="eyebrow">Your activity</div><h1>My requests</h1><p>Track the help you have asked for across campus.</p></div><select className="input" style={{ width: 180 }} value={status} onChange={(event) => setStatus(event.target.value as HelpRequestStatus | "")}><option value="">All statuses</option><option value="OPEN">Open</option><option value="HELP_ACCEPTED">Help accepted</option><option value="COMPLETED">Completed</option></select></div>{error && <p className="alert" role="alert">{error}</p>}{!error && !result && <div className="loading">Loading your requests...</div>}{result?.data.length === 0 && <div className="card"><EmptyState title="Your board is quiet" description="Publish a request when you need support from your community." action={{ label: "Publish a request", href: "/help-requests/new" }} /></div>}<div className="grid grid-3">{result?.data.map((request) => <HelpRequestCard key={request.id} request={request} canEdit />)}</div></main></AppShell>;
}
