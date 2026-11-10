"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/profile");
    router.refresh();
  }

  return (
    <main>
      <h1>Log in</h1>
      {searchParams.get("registered") && <p>Account created. You can now log in.</p>}
      <form onSubmit={submit}>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required /></label>
        {error && <p role="alert">{error}</p>}
        <button disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
      </form>
      <Link href="/register">Create a student account</Link>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main><p>Loading...</p></main>}><LoginForm /></Suspense>;
}
