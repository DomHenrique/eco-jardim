import { createClient } from '@supabase/supabase-js';
import { errorHandler, createError } from '../utils/errorHandler';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const error = createError(
    'Missing Supabase environment variables. Please check your .env.local file.',
    { code: 'ConfigError', context: 'supabaseClient' }
  );
  errorHandler.handle(error);
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check connection
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      errorHandler.handle(error, 'supabaseClient.checkConnection');
      return false;
    }
    return true;
  } catch (err) {
    errorHandler.handle(err as Error, 'supabaseClient.checkConnection');
    return false;
  }
};
