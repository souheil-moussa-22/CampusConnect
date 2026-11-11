"use client";

import { useEffect, useState } from "react";
import { HelpRequestCard } from "@/components/help-requests/HelpRequestCard";
import type { HelpRequestListResponse, HelpRequestStatus } from "@/types/help-request.types";

export default function MyRequestsPage() {
  const [status, setStatus] = useState<HelpRequestStatus | "">("");
  const [result, setResult] = useState<HelpRequestListResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = status ? `?status=${status}` : "";
    fetch(`/api/help-requests/my-requests${params}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setResult(body);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [status]);

  return (
    <main>
      <h1>My help requests</h1>
      <label>Status
        <select value={status} onChange={(event) => setStatus(event.target.value as HelpRequestStatus | "")}>
          <option value="">All statuses</option><option value="OPEN">Open</option><option value="HELP_ACCEPTED">Help accepted</option><option value="COMPLETED">Completed</option>
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      {!error && !result && <p>Loading your requests...</p>}
      {result?.data.length === 0 && <p>You have not published any requests.</p>}
      {result?.data.map((request) => <HelpRequestCard key={request.id} request={request} canEdit />)}
    </main>
  );
}
