# Study Plan App - Deployment Guide

Complete guide to deploying your Study Plan app with Supabase and Netlify.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Netlify Deployment](#netlify-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- A Supabase account (free tier works great) - [Sign up here](https://supabase.com)
- A Netlify account (free tier is sufficient) - [Sign up here](https://netlify.com)
- A GitHub account (optional, but recommended)
- Basic knowledge of SQL (for database setup)

---

## Supabase Setup

### Step 1: Access Your Supabase Project

1. Log in to your Supabase dashboard: https://app.supabase.com
2. You should see your empty project

### Step 2: Get Your API Credentials

1. In your Supabase project, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** under "Project Settings"
3. Copy the following values (you'll need these later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

**⚠️ Important:** Keep these credentials safe! The anon key is safe to use in your frontend, but never share your service_role key publicly.

### Step 3: Create the Database Schema

1. In your Supabase project, click on the **SQL Editor** icon in the left sidebar
2. Click **New Query**
3. Open the file `/supabase/schema.sql` from your project folder
4. Copy the entire contents of `schema.sql`
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: "Success. No rows returned"

This creates all the necessary tables, indexes, and triggers.

### Step 4: Set Up Row Level Security

1. Still in the **SQL Editor**, click **New Query**
2. Open the file `/supabase/rls-policies.sql` from your project folder
3. Copy the entire contents of `rls-policies.sql`
4. Paste it into the Supabase SQL Editor
5. Click **Run**
6. You should see: "Success. No rows returned"

This sets up security policies so users can only access their own data.

### Step 5: Configure Email Authentication

1. In your Supabase project, go to **Authentication** > **Providers**
2. Email provider should be enabled by default
3. Scroll down to **Email Templates** if you want to customize signup/reset emails (optional)

**Note:** By default, Supabase requires email confirmation for new users. For development, you can disable this:
- Go to **Authentication** > **Settings**
- Under "Email Auth", toggle OFF "Enable email confirmations"
- This allows users to login immediately after signup

### Step 6: Verify Your Setup

1. Go to **Database** > **Tables** in the left sidebar
2. You should see these tables:
   - `catch_up_queue`
   - `daily_notes`
   - `daily_schedule`
   - `modules`
   - `revision_resources`
   - `sba_schedule`
   - `sba_tests`
   - `task_categories`
   - `tasks`
   - `user_settings`

If you see all these tables, your database is ready! ✅

---

## Local Development Setup

### Step 1: Configure Your API Keys

1. Open the file `config.js` in your project folder
2. Replace the placeholder values with your actual credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'; // Your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGc...your-anon-key'; // Your anon public key
```

3. Save the file

**⚠️ Important:** Never commit `config.js` with real credentials to a public repository!

### Step 2: Test Locally

1. Open `index.html` in your web browser
2. Or use a local server (recommended):

```bash
# If you have Python 3 installed:
python -m http.server 8000

# Or if you have Node.js:
npx serve
```

3. Open your browser to `http://localhost:8000`
4. You should see the login/signup screen

### Step 3: Create Your First Account

1. Click on the **Sign Up** tab
2. Enter your email and password (minimum 6 characters)
3. Click **Create Account**
4. If email confirmation is disabled, you can login immediately
5. If enabled, check your email for a confirmation link

### Step 4: Verify Everything Works

After logging in, you should see:
- The main app interface
- Default modules loaded (Anatomy, Genetics, etc.)
- Days to Exam counter
- Empty daily schedule (ready for you to customize)

If you see all of this, congratulations! Your app is working locally! 🎉

---

## Netlify Deployment

### Option A: Deploy via Netlify UI (Easiest)

#### Step 1: Prepare Your Files

1. Make sure all your files are in one folder:
   - `index.html`
   - `style.css`
   - `config.js` (with your Supabase credentials)
   - `auth.js`
   - `app.js`

2. Create a `.gitignore` file (optional but recommended):

```
node_modules/
.env
.DS_Store
```

#### Step 2: Deploy to Netlify

1. Log in to https://app.netlify.com
2. Click **Add new site** > **Deploy manually**
3. Drag and drop your project folder into the upload area
4. Wait for deployment (usually takes 30-60 seconds)
5. Your site will be live at a URL like: `https://random-name-123456.netlify.app`

#### Step 3: Configure Custom Domain (Optional)

1. In your Netlify site settings, go to **Domain management**
2. Click **Add custom domain**
3. Follow the instructions to configure your domain

### Option B: Deploy via GitHub (Recommended for Updates)

#### Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub
2. In your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

**⚠️ Security Note:** Do NOT commit your actual API keys! Instead:

1. Update `config.js` to use placeholders:

```javascript
const SUPABASE_URL = 'NETLIFY_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'NETLIFY_SUPABASE_ANON_KEY';
```

2. Add a build script that will replace these at build time (see below)

#### Step 2: Connect GitHub to Netlify

1. In Netlify, click **Add new site** > **Import an existing project**
2. Choose **GitHub** and authorize Netlify
3. Select your repository
4. Configure build settings:
   - **Build command:** (leave empty for static site)
   - **Publish directory:** (leave as `.` or empty)
5. Click **Deploy site**

#### Step 3: Add Environment Variables in Netlify

1. In your Netlify site, go to **Site configuration** > **Environment variables**
2. Add these variables:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key

#### Step 4: Create Build Script (Optional)

To automatically replace placeholders with environment variables:

1. Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "."

[build.environment]
  NODE_VERSION = "18"
```

2. Create `package.json`:

```json
{
  "name": "study-plan-app",
  "version": "1.0.0",
  "scripts": {
    "build": "node build.js"
  }
}
```

3. Create `build.js`:

```javascript
const fs = require('fs');

// Read config.js
let config = fs.readFileSync('config.js', 'utf8');

// Replace placeholders with actual env vars
config = config.replace('NETLIFY_SUPABASE_URL', process.env.SUPABASE_URL);
config = config.replace('NETLIFY_SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY);

// Write updated config
fs.writeFileSync('config.js', config);

console.log('✅ Config built successfully');
```

4. Commit and push these files to trigger a new deployment

---

## Post-Deployment

### Step 1: Test Your Deployed App

1. Visit your Netlify URL
2. Create a new account
3. Verify that:
   - Signup works
   - Login works
   - Data persists after refresh
   - Settings can be updated
   - Tasks can be marked complete
   - Notes are saved

### Step 2: Configure Supabase for Production

1. In Supabase, go to **Authentication** > **URL Configuration**
2. Add your Netlify URL to **Site URL**
3. Add these to **Redirect URLs**:
   - `https://your-site.netlify.app`
   - `https://your-site.netlify.app/**`

This ensures authentication redirects work properly.

### Step 3: Set Up Automatic Deployments

If using GitHub:
1. Any push to your `main` branch will automatically deploy
2. Pull requests create preview deployments
3. Check **Deploys** in Netlify to see deployment history

### Step 4: Monitor Your App

1. In Netlify, check **Analytics** (if enabled) to see usage
2. In Supabase, check **Database** > **Table Editor** to see your data
3. Check **Authentication** > **Users** to see registered users

---

## Troubleshooting

### Problem: "Failed to connect to Supabase"

**Solution:**
1. Check that your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct in `config.js`
2. Make sure there are no extra spaces or quotes
3. Verify your Supabase project is active (not paused)

### Problem: "User already exists" error during signup

**Solution:**
1. This user email is already registered
2. Use the login form instead
3. Or use a different email address

### Problem: "Row Level Security policy violation"

**Solution:**
1. Make sure you ran the `rls-policies.sql` file in Supabase
2. Check that policies are enabled: **Database** > **Policies**
3. Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)

### Problem: Tasks/modules not loading

**Solution:**
1. Check browser console for errors (F12 → Console)
2. Verify you're logged in (check for valid session)
3. Make sure the schema was created correctly
4. Check Supabase logs: **Logs** > **API**

### Problem: Changes not deploying to Netlify

**Solution:**
1. Check **Deploys** tab in Netlify for errors
2. Make sure you pushed your changes to GitHub
3. Trigger a manual deploy: **Deploys** > **Trigger deploy**

### Problem: "This page can't be found" after deployment

**Solution:**
1. Check that `index.html` is in the root of your publish directory
2. Verify **Publish directory** is set correctly in Netlify
3. Make sure your build didn't fail

### Problem: Slow performance or timeout errors

**Solution:**
1. Check your Supabase plan limits (free tier has limits)
2. Optimize database queries by adding indexes
3. Consider upgrading Supabase plan if needed

### Problem: Authentication emails not being sent

**Solution:**
1. Check **Authentication** > **Email Templates** in Supabase
2. Verify SMTP settings if using custom email
3. Check spam folder
4. For development, disable email confirmation

---

## Need More Help?

- **Supabase Documentation:** https://supabase.com/docs
- **Netlify Documentation:** https://docs.netlify.com
- **Supabase Discord:** https://discord.supabase.com
- **Check browser console** (F12) for error messages

---

## Security Best Practices

1. ✅ **Never commit API keys** to public repositories
2. ✅ **Use environment variables** for sensitive data
3. ✅ **Enable RLS policies** on all tables
4. ✅ **Use HTTPS** (Netlify provides this automatically)
5. ✅ **Regularly update** your dependencies
6. ✅ **Enable 2FA** on Supabase and Netlify accounts
7. ✅ **Monitor** authentication logs in Supabase

---

## Updating Your App

### To update the deployed version:

1. Make changes to your local files
2. Test locally first
3. Push to GitHub (if using GitHub deployment):
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Or manually re-deploy in Netlify by dragging updated files

### To update the database schema:

1. Write SQL migration in a new file
2. Run it in Supabase SQL Editor
3. Test thoroughly before running in production
4. Keep backups of your data

---

## Congratulations! 🎉

Your Study Plan app is now live and ready to use. Users can:
- ✅ Sign up and create accounts
- ✅ Track their study progress
- ✅ Mark tasks as complete
- ✅ View module progress
- ✅ Customize their exam dates and settings
- ✅ Add daily notes

Happy studying! 📚
