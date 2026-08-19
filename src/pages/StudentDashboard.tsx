// ─── StudentDashboard — Trang tổng quan học sinh ──────────────────────────────
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Zap,
  Play,
  Star,
  Lock,
  Trophy,
  CalendarClock,
  ChevronRight,
  Award,
  BookOpen,
  Video,
  Clock,
  Target,
  FileQuestion,
  ClipboardList,
  PenLine,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext, xpToLevel, levelName } from '../contexts/AppContext';
import AppLayout from '../layouts/AppLayout';
import { inferAssignmentType, type AssignmentTaskType, useAssignmentStore } from '../store/assignmentStore';
import { useSubmissionStore } from '../store/submissionStore';
import { SIMULATIONS } from '../data/simulations';

// ─── Badge definitions ────────────────────────────────────────────────────────
const ALL_BADGES = [
  { id: 'explorer',        name: 'Nhà Khám Phá',         icon: '🌍', color: 'bg-blue-500' },
  { id: 'climate',         name: 'Chuyên Gia Khí Hậu',   icon: '🌬️', color: 'bg-cyan-500' },
  { id: 'weather',         name: 'Nhà Dự Báo',           icon: '⛅',  color: 'bg-amber-500' },
  { id: 'disaster',        name: 'Chuyên Gia Thiên Tai', icon: '🌋', color: 'bg-red-500' },
  { id: 'map-master',      name: 'Bậc Thầy Bản Đồ',     icon: '🗺️', color: 'bg-emerald-500' },
  { id: 'eco-citizen',     name: 'Công Dân Xanh',        icon: '🌱', color: 'bg-green-500' },
  { id: 'ocean',           name: 'Nhà Đại Dương Học',    icon: '🌊', color: 'bg-indigo-500' },
  { id: 'terrain',         name: 'Chuyên Gia Địa Hình',  icon: '🗻', color: 'bg-stone-500' },
  { id: 'young-scientist', name: 'Nhà KH Trẻ',           icon: '🔬', color: 'bg-violet-500' },
  { id: 'scientist',       name: 'Nhà Khoa Học',         icon: '⚗️', color: 'bg-purple-500' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
// TASKS are now fetched from assignmentStore

const CLASSMATES = [
  { rank: 1, name: 'Nguyễn Minh Tuấn',  xp: 2100, avatar: 'MT', isMe: false },
  { rank: 2, name: 'Lê Thị Lan Anh',    xp: 1850, avatar: 'LA', isMe: false },
  { rank: 3, name: 'Trần Văn An (Bạn)', xp: 1250, avatar: 'TA', isMe: true  },
  { rank: 4, name: 'Phạm Thu Hương',    xp: 1100, avatar: 'TH', isMe: false },
  { rank: 5, name: 'Hoàng Đức Nam',     xp: 980,  avatar: 'HN', isMe: false },
];

const RECENT_SIMS = [
  { id: 'daynight',     name: 'Ngày đêm luân phiên', gradient: 'linear-gradient(135deg,#0f0c29,#302b63 50%,#24243e)', emoji: '🌗' },
  { id: 'seasons',      name: 'Các mùa trong năm',   gradient: 'linear-gradient(135deg,#f093fb,#f5576c)',             emoji: '🍂' },
  { id: 'windpressure', name: 'Khí áp và gió',        gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)',             emoji: '🌬️' },
  { id: 'tide',         name: 'Thủy triều',           gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)',             emoji: '🌊' },
];

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
type TaskFilter = 'all' | AssignmentTaskType | 'dueSoon';

const TASK_FILTERS: Array<{ id: TaskFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'lesson', label: 'Bài giảng' },
  { id: 'simulation', label: 'Mô phỏng' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'worksheet', label: 'Phiếu học tập' },
  { id: 'essay', label: 'Tự luận' },
  { id: 'dueSoon', label: 'Sắp hết hạn' },
];

const TASK_TYPE_LABELS: Record<AssignmentTaskType, string> = {
  simulation: 'Mô phỏng',
  lesson: 'Bài giảng',
  quiz: 'Quiz',
  worksheet: 'Phiếu học tập',
  essay: 'Tự luận',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function xpForLevel(lvl: number): number {
  const t = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];
  return t[Math.min(lvl - 1, t.length - 1)] ?? 0;
}
function xpForNextLevel(lvl: number): number {
  const t = [100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 99999];
  return t[Math.min(lvl - 1, t.length - 1)] ?? 99999;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { xp: ctxXP, badges: ctxBadges, simProgress } = useAppContext();
  const { assignments, fetchStudentTasks, loading } = useAssignmentStore();
  const { startAssignment } = useSubmissionStore();
  const [dateStr, setDateStr] = useState('');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');

  useEffect(() => {
    const d = new Date();
    setDateStr(d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }));
    
    // Gán cứng '10A1' theo đúng kế hoạch MVP
    fetchStudentTasks('10A1');
  }, [fetchStudentTasks]);

  const currentXP    = ctxXP;
  const currentLevel = xpToLevel(ctxXP);
  const userBadges   = ctxBadges;
  const xpMin        = xpForLevel(currentLevel);
  const xpMax        = xpForNextLevel(currentLevel);
  const xpPct        = Math.min(100, Math.round(((currentXP - xpMin) / (xpMax - xpMin)) * 100));
  const simsViewedCount = Object.values(simProgress).filter((p) => p.viewed).length;
  const taskCards = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return assignments.map((task) => {
      const taskType = inferAssignmentType(task);
      const sim = SIMULATIONS.find(s => s.id === task.simulation_id);
      const title =
        task.title ||
        (taskType === 'lesson' ? task.lesson?.title :
        taskType === 'simulation' ? sim?.name :
        taskType === 'quiz' ? 'Quiz GeoHub' :
        taskType === 'essay' ? 'Bài tự luận' :
        'Phiếu học tập');
      const dest =
        taskType === 'lesson' ? `/lesson-viewer/${task.lesson_id}?assignment=${task.id}` :
        taskType === 'simulation' ? `/simulations/${task.simulation_id}?assignment=${task.id}` :
        taskType === 'quiz' ? `/quiz/${task.quiz_id}?assignment=${task.id}` :
        `/tasks/${task.id}`;
      const deadline = new Date(task.deadline);
      const daysLeft = Math.ceil((deadline.getTime() - startOfToday.getTime()) / 86400000);
      const statusLabel = daysLeft < 0 ? 'Quá hạn' : daysLeft === 0 ? 'Hôm nay' : `Còn ${daysLeft} ngày`;
      const statusClass = daysLeft < 0
        ? 'bg-red-500/10 text-red-300 border-red-500/25'
        : daysLeft <= 2
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
          : 'bg-teal-500/10 text-teal-300 border-teal-500/25';

      return {
        task,
        taskType,
        title: `${TASK_TYPE_LABELS[taskType]}: ${title}`,
        dest,
        daysLeft,
        statusLabel,
        statusClass,
        xp: task.points ?? (taskType === 'quiz' || taskType === 'essay' ? 100 : taskType === 'worksheet' ? 70 : taskType === 'lesson' ? 50 : 30),
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [assignments]);

  const filteredTaskCards = taskCards.filter((card) => {
    if (taskFilter !== 'all' && taskFilter !== 'dueSoon') return card.taskType === taskFilter;
    if (taskFilter === 'dueSoon') return card.daysLeft >= 0 && card.daysLeft <= 2;
    return true;
  });
  const dueSoonCount = taskCards.filter(card => card.daysLeft >= 0 && card.daysLeft <= 2).length;
  const overdueCount = taskCards.filter(card => card.daysLeft < 0).length;
  const nextTask = taskCards.find(card => card.daysLeft >= 0) ?? taskCards[0];
  const taskHealthPct = taskCards.length
    ? Math.round(((taskCards.length - overdueCount) / taskCards.length) * 100)
    : 100;

  const openTask = (card: typeof taskCards[number]) => {
    startAssignment(card.task.id, '10A1');
    navigate(card.dest);
  };

  return (
    <AppLayout title="Tổng quan học sinh">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

        {/* 1. Hero */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 via-slate-800/90 to-teal-900/30 p-6 sm:p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-1">{dateStr}</p>
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1">
                Xin chào, {user?.name ?? 'Bạn'}! 👋
              </h2>
              <p className="text-slate-300 text-sm">Hôm nay bạn đã học được gì?</p>
            </div>
            <div className="sm:min-w-[220px] p-4 rounded-xl bg-white/5 border border-white/8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Cấp độ</span>
                <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
                  Lv.{currentLevel} — {levelName(currentLevel)}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1"><Zap size={10} className="text-yellow-400" />{currentXP} XP</span>
                  <span>{xpPct}% → Lv.{currentLevel + 1}</span>
                </div>
                <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Chuỗi học tập', value: '3 ngày', sub: 'liên tiếp', icon: <Flame className="text-orange-400" size={22} />, grad: 'from-orange-500/40 to-red-500/0', border: 'border-orange-500/20' },
            { label: 'Tổng XP', value: currentXP.toLocaleString(), sub: 'điểm kinh nghiệm', icon: <Zap className="text-yellow-400" size={22} />, grad: 'from-yellow-500/40 to-amber-500/0', border: 'border-yellow-500/20' },
            { label: 'Nhiệm vụ sắp hạn', value: dueSoonCount.toString(), sub: overdueCount > 0 ? `${overdueCount} quá hạn` : 'cần ưu tiên', icon: <Clock className="text-teal-400" size={22} />, grad: 'from-teal-500/40 to-cyan-500/0', border: 'border-teal-500/20' },
            { label: 'Huy hiệu', value: userBadges.length.toString(), sub: `/ ${ALL_BADGES.length} huy hiệu`, icon: <Star className="text-violet-400" size={22} />, grad: 'from-violet-500/40 to-purple-500/0', border: 'border-violet-500/20' },
          ].map((s) => (
            <div key={s.label} className={`relative rounded-2xl border ${s.border} bg-slate-800/60 p-4 hover:scale-[1.02] transition-transform duration-200 isolate`}>
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.grad} rounded-t-2xl`} />
              <div className="flex items-start justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium">{s.label}</p>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{s.icon}</div>
              </div>
              <p className="text-white text-2xl font-bold">{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Today focus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-800/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-teal-400" />
              <h3 className="text-white font-semibold">Việc học ưu tiên</h3>
            </div>
            {nextTask ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-slate-300 text-sm font-medium">{nextTask.title}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${nextTask.statusClass}`}>{nextTask.statusLabel}</span>
                    <span className="text-xs px-2 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-300">+{nextTask.xp} XP</span>
                  </div>
                </div>
                <button
                  onClick={() => openTask(nextTask)}
                  className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  Bắt đầu <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Chưa có nhiệm vụ mới. Bạn có thể ôn lại mô phỏng gần đây.</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-semibold">Tình trạng nhiệm vụ</span>
              <span className="text-teal-300 text-sm font-bold">{taskHealthPct}%</span>
            </div>
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" style={{ width: `${taskHealthPct}%` }} />
            </div>
            <p className="text-slate-500 text-xs mt-3">{taskCards.length} nhiệm vụ đang theo dõi · {simsViewedCount} mô phỏng đã xem</p>
          </div>
        </div>

        {/* 3+4. Tasks + Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6" style={{ position: 'relative', zIndex: 10 }}>

          {/* Tasks */}
          <div className="lg:col-span-3 space-y-4" style={{ position: 'relative', zIndex: 10 }}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <CalendarClock size={18} className="text-teal-400" />
                Nhiệm vụ của lớp 10A1
              </h3>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-white/10">
                {assignments.length} nhiệm vụ
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {TASK_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setTaskFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${
                    taskFilter === filter.id
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/35'
                      : 'bg-slate-800/60 text-slate-500 border-white/8 hover:text-slate-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <p className="text-slate-400 text-sm py-4 text-center">Đang tải nhiệm vụ...</p>
              ) : filteredTaskCards.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center border border-white/5 bg-slate-800/30 rounded-2xl p-4">
                  Chưa có nhiệm vụ phù hợp với bộ lọc này.
                </p>
              ) : (
                filteredTaskCards.map((card) => {
                  const Icon =
                    card.taskType === 'lesson' ? BookOpen :
                    card.taskType === 'quiz' ? FileQuestion :
                    card.taskType === 'worksheet' ? ClipboardList :
                    card.taskType === 'essay' ? PenLine :
                    Video;
                  const accent =
                    card.taskType === 'lesson' ? { bg: 'rgba(139,92,246,0.2)', color: '#a78bfa' } :
                    card.taskType === 'quiz' ? { bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' } :
                    card.taskType === 'worksheet' ? { bg: 'rgba(245,158,11,0.18)', color: '#fbbf24' } :
                    card.taskType === 'essay' ? { bg: 'rgba(244,63,94,0.18)', color: '#fb7185' } :
                    { bg: 'rgba(20,184,166,0.2)', color: '#2dd4bf' };

                  return (
                    <div key={card.task.id} style={{ position: 'relative', zIndex: 20 }} className="rounded-2xl border border-white/10 bg-slate-800/70 p-4 sm:p-5">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: accent.bg,
                          color: accent.color,
                        }}>
                          <Icon size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '6px' }}>{card.title}</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                              📅 Hạn: {new Date(card.task.deadline).toLocaleDateString('vi-VN')}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${card.statusClass}`}>
                              {card.statusLabel}
                            </span>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(234,179,8,0.1)', color: '#fde047', border: '1px solid rgba(234,179,8,0.2)' }}>
                              +{card.xp} XP
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => openTask(card)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '6px 14px', borderRadius: '8px',
                            background: '#14b8a6', color: 'white',
                            border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 600,
                            flexShrink: 0, zIndex: 99,
                            position: 'relative',
                            textDecoration: 'none',
                          }}
                        >
                          Bắt đầu <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Award size={18} className="text-violet-400" />
                Huy hiệu của bạn
              </h3>
              <span className="text-xs text-slate-400">{userBadges.length}/{ALL_BADGES.length}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="grid grid-cols-5 gap-2">
                {ALL_BADGES.map((badge) => {
                  const unlocked = userBadges.includes(badge.id);
                  return (
                    <div key={badge.id} title={badge.name} className="relative flex flex-col items-center group cursor-default">
                      <div className={`relative w-full aspect-square rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110
                        ${unlocked ? `${badge.color} shadow-lg` : 'bg-slate-700/50 grayscale brightness-50'}`}>
                        <span>{badge.icon}</span>
                        {!unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                            <Lock size={10} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-center text-slate-500 text-[9px] mt-1 leading-tight line-clamp-2 w-full">{badge.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5+6. Leaderboard + Recent sims */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Leaderboard */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              Bảng xếp hạng lớp
            </h3>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 overflow-hidden">
              {CLASSMATES.map((cm) => (
                <div
                  key={cm.rank}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 transition-colors
                    ${cm.isMe ? 'bg-teal-500/10 border-l-2 border-l-teal-400' : 'hover:bg-white/3'}`}
                >
                  <span className="w-6 text-center text-sm font-bold text-slate-400">
                    {RANK_MEDALS[cm.rank] ?? cm.rank}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                    ${cm.isMe ? 'bg-gradient-to-br from-teal-400 to-cyan-600' : 'bg-slate-600'}`}>
                    {cm.avatar}
                  </div>
                  <span className={`flex-1 text-sm font-medium ${cm.isMe ? 'text-teal-300' : 'text-slate-300'}`}>{cm.name}</span>
                  <span className="text-xs text-yellow-400 font-semibold flex items-center gap-1">
                    <Zap size={10} />{cm.xp.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sims */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-cyan-400" />
              Mô phỏng gần đây
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {RECENT_SIMS.map((sim) => (
                <a
                  key={sim.id}
                  href={`/simulations/${sim.id}`}
                  className="group rounded-2xl overflow-hidden border border-white/10 hover:border-teal-500/40 hover:scale-[1.03] transition-all duration-200 no-underline block"
                >
                  <div className="h-24 flex items-center justify-center text-4xl" style={{ background: sim.gradient }}>
                    <span className="opacity-80 group-hover:scale-110 transition-transform duration-300">{sim.emoji}</span>
                  </div>
                  <div className="bg-slate-800/80 px-3 py-2 flex items-center gap-2">
                    <p className="text-xs text-slate-300 font-medium flex-1 line-clamp-1">{sim.name}</p>
                    <ChevronRight size={12} className="text-slate-500 group-hover:text-teal-400 transition-colors flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
