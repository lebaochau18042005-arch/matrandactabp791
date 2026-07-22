import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'teacher' | 'student' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  xp?: number;
  level?: number;
}

interface AuthState {
  user: User | null;
  role: UserRole;
  session: Session | null;
  setUser: (user: User | null, session: Session | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: 'guest',
  session: null,
  setUser: (user, session) => set({ user, role: user ? user.role : 'guest', session }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: 'guest', session: null });
  },
}));
