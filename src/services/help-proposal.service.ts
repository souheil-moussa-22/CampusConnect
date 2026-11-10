import "server-only";

import { withTransaction } from "@/lib/db/transaction";

export async function acceptHelpProposal(
  requestId: string,
  proposalId: string,
  requestAuthorId: string
): Promise<void> {
  await withTransaction(async (client) => {
    const request = await client.query<{ author_id: string; status: string }>(
      `SELECT author_id, status
       FROM help_requests
       WHERE id = $1
       FOR UPDATE`,
      [requestId]
    );

    if (!request.rowCount || request.rows[0].author_id !== requestAuthorId) {
      throw new Error("Only the request author can accept a proposal.");
    }
    if (request.rows[0].status !== "OPEN") {
      throw new Error("Only open requests can accept proposals.");
    }

    const proposal = await client.query<{ proposer_id: string; status: string }>(
      `SELECT proposer_id, status
       FROM help_proposals
       WHERE id = $1 AND request_id = $2
       FOR UPDATE`,
      [proposalId, requestId]
    );
    if (!proposal.rowCount || proposal.rows[0].status !== "PENDING") {
      throw new Error("The proposal is not available for acceptance.");
    }
    if (proposal.rows[0].proposer_id === requestAuthorId) {
      throw new Error("A request author cannot accept their own proposal.");
    }

    await client.query(
      `UPDATE help_proposals
       SET status = CASE WHEN id = $1 THEN 'ACCEPTED' ELSE 'REJECTED' END,
           updated_at = NOW()
       WHERE request_id = $2 AND status = 'PENDING'`,
      [proposalId, requestId]
    );
    await client.query(
      "UPDATE help_requests SET status = 'HELP_ACCEPTED', updated_at = NOW() WHERE id = $1",
      [requestId]
    );
    await client.query(
      `INSERT INTO help_sessions (request_id, proposal_id, status)
       VALUES ($1, $2, 'SCHEDULED')`,
      [requestId, proposalId]
    );
  });
}

