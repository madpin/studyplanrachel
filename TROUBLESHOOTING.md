# Troubleshooting: Can't Login After RLS Policies

## Quick Fix Steps

### Step 1: Check Browser Console
1. Open your app in the browser
2. Press F12 to open Developer Tools
3. Go to the **Console** tab
4. Try to login
5. Look for any error messages

Common errors you might see:
- "new row violates row-level security policy"
- "permission denied for table user_settings"
- "Failed to fetch"

### Step 2: Verify Auth is Working

Run this test in Supabase SQL Editor:

```sql
-- Check if there are any users
SELECT * FROM auth.users LIMIT 5;
```

If you see users, auth is working. If not, authentication might be disabled.

### Step 3: Temporarily Disable RLS (for testing)

To test if RLS is the issue, temporarily disable it:

```sql
-- Disable RLS on user_settings (TEMPORARY - for testing only)
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
```

Now try to login. If it works, the issue is with the RLS policies.

**Important:** Re-enable RLS after testing:
```sql
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

### Step 4: Check Authentication in Supabase

1. Go to **Authentication** > **Settings** in Supabase
2. Make sure "Enable email confirmations" is **OFF** (for testing)
3. Check **Authentication** > **Users** to see if your user was created

## Common Issues & Solutions

### Issue 1: Policies Too Strict During Signup

**Problem:** User can't create initial settings because auth.uid() isn't set yet.

**Solution:** Update the INSERT policy for user_settings:

```sql
-- Drop the existing policy
DROP POLICY "Users can insert their own settings" ON user_settings;

-- Create a more permissive INSERT policy
CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (true);  -- Allow all inserts, user_id check is done in app
```

This allows the initial insert, but the app still ensures user_id matches auth.uid().

### Issue 2: Email Confirmation Required

**Problem:** Users need to confirm email before they can login.

**Solution:**
1. Go to **Authentication** > **Settings** in Supabase
2. Find "Enable email confirmations"
3. Toggle it **OFF**
4. Try signup again

### Issue 3: Session Not Persisting

**Problem:** User logs in but immediately gets logged out.

**Solution:** Check if cookies are enabled and local storage is working:

```javascript
// Test in browser console:
localStorage.setItem('test', 'test');
console.log(localStorage.getItem('test')); // Should log 'test'
```

### Issue 4: CORS or Network Error

**Problem:** Can't connect to Supabase API.

**Solution:**
1. Check your **config.js** - make sure URL and key are correct
2. Check Supabase project is active (not paused)
3. Check Network tab in DevTools for failed requests

## Better RLS Policies (If needed)

If you're still having issues, here's a more lenient set of policies:

```sql
-- Drop all existing policies for user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

-- Create more permissive policies
CREATE POLICY "Users can manage their settings"
  ON user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Do the same for other tables.

## Nuclear Option: Start Fresh

If nothing works, start fresh:

1. **Drop all tables:**
```sql
DROP TABLE IF EXISTS catch_up_queue CASCADE;
DROP TABLE IF EXISTS revision_resources CASCADE;
DROP TABLE IF EXISTS sba_schedule CASCADE;
DROP TABLE IF EXISTS sba_tests CASCADE;
DROP TABLE IF EXISTS daily_notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS task_categories CASCADE;
DROP TABLE IF EXISTS daily_schedule CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
```

2. **Re-run schema.sql** (the table creation script)

3. **Re-run rls-policies.sql** (the policies script)

4. **Create a new test account**

## Still Having Issues?

Contact me with:
1. The exact error message from browser console
2. Screenshot of the error
3. What step you're stuck on (signup, login, after login)

I'll help you debug it!
