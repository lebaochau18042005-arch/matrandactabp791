import { create } from 'zustand';

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
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: 'guest',
  setUser: (user) => set({ user, role: user ? user.role : 'guest' }),
  logout: () => set({ user: null, role: 'guest' }),
}));
