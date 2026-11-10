CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES help_sessions (id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  evaluated_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (evaluator_id <> evaluated_user_id),
  UNIQUE (session_id, evaluator_id)
);

CREATE INDEX evaluations_evaluated_user_idx ON evaluations (evaluated_user_id, created_at DESC);
