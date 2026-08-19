// ─── SimLibraryPage – Thư viện mô phỏng 3D GeoHub LMS ────────────────────────
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Play, Clock, BookOpen, Star, SortAsc } from 'lucide-react';
import { SIMULATIONS, SIM_GROUPS, SimGroup } from '../data/simulations';
import AppLayout from '../layouts/AppLayout';
import confetti from 'canvas-confetti';

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusFilter     = 'all' | 'live' | 'coming';
type GradeFilter      = 'all' | 10 | 11 | 12;
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
type SortMode         = 'recommended' | 'duration' | 'difficulty' | 'name';

const GROUP_TABS: Array<{ id: 'all' | SimGroup; label: string; emoji: string }> = [
  { id: 'all',        label: 'Tất cả',       emoji: '🌐' },
  { id: 'earth',      label: 'Trái Đất',     emoji: '🌍' },
  { id: 'atmosphere', label: 'Khí Quyển',    emoji: '🌬️' },
  { id: 'hydro',      label: 'Thủy Quyển',   emoji: '🌊' },
  { id: 'litho',      label: 'Thạch Quyển',  emoji: '🗻' },
  { id: 'vietnam',    label: 'Việt Nam',      emoji: '🇻🇳' },
];

const DIFF_LABELS: Record<string, { label: string; color: string }> = {
  easy:   { label: 'Dễ',  color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  medium: { label: 'TB',  color: 'text-amber-400   bg-amber-500/15   border-amber-500/30'   },
  hard:   { label: 'Khó', color: 'text-red-400     bg-red-500/15     border-red-500/30'      },
};

const SORT_OPTIONS: Array<{ id: SortMode; label: string }> = [
  { id: 'recommended', label: 'Đề xuất' },
  { id: 'duration', label: 'Thời lượng ngắn' },
  { id: 'difficulty', label: 'Dễ đến khó' },
  { id: 'name', label: 'Tên A-Z' },
];

const normalizeSearch = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

// ─── Simulation Card ──────────────────────────────────────────────────────────
function SimCard({ sim, onAction, isFavorite, onToggleFavorite }: {
  sim: typeof SIMULATIONS[number];
  onAction: (sim: typeof SIMULATIONS[number]) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const diff  = DIFF_LABELS[sim.difficulty];
  const isLive = sim.status === 'live';

  return (
    <div className="group relative rounded-2xl border border-white/8 bg-slate-800/60 overflow-hidden hover:border-white/20 hover:scale-[1.015] transition-all duration-250 flex flex-col">

      {/* Thumbnail */}
      <div
        className="relative h-36 flex items-center justify-center text-5xl overflow-hidden"
        style={{ background: sim.gradient }}
      >
        <span className="drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
          {sim.groupEmoji}
        </span>

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider ${
            isLive
              ? 'bg-teal-500/90 text-white shadow-lg shadow-teal-500/40'
              : 'bg-orange-500/90 text-white shadow-lg shadow-orange-500/30'
          }`}>
            {isLive ? '● LIVE' : '○ COMING'}
          </span>
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${diff.color}`}>
            {diff.label}
          </span>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(sim.id);
          }}
          aria-label={isFavorite ? `Bỏ yêu thích ${sim.name}` : `Yêu thích ${sim.name}`}
          className={`absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full border backdrop-blur flex items-center justify-center transition-all ${
            isFavorite
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30'
              : 'bg-slate-950/45 text-white/80 border-white/15 hover:bg-slate-950/70 hover:text-amber-300'
          }`}
        >
          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Dim overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4 gap-2">
        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-teal-300 transition-colors">
          {sim.name}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 flex-1">
          {sim.description}
        </p>

        {/* Metadata row */}
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {sim.grades.map(g => (
            <span key={g} className="px-2 py-0.5 rounded-md bg-indigo-500/12 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              Lớp {g}
            </span>
          ))}
          {sim.lessonRef && (
            <div className="flex items-center gap-1 text-slate-500">
              <BookOpen size={11} />
              <span className="text-xs">{sim.lessonRef}</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto text-slate-500">
            <Clock size={11} />
            <span className="text-xs">{sim.durationMin} phút</span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => onAction(sim)}
          className={`w-full mt-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
            isLive
              ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-500 hover:to-teal-400 shadow-lg shadow-teal-500/25'
              : 'bg-slate-700/60 text-slate-400 hover:bg-slate-700 border border-white/8'
          }`}
        >
          {isLive
            ? <><Play size={12} fill="currentColor" /> Xem mô phỏng</>
            : <>🔒 Xem trước</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ emoji, label, count }: { emoji: string; label: string; count: number }) {
  const colorMap: Record<SimGroup, string> = {
    earth:      'border-blue-500/30 bg-blue-500/8',
    atmosphere: 'border-purple-500/30 bg-purple-500/8',
    hydro:      'border-cyan-500/30 bg-cyan-500/8',
    litho:      'border-amber-500/30 bg-amber-500/8',
    vietnam:    'border-red-500/30 bg-red-500/8',
  };
  const cls = colorMap[label.toLowerCase().replace(' ', '') as SimGroup] ?? 'border-white/10 bg-white/5';

  return (
    <div className={`flex items-center gap-3 rounded-xl border ${cls} px-4 py-3 mb-4`}>
      <span className="text-2xl">{emoji}</span>
      <span className="text-white font-black text-base">{label}</span>
      <span className="ml-auto text-slate-500 text-xs font-semibold">{count} mô phỏng</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SimLibraryPage() {
  const navigate = useNavigate();

  const [query,           setQuery]           = useState('');
  const [activeGroup,     setActiveGroup]     = useState<'all' | SimGroup>('all');
  const [activeStatus,    setActiveStatus]    = useState<StatusFilter>('all');
  const [activeGrade,     setActiveGrade]     = useState<GradeFilter>('all');
  const [activeDifficulty,setActiveDifficulty]= useState<DifficultyFilter>('all');
  const [sortMode,        setSortMode]        = useState<SortMode>('recommended');
  const [favoritesOnly,   setFavoritesOnly]   = useState(false);
  const [favoriteIds,     setFavoriteIds]     = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('geohub_favorite_sims');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  // ── Confetti effect when all unlocked ───────────────────────────────────────
  React.useEffect(() => {
    const comingCount = SIMULATIONS.filter(s => s.status === 'coming').length;
    if (comingCount === 0) {
      const hasCelebrated = localStorage.getItem('geohub_all_unlocked');
      if (!hasCelebrated) {
        localStorage.setItem('geohub_all_unlocked', 'true');
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('geohub_favorite_sims', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]
    );
  };

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim());
    const difficultyRank = { easy: 1, medium: 2, hard: 3 };

    return SIMULATIONS.filter(sim => {
      const searchText = normalizeSearch(`${sim.name} ${sim.description} ${sim.lessonRef ?? ''} ${sim.keywords.join(' ')}`);
      if (q && !searchText.includes(q)) return false;
      if (favoritesOnly && !favoriteSet.has(sim.id)) return false;
      if (activeGroup  !== 'all' && sim.group !== activeGroup)     return false;
      if (activeStatus !== 'all' && sim.status !== activeStatus)   return false;
      if (activeGrade  !== 'all' && !sim.grades.includes(activeGrade as number)) return false;
      if (activeDifficulty !== 'all' && sim.difficulty !== activeDifficulty) return false;
      return true;
    }).sort((a, b) => {
      if (sortMode === 'duration') return a.durationMin - b.durationMin || a.name.localeCompare(b.name, 'vi');
      if (sortMode === 'difficulty') return difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.name.localeCompare(b.name, 'vi');
      if (sortMode === 'name') return a.name.localeCompare(b.name, 'vi');

      const favoriteDelta = Number(favoriteSet.has(b.id)) - Number(favoriteSet.has(a.id));
      if (favoriteDelta) return favoriteDelta;

      const statusDelta = Number(b.status === 'live') - Number(a.status === 'live');
      return statusDelta || a.name.localeCompare(b.name, 'vi');
    });
  }, [query, favoritesOnly, favoriteSet, activeGroup, activeStatus, activeGrade, activeDifficulty, sortMode]);

  // ── Group filtered results ──────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups: Array<{ group: SimGroup; label: string; emoji: string; sims: typeof SIMULATIONS }> = [];
    const groupOrder: SimGroup[] = ['earth', 'atmosphere', 'hydro', 'litho', 'vietnam'];
    for (const gid of groupOrder) {
      const sims = filtered.filter(s => s.group === gid);
      if (sims.length) {
        const meta = SIM_GROUPS[gid];
        groups.push({ group: gid, label: meta.label, emoji: meta.emoji, sims });
      }
    }
    return groups;
  }, [filtered]);

  // ── Handle sim click ────────────────────────────────────────────────────────
  const handleAction = (sim: typeof SIMULATIONS[number]) => {
    if (sim.status === 'live') {
      navigate(`/simulations/${sim.id}`);
    } else {
      alert('🚀 Sắp ra mắt! Mô phỏng này đang được phát triển.');
    }
  };

  const liveCount   = SIMULATIONS.filter(s => s.status === 'live').length;
  const comingCount = SIMULATIONS.filter(s => s.status === 'coming').length;
  const favoriteCount = favoriteIds.length;

  return (
    <AppLayout title="🎨 Thư viện Mô phỏng 3D">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 via-slate-800/80 to-teal-900/30 p-6 sm:p-8">
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

          <h1 className="text-white text-2xl sm:text-3xl font-black mb-1.5">🎨 Thư viện Mô phỏng 3D</h1>
          <p className="text-slate-400 text-sm mb-5">
            {SIMULATIONS.length} mô phỏng · {Object.keys(SIM_GROUPS).length} chủ đề · Lớp 10–12
            <span className="ml-3 text-teal-400 font-semibold">{liveCount} LIVE</span>
            <span className="mx-1 text-slate-600">·</span>
            {comingCount > 0 ? (
                <span className="text-orange-400 font-semibold">{comingCount} sắp ra mắt</span>
            ) : (
                <span className="text-pink-400 font-bold tracking-wider animate-pulse">🎉 100% HOÀN TẤT</span>
            )}
            {favoriteCount > 0 && (
              <>
                <span className="mx-1 text-slate-600">·</span>
                <span className="text-amber-300 font-semibold">{favoriteCount} đã ghim</span>
              </>
            )}
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm mô phỏng... (ngày đêm, khí áp, thủy triều...)"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/70 border border-white/10 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500/50 focus:bg-slate-900 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >✕</button>
            )}
          </div>
        </div>

        {/* ── Filter row ───────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Group tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {GROUP_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveGroup(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-150 ${
                  activeGroup === tab.id
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-slate-800/60 text-slate-400 border-white/8 hover:border-white/20 hover:text-white'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter size={13} className="text-slate-600" />

            {/* Status */}
            {(['all', 'live', 'coming'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeStatus === s
                    ? s === 'live' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                      : s === 'coming' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      : 'bg-slate-600/40 text-slate-300 border-white/20'
                    : 'bg-slate-800/40 text-slate-500 border-white/6 hover:text-slate-300'
                }`}
              >
                {s === 'all' ? 'Tất cả' : s === 'live' ? '🟢 LIVE' : '🟠 COMING'}
              </button>
            ))}

            <div className="w-px h-5 bg-white/10" />

            {/* Grade */}
            {(['all', 10, 11, 12] as GradeFilter[]).map(g => (
              <button
                key={g}
                onClick={() => setActiveGrade(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeGrade === g
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-800/40 text-slate-500 border-white/6 hover:text-slate-300'
                }`}
              >
                {g === 'all' ? 'Tất cả lớp' : `Lớp ${g}`}
              </button>
            ))}

            <div className="w-px h-5 bg-white/10" />

            {/* Difficulty */}
            {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map(d => (
              <button
                key={d}
                onClick={() => setActiveDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeDifficulty === d
                    ? d === 'easy' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : d === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : d === 'hard' ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-slate-600/40 text-slate-300 border-white/20'
                    : 'bg-slate-800/40 text-slate-500 border-white/6 hover:text-slate-300'
                }`}
              >
                {d === 'all' ? 'Tất cả mức' : DIFF_LABELS[d]?.label ?? d}
              </button>
            ))}

            <div className="w-px h-5 bg-white/10" />

            <button
              onClick={() => setFavoritesOnly(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                favoritesOnly
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/35'
                  : 'bg-slate-800/40 text-slate-500 border-white/6 hover:text-amber-300'
              }`}
            >
              <Star size={12} fill={favoritesOnly ? 'currentColor' : 'none'} />
              Đã ghim
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-white/6 text-slate-500 text-xs font-semibold">
              <SortAsc size={12} />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-transparent text-slate-300 focus:outline-none [color-scheme:dark]"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>

            {/* Result count */}
            <div className="ml-auto text-slate-500 text-xs">
              {filtered.length} kết quả
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-400 font-semibold">Không tìm thấy mô phỏng nào</p>
            <p className="text-slate-600 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setQuery('');
                setActiveGroup('all');
                setActiveStatus('all');
                setActiveGrade('all');
                setActiveDifficulty('all');
                setFavoritesOnly(false);
                setSortMode('recommended');
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm font-semibold hover:bg-teal-500/20 transition-all"
            >
              Xoá bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ group, label, emoji, sims }) => (
              <section key={group}>
                <SectionHeader emoji={emoji} label={label} count={sims.length} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sims.map(sim => (
                    <SimCard
                      key={sim.id}
                      sim={sim}
                      onAction={handleAction}
                      isFavorite={favoriteSet.has(sim.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
