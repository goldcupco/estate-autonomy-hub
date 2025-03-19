
// Environment variables management

/**
 * Get an environment variable with validation
 * @param key The environment variable name
 * @param defaultValue Optional default value if not found
 * @param required If true, will throw error when missing
 * @returns The environment variable value
 */
export function getEnv(key: string, defaultValue?: string, required = false): string {
  const value = import.meta.env[key] || defaultValue || '';
  
  if (required && !value) {
    console.error(`Required environment variable ${key} is missing`);
    throw new Error(`Required environment variable ${key} is missing`);
  }
  
  return value;
}

// Supabase environment values
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://gdxzktqieasxxcocwsjh.supabase.co');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeHprdHFpZWFzeHhjb2N3c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjc1MTEsImV4cCI6MjA1NzkwMzUxMX0.EKFCdp3mGjHsBalEWUcIApkHtcmbzR8876N8F3OhlKY');

// Add other environment variables as needed
export const GOOGLE_MAPS_API_KEY = getEnv('VITE_GOOGLE_MAPS_API_KEY', '');
