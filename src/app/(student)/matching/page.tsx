import { auth } from '@/presentation/auth';
import { redirect } from 'next/navigation';
import { campusApplication } from '@/presentation/server/services';

export default async function Matching({ searchParams }: { searchParams: Promise<{ requestId?: string }> }) {
  const session = await auth();
  if (!session) redirect('/login');
  const params = await searchParams;
  const { requests, request, candidates } = await campusApplication.getMatching(session.user.id, params.requestId);
  if (!request) return <p className="text-slate-500">Create a help request to receive recommendations.</p>;

  return <div>
    <h1 className="text-2xl font-bold">Smart Matching</h1>
    <p className="mt-1 text-sm text-slate-500">Transparent compatibility recommendations</p>
    <form className="mt-5" action="/matching">
      <select name="requestId" defaultValue={request.id} className="rounded-lg border bg-white px-3 py-2">
        {requests.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
      <button className="ml-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Update</button>
    </form>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {candidates.map(({ candidate, score, matchingSkills, explanation }) => <div key={candidate.id} className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between"><b>{candidate.name}</b><span className="text-xl font-bold text-indigo-700">{score}%</span></div>
        <p className="mt-3 text-sm text-slate-600">{explanation}</p>
        <p className="mt-2 text-xs text-slate-400">Skills: {matchingSkills.join(', ') || 'No exact skill match'} · {candidate.specialty || 'General studies'}</p>
      </div>)}
    </div>
  </div>;
}
