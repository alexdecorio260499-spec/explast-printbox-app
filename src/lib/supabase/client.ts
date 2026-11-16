import { createClient } from '@supabase/supabase-js';

const DUMMY_PLACEHOLDER_URL = 'https://vqwvddwdkxnkqgfyiizt.supabase.co';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DUMMY_PLACEHOLDER_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxd3ZkZHdka3hua3FnZnlpaXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Njc0MjUsImV4cCI6MjEwNTI0MzQyNX0.EJTvF00d48d32VLa7UlMlHYuELIWLHB1xhYI49BCLkY';

export const isSupabaseConfigured = (): boolean => {
  const customUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const customKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    customUrl &&
    customKey &&
    customUrl !== DUMMY_PLACEHOLDER_URL &&
    customKey !== 'your_supabase_anon_key'
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
