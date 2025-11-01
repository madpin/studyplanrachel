-- Add capacity configuration to user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS max_study_minutes INTEGER DEFAULT 480, -- 8 hours default
ADD COLUMN IF NOT EXISTS work_days_pattern JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}';

-- Add comment for clarity
COMMENT ON COLUMN user_settings.max_study_minutes IS 'Maximum study time per day in minutes (default 480 = 8 hours)';
COMMENT ON COLUMN user_settings.work_days_pattern IS 'JSON object indicating which days are work days for capacity planning';

