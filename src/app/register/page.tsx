"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(body.error ?? "Registration failed.");
      return;
    }
    router.push("/login?registered=1");
  }

  return (
    <main>
      <h1>Create your student account</h1>
      <form onSubmit={submit}>
        <label>Full name<input name="fullName" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minLength={12} required /></label>
        <label>Confirm password<input name="passwordConfirmation" type="password" required /></label>
        <label>Specialty<input name="specialty" required /></label>
        <label>Academic level<input name="academicLevel" required /></label>
        {error && <p role="alert">{error}</p>}
        <button disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
      </form>
      <Link href="/login">Already have an account? Log in</Link>
    </main>
  );
}
