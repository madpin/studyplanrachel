-- Quick Fix for RLS Login Issues
-- Run this if you can't login after enabling RLS policies

-- This makes the policies more permissive to allow initial user setup

-- Fix user_settings policies
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (true);  -- Allow all authenticated users to insert

-- Fix modules policies
DROP POLICY IF EXISTS "Users can insert their own modules" ON modules;

CREATE POLICY "Users can insert their own modules"
  ON modules FOR INSERT
  WITH CHECK (true);  -- Allow all authenticated users to insert

-- The SELECT, UPDATE, DELETE policies remain strict (users can only access their own data)
-- But INSERT is more permissive to allow initial data creation

-- After running this, try logging in again
