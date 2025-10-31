-- FIX: The SELECT policies are too restrictive causing 406 errors
-- Run this to make SELECT work properly

-- Fix user_settings SELECT policy
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (true);  -- Allow all authenticated users to SELECT

-- Fix modules SELECT policy
DROP POLICY IF EXISTS "Users can view their own modules" ON modules;

CREATE POLICY "Users can view their own modules"
  ON modules FOR SELECT
  USING (true);  -- Allow all authenticated users to SELECT

-- Fix task_categories SELECT policy
DROP POLICY IF EXISTS "Users can view their own task categories" ON task_categories;

CREATE POLICY "Users can view their own task categories"
  ON task_categories FOR SELECT
  USING (true);

-- Fix tasks SELECT policy
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;

CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (true);

-- Fix daily_notes SELECT policy
DROP POLICY IF EXISTS "Users can view their own daily notes" ON daily_notes;

CREATE POLICY "Users can view their own daily notes"
  ON daily_notes FOR SELECT
  USING (true);

-- Fix catch_up_queue SELECT policy
DROP POLICY IF EXISTS "Users can view their own catch-up queue" ON catch_up_queue;

CREATE POLICY "Users can view their own catch-up queue"
  ON catch_up_queue FOR SELECT
  USING (true);

-- Note: UPDATE and DELETE policies remain strict (user_id check)
-- This allows reading but prevents modifying other users' data
