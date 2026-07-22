// ─── App Context (XP, Badges, Progress) ───────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SimProgress {
  simId: string;
  viewed: boolean;
  completed: boolean;
  score?: number;
  timeSpent?: number; // seconds
  viewedAt?: string;  // ISO date
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;   // emoji
  color: string;  // tailwind bg class e.g. 'bg-blue-500'
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'explorer',       name: 'Nhà Khám Phá Trái Đất',    description: 'Xem 5 mô phỏng đầu tiên',          icon: '🌍', color: 'bg-blue-500' },
  { id: 'climate',        name: 'Chuyên Gia Khí Hậu',       description: 'Hoàn thành 3 mô phỏng Khí Quyển',  icon: '🌬️', color: 'bg-cyan-500' },
  { id: 'weather',        name: 'Nhà Dự Báo Thời Tiết',     description: 'Đạt 90%+ quiz thủy triều',          icon: '⛅', color: 'bg-amber-500' },
  { id: 'disaster',       name: 'Chuyên Gia Thiên Tai',      description: 'Xem mô phỏng núi lửa + sóng thần', icon: '🌋', color: 'bg-red-500' },
  { id: 'map-master',     name: 'Bậc Thầy Bản Đồ',          description: 'Hoàn thành 3 bài tọa độ địa lí',   icon: '🗺️', color: 'bg-emerald-500' },
  { id: 'eco-citizen',    name: 'Công Dân Xanh',             description: 'Xem mô phỏng biến đổi khí hậu',   icon: '🌱', color: 'bg-green-500' },
  { id: 'ocean',          name: 'Nhà Nghiên Cứu Đại Dương',  description: 'Hoàn thành 3 mô phỏng Thủy Quyển', icon: '🌊', color: 'bg-indigo-500' },
  { id: 'terrain',        name: 'Chuyên Gia Địa Hình',       description: 'Hoàn thành 3 mô phỏng Thạch Quyển',icon: '🗻', color: 'bg-stone-500' },
  { id: 'young-scientist',name: 'Nhà Khoa Học Trẻ',          description: 'Đạt điểm tuyệt đối 5 bài quiz',    icon: '🔬', color: 'bg-violet-500' },
  { id: 'scientist',      name: 'Nhà Khoa Học',              description: 'Tích lũy 5000 XP',                 icon: '⚗️', color: 'bg-purple-500' },
];

// XP rewards
export const XP_REWARDS = {
  VIEW_SIM: 10,
  COMPLETE_QUIZ: 30,
  CORRECT_ANSWER: 5,
  COMPLETE_LESSON: 50,
  PERFECT_SCORE: 100,
};

// Level thresholds
export function xpToLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2200) return 6;
  if (xp < 3000) return 7;
  if (xp < 4000) return 8;
  if (xp < 5500) return 9;
  if (xp < 7500) return 10;
  return Math.min(99, 10 + Math.floor((xp - 7500) / 1000));
}

export function levelName(level: number): string {
  if (level <= 2) return 'Học Viên';
  if (level <= 4) return 'Khám Phá Viên';
  if (level <= 6) return 'Nhà Địa Lí';
  if (level <= 8) return 'Chuyên Gia';
  if (level <= 10) return 'Tiến Sĩ Địa Lí';
  return 'Bậc Thầy';
}

interface AppContextType {
  xp: number;
  level: number;
  addXP: (amt: number, reason?: string) => void;
  badges: string[];
  unlockBadge: (id: string) => void;
  simProgress: Record<string, SimProgress>;
  markSimViewed: (id: string) => void;
  completeQuiz: (id: string, score: number) => void;
  recentActivity: { text: string; xp: number; time: string }[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useState<number>(() => {
    return Number(localStorage.getItem('geohub_xp') || '0');
  });

  const [badges, setBadges] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('geohub_badges') || '[]'); }
    catch { return []; }
  });

  const [simProgress, setSimProgress] = useState<Record<string, SimProgress>>(() => {
    try { return JSON.parse(localStorage.getItem('geohub_progress') || '{}'); }
    catch { return {}; }
  });

  const [recentActivity, setRecentActivity] = useState<{ text: string; xp: number; time: string }[]>([]);

  const level = xpToLevel(xp);

  // Sync from Supabase on mount
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load XP from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', user.id)
        .single();
      
      if (profile) setXP(profile.xp || 0);

      // Load Badges from user_badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('student_id', user.id);
        
      if (userBadges) {
        setBadges(userBadges.map(b => b.badge_id));
      }
    };
    loadUserData();
  }, []);

  const addXP = async (amt: number, reason?: string) => {
    const newXP = xp + amt;
    setXP(newXP);
    localStorage.setItem('geohub_xp', String(newXP));
    
    if (reason) {
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setRecentActivity(prev => [{ text: reason, xp: amt, time: now }, ...prev].slice(0, 20));
    }

    // Sync to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ xp: newXP }).eq('id', user.id);
    }
  };

  const unlockBadge = async (id: string) => {
    if (!badges.includes(id)) {
      const next = [...badges, id];
      setBadges(next);
      localStorage.setItem('geohub_badges', JSON.stringify(next));

      // Sync to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_badges').insert({ student_id: user.id, badge_id: id });
      }
    }
  };

  const markSimViewed = (id: string) => {
    const existing = simProgress[id];
    if (existing?.viewed) return; // already counted
    const prog: SimProgress = {
      ...(existing || {}),
      simId: id, viewed: true,
      completed: existing?.completed || false,
      viewedAt: new Date().toISOString(),
    };
    const next = { ...simProgress, [id]: prog };
    setSimProgress(next);
    localStorage.setItem('geohub_progress', JSON.stringify(next));
    addXP(XP_REWARDS.VIEW_SIM, `Xem mô phỏng +${XP_REWARDS.VIEW_SIM} XP`);
  };

  const completeQuiz = (id: string, score: number) => {
    const existing = simProgress[id];
    const prog: SimProgress = {
      ...(existing || {}),
      simId: id, viewed: true, completed: true, score,
    };
    const next = { ...simProgress, [id]: prog };
    setSimProgress(next);
    localStorage.setItem('geohub_progress', JSON.stringify(next));
    const xpGain = score === 100 ? XP_REWARDS.PERFECT_SCORE : XP_REWARDS.COMPLETE_QUIZ;
    addXP(xpGain, `Hoàn thành quiz (${score}%) +${xpGain} XP`);
    if (score === 100) unlockBadge('young-scientist');
  };

  return (
    <AppContext.Provider value={{ xp, level, addXP, badges, unlockBadge, simProgress, markSimViewed, completeQuiz, recentActivity }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
