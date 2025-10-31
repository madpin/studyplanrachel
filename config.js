// Supabase Configuration
// Replace these with your actual Supabase project credentials

const SUPABASE_URL = 'https://olhzunjhhimybxxrfazc.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saHp1bmpoaGlteWJ4eHJmYXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjMyNDAsImV4cCI6MjA3NzQ5OTI0MH0.o0_Yix7Hflm9t1kA6Zu_M8jTQs-zUtNx2MMR1fU8MYM';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
