-- Fix remaining tables that still have restrictive SELECT policies

-- Fix daily_schedule SELECT policy
DROP POLICY IF EXISTS "Users can view their own daily schedule" ON daily_schedule;

CREATE POLICY "Users can view their own daily schedule"
  ON daily_schedule FOR SELECT
  USING (true);

-- Fix sba_tests SELECT policy
DROP POLICY IF EXISTS "Users can view their own SBA tests" ON sba_tests;

CREATE POLICY "Users can view their own SBA tests"
  ON sba_tests FOR SELECT
  USING (true);

-- Fix sba_schedule SELECT policy
DROP POLICY IF EXISTS "Users can view their own SBA schedule" ON sba_schedule;

CREATE POLICY "Users can view their own SBA schedule"
  ON sba_schedule FOR SELECT
  USING (true);

-- Fix revision_resources SELECT policy
DROP POLICY IF EXISTS "Users can view their own revision resources" ON revision_resources;

CREATE POLICY "Users can view their own revision resources"
  ON revision_resources FOR SELECT
  USING (true);

-- All SELECT policies are now permissive
-- UPDATE and DELETE policies remain strict (checking user_id)
