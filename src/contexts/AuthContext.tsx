import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore, User } from '../store/authStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAsGuest: () => void;
  loginAsDemo: (role: 'teacher' | 'student') => void;
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

const DEMO_TEACHER: User = {
  id: 'demo-teacher',
  name: 'Giáo viên Demo',
  email: 'giaovien@geohub.vn',
  role: 'teacher',
  avatar: 'GV',
  xp: 1500,
  level: 5,
};

const DEMO_STUDENT: User = {
  id: 'demo-student',
  name: 'Học sinh Demo',
  email: 'hocsinh@geohub.vn',
  role: 'student',
  avatar: 'HS',
  xp: 450,
  level: 2,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout: storeLogout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only hook into Supabase auth if it's properly configured
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session) {
        fetchProfile(session);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    // Listen for auth state changes
    let subscription: any;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session) {
          fetchProfile(session);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      subscription = data?.subscription;
    } catch (e) {
      setLoading(false);
    }

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

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
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback – set basic user from session
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || 'Người dùng',
        role: session.user.user_metadata?.role || 'student',
      });
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    setUser(GUEST_USER);
  };

  const loginAsDemo = (role: 'teacher' | 'student') => {
    setUser(role === 'teacher' ? DEMO_TEACHER : DEMO_STUDENT);
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) await supabase.auth.signOut();
    } catch (_) {}
    storeLogout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAsGuest, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
