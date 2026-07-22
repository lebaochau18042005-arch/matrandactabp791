import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore, User } from '../store/authStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const GUEST_USER: User = {
  id: 'guest',
  name: 'Khách',
  email: '',
  role: 'guest',
  avatar: 'KH',
  xp: 0,
  level: 0,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout: storeLogout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session);
      } else {
        setUser(null, null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const fetchProfile = async (session: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.full_name || session.user.user_metadata?.full_name || 'Người dùng',
          role: data.role || 'student',
          avatar: data.avatar_url || 'KH',
          xp: data.xp || 0,
          level: Math.floor((data.xp || 0) / 1000) + 1,
        }, session);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || 'Người dùng',
        role: session.user.user_metadata?.role || 'student',
      }, session);
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    setUser(GUEST_USER, null);
  };

  const logout = async () => {
    await storeLogout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
