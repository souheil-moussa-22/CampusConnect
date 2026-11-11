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
    <form className="form-stack" onSubmit={submit}>
      <div className="form-grid">
        <label className="field full">Title<input value={values.title} maxLength={200} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Need help with calculus integration" /></label>
        <label className="field full">Description<textarea value={values.description} maxLength={5000} onChange={(event) => update("description", event.target.value)} placeholder="Describe what you need help with..." /></label>
        <label className="field">Subject<input value={values.subject} maxLength={100} onChange={(event) => update("subject", event.target.value)} placeholder="Mathematics" /></label>
        <label className="field">Academic level<input value={values.academicLevel} maxLength={100} onChange={(event) => update("academicLevel", event.target.value)} placeholder="Bachelor 2" /></label>
        <label className="field full">Availability<textarea value={values.availability} maxLength={1000} onChange={(event) => update("availability", event.target.value)} placeholder="When are you available to receive help?" /></label>
      </div>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="actions"><button className="button" disabled={saving}>{saving ? "Saving..." : submitLabel}</button></div>
    </form>
  );
}
