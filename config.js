/**
 * Supabase Configuration Module
 * Exports the Supabase client for use throughout the application
 */

const SUPABASE_URL = 'https://olhzunjhhimybxxrfazc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saHp1bmpoaGlteWJ4eHJmYXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjMyNDAsImV4cCI6MjA3NzQ5OTI0MH0.o0_Yix7Hflm9t1kA6Zu_M8jTQs-zUtNx2MMR1fU8MYM';

// Initialize Supabase client
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized:', {
  url: SUPABASE_URL,
  hasClient: !!supabase
});
