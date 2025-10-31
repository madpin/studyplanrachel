# Quick Start Guide - 5 Minutes to Deploy

Get your Study Plan app running in just 5 minutes!

---

## Step 1: Set Up Supabase (2 minutes)

1. Go to https://app.supabase.com
2. Open your empty project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of `supabase/schema.sql` → Paste → Click **Run**
6. Click **New Query** again
7. Copy the contents of `supabase/rls-policies.sql` → Paste → Click **Run**
8. Go to **Settings** > **API**
9. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

✅ Database ready!

---

## Step 2: Configure Your App (1 minute)

1. Open `config.js` in your project folder
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'YOUR_ACTUAL_PROJECT_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_ACTUAL_ANON_KEY_HERE';
```

3. Save the file

✅ App configured!

---

## Step 3: Test Locally (1 minute)

1. Open `index.html` in your browser
2. Or use a local server:

```bash
# Python 3:
python -m http.server 8000

# Node.js:
npx serve
```

3. Go to http://localhost:8000
4. Click **Sign Up**
5. Create an account with your email

✅ App working locally!

---

## Step 4: Deploy to Netlify (1 minute)

1. Go to https://app.netlify.com
2. Click **Add new site** > **Deploy manually**
3. Drag and drop your entire project folder
4. Wait 30 seconds
5. Your app is live! 🎉

✅ App deployed!

---

## What's Next?

Your app is now live and ready to use! You can:

- **Customize your exam date:** Click the Settings button (⚙️)
- **Add tasks:** Tasks will be added as you use the app
- **Track progress:** Mark tasks complete to update module progress
- **View different timeframes:** Switch between Daily, Weekly, Calendar, and Modules views

---

## Need Help?

- 📖 Full deployment guide: See `DEPLOYMENT.md`
- 🔧 Something not working? Check the Troubleshooting section in `DEPLOYMENT.md`
- 🐛 Found a bug? Check browser console (F12) for error messages

---

## Quick Tips

1. **First time users get default data** - The app automatically loads sample modules and structure
2. **Everything is editable** - Change dates, add modules, customize tasks
3. **Data syncs automatically** - Changes save to Supabase in real-time
4. **Progress updates automatically** - Mark tasks complete to update module percentages
5. **Mobile friendly** - Works great on phones and tablets

---

Happy studying! 📚✨
