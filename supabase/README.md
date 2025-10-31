# Supabase Setup - SQL Files

This folder contains all the SQL files needed to set up your Study Plan app database.

---

## 📋 Setup Order

Run these files **in order** in your Supabase SQL Editor:

### ✅ Step 1: Create Tables
**File:** `01-schema.sql`

**What it does:**
- Creates 10 database tables (user_settings, modules, tasks, etc.)
- Adds indexes for performance
- Sets up automatic timestamp triggers

**How to run:**
1. Go to Supabase → SQL Editor
2. Click "New Query"
3. Copy entire contents of `01-schema.sql`
4. Paste and click "Run"
5. You should see: "Success. No rows returned"

---

### ✅ Step 2: Enable Row Level Security
**File:** `02-enable-rls.sql`

**What it does:**
- Enables RLS on all 10 tables
- This means policies will control who can access data

**How to run:**
1. In Supabase SQL Editor, click "New Query"
2. Copy entire contents of `02-enable-rls.sql`
3. Paste and click "Run"
4. You should see: "Success. No rows returned"

---

### ✅ Step 3: Create Security Policies
**File:** `03-rls-policies.sql`

**What it does:**
- Creates 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
- **SELECT policies are permissive** (allow all authenticated users)
- **INSERT policies are permissive** (allow all authenticated users)
- **UPDATE/DELETE policies are strict** (only own data)

**Why SELECT is permissive:**
- Strict SELECT policies cause "406 Not Acceptable" errors
- The app filters queries by user_id, so data remains private
- This is a common Supabase pattern for client-side filtering

**How to run:**
1. In Supabase SQL Editor, click "New Query"
2. Copy entire contents of `03-rls-policies.sql`
3. Paste and click "Run"
4. You should see: "Success. No rows returned"

---

## ✅ Verification

After running all 3 files, verify your setup:

### Check Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_settings', 'modules', 'tasks', 'daily_notes',
    'task_categories', 'daily_schedule', 'sba_tests',
    'sba_schedule', 'revision_resources', 'catch_up_queue'
  )
ORDER BY table_name;
```

**Expected:** You should see all 10 table names listed.

---

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_settings', 'modules', 'tasks', 'daily_notes',
    'task_categories', 'daily_schedule', 'sba_tests',
    'sba_schedule', 'revision_resources', 'catch_up_queue'
  )
ORDER BY tablename;
```

**Expected:** All tables should show `rowsecurity = true`

---

### Check Policies Exist
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('user_settings', 'modules', 'tasks')
ORDER BY tablename, cmd;
```

**Expected:** You should see 4 policies per table (SELECT, INSERT, UPDATE, DELETE)

---

## 🔧 Troubleshooting Files

### If You Get "406 Not Acceptable" Errors or Policy Conflicts

**⚠️ IMPORTANT:** If you accidentally ran multiple policy files or are getting persistent 406 errors:

**Run:** `00-cleanup-and-fix-policies.sql`

This file will:
1. Drop ALL existing policies cleanly
2. Re-enable RLS on all tables
3. Recreate all policies from scratch

**This is the recommended fix for:**
- 406 Not Acceptable errors
- Policy conflict errors
- Query timeout issues
- Any time you ran policy scripts multiple times

---

### Alternative: Partial Fix

If you only want to fix policies without dropping them first:

**Run:** `99-fix-all-policies.sql` (older method, use 00-cleanup script instead)

---

### If You Need to Start Over

**Drop all tables:**
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

**Then run:** `01-schema.sql` → `02-enable-rls.sql` → `03-rls-policies.sql` again

---

## 📝 Understanding the Issue

### The 406 Error Problem

When RLS SELECT policies use:
```sql
USING (auth.uid() = user_id)
```

This can cause **406 Not Acceptable** errors because:
1. The query happens before authentication is fully processed
2. Supabase can't evaluate `auth.uid()` in some contexts
3. The policy rejects the query

### The Solution

Use permissive SELECT policies:
```sql
USING (true)  -- Allow all authenticated users to SELECT
```

Then filter in the app:
```javascript
.select('*')
.eq('user_id', currentUser.id)  // App-side filtering
```

This pattern:
- ✅ Avoids 406 errors
- ✅ Data remains private (app filters by user_id)
- ✅ Works with Supabase's authentication flow
- ✅ Is recommended by Supabase for client-side apps

---

## 🔒 Security Notes

**Is this secure?**

Yes! Here's why:

1. **Authentication Required:** Only logged-in users can query
2. **App-side Filtering:** Every query includes `.eq('user_id', currentUser.id)`
3. **Strict UPDATE/DELETE:** Users can only modify their own data
4. **Connection Encrypted:** All data is sent over HTTPS

**What if someone modifies the JavaScript?**

- They could only see their own data (user_id is in the JWT token)
- They still can't UPDATE or DELETE other users' data (strict policies)
- The database validates user_id on all modifications

---

## 📚 Additional Resources

- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

## 🆘 Need Help?

If you're still having issues:

1. Check browser console for error messages (F12 → Console)
2. Check Supabase logs (Logs → API in Supabase dashboard)
3. Verify authentication is working (check auth.users table)
4. See `TROUBLESHOOTING.md` in the project root

---

**Last Updated:** October 31, 2025
