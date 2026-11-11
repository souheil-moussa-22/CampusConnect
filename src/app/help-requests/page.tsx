"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelpRequestCard } from "@/components/help-requests/HelpRequestCard";
import type { HelpRequestListResponse, HelpRequestStatus } from "@/types/help-request.types";

export default function HelpRequestsPage() {
  const [result, setResult] = useState<HelpRequestListResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [status, setStatus] = useState<HelpRequestStatus | "">("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (subject) params.set("subject", subject);
    if (academicLevel) params.set("academicLevel", academicLevel);
    if (status) params.set("status", status);
    setLoading(true);
    fetch(`/api/help-requests?${params}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setResult(body);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [search, subject, academicLevel, status, page]);

  function filterSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
  }

  return (
    <main>
      <h1>Help requests</h1>
      <p><Link href="/help-requests/new">Publish a request</Link> · <Link href="/my-requests">My requests</Link></p>
      <form onSubmit={filterSubmit}>
        <input placeholder="Search title or description" value={search} onChange={(event) => setSearch(event.target.value)} />
        <input placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        <input placeholder="Academic level" value={academicLevel} onChange={(event) => setAcademicLevel(event.target.value)} />
        <select value={status} onChange={(event) => { setStatus(event.target.value as HelpRequestStatus | ""); setPage(1); }}>
          <option value="">All statuses</option><option value="OPEN">Open</option><option value="HELP_ACCEPTED">Help accepted</option><option value="COMPLETED">Completed</option>
        </select>
        <button>Apply filters</button>
      </form>
      {loading && <p>Loading help requests...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && result?.data.length === 0 && <p>No help requests found.</p>}
      {result?.data.map((request) => <HelpRequestCard key={request.id} request={request} />)}
      {result && result.pagination.totalPages > 1 && (
        <p>
          <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>{" "}
          Page {page} of {result.pagination.totalPages}{" "}
          <button disabled={page >= result.pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
        </p>
      )}
    </main>
  );
}
