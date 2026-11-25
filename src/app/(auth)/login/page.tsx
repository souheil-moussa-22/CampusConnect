import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { signIn } from '@/presentation/auth';

export default function Login() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
      <section className="relative hidden overflow-hidden bg-indigo-700 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div aria-hidden="true" className="absolute -right-36 -top-20 size-[30rem] rounded-full border-[70px] border-white/5" />
        <Link href="/" className="relative flex w-fit items-center gap-3 text-white">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15"><Sparkles size={20} aria-hidden="true" /></span>
          <span className="text-base font-bold tracking-tight">CampusConnect</span>
        </Link>
        <div className="relative max-w-lg py-16">
          <p className="text-sm font-semibold text-indigo-200">A campus community for everyone</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">Learn with people who get it.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-indigo-100">Find support, share what you know, and make studying feel a little less like doing it alone.</p>
        </div>
        <p className="relative text-xs text-indigo-200">CampusConnect · Learn better, together</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-700 lg:hidden">
            <ArrowLeft size={16} aria-hidden="true" /> CampusConnect
          </Link>
          <p className="text-sm font-semibold text-indigo-700">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-500">Pick up where you left off with your study community.</p>
          <form action={async formData => {
            'use server';
            await signIn('credentials', {
              email: String(formData.get('email')),
              password: String(formData.get('password')),
              redirectTo: '/dashboard',
            });
          }} className="mt-8 space-y-5">
            <label className="control-label">
              Email address
              <input name="email" type="email" autoComplete="email" required placeholder="you@university.edu" className="mt-2 w-full px-3.5 text-sm" />
            </label>
            <label className="control-label">
              Password
              <input name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" className="mt-2 w-full px-3.5 text-sm" />
            </label>
            <button className="primary-action mt-2 min-h-12 w-full px-4 py-3">Sign in</button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            New to CampusConnect? <Link href="/register" className="font-semibold text-indigo-700 hover:text-indigo-900">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
