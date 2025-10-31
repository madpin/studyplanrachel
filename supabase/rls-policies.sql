-- Row Level Security (RLS) Policies
-- Run this SQL AFTER running schema.sql

-- Enable RLS on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sba_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sba_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE catch_up_queue ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Modules Policies
CREATE POLICY "Users can view their own modules"
  ON modules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own modules"
  ON modules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own modules"
  ON modules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own modules"
  ON modules FOR DELETE
  USING (auth.uid() = user_id);

-- Daily Schedule Policies
CREATE POLICY "Users can view their own daily schedule"
  ON daily_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily schedule"
  ON daily_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily schedule"
  ON daily_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily schedule"
  ON daily_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- Task Categories Policies
CREATE POLICY "Users can view their own task categories"
  ON task_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task categories"
  ON task_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task categories"
  ON task_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task categories"
  ON task_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Tasks Policies
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Daily Notes Policies
CREATE POLICY "Users can view their own daily notes"
  ON daily_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily notes"
  ON daily_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily notes"
  ON daily_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily notes"
  ON daily_notes FOR DELETE
  USING (auth.uid() = user_id);

-- SBA Tests Policies
CREATE POLICY "Users can view their own SBA tests"
  ON sba_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SBA tests"
  ON sba_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SBA tests"
  ON sba_tests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SBA tests"
  ON sba_tests FOR DELETE
  USING (auth.uid() = user_id);

-- SBA Schedule Policies
CREATE POLICY "Users can view their own SBA schedule"
  ON sba_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SBA schedule"
  ON sba_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SBA schedule"
  ON sba_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SBA schedule"
  ON sba_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- Revision Resources Policies
CREATE POLICY "Users can view their own revision resources"
  ON revision_resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own revision resources"
  ON revision_resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revision resources"
  ON revision_resources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revision resources"
  ON revision_resources FOR DELETE
  USING (auth.uid() = user_id);

-- Catch-up Queue Policies
CREATE POLICY "Users can view their own catch-up queue"
  ON catch_up_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own catch-up items"
  ON catch_up_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catch-up items"
  ON catch_up_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catch-up items"
  ON catch_up_queue FOR DELETE
  USING (auth.uid() = user_id);
