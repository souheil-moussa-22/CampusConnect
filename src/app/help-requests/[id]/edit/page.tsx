"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { HelpRequestForm } from "@/components/help-requests/HelpRequestForm";
import type { PublicHelpRequest } from "@/types/help-request.types";

export default function EditHelpRequestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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
  if (session?.user?.id !== request.author_id) return <main><p>You are not authorized to edit this request.</p></main>;
  if (request.status !== "OPEN") return <main><p>This request is no longer open and cannot be edited.</p></main>;

  return (
    <main>
      <h1>Edit help request</h1>
      <HelpRequestForm
        submitLabel="Save changes"
        initialValues={{ title: request.title, description: request.description, subject: request.subject, academicLevel: request.academic_level, availability: request.availability }}
        onSubmit={async (values) => {
          const response = await fetch(`/api/help-requests/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
          });
          const body = await response.json();
          if (!response.ok) throw new Error(body.error ?? "Unable to update help request.");
          router.push(`/help-requests/${id}`);
        }}
      />
    </main>
  );
}
