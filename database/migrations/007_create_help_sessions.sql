CREATE TABLE help_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE REFERENCES help_requests (id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL UNIQUE REFERENCES help_proposals (id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (proposal_id, request_id)
    REFERENCES help_proposals (id, request_id)
    ON DELETE RESTRICT,
  CHECK ((status = 'COMPLETED' AND completed_at IS NOT NULL) OR status <> 'COMPLETED')
);

CREATE INDEX help_sessions_status_idx ON help_sessions (status);
