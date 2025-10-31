# SBA and Telegram Questions Management - Implementation Guide

## Overview

This document describes the new features added for managing SBA tests and Telegram questions, including full CRUD operations, bulk upload, and placeholder creation.

## What's New

### 1. Database Schema Updates

**New Table: `telegram_questions`**
- Stores telegram questions with date, text, source, and completion status
- Supports placeholder flag for future questions

**Updated Tables:**
- `tasks`: Added `module_id` (for explicit module linking) and `is_placeholder` fields
- `sba_schedule`: Added `is_placeholder` field

**Migration Script:** `supabase/04-add-sba-telegram-features.sql`
- Run this if you've already deployed the initial schema
- Adds new fields and tables to existing database

### 2. SBA Tests Management

**New View: SBA Tests Tab**
- View all SBA test definitions
- See completion progress for each test
- Schedule SBA tests by date
- Edit/delete SBA tests and schedule entries

**Features:**
- ✅ Create new SBA tests with custom parameters (name, days, reading time, etc.)
- ✅ Edit existing SBA tests
- ✅ Delete SBA tests (also removes associated schedule entries)
- ✅ Schedule SBA tests for specific dates
- ✅ Mark SBA schedule entries as completed
- ✅ View progress with visual progress bars
- ✅ Bulk upload SBA schedule from JSON
- ✅ Create placeholder SBA entries for future dates

### 3. Telegram Questions Management

**New View: Telegram Q Tab**
- View all telegram questions grouped by date
- Filter by source (MRCOG Study Group / MRCOG Intensive Hour)
- Filter by status (completed/pending)
- Date range filtering

**Features:**
- ✅ Add telegram questions with date, text, and source
- ✅ Edit existing questions
- ✅ Delete questions
- ✅ Mark questions as completed
- ✅ Bulk upload questions from JSON
- ✅ Create placeholder questions for future dates

### 4. Bulk Upload System

**JSON Format for SBA Schedule:**
```json
[
  {
    "date": "2025-11-01",
    "sba_name": "Biostatistics SBA Day 1",
    "is_placeholder": false,
    "completed": false
  }
]
```

**JSON Format for Telegram Questions:**
```json
[
  {
    "date": "2025-11-01",
    "question_text": "What is the management of...",
    "source": "MRCOG Study Group",
    "is_placeholder": false,
    "completed": false
  }
]
```

### 5. Placeholder Creation System

**Multi-Date Calendar Picker:**
- Select multiple dates by clicking on them
- Option to exclude weekends automatically
- Visual calendar showing 3 months at once
- Create placeholders for SBA tests or Telegram questions in bulk

**Use Cases:**
- Plan ahead by creating placeholder entries for future study sessions
- Easily delete placeholders if plans change
- Placeholders don't inflate progress metrics

### 6. Module Progress Enhancement

**New Progress Display:**
- Shows "X/Y tasks (Z placeholders)" format
- X = completed tasks (excluding placeholders)
- Y = total real tasks (excluding placeholders)
- Z = number of placeholder tasks

**Dual Tracking System:**
1. **Explicit Linking:** Tasks can be directly linked to modules via `module_id`
2. **Implicit Matching:** Falls back to name matching for backward compatibility

**Progress Calculation:**
- Only non-placeholder tasks count toward progress
- Placeholders are tracked separately for visibility
- Progress bars show real completion percentage

### 7. Header Statistics

**New Stats Added:**
- **SBA Progress:** Shows overall SBA completion percentage
- **Telegram Q's:** Shows number of completed telegram questions

## Usage Guide

### Adding an SBA Test

1. Navigate to "SBA Tests" tab
2. Click "Add SBA Test"
3. Fill in:
   - Test Key (unique identifier, e.g., "biostatistics")
   - Test Name (e.g., "Biostatistics SBA")
   - Total Days
   - Reading Time
   - Average Time per Day
4. Click "Save SBA Test"

### Scheduling SBA Tests

1. In SBA Tests view, use date range selector
2. The schedule shows all SBA entries for that date range
3. Check boxes to mark as completed
4. Click "Edit" to modify the test name
5. Click "Delete" to remove entries

### Viewing in Daily View

**All SBA tests and Telegram questions now appear in the Daily View!**

1. Navigate to "Daily View" tab
2. Select a date using the date navigator
3. You'll see three types of items:
   - **📚 Regular Tasks** - From your study schedule
   - **📋 SBA Tests** - All SBA tests scheduled for that day
   - **💬 Telegram Questions** - All telegram questions for that day
4. All items show placeholder badges if applicable
5. Edit/delete buttons are available for each item
6. Check boxes to mark items as completed

### Adding Telegram Questions

1. Navigate to "Telegram Q" tab
2. Click "Add Question"
3. Fill in date, question text, and source
4. Click "Save Question"

### Bulk Uploading

1. Click "Bulk Upload" button in either SBA or Telegram view
2. Paste your JSON data (see formats above)
3. Click "Upload"
4. Success message shows number of items uploaded

### Creating Placeholders

1. Click "Create Placeholders" button in either view
2. Select dates on the calendar (click to toggle)
3. Check/uncheck "Exclude Weekends" as needed
4. Click "Create Placeholders"
5. Placeholders appear with dashed borders and warning background

### Viewing Module Progress

1. Navigate to "Module Progress" tab
2. Each module now shows:
   - Subtopic completion percentage
   - Task completion stats (if tasks are linked to module)
   - Placeholder count (if any exist)

## Visual Indicators

**Placeholders:**
- 🟡 Dashed border
- 🟡 Light warning background
- 🟡 "Placeholder" badge

**Completed Items:**
- ✓ Checkbox checked
- 📝 Strikethrough text (in most views)
- ⚪ Reduced opacity

**SBA Progress:**
- 📊 Progress bars show percentage complete
- 📈 Tracks completed days vs total days

## API Functions Reference

### SBA Functions
- `loadSBATests()` - Fetch all SBA tests
- `createSBATest(data)` - Create new test
- `updateSBATest(id, data)` - Update existing test
- `deleteSBATest(id)` - Delete test
- `loadSBASchedule(startDate, endDate)` - Get scheduled SBAs
- `toggleSBAScheduleCompletion(id)` - Mark completed/incomplete
- `bulkUploadSBA(jsonData)` - Bulk insert SBA schedule

### Telegram Functions
- `loadTelegramQuestions(startDate, endDate)` - Fetch questions
- `createTelegramQuestion(data)` - Create new question
- `updateTelegramQuestion(id, data)` - Update existing question
- `deleteTelegramQuestion(id)` - Delete question
- `toggleTelegramQuestionCompletion(id)` - Mark completed/incomplete
- `bulkUploadTelegramQuestions(jsonData)` - Bulk insert questions

### Placeholder Functions
- `createPlaceholders(dates, type, data)` - Create placeholders for multiple dates
- `getWeekdaysOnly(dates)` - Filter weekend dates

### Module Progress Functions
- `getModuleProgressStats(moduleId)` - Get detailed progress including placeholders
- `updateModuleProgress()` - Recalculate all module progress

## Database Considerations

**Important Notes:**
1. Run the migration script (`04-add-sba-telegram-features.sql`) before using new features
2. The script is idempotent - safe to run multiple times
3. Existing data is preserved
4. New fields have sensible defaults

**RLS Policies:**
- All tables use Row Level Security
- Users can only access their own data
- Policies inherit from existing pattern

## Troubleshooting

**SBA tests not showing:**
- Check that you've run the migration script
- Verify user authentication
- Check browser console for errors

**Bulk upload failing:**
- Verify JSON format matches examples exactly
- Check that dates are in YYYY-MM-DD format
- Ensure array structure (not object)

**Placeholders not appearing:**
- Refresh the view after creation
- Check that dates are in the future
- Verify weekends aren't excluded if selecting weekends

**Module progress not updating:**
- Ensure tasks have `module_id` set or names match module/subtopics
- Check that tasks aren't all placeholders
- Module progress updates when tasks are toggled

## Best Practices

1. **Use Placeholders Wisely:**
   - Create placeholders for known future study sessions
   - Delete placeholders if plans change
   - Don't rely on placeholders for progress tracking

2. **Bulk Uploads:**
   - Test with small datasets first
   - Keep JSON files for backup
   - Use consistent date formats

3. **Module Linking:**
   - Explicitly link tasks to modules when possible
   - Use descriptive task names that include module/subtopic names
   - Review module progress regularly

4. **Data Organization:**
   - Use consistent source names for telegram questions
   - Keep SBA test keys simple and lowercase
   - Schedule SBA tests close to study dates

## Future Enhancements

Potential improvements for future versions:
- Export SBA/Telegram data to CSV
- Import from CSV
- Advanced filtering and search
- Bulk edit capabilities
- Calendar integration
- Mobile app companion

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the TROUBLESHOOTING.md file
3. Check Supabase logs for database errors
4. Verify authentication status

---

**Implementation Date:** October 31, 2025
**Version:** 1.0
**Database Migration Required:** Yes (`04-add-sba-telegram-features.sql`)

