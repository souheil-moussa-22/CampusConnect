CREATE INDEX IF NOT EXISTS help_requests_created_at_idx
  ON help_requests (created_at DESC);
