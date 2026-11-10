CREATE TABLE help_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES help_requests (id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 5000),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (request_id, proposer_id),
  UNIQUE (id, request_id)
);

CREATE INDEX help_proposals_request_idx ON help_proposals (request_id, status);
CREATE INDEX help_proposals_proposer_idx ON help_proposals (proposer_id, created_at DESC);
