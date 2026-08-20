import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// If Supabase is not configured (e.g. on Vercel without env vars),
// provide a safe no-op mock so the app doesn't crash.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      auth: {
        signUp: async () => ({ data: null, error: { message: 'Supabase chưa được cấu hình. Vui lòng dùng tài khoản Demo.' } }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase chưa được cấu hình. Vui lòng dùng tài khoản Demo.' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase chưa được cấu hình.' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_event: any, _callback: any) => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: (_table: string) => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('No Supabase') }) }) }),
        insert: async () => ({ data: null, error: new Error('No Supabase') }),
        update: () => ({ eq: async () => ({ data: null, error: new Error('No Supabase') }) }),
        upsert: async () => ({ data: null, error: new Error('No Supabase') }),
        delete: () => ({ eq: async () => ({ data: null, error: new Error('No Supabase') }) }),
      }),
    } as any);
