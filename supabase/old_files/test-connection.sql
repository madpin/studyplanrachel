-- Test Connection and Policies
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_settings', 'modules', 'tasks')
ORDER BY table_name;

-- 2. Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_settings', 'modules', 'tasks')
ORDER BY tablename;

-- 3. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('user_settings', 'modules')
ORDER BY tablename, policyname;

-- 4. Check if there are any users
SELECT COUNT(*) as user_count FROM auth.users;

-- 5. Check if there are any user_settings records
SELECT COUNT(*) as settings_count FROM user_settings;
