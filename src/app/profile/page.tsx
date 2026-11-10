"use client";

import { signOut } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

type Profile = {
  email: string;
  full_name: string;
  specialty: string | null;
  academic_level: string | null;
  bio: string | null;
  availability: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setProfile(body.profile);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Unable to update profile.");
      return;
    }
    setProfile(body.profile);
    setMessage("Profile updated.");
  }

  if (error && !profile) return <main><p role="alert">{error}</p></main>;
  if (!profile) return <main><p>Loading profile...</p></main>;

  return (
    <main>
      <h1>Your profile</h1>
      <form onSubmit={submit}>
        <label>Email<input value={profile.email} readOnly /></label>
        <label>Full name<input name="fullName" defaultValue={profile.full_name} required /></label>
        <label>Specialty<input name="specialty" defaultValue={profile.specialty ?? ""} required /></label>
        <label>Academic level<input name="academicLevel" defaultValue={profile.academic_level ?? ""} required /></label>
        <label>Bio<textarea name="bio" defaultValue={profile.bio ?? ""} /></label>
        <label>Availability<textarea name="availability" defaultValue={profile.availability ?? ""} /></label>
        {message && <p>{message}</p>}
        {error && <p role="alert">{error}</p>}
        <button>Save profile</button>
      </form>
      <button onClick={() => signOut({ callbackUrl: "/login" })}>Log out</button>
    </main>
  );
}
