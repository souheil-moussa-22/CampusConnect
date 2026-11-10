CREATE TABLE student_profile_skills (
  profile_id UUID NOT NULL REFERENCES student_profiles (id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills (id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, skill_id)
);

CREATE INDEX student_profile_skills_skill_idx ON student_profile_skills (skill_id);
