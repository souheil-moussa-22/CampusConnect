import "server-only";

import { withTransaction } from "@/lib/db/transaction";

export async function createEvaluation(input: {
  sessionId: string;
  evaluatorId: string;
  evaluatedUserId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  await withTransaction(async (client) => {
    const session = await client.query<{
      status: string;
      author_id: string;
      proposer_id: string;
    }>(
      `SELECT s.status, r.author_id, p.proposer_id
       FROM help_sessions s
       JOIN help_requests r ON r.id = s.request_id
       JOIN help_proposals p ON p.id = s.proposal_id
       WHERE s.id = $1
       FOR UPDATE`,
      [input.sessionId]
    );
    if (!session.rowCount || session.rows[0].status !== "COMPLETED") {
      throw new Error("Evaluations require a completed help session.");
    }

    const participants = new Set([
      session.rows[0].author_id,
      session.rows[0].proposer_id
    ]);
    if (
      !participants.has(input.evaluatorId) ||
      !participants.has(input.evaluatedUserId) ||
      input.evaluatorId === input.evaluatedUserId
    ) {
      throw new Error("Only session participants can evaluate each other.");
    }

    await client.query(
      `INSERT INTO evaluations
         (session_id, evaluator_id, evaluated_user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        input.sessionId,
        input.evaluatorId,
        input.evaluatedUserId,
        input.rating,
        input.comment ?? null
      ]
    );
  });
}
