-- TEMPORARY: Disable RLS to test if that's the issue
-- Run this to see if the app works without RLS
-- IMPORTANT: Re-enable RLS after testing!

-- Disable RLS on user_settings
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- After testing, RE-ENABLE it with:
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
