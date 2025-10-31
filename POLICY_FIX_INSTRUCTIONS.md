# Fix for 406 Errors and Policy Conflicts

## What Happened

You ran both `99-fix-all-policies.sql` and `03-rls-policies.sql` in sequence. This created duplicate policy creation attempts, which caused:

1. **Query timeout** - Database was struggling with conflicting policies
2. **406 Not Acceptable error** - Specifically on `daily_notes` table queries

## The Solution

I've created a comprehensive cleanup script: `00-cleanup-and-fix-policies.sql`

### How to Fix Right Now

1. **Go to Supabase SQL Editor**
   - Open your Supabase dashboard
   - Navigate to: SQL Editor

2. **Run the cleanup script**
   - Click "New Query"
   - Open: `supabase/00-cleanup-and-fix-policies.sql`
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run"

3. **What you'll see**
   ```
   NOTICE: Dropped policy [policy_name] on table [table_name]
   NOTICE: Dropped policy [policy_name] on table [table_name]
   ... (multiple lines)
   NOTICE: All policies dropped successfully
   Success. No rows returned
   ```

4. **Test your app**
   - Refresh your app in the browser (hard refresh: Cmd+Shift+R)
   - Log in
   - The 406 errors and timeouts should be gone

## What the Script Does

### Step 1: Clean Slate
- Drops ALL existing policies from all tables
- Uses proper PostgreSQL loop to ensure everything is removed
- Shows notices for each policy dropped

### Step 2: Re-enable RLS
- Ensures Row Level Security is enabled on all 10 tables
- This is idempotent (safe to run multiple times)

### Step 3: Recreate Policies
- Creates fresh policies for all tables
- SELECT policies: Permissive (`USING true`)
- INSERT policies: Permissive (`WITH CHECK true`)
- UPDATE/DELETE policies: Strict (check `user_id`)

## Why This Works

The script is designed to be **idempotent** - you can run it multiple times safely:
- `DROP POLICY IF EXISTS` - won't error if policy doesn't exist
- `ALTER TABLE ENABLE RLS` - won't error if already enabled
- Fresh policy creation - no conflicts

## Technical Details

### The 406 Error Explained

The error occurred because:
1. Policies were created multiple times (from running 2 scripts)
2. PostgreSQL may have had conflicting or partial policies
3. The `daily_notes` SELECT policy was specifically problematic

### Why the Query Timed Out

Your `user_settings` query hit the 10-second timeout because:
- Database was processing policy conflicts
- RLS evaluation was taking too long
- PostgreSQL was trying to determine which policy to apply

## Future Prevention

### ✅ DO
- Run setup scripts in order: `01-schema.sql` → `02-enable-rls.sql` → `03-rls-policies.sql`
- If you need to fix policies, use `00-cleanup-and-fix-policies.sql` ONLY
- Keep one source of truth for policies

### ❌ DON'T
- Run multiple policy scripts in sequence
- Run `99-fix-all-policies.sql` after `03-rls-policies.sql`
- Modify policies directly in Supabase UI after running scripts

## Verification After Fix

Run this in Supabase SQL Editor to verify:

```sql
-- Count policies per table (should be 4 each)
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_settings', 'modules', 'tasks', 'daily_notes',
    'task_categories', 'daily_schedule', 'sba_tests',
    'sba_schedule', 'revision_resources', 'catch_up_queue'
  )
GROUP BY tablename
ORDER BY tablename;
```

**Expected Result:** Each table should have exactly 4 policies.

## Still Having Issues?

If after running `00-cleanup-and-fix-policies.sql` you still see errors:

1. **Check browser console** (F12 → Console tab)
   - Look for specific error messages
   - Note which table/query is failing

2. **Check Supabase logs**
   - Go to: Logs → API in Supabase dashboard
   - Look for 406 or timeout errors
   - Check if policies are being evaluated

3. **Verify authentication**
   ```sql
   -- Check if you have a user
   SELECT id, email FROM auth.users;
   ```

4. **Nuclear option: Full database reset**
   - See `supabase/README.md` under "If You Need to Start Over"
   - This will delete all data and start fresh

## Questions?

- See: `supabase/README.md` for detailed setup instructions
- See: `TROUBLESHOOTING.md` for general troubleshooting
- Check: Supabase docs on RLS policies

---

**Created:** October 31, 2025  
**Issue:** Query timeout + 406 errors after running multiple policy scripts  
**Solution:** `00-cleanup-and-fix-policies.sql`

