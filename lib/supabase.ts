import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // During build, return a mock client to avoid errors
      if (process.env.NODE_ENV === 'production' && !supabaseUrl) {
        throw new Error('Missing Supabase environment variables');
      }
      // Return a minimal mock for build time
      return createClient('http://localhost:54321', 'mock-key');
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

function createLazyClient(): SupabaseClient {
  const handler: ProxyHandler<SupabaseClient> = {
    get(target, prop) {
      const client = getSupabaseClient();
      const value = (client as any)[prop];
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
  };
  
  return new Proxy({} as SupabaseClient, handler);
}

export const supabase = createLazyClient();

export const getSupabaseServerClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};