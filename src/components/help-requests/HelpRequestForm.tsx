"use client";

import { FormEvent, useState } from "react";

export type HelpRequestFormValues = {
  title: string;
  description: string;
  subject: string;
  academicLevel: string;
  availability: string;
};

export function HelpRequestForm({
  initialValues,
  submitLabel,
  onSubmit
}: {
  initialValues?: Partial<HelpRequestFormValues>;
  submitLabel: string;
  onSubmit: (values: HelpRequestFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<HelpRequestFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    subject: initialValues?.subject ?? "",
    academicLevel: initialValues?.academicLevel ?? "",
    availability: initialValues?.availability ?? ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(name: keyof HelpRequestFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (Object.values(values).some((value) => !value.trim())) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save help request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Title<input value={values.title} maxLength={200} onChange={(event) => update("title", event.target.value)} /></label>
      <label>Description<textarea value={values.description} maxLength={5000} onChange={(event) => update("description", event.target.value)} /></label>
      <label>Subject<input value={values.subject} maxLength={100} onChange={(event) => update("subject", event.target.value)} /></label>
      <label>Academic level<input value={values.academicLevel} maxLength={100} onChange={(event) => update("academicLevel", event.target.value)} /></label>
      <label>Availability<textarea value={values.availability} maxLength={1000} onChange={(event) => update("availability", event.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button disabled={saving}>{saving ? "Saving..." : submitLabel}</button>
    </form>
  );
}
