-- Migration: Daily Schedule Table
-- This table stores the day-by-day schedule with topics, type, and resources
-- Allows users to customize their work/study schedule

-- Create daily_schedule table
CREATE TABLE IF NOT EXISTS public.daily_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  type TEXT NOT NULL DEFAULT 'off',
  resources TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Unique constraint: one schedule entry per user per date
  UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_schedule_user_date 
  ON public.daily_schedule(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.daily_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_schedule

-- SELECT: Users can only see their own schedule
CREATE POLICY "Users can view their own daily schedule"
  ON public.daily_schedule
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own schedule
CREATE POLICY "Users can insert their own daily schedule"
  ON public.daily_schedule
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own schedule
CREATE POLICY "Users can update their own daily schedule"
  ON public.daily_schedule
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own schedule
CREATE POLICY "Users can delete their own daily schedule"
  ON public.daily_schedule
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_daily_schedule_updated_at
  BEFORE UPDATE ON public.daily_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_schedule_updated_at();

-- Grant permissions
GRANT ALL ON public.daily_schedule TO authenticated;
GRANT ALL ON public.daily_schedule TO service_role;

-- Add comment to table
COMMENT ON TABLE public.daily_schedule IS 'Stores daily study schedule with topics, type (work/off/revision/etc), and resources for each date';

-- Migration complete

