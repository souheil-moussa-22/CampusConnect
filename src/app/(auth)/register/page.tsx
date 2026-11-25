import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn } from '@/lib/auth';

export default function Register() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
      <section className="relative hidden overflow-hidden bg-indigo-700 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div aria-hidden="true" className="absolute -right-36 -top-20 size-[30rem] rounded-full border-[70px] border-white/5" />
        <Link href="/" className="relative flex w-fit items-center gap-3 text-white">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15"><Sparkles size={20} aria-hidden="true" /></span>
          <span className="text-base font-bold tracking-tight">CampusConnect</span>
        </Link>
        <div className="relative max-w-lg py-16">
          <p className="text-sm font-semibold text-indigo-200">Better together</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">Make your next connection count.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-indigo-100">Join a student-first space to ask for help, offer your skills, and make progress as a community.</p>
        </div>
        <p className="relative text-xs text-indigo-200">CampusConnect · Learn better, together</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-700 lg:hidden">
            <ArrowLeft size={16} aria-hidden="true" /> CampusConnect
          </Link>
          <p className="text-sm font-semibold text-indigo-700">Get started</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">A few details and you&apos;re part of the community.</p>
          <form action={async formData => {
            'use server';
            const name = String(formData.get('name')).trim();
            const email = String(formData.get('email')).trim().toLowerCase();
            const password = String(formData.get('password'));
            if (name.length < 2 || password.length < 6) throw new Error('Invalid registration');
            if (await prisma.user.findUnique({ where: { email } })) throw new Error('Email already registered');
            await prisma.user.create({
              data: { name, email, passwordHash: await bcrypt.hash(password, 12), profile: { create: {} } },
            });
            await signIn('credentials', { email, password, redirectTo: '/dashboard' });
          }} className="mt-8 space-y-5">
            <label className="control-label">
              Full name
              <input name="name" autoComplete="name" required minLength={2} placeholder="Your name" className="mt-2 w-full px-3.5 text-sm" />
            </label>
            <label className="control-label">
              University email
              <input name="email" type="email" autoComplete="email" required placeholder="you@university.edu" className="mt-2 w-full px-3.5 text-sm" />
            </label>
            <label className="control-label">
              Password
              <input name="password" type="password" autoComplete="new-password" minLength={6} required placeholder="At least 6 characters" className="mt-2 w-full px-3.5 text-sm" />
            </label>
            <button className="primary-action mt-2 min-h-12 w-full px-4 py-3">Create account</button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            Already a member? <Link href="/login" className="font-semibold text-indigo-700 hover:text-indigo-900">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
