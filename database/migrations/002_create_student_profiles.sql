CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialty TEXT,
  academic_level TEXT,
  bio TEXT,
  availability TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX student_profiles_specialty_idx ON student_profiles (specialty);
CREATE INDEX student_profiles_academic_level_idx ON student_profiles (academic_level);
