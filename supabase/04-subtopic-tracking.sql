-- Add subtopic tracking table for detailed progress
CREATE TABLE IF NOT EXISTS subtopic_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  subtopic_name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id, subtopic_name)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_subtopic_progress_user_module ON subtopic_progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_subtopic_progress_completed ON subtopic_progress(user_id, completed);

-- Enable RLS
ALTER TABLE subtopic_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subtopic_progress
CREATE POLICY "Users can view their own subtopic progress"
  ON subtopic_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subtopic progress"
  ON subtopic_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subtopic progress"
  ON subtopic_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subtopic progress"
  ON subtopic_progress FOR DELETE
  USING (auth.uid() = user_id);

