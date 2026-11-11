"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icons";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirect: false });
    setLoading(false);
    if (result?.error) { setError("Invalid email or password."); return; }
    router.push(searchParams.get("callbackUrl") || "/dashboard"); router.refresh();
  }
  return <div className="auth-page"><section className="auth-panel"><div className="auth-form-wrap">
    <Link href="/login" className="brand"><span className="brand-mark">C</span>CampusConnect</Link>
    <div className="auth-heading"><div className="eyebrow">Welcome back</div><h1>Connect. Learn. Grow.</h1><p>Sign in to find the support and skills you need on campus.</p></div>
    {searchParams.get("registered") && <p className="success">Account created. You can now log in.</p>}
    <form className="form-stack" onSubmit={submit}>
      <label className="field">Email address<input name="email" type="email" placeholder="you@university.edu" required /></label>
      <label className="field">Password<div className="password-wrap"><input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}><Icon name={showPassword ? "eyeOff" : "eye"} /></button></div></label>
      {error && <p className="alert" role="alert">{error}</p>}
      <button className="button" disabled={loading}>{loading ? "Logging in..." : "Log in"} <Icon name="arrow" /></button>
    </form>
    <p className="auth-foot">New to CampusConnect? <Link href="/register">Create a student account</Link></p>
  </div></section><aside className="auth-art" aria-hidden="true"><div className="auth-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-panel"><div className="visual-avatar">CC</div><div><strong>Learn together</strong><span>Find your campus community</span></div><Icon name="arrow" /></div><div className="visual-badge badge-top"><Icon name="book" /><span>Shared knowledge</span></div><div className="visual-badge badge-bottom"><Icon name="check" /><span>Real connections</span></div></div></aside></div>;
}
export default function LoginPage() { return <Suspense fallback={<div className="loading">Loading...</div>}><LoginForm /></Suspense>; }
