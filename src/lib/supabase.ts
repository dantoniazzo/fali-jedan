import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { envVars } from '_app';

// Ensure we have the required environment variables
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
