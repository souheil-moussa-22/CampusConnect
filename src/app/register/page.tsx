"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icons";
export default function RegisterPage() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const body = await response.json(); setLoading(false);
    if (!response.ok) { setError(body.error ?? "Registration failed."); return; } router.push("/login?registered=1");
  }
  return <div className="auth-page"><section className="auth-panel"><div className="auth-form-wrap">
    <Link href="/login" className="brand"><span className="brand-mark">C</span>CampusConnect</Link>
    <div className="auth-heading"><div className="eyebrow">Join the community</div><h1>Build your campus network.</h1><p>Create your student profile and start sharing knowledge with your peers.</p></div>
    <form className="form-stack" onSubmit={submit}>
      <div className="form-grid"><label className="field">Full name<input name="fullName" placeholder="Alex Martin" required /></label><label className="field">Email<input name="email" type="email" placeholder="you@university.edu" required /></label><label className="field">Password<div className="password-wrap"><input name="password" type={showPassword ? "text" : "password"} minLength={12} placeholder="12 characters minimum" required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}><Icon name={showPassword ? "eyeOff" : "eye"} /></button></div></label><label className="field">Confirm password<input name="passwordConfirmation" type="password" required /></label><label className="field">Specialty<input name="specialty" placeholder="Computer science" required /></label><label className="field">Academic level<input name="academicLevel" placeholder="Bachelor 3" required /></label></div>
      {error && <p className="alert" role="alert">{error}</p>}<button className="button" disabled={loading}>{loading ? "Creating account..." : "Create account"} <Icon name="arrow" /></button>
    </form><p className="auth-foot">Already have an account? <Link href="/login">Log in</Link></p>
  </div></section><aside className="auth-art" aria-hidden="true"><div className="auth-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-panel"><div className="visual-avatar">+</div><div><strong>Join your peers</strong><span>Share skills and grow together</span></div><Icon name="arrow" /></div><div className="visual-badge badge-top"><Icon name="user" /><span>Student network</span></div><div className="visual-badge badge-bottom"><Icon name="clock" /><span>Always learning</span></div></div></aside></div>;
}
