CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 200),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 5000),
  subject TEXT NOT NULL,
  academic_level TEXT NOT NULL,
  availability TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'HELP_ACCEPTED', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX help_requests_open_idx ON help_requests (status, created_at DESC);
CREATE INDEX help_requests_subject_idx ON help_requests (subject);
CREATE INDEX help_requests_academic_level_idx ON help_requests (academic_level);
CREATE INDEX help_requests_author_idx ON help_requests (author_id, created_at DESC);
