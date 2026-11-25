import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarCheck, Sparkles, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_80%_0%,#e8eaff_0%,transparent_38%),#f8f9fc]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="CampusConnect home">
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900">CampusConnect</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900">Log in</Link>
          <Link href="/register" className="primary-action inline-flex min-h-10 items-center px-4 py-2">Join the community</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="soft-enter">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            Made for students, powered by each other
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
            Your campus is full of people who can help.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Find a study partner, share your strengths, and turn tough coursework into progress you make together.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="primary-action inline-flex min-h-12 items-center gap-2 px-5 py-3">
              Get started <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/login" className="inline-flex min-h-12 items-center px-4 py-3 text-sm font-semibold text-slate-600 transition hover:text-indigo-700">
              I already have an account
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-2 text-sm text-slate-500">
            <BookOpen size={16} className="text-indigo-600" aria-hidden="true" />
            <span>A community built around peer-to-peer learning.</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div aria-hidden="true" className="absolute -inset-8 rounded-[2rem] bg-indigo-100/60 blur-3xl" />
          <div className="relative space-y-4 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_24px_70px_-35px_rgba(49,46,129,0.3)] backdrop-blur sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-medium text-slate-500">A better way to study</p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">A little help goes a long way</h2>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                <BookOpen size={20} aria-hidden="true" />
              </span>
            </div>
            <Feature icon={<Users size={19} />} title="Find your people" text="Meet peers with complementary skills and shared goals." />
            <Feature icon={<CalendarCheck size={19} />} title="Make time to learn" text="Turn a helpful conversation into a focused study session." />
            <Feature icon={<Sparkles size={19} />} title="Build trust together" text="Share feedback and grow your reputation in the community." />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 transition hover:border-indigo-100 hover:shadow-sm sm:p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700">{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}
