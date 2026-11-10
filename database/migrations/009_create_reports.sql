CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES help_requests (id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 5000),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reporter_id, request_id)
);

CREATE INDEX reports_status_idx ON reports (status, created_at DESC);
CREATE INDEX reports_request_idx ON reports (request_id);
