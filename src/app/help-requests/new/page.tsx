"use client";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { HelpRequestForm } from "@/components/help-requests/HelpRequestForm";
export default function NewHelpRequestPage() { const router = useRouter(); return <AppShell><main className="content"><div className="page-heading"><div><div className="eyebrow">Ask your community</div><h1>Publish a help request</h1><p>Be specific so the right classmate can find and support you.</p></div></div><div className="card form-card"><HelpRequestForm submitLabel="Publish request" onSubmit={async (values) => { const response = await fetch("/api/help-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Unable to create help request."); router.push(`/help-requests/${body.helpRequest.id}`); }} /></div></main></AppShell>; }
