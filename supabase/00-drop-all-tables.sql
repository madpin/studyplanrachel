-- ============================================
-- STEP 0: DROP ALL TABLES AND RESET DATABASE
-- ============================================
-- Run this FIRST when you need to completely reset the database
-- This will delete ALL data and recreate a fresh database
-- WARNING: This is irreversible! Make sure you have backups if needed.
-- ============================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
DROP TRIGGER IF EXISTS update_daily_schedule_updated_at ON daily_schedule;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_task_categories_updated_at ON task_categories;
DROP TRIGGER IF EXISTS update_daily_notes_updated_at ON daily_notes;
DROP TRIGGER IF EXISTS update_sba_tests_updated_at ON sba_tests;
DROP TRIGGER IF EXISTS update_sba_schedule_updated_at ON sba_schedule;
DROP TRIGGER IF EXISTS update_revision_resources_updated_at ON revision_resources;
DROP TRIGGER IF EXISTS update_catch_up_queue_updated_at ON catch_up_queue;
DROP TRIGGER IF EXISTS update_telegram_questions_updated_at ON telegram_questions;

-- Drop tables in correct order (child tables first due to foreign key dependencies)
-- Using CASCADE to automatically handle any remaining dependencies
DROP TABLE IF EXISTS telegram_questions CASCADE;
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

-- Drop custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_daily_schedule_updated_at() CASCADE;

-- Note: Indexes are automatically dropped when tables are dropped
-- Note: RLS policies are automatically dropped when tables are dropped

-- ============================================
-- RESULT: You should see "Success. No rows returned"
-- NEXT: Run 01-schema.sql to recreate all tables
-- ============================================

