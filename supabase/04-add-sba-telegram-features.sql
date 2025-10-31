-- ============================================
-- MIGRATION: Add SBA and Telegram Features
-- ============================================
-- Run this if you've already run 01-schema.sql
-- This adds new fields and tables for enhanced functionality
-- ============================================

-- Add new fields to tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_placeholder BOOLEAN DEFAULT FALSE;

-- Add new field to sba_schedule table
ALTER TABLE sba_schedule 
  ADD COLUMN IF NOT EXISTS is_placeholder BOOLEAN DEFAULT FALSE;

-- Create telegram_questions table
CREATE TABLE IF NOT EXISTS telegram_questions (
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

-- Add new indexes
CREATE INDEX IF NOT EXISTS idx_tasks_module ON tasks(module_id);
CREATE INDEX IF NOT EXISTS idx_telegram_questions_user_date ON telegram_questions(user_id, date);

-- Add trigger for telegram_questions
CREATE TRIGGER update_telegram_questions_updated_at BEFORE UPDATE ON telegram_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RESULT: You should see "Success. No rows returned"
-- ============================================

