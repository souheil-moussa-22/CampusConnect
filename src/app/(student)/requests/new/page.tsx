import { auth } from '@/presentation/auth';
import { redirect } from 'next/navigation';
import { campusApplication } from '@/presentation/server/services';

export default async function NewRequest() {
  const subjects = await campusApplication.listSubjects();

  return <div className="mx-auto max-w-2xl">
    <h1 className="text-2xl font-bold">Publish a help request</h1>
    <form action={async formData => {
      'use server';
      const session = await auth();
      if (!session) redirect('/login');
      await campusApplication.createRequest({
        title: String(formData.get('title')).trim(),
        description: String(formData.get('description')).trim(),
        subject: String(formData.get('subject')),
        level: String(formData.get('level')),
        availability: String(formData.get('availability')),
        authorId: session.user.id,
      });
      redirect('/requests');
    }} className="mt-6 space-y-4 rounded-xl border bg-white p-6">
      <label className="block text-sm font-medium">Title<input name="title" required className="mt-2 w-full rounded-lg border px-3 py-2"/></label>
      <label className="block text-sm font-medium">Description<textarea name="description" required rows={5} className="mt-2 w-full rounded-lg border px-3 py-2"/></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Subject<input name="subject" list="subjects" required defaultValue="Computer Science" className="mt-2 w-full rounded-lg border px-3 py-2"/><datalist id="subjects">{subjects.map(subject=><option key={subject.id} value={subject.name}/>)}</datalist></label>
        <label className="text-sm font-medium">Required level<select name="level" className="mt-2 w-full rounded-lg border px-3 py-2">{['L1','L2','L3','M1','M2'].map(level=><option key={level}>{level}</option>)}</select></label>
      </div>
      <label className="block text-sm font-medium">Availability<input name="availability" className="mt-2 w-full rounded-lg border px-3 py-2"/></label>
      <button className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white">Publish request</button>
    </form>
  </div>;
}
