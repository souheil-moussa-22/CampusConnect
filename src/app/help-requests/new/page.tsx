"use client";

import { useRouter } from "next/navigation";
import { HelpRequestForm } from "@/components/help-requests/HelpRequestForm";

export default function NewHelpRequestPage() {
  const router = useRouter();
  return (
    <main>
      <h1>Publish a help request</h1>
      <HelpRequestForm submitLabel="Publish request" onSubmit={async (values) => {
        const response = await fetch("/api/help-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Unable to create help request.");
        router.push(`/help-requests/${body.helpRequest.id}`);
      }} />
    </main>
  );
}
