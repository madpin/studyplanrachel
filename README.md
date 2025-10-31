# Study Plan App

A simple yet engaging study plan application to help you track your learning goals, manage time effectively, and balance your commitments.

## 🎯 Overview

This app helps you organize your study sessions while keeping track of personal commitments, holidays, work days, and free time. With multiple visualization options, you can see your progress across different time periods and stay motivated on your learning journey.

## ✨ Features

### Core Functionality
- **Task Management**: Create, edit, and track study tasks with checkbox completion
- **Module-Based Organization**: Organize study topics into modules with progress tracking
- **Study Schedule**: Day-by-day detailed study schedule with specific topics
- **Personal Calendar**: Manage trips, holidays, work days, and free days
- **Daily Notes**: Add notes for each study day
- **Task Completion Tracking**: Mark individual tasks as complete with persistent storage

### Visualizations
- **Daily View**: See detailed daily tasks, topics, and study plan for each day
- **Weekly Overview**: Visualize your week's study patterns with color-coded day types
- **Monthly Calendar**: Full month view with study modules and day type indicators
- **Modules Dashboard**: Track progress across all study modules with visual progress bars
- **Engagement Metrics**: Overall progress percentage and motivational messages

### Calendar Integration & Day Types
- **Work Days**: Reduced study load with focused single-topic approach (1-2 hours)
- **Off Days/Study Days**: Full study capacity with multiple topics (4-6 hours)
- **Revision Days**: Comprehensive review with mock exams (3-4 hours)
- **Trip Days**: Minimal/optional study (0-30 minutes)
- **Rest Days**: Very light review only
- **Exam Eve**: Mental preparation mode
- **Configurable study time per day type**: Each day type has appropriate study expectations

### Smart Features
- **Work-Suitable Task Indicators**: Tasks marked as suitable for work days (podcasts, quick questions)
- **Resource Integration**: Links to lecture summaries, podcasts, videos, practice questions
- **Revision Resources**: Week-specific GTG podcasts, summaries, NICE guidelines, and RRR sessions
- **Collapsible Task Categories**: Organize tasks by topic with expand/collapse functionality
- **Day Navigation**: Easy navigation between days, weeks, and months
- **Countdown Timers**: Days until exam and important events
- **Motivational Banner**: Random motivational messages to keep you engaged

## 🛠️ Tech Stack

### Frontend
- **Hosting**: Netlify
- **Framework**: Vanilla JavaScript (current), to migrate to React/Vue/Svelte
- **Styling**: Custom CSS with modern design
- **UI Features**:
  - Tab-based navigation (Daily, Weekly, Calendar, Modules views)
  - Collapsible task categories
  - Color-coded day types
  - Progress bars and visual indicators
  - Responsive date navigation

### Backend
- **Database & Auth**: Supabase
- **Real-time Updates**: Supabase Realtime
- **Storage**: Supabase Storage (for any assets)

### Current Implementation
The reference app (`app.js`) is a fully functional vanilla JavaScript application with:
- In-memory data storage (to be migrated to Supabase)
- Complete UI implementation
- All core features working
- Ready to be enhanced with backend persistence

## 🎯 Key Features from Reference App

### 1. **Intelligent Day Type System**
The app recognizes different day types and adjusts study load accordingly:
- `work` - Work days with reduced study time (1-2 hours, single topic focus)
- `off` - Full study days (4-6 hours, multiple topics)
- `revision` - Mock exam and review days (3-4 hours)
- `intensive` - Deep dive study days
- `intensive-post` - Post-trip catch-up days
- `trip` - Minimal study (0-30 minutes optional)
- `trip-end` - Transition back to study
- `rest` - Light review only
- `exam-eve` - Mental preparation mode
- `light` - Reduced load days (e.g., holidays)

### 2. **Detailed Daily Schedule**
Each day has a pre-planned schedule with:
- Specific topics to study (e.g., "Biostatistics: Variables & Types")
- Recommended resources (Lecture Summary, Podcast, Video, Questions)
- Time estimates for each task
- Work-suitable indicators for tasks that can be done during work breaks

### 3. **Module Progress Tracking**
12 study modules with:
- Exam weight percentage
- Total subtopics count
- Completed subtopics count
- Color coding for visual identification
- Detailed subtopic lists

### 4. **Revision Resources Integration**
Week-specific resources including:
- GTG (Green-top Guidelines) Podcasts
- GTG Summaries
- NICE Guidelines
- RRR (Rapid Review Revision) Session recordings
- Automatically shown based on current week

### 5. **Task Management Features**
- Checkbox completion tracking
- Persistent storage of completions
- Category-based organization
- Collapsible sections for better organization
- Work-suitable task indicators
- Time estimates for each task

### 6. **Multi-View Navigation**
- **Daily View**: Detailed task list with notes
- **Weekly View**: 7-day overview with color coding
- **Calendar View**: Full month calendar
- **Modules View**: Progress dashboard
- Easy navigation between views and dates

### 7. **Motivational Features**
- Countdown to exam date
- Countdown to important events (e.g., trips)
- Random motivational messages
- Overall progress percentage
- Visual progress bars

## 📊 Data Structure

### Tables (Supabase)

#### `modules`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `name` (text) - e.g., "Anatomy", "Genetics", "Physiology"
- `exam_weight` (numeric) - Percentage weight in exam
- `subtopics` (integer) - Total number of subtopics
- `completed` (integer) - Number of completed subtopics
- `color` (text) - Hex color for visual identification
- `subtopics_list` (jsonb) - Array of subtopic names
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `daily_schedule`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `date` (date)
- `topics` (jsonb) - Array of specific topics for the day
- `day_type` (enum: work, off, revision, intensive, intensive-post, trip, trip-end, rest, exam-eve, light)
- `resources` (jsonb) - Array of resources (Lecture Summary, Podcast, Video, etc.)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `tasks`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `date` (date)
- `category_index` (integer) - Index of task category
- `item_index` (integer) - Index of item within category
- `category_name` (text) - Name of the task category
- `task_name` (text) - Name of the specific task
- `time_estimate` (text) - Estimated time (e.g., "30-45 min")
- `work_suitable` (boolean) - Whether task is suitable for work days
- `completed` (boolean) - Completion status
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `daily_notes`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `date` (date)
- `notes` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `calendar_events`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `event_type` (enum: holiday, work_day, trip, free_day, commitment)
- `start_date` (date)
- `end_date` (date)
- `all_day` (boolean)
- `expected_study_hours` (numeric, nullable) - Configurable study time for this event (e.g., 0.5 for 30 minutes)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `revision_resources`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `resource_type` (enum: gtg_podcast, gtg_summary, nice_guideline, rrr_session)
- `title` (text)
- `week_start_date` (date) - Week when this resource is relevant
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Netlify account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyplan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a new project in [Supabase](https://supabase.com)
   - Run the SQL migrations in `/supabase/migrations` (to be created)
   - Copy your project URL and anon key

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run locally**
   ```bash
   npm run dev
   ```

6. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Add environment variables in Netlify dashboard
   - Deploy!

## 📱 Usage

### Daily View - Your Study Dashboard
1. See your current day's study plan with all tasks organized by topic
2. Check if it's a work day, study day, revision day, or trip day
3. View specific topics scheduled for the day
4. Mark tasks as complete using checkboxes
5. See which tasks are suitable for work days (marked with ✓)
6. Add personal notes for the day
7. Navigate between days using Previous/Next buttons

### Weekly View - Plan Your Week
1. See all 7 days of the week at a glance
2. Color-coded day types:
   - Blue: Work days (reduced study load)
   - Green: Revision days (mock exams and review)
   - Orange: Trip days (minimal study)
   - Default: Regular study days
3. Click any day to jump to its detailed daily view
4. See which modules are scheduled for each day
5. Navigate between weeks using Previous/Next Week buttons

### Calendar View - Monthly Overview
1. Full month calendar with all your study days
2. See study modules for each day
3. Visual indicators for:
   - Today (highlighted)
   - Work days
   - Revision days
   - Trip days
   - Exam day
4. Click any date to view its detailed daily plan
5. Navigate between months

### Modules View - Track Your Progress
1. See all study modules with progress bars
2. Each module shows:
   - Exam weight percentage
   - Completion percentage
   - Number of completed subtopics
   - List of all subtopics
3. Color-coded for easy visual identification
4. Track overall study progress

### Managing Different Day Types
The app automatically adjusts study expectations based on day type:
- **Work Days** (1-2 hours): Focus on one specific topic, podcasts, and quick questions
- **Off Days/Study Days** (4-6 hours): Full study with videos, lectures, practice questions
- **Revision Days** (3-4 hours): Mock exams and comprehensive review
- **Trip Days** (0-30 minutes): Optional light questions only
- **Rest Days**: Very light review
- **Exam Eve**: Mental preparation mode

## 🎨 Design Principles

- **Simple & Clean**: Minimal interface, maximum functionality
- **Engaging**: Visual feedback and progress indicators
- **Flexible**: Adapt to different study styles and schedules
- **Realistic**: Set different study expectations for different types of days
- **Motivating**: Clear visualization of progress and achievements

## 🔐 Security

- Authentication handled by Supabase Auth
- Row Level Security (RLS) policies ensure users only see their own data
- All API calls secured with JWT tokens

## 🗺️ Roadmap

### ✅ Implemented (from reference app)
- [x] Task management with checkbox completion
- [x] Module-based organization with progress tracking
- [x] Daily/weekly/monthly visualizations
- [x] Calendar integration with day types
- [x] Task categorization and collapsible sections
- [x] Work-suitable task indicators
- [x] Daily notes functionality
- [x] Countdown timers (days to exam, days to events)
- [x] Motivational messages
- [x] Revision resources by week
- [x] Detailed daily schedule with specific topics
- [x] Navigation between days/weeks/months
- [x] Progress tracking across modules

### 🔄 To Migrate to Supabase
- [ ] User authentication (Supabase Auth)
- [ ] Persistent storage of task completions
- [ ] Persistent storage of daily notes
- [ ] Persistent storage of modules and progress
- [ ] Persistent storage of daily schedules
- [ ] Persistent storage of revision resources
- [ ] Row Level Security (RLS) policies

### 🎯 Future Enhancements
- [ ] Mobile responsive design improvements
- [ ] Dark mode
- [ ] Export data (CSV/PDF)
- [ ] Study streak tracking
- [ ] Pomodoro timer integration
- [ ] Study goals and milestones
- [ ] Analytics dashboard with charts
- [ ] Time tracking with actual hours logged
- [ ] Multi-user support
- [ ] Notifications and reminders
- [ ] Custom themes and colors
- [ ] Drag-and-drop task reordering
- [ ] Study session timer
- [ ] Focus mode (hide distractions)

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

[To be determined]

## 🙏 Acknowledgments

Built with:
- [Supabase](https://supabase.com) - Backend as a Service
- [Netlify](https://netlify.com) - Frontend hosting
- And other amazing open-source tools

---

**Happy Studying! 📚✨**

