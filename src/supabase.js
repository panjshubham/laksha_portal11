import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kfsgcftwlsptpcysgchc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc2djZnR3bHNwdHBjeXNnY2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzQ1ODcsImV4cCI6MjEwMzI1MDU4N30._YtwONIFbQRG4o0GHa0uzf77AYqbgdwWh900wkiAaBc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
