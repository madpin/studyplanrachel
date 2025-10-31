# First-Time User Onboarding

## Overview

The application now includes a comprehensive first-time user onboarding experience that allows new users to customize their study plan from the start.

## How It Works

### 1. First-Time User Detection

When a new user signs up or logs in for the first time, the app detects that they have no existing settings in the database and triggers the onboarding flow.

**Detection Logic:**
- Located in `app.js` → `initializeApp()` function
- Checks if user has existing `user_settings` record
- If no settings found, calls `initializeFirstTimeUser()` which shows the onboarding modal

### 2. Onboarding Modal

The onboarding modal (`#onboardingModal` in `index.html`) presents two main sections:

#### Section 1: Configure Your Dates
- **Exam Date** (required): User's exam date
  - Default: 2026-01-14 (from original schedule)
- **Trip/Break Start Date** (optional): Start of any planned breaks or trips
  - Default: 2025-12-19 (from original schedule)
- **Trip/Break End Date** (optional): End of any planned breaks or trips
  - Default: 2025-12-29 (from original schedule)

#### Section 2: Select Modules to Study
- Displays all 12 available modules with:
  - Module name (color-coded)
  - Exam weight percentage
  - Number of subtopics
- All modules are pre-selected by default
- Users can:
  - Click individual checkboxes to select/deselect
  - Use "Select All" button
  - Use "Deselect All" button

### 3. Data Initialization

When the user submits the onboarding form:

**Function: `completeOnboarding()` in `app.js`**

1. Creates `user_settings` record with the selected dates
2. Creates `modules` records for all selected modules
3. Loads all user data
4. Renders the initial view (Daily View)
5. Shows the main application

## Default Module Data

The app includes 12 pre-configured modules in `defaultModules` array:

1. **Anatomy** - 10% exam weight, 13 subtopics
2. **Genetics** - 5% exam weight, 10 subtopics
3. **Physiology** - 8% exam weight, 9 subtopics
4. **Endocrinology** - 6% exam weight, 10 subtopics
5. **Biochemistry** - 8% exam weight, 10 subtopics
6. **Embryology** - 8% exam weight, 8 subtopics
7. **Microbiology & Immunology** - 10% exam weight, 15 subtopics
8. **Pathology** - 7% exam weight, 8 subtopics
9. **Pharmacology** - 7% exam weight, 9 subtopics
10. **Clinical Management** - 20% exam weight, 19 subtopics
11. **Biostatistics** - 7% exam weight, 14 subtopics
12. **Data Interpretation** - 4% exam weight, 8 subtopics

Each module includes:
- Name
- Color (for visual identification)
- Exam weight percentage
- Total number of subtopics
- List of all subtopics

## Customization Guide

### Adding New Modules

To add more modules to the default list, edit the `defaultModules` array in `app.js`:

```javascript
const defaultModules = [
  // ... existing modules
  { 
    name: 'Your Module Name',
    exam_weight: 10,
    subtopics: 8,
    color: '#3498db',
    completed: 0,
    subtopics_list: ['Topic 1', 'Topic 2', '...']
  }
];
```

### Changing Default Dates

The default dates are defined at the top of the onboarding section in `app.js`. To change them, edit the `defaultDates` object:

```javascript
const defaultDates = {
  examDate: '2026-01-14',           // Change to your exam date
  brazilTripStart: '2025-12-19',    // Change to your trip start
  brazilTripEnd: '2025-12-29'       // Change to your trip end
};
```

These dates match the original schedule from `draft/app.js` and will pre-populate the onboarding form.

### Customizing the UI

All onboarding styles are in `style.css` under the `/* ===== ONBOARDING MODAL STYLES ===== */` section.

Key CSS classes:
- `.modal-large` - Large modal container
- `.onboarding-section` - Each section of the onboarding
- `.module-checkboxes` - Grid of module checkboxes
- `.module-checkbox-item` - Individual module card
- `.btn--large` - Large submit button

### Skipping Onboarding (for testing)

For existing users or to skip onboarding:

1. The onboarding is only shown if no `user_settings` record exists
2. If settings exist, the app loads normally
3. Users with existing data will never see the onboarding modal

## Files Modified

1. **`index.html`** - Added onboarding modal HTML
2. **`app.js`** - Added onboarding logic and functions:
   - `initializeFirstTimeUser()`
   - `completeOnboarding()`
   - `showOnboardingModal()`
   - `selectAllModules()`
   - `deselectAllModules()`
   - Onboarding form submission handler
3. **`style.css`** - Added comprehensive styling for onboarding components

## User Experience Flow

```
User Signs Up/Logs In
        ↓
App checks for user_settings
        ↓
No settings found?
        ↓ YES
Show Onboarding Modal
        ↓
User configures dates
        ↓
User selects modules
        ↓
User clicks "Start My Study Journey! 🚀"
        ↓
Create settings & modules in database
        ↓
Load all user data
        ↓
Show main application (Daily View)
```

## Future Enhancements

Potential improvements to consider:

1. **Task/Schedule Templates**: Pre-populate tasks based on selected modules
2. **Guided Tour**: Show tooltips/walkthrough after onboarding
3. **Progress Tracking**: Show expected completion timeline
4. **Study Schedule Generator**: Auto-generate daily study schedule based on exam date
5. **Import/Export**: Allow users to import existing study plans
6. **Multi-step Wizard**: Break onboarding into multiple steps with progress indicator
7. **Preview Mode**: Show sample schedule before finalizing

## Technical Notes

- The onboarding modal uses a CSS flexbox layout for responsiveness
- Module data is stored in the `defaultModules` array and can be easily modified
- The form prevents submission if no modules are selected
- All database operations are done via Supabase
- The modal can only be closed by completing the form (no X button on first load)
- Loading indicators are shown during database operations

