import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijbldfklchtxfeolmyta.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqYmxkZmtsY2h0eGZlb2xteXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjc1MzAsImV4cCI6MjA4OTc0MzUzMH0.QUNS6TzI1YEN_hLPnmsE3AaAZ3wkCo8YJqP7MGE8xxc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
