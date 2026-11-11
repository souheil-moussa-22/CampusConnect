"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { PublicHelpRequest } from "@/types/help-request.types";

export default function HelpRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [request, setRequest] = useState<PublicHelpRequest | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/help-requests/${id}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setRequest(body.helpRequest);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [id]);

  if (error) return <main><p role="alert">{error}</p></main>;
  if (!request) return <main><p>Loading help request...</p></main>;
  const isAuthor = session?.user?.id === request.author_id;
  return (
    <main>
      <h1>{request.title}</h1>
      <p>{request.description}</p>
      <p>Subject: {request.subject}</p>
      <p>Academic level: {request.academic_level}</p>
      <p>Availability: {request.availability}</p>
      <p>Status: {request.status}</p>
      <p>Author: {request.author_name}{request.author_specialty ? ` (${request.author_specialty})` : ""}</p>
      <p>Published: {new Date(request.created_at).toLocaleString()}</p>
      {isAuthor && request.status === "OPEN" && <Link href={`/help-requests/${request.id}/edit`}>Edit request</Link>}
    </main>
  );
}
