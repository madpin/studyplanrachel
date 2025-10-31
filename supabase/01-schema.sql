-- ============================================
-- STEP 1: CREATE DATABASE SCHEMA
-- ============================================
-- Run this FIRST in Supabase SQL Editor
-- This creates all the tables for the app
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Settings Table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  brazil_trip_start DATE,
  brazil_trip_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Modules Table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exam_weight NUMERIC NOT NULL,
  subtopics INTEGER NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  subtopics_list JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Schedule Table
CREATE TABLE daily_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]',
  day_type TEXT NOT NULL,
  resources JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Task Categories (for organizing daily tasks)
CREATE TABLE task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category_name TEXT NOT NULL,
  time_estimate TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_catch_up BOOLEAN DEFAULT FALSE,
  original_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES task_categories(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  task_name TEXT NOT NULL,
  time_estimate TEXT NOT NULL,
  work_suitable BOOLEAN DEFAULT FALSE,
  is_sba BOOLEAN DEFAULT FALSE,
  is_placeholder BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Notes Table
CREATE TABLE daily_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- SBA Tests Table
CREATE TABLE sba_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_key TEXT NOT NULL,
  name TEXT NOT NULL,
  total_days INTEGER NOT NULL,
  reading_time TEXT NOT NULL,
  avg_time TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, test_key)
);

-- SBA Schedule Table (which SBA is on which day)
CREATE TABLE sba_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sba_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  is_placeholder BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revision Resources Table
CREATE TABLE revision_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'gtg_podcast', 'gtg_summary', 'nice_guideline', 'rrr_session'
  title TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catch-up Queue Table
CREATE TABLE catch_up_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_date DATE NOT NULL,
  original_topic TEXT NOT NULL,
  new_date DATE NOT NULL,
  time_estimate TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telegram Questions Table
CREATE TABLE telegram_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  question_text TEXT NOT NULL,
  source TEXT, -- 'MRCOG Study Group' or 'MRCOG Intensive Hour'
  completed BOOLEAN DEFAULT FALSE,
  is_placeholder BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_modules_user_id ON modules(user_id);
CREATE INDEX idx_daily_schedule_user_date ON daily_schedule(user_id, date);
CREATE INDEX idx_tasks_user_date ON tasks(user_id, date);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_module ON tasks(module_id);
CREATE INDEX idx_task_categories_user_date ON task_categories(user_id, date);
CREATE INDEX idx_daily_notes_user_date ON daily_notes(user_id, date);
CREATE INDEX idx_sba_tests_user ON sba_tests(user_id);
CREATE INDEX idx_sba_schedule_user_date ON sba_schedule(user_id, date);
CREATE INDEX idx_revision_resources_user_date ON revision_resources(user_id, week_start_date);
CREATE INDEX idx_catch_up_queue_user_new_date ON catch_up_queue(user_id, new_date);
CREATE INDEX idx_telegram_questions_user_date ON telegram_questions(user_id, date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_schedule_updated_at BEFORE UPDATE ON daily_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_notes_updated_at BEFORE UPDATE ON daily_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telegram_questions_updated_at BEFORE UPDATE ON telegram_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RESULT: You should see "Success. No rows returned"
-- NEXT: Run 02-enable-rls.sql
-- ============================================
