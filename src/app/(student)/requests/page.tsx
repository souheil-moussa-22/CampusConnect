import Link from 'next/link';
import { ArrowRight, BookOpen, MessageSquareText, Search } from 'lucide-react';
import { campusApplication } from '@/presentation/server/services';

export default async function Requests({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [requests, subjects] = await Promise.all([
    campusApplication.listRequests(params),
    campusApplication.listSubjects(),
  ]);

  return (
    <div className="soft-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-700">Student community</p>
          <h1 className="page-title mt-1">Find help</h1>
          <p className="mt-2 text-sm text-slate-500">Explore what your campus community is learning and working on.</p>
        </div>
        <Link href="/requests/new" className="primary-action inline-flex min-h-11 w-fit items-center gap-2 px-4 py-2.5">
          <MessageSquareText size={17} aria-hidden="true" /> Post a request
        </Link>
      </div>

      <form className="surface mt-6 grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(220px,2fr)_minmax(150px,1fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_auto]" action="/requests">
        <label className="control-label">
          Search
          <span className="relative mt-1.5 block">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input name="keyword" defaultValue={params.keyword} placeholder="Try calculus, essays..." className="w-full pl-9 pr-3 text-sm" />
          </span>
        </label>
        <label className="control-label">
          Subject
          <select name="subject" defaultValue={params.subject} className="mt-1.5 w-full px-3 text-sm">
            <option value="">All subjects</option>
            {subjects.map(subject => <option key={subject.id} value={subject.name}>{subject.name}</option>)}
          </select>
        </label>
        <label className="control-label">
          Level
          <select name="level" defaultValue={params.level} className="mt-1.5 w-full px-3 text-sm">
            <option value="">All levels</option>
            {['L1', 'L2', 'L3', 'M1', 'M2'].map(level => <option key={level}>{level}</option>)}
          </select>
        </label>
        <label className="control-label">
          Sort by
          <select name="sort" defaultValue={params.sort || 'newest'} className="mt-1.5 w-full px-3 text-sm">
            <option value="newest">Most recent</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <button className="primary-action min-h-11 self-end px-5 py-2.5">Search</button>
      </form>

      <div className="mb-3 mt-7 flex items-center justify-between">
        <h2 className="section-title">Community requests</h2>
        <p className="text-xs font-medium text-slate-500">{requests.length} {requests.length === 1 ? 'request' : 'requests'} shown</p>
      </div>
      {requests.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {requests.map(request => {
            const statusClass = request.status === 'OPEN'
              ? 'bg-emerald-50 text-emerald-700'
              : request.status === 'HELP_ACCEPTED'
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-slate-100 text-slate-600';
            const statusLabel = request.status.replaceAll('_', ' ').toLowerCase();

            return (
              <Link
                href={`/requests/${request.id}`}
                key={request.id}
                className="request-card surface flex min-h-56 flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex max-w-[70%] items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    <BookOpen size={13} aria-hidden="true" />
                    <span className="truncate">{request.subject.name}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusClass}`}>{statusLabel}</span>
                </div>
                <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-slate-900">{request.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{request.description}</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="min-w-0 truncate font-medium text-slate-700">{request.author.name} <span className="font-normal text-slate-400">· {request.level}</span></span>
                  <span className="inline-flex shrink-0 items-center gap-1">
                    {request._count.proposals} {request._count.proposals === 1 ? 'proposal' : 'proposals'}
                    <ArrowRight size={14} className="ml-1 text-slate-400" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="surface mt-4 border-dashed px-6 py-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Search size={22} aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-semibold text-slate-800">No requests found</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Try changing your search or filters, or post a request of your own.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/requests" className="subtle-action inline-flex min-h-10 items-center px-4">Clear filters</Link>
            <Link href="/requests/new" className="primary-action inline-flex min-h-10 items-center px-4">Post a request</Link>
          </div>
        </div>
      )}
    </div>
  );
}
