import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      auth: {
        signUp: async () => ({ error: { message: 'Supabase chưa được cấu hình trên Vercel. Vui lòng bấm vào nút "👀 Trải nghiệm bằng quyền Khách" ở bên dưới.' } }),
        signInWithPassword: async () => ({ error: { message: 'Supabase chưa được cấu hình trên Vercel. Vui lòng bấm vào nút "👀 Trải nghiệm bằng quyền Khách" ở bên dưới.' } }),
        signInWithOAuth: async () => ({ error: { message: 'Supabase chưa được cấu hình.' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
      }
    } as any);

