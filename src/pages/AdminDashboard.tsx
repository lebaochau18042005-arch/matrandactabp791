// ─── AdminDashboard – Quản trị toàn hệ thống GeoHub LMS ──────────────────────
import React, { useState } from 'react';
import {
  School, Users, GraduationCap, LayoutGrid, Cpu, Activity,
  Edit2, Trash2, UserPlus, FileBarChart, Plus, RefreshCw,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { name: 'Nguyễn Thị Hoài Thư', role: 'teacher', subject: 'Địa lí',  xp: 4500, active: true,  avatar: 'NT' },
  { name: 'Lê Văn Bình',         role: 'teacher', subject: 'Địa lí',  xp: 3200, active: true,  avatar: 'LB' },
  { name: 'Trần Văn An',         role: 'student', class: '10A1',       xp: 1250, active: true,  avatar: 'TA' },
  { name: 'Nguyễn Minh Tuấn',    role: 'student', class: '10A1',       xp: 2100, active: true,  avatar: 'MT' },
  { name: 'Bùi Quốc Cường',      role: 'student', class: '10A1',       xp: 420,  active: false, avatar: 'QC' },
  { name: 'Phạm Thu Hương',      role: 'student', class: '11B2',       xp: 1100, active: true,  avatar: 'TH' },
] as const;

const MOCK_SIMS = [
  { id: 'daynight',      name: 'Ngày đêm luân phiên',   group: '🌍 Trái Đất',  status: 'live',   grade: 10, color: 'from-indigo-700 to-blue-900' },
  { id: 'seasons',       name: 'Các mùa trong năm',     group: '🌍 Trái Đất',  status: 'live',   grade: 10, color: 'from-pink-700 to-rose-900' },
  { id: 'timezone',      name: 'Múi giờ quốc tế',       group: '🌍 Trái Đất',  status: 'live',   grade: 10, color: 'from-cyan-700 to-blue-900' },
  { id: 'atmosphere',    name: 'Hoàn lưu khí quyển',    group: '🌬️ Khí Quyển', status: 'live',   grade: 10, color: 'from-violet-700 to-purple-900' },
  { id: 'windpressure',  name: 'Khí áp và gió',         group: '🌬️ Khí Quyển', status: 'live',   grade: 10, color: 'from-purple-700 to-violet-900' },
  { id: 'volcano',       name: 'Núi lửa',               group: '🗻 Thạch Quyển',status: 'live',   grade: 10, color: 'from-orange-700 to-red-900' },
];

const WEEK_SESSIONS = [145, 198, 167, 234, 209, 247, 312];
const WEEK_DAYS     = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, borderColor, gradFrom }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
  borderColor: string; gradFrom: string;
}) {
  return (
    <div className={`relative rounded-2xl border ${borderColor} bg-slate-800/60 p-5 overflow-hidden hover:scale-[1.02] transition-transform duration-200 cursor-default`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradFrom}`} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-white text-3xl font-black mb-0.5">{value}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const maxSessions = Math.max(...WEEK_SESSIONS);

  return (
    <AppLayout title="⚙️ Quản trị hệ thống">
      <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">

        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-indigo-500/30 border border-indigo-400/30">
            <RefreshCw size={15} className="animate-spin" />
            <span className="font-semibold text-sm">{toastMsg}</span>
          </div>
        )}

        {/* ── Hero banner ────────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 via-slate-800/80 to-indigo-900/40 p-6 sm:p-8">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30">
              🏫
            </div>
            <div>
              <h2 className="text-white text-2xl sm:text-3xl font-black mb-1">
                GeoHub Admin Console
              </h2>
              <p className="text-slate-400 text-sm">Trường THPT Nguyễn Huệ · Năm học 2024–2025</p>
            </div>
            <div className="ml-auto flex gap-2 flex-wrap">
              <button
                onClick={() => showToast('Tính năng đang phát triển...')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm font-semibold hover:bg-teal-500/20 transition-all"
              >
                <UserPlus size={15} /> Tạo tài khoản GV
              </button>
              <button
                onClick={() => showToast('Tính năng đang phát triển...')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold hover:bg-blue-500/20 transition-all"
              >
                <UserPlus size={15} /> Tạo tài khoản HS
              </button>
              <button
                onClick={() => showToast('Tính năng đang phát triển...')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-semibold hover:bg-amber-500/20 transition-all"
              >
                <FileBarChart size={15} /> Xuất báo cáo
              </button>
            </div>
          </div>
        </div>

        {/* ── 1. Stats row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            icon={<School size={20} className="text-teal-400" />}
            label="Trường" value="1"
            sub="THPT Nguyễn Huệ"
            borderColor="border-teal-500/20"
            gradFrom="from-teal-500/50 to-transparent"
          />
          <StatCard
            icon={<Users size={20} className="text-blue-400" />}
            label="Giáo viên" value="12"
            sub="đang hoạt động"
            borderColor="border-blue-500/20"
            gradFrom="from-blue-500/50 to-transparent"
          />
          <StatCard
            icon={<GraduationCap size={20} className="text-emerald-400" />}
            label="Học sinh" value="384"
            sub="toàn trường"
            borderColor="border-emerald-500/20"
            gradFrom="from-emerald-500/50 to-transparent"
          />
          <StatCard
            icon={<LayoutGrid size={20} className="text-violet-400" />}
            label="Lớp" value="16"
            sub="Khối 10, 11, 12"
            borderColor="border-violet-500/20"
            gradFrom="from-violet-500/50 to-transparent"
          />
          <StatCard
            icon={<Cpu size={20} className="text-pink-400" />}
            label="Mô phỏng" value="13 LIVE"
            sub="22 sắp ra mắt"
            borderColor="border-pink-500/20"
            gradFrom="from-pink-500/50 to-transparent"
          />
          <StatCard
            icon={<Activity size={20} className="text-amber-400" />}
            label="Sessions hôm nay" value="247"
            sub="+32% so với hôm qua"
            borderColor="border-amber-500/20"
            gradFrom="from-amber-500/50 to-transparent"
          />
        </div>

        {/* ── 2. User Management + 4. Activity Chart ────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* User management table (2/3) */}
          <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-slate-800/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={17} className="text-indigo-400" />
                <span className="text-white font-bold text-sm">Quản lý người dùng</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold">
                  {MOCK_USERS.length} người
                </span>
              </div>
              <button
                onClick={() => alert('Tính năng đang phát triển')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold hover:bg-teal-500/20 transition-all"
              >
                <Plus size={13} /> Thêm người dùng
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lớp / Môn</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">XP</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_USERS.map((u, i) => (
                    <tr key={i} className="hover:bg-white/3 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                            {u.avatar}
                          </div>
                          <span className="text-slate-200 text-sm font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          u.role === 'teacher'
                            ? 'bg-blue-500/15 text-blue-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}>
                          {u.role === 'teacher' ? '👨‍🏫 GV' : '👨‍🎓 HS'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-400 text-xs">
                          {'subject' in u ? u.subject : u.class}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 text-xs">⚡</span>
                          <span className="text-slate-200 text-xs font-bold">{u.xp.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          u.active
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}>
                          {u.active ? '● Hoạt động' : '○ Không HĐ'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => alert('Tính năng đang phát triển')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => alert('Tính năng đang phát triển')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity chart (1/3) */}
          <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={17} className="text-teal-400" />
              <span className="text-white font-bold text-sm">Sessions 7 ngày qua</span>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-2 h-40 mb-3">
              {WEEK_SESSIONS.map((v, i) => {
                const pct = (v / maxSessions) * 100;
                const isToday = i === WEEK_SESSIONS.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-slate-400 text-xs">{v}</span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-teal-600 to-teal-400'
                          : 'bg-gradient-to-t from-indigo-700 to-indigo-500'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              {WEEK_DAYS.map((d, i) => (
                <div key={i} className="flex-1 text-center text-xs text-slate-500">{d}</div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/8">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-slate-500">Hôm nay</p>
                  <p className="text-teal-400 font-black text-xl">312</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">TB / ngày</p>
                  <p className="text-white font-black text-xl">
                    {Math.round(WEEK_SESSIONS.reduce((a, b) => a + b, 0) / WEEK_SESSIONS.length)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Simulation management ──────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-slate-800/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={17} className="text-pink-400" />
              <span className="text-white font-bold text-sm">Quản lý Mô phỏng</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-semibold">13 LIVE</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 text-xs font-semibold">22 COMING</span>
            </div>
            <button
              onClick={() => alert('Tính năng đang phát triển')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/25 text-pink-300 text-xs font-semibold hover:bg-pink-500/20 transition-all"
            >
              <Plus size={13} /> Thêm mô phỏng
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {MOCK_SIMS.map(sim => (
              <div key={sim.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group">
                {/* Thumbnail */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sim.color} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                  {sim.group.split(' ')[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-bold">{sim.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      sim.status === 'live'
                        ? 'bg-teal-500/15 text-teal-300'
                        : 'bg-orange-500/15 text-orange-300'
                    }`}>
                      {sim.status === 'live' ? '🟢 LIVE' : '🟠 COMING'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{sim.group} · Lớp {sim.grade}</p>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => alert('Tính năng đang phát triển')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => alert('Tính năng đang phát triển')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. Quick Actions ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span>⚡</span> Thao tác nhanh
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => alert('Tính năng đang phát triển')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm font-semibold hover:bg-teal-500/20 active:scale-95 transition-all"
            >
              <UserPlus size={15} /> Tạo tài khoản GV
            </button>
            <button
              onClick={() => alert('Tính năng đang phát triển')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold hover:bg-blue-500/20 active:scale-95 transition-all"
            >
              <UserPlus size={15} /> Tạo tài khoản HS
            </button>
            <button
              onClick={() => alert('Tính năng đang phát triển')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-semibold hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              <FileBarChart size={15} /> Xuất báo cáo toàn trường
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
