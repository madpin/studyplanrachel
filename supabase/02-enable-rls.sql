-- ============================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ============================================
-- Run this SECOND in Supabase SQL Editor
-- This enables RLS on all tables (but doesn't create policies yet)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sba_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sba_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE catch_up_queue ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RESULT: You should see "Success. No rows returned"
-- NEXT: Run 03-rls-policies.sql
-- ============================================
