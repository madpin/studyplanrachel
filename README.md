# Study Plan Tracker

A full-featured study planning application with multi-user authentication, real-time database sync, and automatic progress tracking.

---

## 🚀 Quick Start (10 Minutes Total)

### 1. Set Up Supabase Database (5 min)
```
📂 Go to: supabase/README.md
```
Follow the 3-step setup:
- Run `01-schema.sql` (creates tables)
- Run `02-enable-rls.sql` (enables security)
- Run `03-rls-policies.sql` (creates access policies)

### 2. Configure Your App (2 min)
1. Open `config.js`
2. Replace placeholders with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

### 3. Test Locally (2 min)
1. Open `index.html` in your browser
2. Create an account
3. Start using the app!

### 4. Deploy to Netlify (1 min)
1. Go to https://netlify.com
2. Drag your project folder
3. Done!

**Need detailed help?** See `DEPLOYMENT.md`

---

## ✨ Features

- ✅ **Multi-user authentication** - Secure signup/login
- ✅ **Daily/Weekly/Calendar views** - Multiple planning perspectives
- ✅ **Module progress tracking** - Track completion across 12 study modules
- ✅ **Task management** - Mark tasks complete, add notes
- ✅ **Automatic progress calculation** - Updates as you complete tasks
- ✅ **Customizable settings** - Edit exam dates, trip dates
- ✅ **Catch-up queue** - Reschedule missed tasks
- ✅ **Real-time sync** - All changes save to cloud database
- ✅ **Mobile responsive** - Works on all devices

---

## 📁 Project Structure

```
studyplan/
├── index.html              # Main app UI
├── style.css               # Complete styling
├── config.js               # ⚠️ Add your Supabase credentials here
├── auth.js                 # Authentication logic
├── app.js                  # Main application logic
│
├── supabase/               # Database setup files
│   ├── README.md           # 📖 START HERE for database setup
│   ├── 01-schema.sql       # Step 1: Create tables
│   ├── 02-enable-rls.sql   # Step 2: Enable security
│   └── 03-rls-policies.sql # Step 3: Create policies
│
├── QUICKSTART.md           # 5-minute setup guide
├── DEPLOYMENT.md           # Comprehensive deployment guide
├── PROJECT_OVERVIEW.md     # Technical documentation
└── TROUBLESHOOTING.md      # Common issues and solutions
```

---

## 🔧 Setup Instructions

### Prerequisites
- Supabase account (free tier) - https://supabase.com
- Netlify account (free tier) - https://netlify.com

### Step-by-Step Setup

#### 1. Database Setup (Supabase)

**Go to `supabase/README.md` and follow the 3-step setup.**

Summary:
1. Run `01-schema.sql` in Supabase SQL Editor
2. Run `02-enable-rls.sql` in Supabase SQL Editor
3. Run `03-rls-policies.sql` in Supabase SQL Editor

#### 2. App Configuration

1. Get your Supabase credentials:
   - Go to Supabase → Settings → API
   - Copy **Project URL** and **anon public key**

2. Update `config.js`:
   ```javascript
   const SUPABASE_URL = 'YOUR_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```

#### 3. Test Locally

Open `index.html` in your browser or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

Visit `http://localhost:8000`

#### 4. Deploy to Netlify

**Option A: Manual Deploy**
1. Go to https://netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag your project folder
4. Done!

**Option B: GitHub Deploy**
1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify
4. Auto-deploy on every push

**Full deployment guide:** See `DEPLOYMENT.md`

---

## 🎯 How It Works

### For First-Time Users
1. User signs up → Account created
2. App detects first login → Loads default data
3. User sees 12 pre-configured study modules
4. Ready to customize!

### For Returning Users
1. User logs in → Session restored
2. App loads user's data from Supabase
3. Shows progress, tasks, notes
4. All changes sync automatically

### Data Privacy
- ✅ Each user sees only their own data
- ✅ Row Level Security enforced
- ✅ HTTPS encrypted connection
- ✅ Secure authentication via Supabase

---

## 🐛 Troubleshooting

### Issue: Can't login or getting errors

1. **Check browser console** (F12 → Console)
2. **Check config.js** - Are your API keys correct?
3. **Check Supabase logs** - Go to Supabase → Logs → API

### Issue: "406 Not Acceptable" errors

This is a Row Level Security issue.

**Solution:** Run `03-rls-policies.sql` again (it has the correct permissive policies)

**Why it happens:** SELECT policies were too restrictive. The fixed version uses `USING (true)` for SELECT which allows queries while the app filters by user_id.

### Issue: Tables don't exist

**Solution:** Run `01-schema.sql` in Supabase SQL Editor

### Issue: Authentication not working

1. Check Supabase → Authentication → Settings
2. Make sure "Enable email confirmations" is OFF (for testing)
3. Check Supabase → Authentication → Users to see if user was created

**For more help:** See `TROUBLESHOOTING.md`

---

## 📚 Documentation

- **`QUICKSTART.md`** - 5-minute setup guide
- **`DEPLOYMENT.md`** - Comprehensive deployment instructions
- **`PROJECT_OVERVIEW.md`** - Technical details and architecture
- **`TROUBLESHOOTING.md`** - Common issues and solutions
- **`supabase/README.md`** - Database setup guide

---

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ User authentication via Supabase Auth
- ✅ HTTPS encryption
- ✅ Environment variables for sensitive data
- ✅ SQL injection protection
- ✅ Session management

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla JavaScript, HTML, CSS |
| Backend | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Hosting | Netlify |
| Database | PostgreSQL with RLS |

---

## 📈 Features Roadmap

### ✅ Completed
- [x] Multi-user authentication
- [x] Task completion tracking
- [x] Module progress calculation
- [x] Daily/Weekly/Calendar views
- [x] Settings customization
- [x] Real-time database sync
- [x] Responsive design

### 🎯 Future Enhancements
- [ ] Task creation UI
- [ ] Module creation UI
- [ ] Dark mode
- [ ] Email reminders
- [ ] Data export (PDF/CSV)
- [ ] Study timer
- [ ] Analytics dashboard
- [ ] Mobile app

---

## 🆘 Getting Help

1. **Check the docs** - See `DEPLOYMENT.md` and `TROUBLESHOOTING.md`
2. **Browser console** - Press F12 to see error messages
3. **Supabase logs** - Check API logs in Supabase dashboard
4. **Test locally first** - Easier to debug than in production

---

## 📄 License

This project is yours to use, modify, and deploy as you wish.

---

## 🙏 Acknowledgments

Built with:
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Netlify](https://netlify.com) - Modern web hosting

---

**Ready to get started?** Go to `supabase/README.md` and follow the 3-step setup!

**Have questions?** Check `DEPLOYMENT.md` for comprehensive instructions.

**Happy studying!** 📚✨
