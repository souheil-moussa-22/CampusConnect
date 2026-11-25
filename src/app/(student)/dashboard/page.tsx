import Link from 'next/link';
import { ArrowRight, Bell, CalendarDays, MessageSquareText, Plus, Search, Star, Users } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect('/login');

  const id = session.user.id;
  const [requests, proposals, received, sessions, notifications, profile] = await Promise.all([
    prisma.helpRequest.count({ where: { authorId: id } }),
    prisma.helpProposal.count({ where: { studentId: id } }),
    prisma.helpProposal.count({ where: { request: { authorId: id }, status: 'PENDING' } }),
    prisma.studySession.findMany({
      where: { OR: [{ ownerId: id }, { helpingStudentId: id }] },
      include: { request: true },
      orderBy: { date: 'asc' },
    }),
    prisma.notification.findMany({ where: { recipientId: id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.studentProfile.findUnique({ where: { userId: id } }),
  ]);
  const stats = [
    { label: 'My requests', value: requests, icon: MessageSquareText, tone: 'bg-indigo-50 text-indigo-700' },
    { label: 'Proposals sent', value: proposals, icon: ArrowRight, tone: 'bg-sky-50 text-sky-700' },
    { label: 'Awaiting response', value: received, icon: Users, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Study sessions', value: sessions.length, icon: CalendarDays, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Average rating', value: profile?.averageRating.toFixed(1) ?? '—', icon: Star, tone: 'bg-violet-50 text-violet-700' },
  ];
  const upcomingSessions = sessions.filter(item => item.status === 'SCHEDULED').slice(0, 4);

  return (
    <div className="soft-enter space-y-7">
      <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/80 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold text-indigo-700">Your learning community</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Good to see you, {session.user.name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Ask a question, share what you know, and make progress together with your campus community.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/requests/new" className="primary-action inline-flex min-h-11 items-center gap-2 px-4 py-2.5">
              <Plus size={17} aria-hidden="true" /> Create a request
            </Link>
            <Link href="/requests" className="subtle-action inline-flex min-h-11 items-center gap-2 px-4 py-2.5">
              <Search size={17} aria-hidden="true" /> Explore requests
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 hidden size-72 rounded-full border-[36px] border-indigo-100/45 sm:block" />
      </section>

      <section aria-label="Your activity" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="surface flex min-w-0 items-center gap-3.5 p-4 sm:p-5">
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
              <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <section className="surface min-w-0 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Upcoming sessions</h2>
              <p className="mt-1 text-sm text-slate-500">Your scheduled time to learn together</p>
            </div>
            <Link href="/sessions" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">
              View all <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {upcomingSessions.length ? (
            <div className="mt-5 divide-y divide-slate-100">
              {upcomingSessions.map(item => (
                <Link key={item.id} href="/sessions" className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                    <CalendarDays size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{item.request.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {item.date.toLocaleString()} <span aria-hidden="true">·</span> {item.duration} min
                    </span>
                  </span>
                  <ArrowRight size={16} className="mt-1 shrink-0 text-slate-400" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
              <CalendarDays size={23} className="mx-auto text-slate-400" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-slate-700">No sessions scheduled yet</p>
              <p className="mt-1 text-xs text-slate-500">Find a study request and offer to help.</p>
              <Link href="/requests" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700">
                Browse requests <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        <section className="surface min-w-0 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Recent notifications</h2>
              <p className="mt-1 text-sm text-slate-500">The latest from your community</p>
            </div>
            <Link href="/notifications" aria-label="View all notifications" className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-700">
              <Bell size={18} aria-hidden="true" />
            </Link>
          </div>
          {notifications.length ? (
            <div className="mt-5 divide-y divide-slate-100">
              {notifications.map(notification => (
                <div key={notification.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span className={`mt-1 size-2 shrink-0 rounded-full ${notification.read ? 'bg-slate-200' : 'bg-indigo-500'}`} aria-label={notification.read ? 'Read' : 'Unread'} />
                  <div className="min-w-0">
                    <p className="text-sm leading-5 text-slate-700">{notification.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{notification.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
              <Bell size={22} className="mx-auto text-slate-400" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-slate-700">You&apos;re all caught up</p>
              <p className="mt-1 text-xs text-slate-500">New activity will show up here.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
