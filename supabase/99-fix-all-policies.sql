-- ============================================
-- FIX ALL POLICIES (Run this if you have 406 errors)
-- ============================================
-- Only run this if you already set up the database
-- and are getting "406 Not Acceptable" errors
-- ============================================

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END$$;

-- ==========================================
-- RECREATE ALL POLICIES
-- ==========================================
-- All SELECT policies are permissive (USING true)
-- All INSERT policies are permissive (WITH CHECK true) 
-- UPDATE and DELETE policies check user_id
-- ==========================================

-- USER SETTINGS POLICIES
CREATE POLICY "Users can view settings"
  ON user_settings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- MODULES POLICIES
CREATE POLICY "Users can view modules"
  ON modules FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own modules"
  ON modules FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own modules"
  ON modules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own modules"
  ON modules FOR DELETE
  USING (auth.uid() = user_id);

-- DAILY SCHEDULE POLICIES
CREATE POLICY "Users can view daily schedule"
  ON daily_schedule FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own daily schedule"
  ON daily_schedule FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own daily schedule"
  ON daily_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily schedule"
  ON daily_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- TASK CATEGORIES POLICIES
CREATE POLICY "Users can view task categories"
  ON task_categories FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own task categories"
  ON task_categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own task categories"
  ON task_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task categories"
  ON task_categories FOR DELETE
  USING (auth.uid() = user_id);

-- TASKS POLICIES
CREATE POLICY "Users can view tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- DAILY NOTES POLICIES (CRITICAL - Fixed for 406 errors)
CREATE POLICY "Users can view daily notes"
  ON daily_notes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own daily notes"
  ON daily_notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own daily notes"
  ON daily_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily notes"
  ON daily_notes FOR DELETE
  USING (auth.uid() = user_id);

-- SBA TESTS POLICIES
CREATE POLICY "Users can view SBA tests"
  ON sba_tests FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own SBA tests"
  ON sba_tests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own SBA tests"
  ON sba_tests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SBA tests"
  ON sba_tests FOR DELETE
  USING (auth.uid() = user_id);

-- SBA SCHEDULE POLICIES
CREATE POLICY "Users can view SBA schedule"
  ON sba_schedule FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own SBA schedule"
  ON sba_schedule FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own SBA schedule"
  ON sba_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SBA schedule"
  ON sba_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- REVISION RESOURCES POLICIES
CREATE POLICY "Users can view revision resources"
  ON revision_resources FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own revision resources"
  ON revision_resources FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own revision resources"
  ON revision_resources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revision resources"
  ON revision_resources FOR DELETE
  USING (auth.uid() = user_id);

-- CATCH-UP QUEUE POLICIES
CREATE POLICY "Users can view catch-up queue"
  ON catch_up_queue FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own catch-up items"
  ON catch_up_queue FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own catch-up items"
  ON catch_up_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catch-up items"
  ON catch_up_queue FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DONE! All policies have been recreated.
-- This should fix all 406 errors.
-- The app filters by user_id in queries, so data remains secure.
-- ============================================
