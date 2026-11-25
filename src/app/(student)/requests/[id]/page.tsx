import { auth } from '@/presentation/auth';
import { notFound, redirect } from 'next/navigation';
import { campusApplication, proposalApplication } from '@/presentation/server/services';

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect('/login');
  const request = await campusApplication.getRequestDetails(id);
  if (!request || request.hidden) notFound();
  const owner = session.user.id === request.authorId;

  return <div className="mx-auto max-w-4xl">
    <div className="rounded-xl border bg-white p-6">
      <p className="text-sm font-bold text-indigo-600">{request.subject.name}</p>
      <h1 className="mt-2 text-3xl font-bold">{request.title}</h1>
      <p className="mt-4 text-slate-600">{request.description}</p>
      <div className="mt-5 flex gap-4 text-sm text-slate-500">
        <span>{request.level}</span><span>{request.availability || 'Flexible'}</span><span>by {request.author.name}</span>
      </div>
    </div>
    {!owner && <form action={async formData => {
      'use server';
      const current = await auth();
      if (!current) redirect('/login');
      await campusApplication.submitReport({
        reporterId: current.user.id,
        requestId: id,
        reason: String(formData.get('reason')) as 'INAPPROPRIATE' | 'SPAM' | 'HARASSMENT' | 'OTHER',
        details: String(formData.get('details')),
      });
      redirect(`/requests/${id}`);
    }} className="mt-4 flex items-end gap-2 rounded-xl border bg-white p-4">
      <label className="text-sm">Report reason<select name="reason" className="ml-2 rounded-lg border px-2 py-1"><option>INAPPROPRIATE</option><option>SPAM</option><option>HARASSMENT</option><option>OTHER</option></select></label>
      <input name="details" className="flex-1 rounded-lg border px-3 py-1" placeholder="Optional details"/>
      <button className="rounded-lg border px-3 py-1 text-sm">Report</button>
    </form>}
    {owner ? <div className="mt-6">
      <h2 className="mb-3 text-lg font-bold">Received proposals</h2>
      {request.proposals.length ? request.proposals.map(proposal => <div key={proposal.id} className="mb-3 flex items-center justify-between rounded-xl border bg-white p-4">
        <div><b>{proposal.student.name}</b><p className="text-sm text-slate-600">{proposal.message}</p><span className="text-xs text-slate-400">{proposal.status}</span></div>
        {proposal.status === 'PENDING' && <div className="flex gap-2">
          <form action={async () => {
            'use server';
            const current = await auth();
            if (!current) redirect('/login');
            await proposalApplication.accept.execute(current.user.id, proposal.id);
            redirect(`/requests/${id}`);
          }}><button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">Accept</button></form>
          <form action={async () => {
            'use server';
            const current = await auth();
            if (!current) redirect('/login');
            await proposalApplication.reject.execute(current.user.id, proposal.id);
            redirect(`/requests/${id}`);
          }}><button className="rounded-lg border px-3 py-2 text-sm">Reject</button></form>
        </div>}
      </div>) : <p className="rounded-xl border border-dashed bg-white p-8 text-center text-slate-500">No proposals yet.</p>}
    </div> : request.status === 'OPEN' && <form action={async formData => {
      'use server';
      const current = await auth();
      if (!current) redirect('/login');
      await campusApplication.submitProposal({
        actorId: current.user.id,
        requestId: id,
        message: String(formData.get('message')),
        studentName: current.user.name ?? null,
      });
      redirect(`/requests/${id}`);
    }} className="mt-6 rounded-xl border bg-white p-5">
      <h2 className="font-bold">Offer your help</h2>
      <textarea name="message" required minLength={10} rows={4} className="mt-3 w-full rounded-lg border p-3" placeholder="Explain how you can help..."/>
      <button className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Submit proposal</button>
    </form>}
  </div>;
}
