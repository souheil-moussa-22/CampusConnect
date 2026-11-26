import { auth } from '@/presentation/auth';
import { redirect } from 'next/navigation';
import { campusApplication } from '@/presentation/server/services';

export default async function Reviews() {
  const session = await auth();
  if (!session) redirect('/login');
  const sessions = await campusApplication.getCompletedSessionsForReview(session.user.id);

  return <div>
    <h1 className="text-2xl font-bold">Session reviews</h1>
    {sessions.map(item => {
      const reviewingHelpingStudent = session.user.id === item.ownerId;
      const reviewed = reviewingHelpingStudent ? item.helpingStudent : item.owner;
      const alreadyReviewed = item.reviews.some(review =>
        review.reviewerId === session.user.id && review.reviewedStudentId === reviewed.id,
      );
      return <div key={item.id} className="mt-5 rounded-xl border bg-white p-5">
        <h2 className="font-bold">{item.request.title}</h2>
        {alreadyReviewed ? <p className="mt-3 text-sm text-emerald-600">Review submitted.</p> : <form action={async formData => {
          'use server';
          const current = await auth();
          if (!current) redirect('/login');
          await campusApplication.submitReview({
            sessionId: item.id,
            reviewerId: current.user.id,
            reviewerName: current.user.name || 'A student',
            rating: Number(formData.get('rating')),
            comment: String(formData.get('comment')),
          });
          redirect('/reviews');
        }} className="mt-3">
          <select name="rating" className="rounded-lg border px-3 py-2">{[5,4,3,2,1].map(rating => <option key={rating} value={rating}>{rating} stars</option>)}</select>
          <textarea name="comment" required className="mt-3 w-full rounded-lg border p-3" placeholder={`Review ${reviewed.name}`}/>
          <button className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Submit review</button>
        </form>}
      </div>;
    })}
    {!sessions.length && <p className="mt-6 text-slate-500">Completed sessions will appear here.</p>}
  </div>;
}
