// ─── TeacherDashboard — Trang quản lý giáo viên ───────────────────────────────
import React, { useState } from 'react';
import {
  Users,
  CheckSquare,
  TrendingUp,
  Star,
  BarChart3,
  Brain,
  FileText,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  Download,
  Table,
  CalendarClock,
  Database,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../layouts/AppLayout';
import { supabase } from '../lib/supabase';
import { useLessonStore } from '../store/lessonStore';
import { useAssignmentStore } from '../store/assignmentStore';

// ─── Mock students ────────────────────────────────────────────────────────────
const STUDENTS = [
  { id: 1, name: 'Nguyễn Minh Tuấn', xp: 2100, simsViewed: 11, avgScore: 9.2, status: 'excellent', avatar: 'MT' },
  { id: 2, name: 'Lê Thị Lan Anh',    xp: 1850, simsViewed: 9,  avgScore: 8.8, status: 'good',      avatar: 'LA' },
  { id: 3, name: 'Trần Văn An',        xp: 1250, simsViewed: 6,  avgScore: 7.5, status: 'good',      avatar: 'TA' },
  { id: 4, name: 'Phạm Thu Hương',     xp: 1100, simsViewed: 5,  avgScore: 7.0, status: 'warning',   avatar: 'TH' },
  { id: 5, name: 'Hoàng Đức Nam',      xp: 980,  simsViewed: 4,  avgScore: 6.8, status: 'warning',   avatar: 'HN' },
  { id: 6, name: 'Vũ Thị Mai',         xp: 750,  simsViewed: 3,  avgScore: 6.2, status: 'warning',   avatar: 'VM' },
  { id: 7, name: 'Bùi Quốc Cường',     xp: 420,  simsViewed: 2,  avgScore: 5.5, status: 'danger',    avatar: 'QC' },
  { id: 8, name: 'Trương Thị Hoa',     xp: 200,  simsViewed: 1,  avgScore: 4.0, status: 'danger',    avatar: 'TH' },
] as const;

const SIM_OPTIONS = [
  { id: 'daynight',     label: 'Ngày đêm luân phiên' },
  { id: 'seasons',      label: 'Các mùa trong năm' },
  { id: 'timezone',     label: 'Múi giờ quốc tế' },
  { id: 'windpressure', label: 'Khí áp và gió' },
  { id: 'tide',         label: 'Thủy triều' },
  { id: 'volcano',      label: 'Núi lửa' },
  { id: 'ocean',        label: 'Dòng biển' },
];

const CLASS_OPTIONS = ['10A1', '11B2'];

type Status = 'excellent' | 'good' | 'warning' | 'danger';

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  excellent: { label: 'Xuất sắc',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 size={13} /> },
  good:      { label: 'Tốt',         color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: <CheckCircle2 size={13} /> },
  warning:   { label: 'Cần chú ý',   color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: <AlertTriangle size={13} /> },
  danger:    { label: 'Nguy hiểm',   color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: <XCircle size={13} /> },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lessons } = useLessonStore();
  const { assignTask } = useAssignmentStore();
  
  const [activeTab, setActiveTab] = useState<'10A1' | '11B2'>('10A1');
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedClass, setSelectedClass] = useState('10A1');
  const [deadline, setDeadline] = useState('');

  React.useEffect(() => {
    if (user) {
      useLessonStore.getState().fetchLessons();
    }
  }, [user]);

  // Merge default simulations and user's lessons into one dropdown
  const TASK_OPTIONS = [
    { type: 'group', label: 'Bài giảng của tôi', items: lessons.map(l => ({ id: `lesson_${l.id}`, label: l.title })) },
    { type: 'group', label: 'Mô phỏng 3D', items: SIM_OPTIONS.map(s => ({ id: `sim_${s.id}`, label: s.label })) }
  ];

  const handleAssign = async () => {
    if (!selectedTask) { toast.error('Vui lòng chọn bài giảng/mô phỏng!'); return; }
    if (!deadline) { toast.error('Vui lòng chọn hạn chót!'); return; }
    
    const isLesson = selectedTask.startsWith('lesson_');
    const actualId = selectedTask.split('_')[1];

    await assignTask({
      class_name: selectedClass,
      lesson_id: isLesson ? actualId : null,
      simulation_id: !isLesson ? actualId : null,
      deadline,
    });
  };

  const handleExportExcel = () => {
    const data = STUDENTS.map(stu => ({
      'ID': stu.id,
      'Học sinh': stu.name,
      'XP': stu.xp,
      'Bài đã xem': stu.simsViewed,
      'Điểm TB': stu.avgScore,
      'Trạng thái': STATUS_CONFIG[stu.status as Status].label,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Lop_${activeTab}`);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Danh_sach_lop_${activeTab}.xlsx`);
    toast.success('Đã xuất file Excel thành công!');
  };

  const handleMigrateData = async () => {
    try {
      if (!user) {
        toast.error('Vui lòng đăng nhập trước!');
        return;
      }
      const rawData = localStorage.getItem('geohub-lesson-storage');
      if (!rawData) {
        toast.error('Không tìm thấy dữ liệu cũ trên máy!');
        return;
      }
      const parsed = JSON.parse(rawData);
      const lessons = parsed?.state?.lessons || [];
      if (lessons.length === 0) {
        toast.info('Không có bài giảng nào để đồng bộ.');
        return;
      }

      toast.loading('Đang đẩy dữ liệu lên máy chủ...');
      
      for (const lesson of lessons) {
        // Insert one by one to avoid conflicts
        await supabase.from('lessons').upsert({
          id: lesson.id,
          author_id: user.id,
          title: lesson.title,
          grade: lesson.grade,
          subject: lesson.topic || 'Địa lí',
          content: lesson.blocks || lesson.content,
        });
      }
      
      toast.dismiss();
      toast.success(`Đã đồng bộ thành công ${lessons.length} bài giảng!`);
      // Optional: Clear local storage after successful migration
      // localStorage.removeItem('geohub-lesson-storage');
    } catch (error: any) {
      toast.dismiss();
      toast.error('Lỗi đồng bộ: ' + error.message);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Bao cao lop ${activeTab}`, 14, 15);
    
    const tableColumn = ["ID", "Hoc sinh", "XP", "Bai da xem", "Diem TB", "Trang thai"];
    const tableRows: any[] = [];

    STUDENTS.forEach(stu => {
      tableRows.push([
        stu.id,
        stu.name,
        stu.xp,
        stu.simsViewed,
        stu.avgScore,
        STATUS_CONFIG[stu.status as Status].label
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`Bao_cao_lop_${activeTab}.pdf`);
    toast.success('Đã xuất file PDF thành công!');
  };

  // simple progress bar width for a student (0-100%)
  const progressPct = (s: typeof STUDENTS[number]) => Math.round((s.simsViewed / 14) * 100);

  const QUICK_STATS = [
    { label: 'Lớp học', value: '10A1', sub: '32 học sinh', icon: <Users size={22} className="text-teal-400" />, border: 'border-teal-500/20', grad: 'from-teal-500/40 to-cyan-500/0' },
    { label: 'Nhiệm vụ đã giao', value: '8', sub: 'đang hoạt động', icon: <CheckSquare size={22} className="text-blue-400" />, border: 'border-blue-500/20', grad: 'from-blue-500/40 to-blue-400/0' },
    { label: 'Tỉ lệ hoàn thành', value: '73%', sub: 'trung bình lớp', icon: <TrendingUp size={22} className="text-emerald-400" />, border: 'border-emerald-500/20', grad: 'from-emerald-500/40 to-green-500/0' },
    { label: 'Điểm trung bình', value: '8.4', sub: '/ 10 điểm', icon: <Star size={22} className="text-amber-400" />, border: 'border-amber-500/20', grad: 'from-amber-500/40 to-yellow-500/0' },
  ];

  return (
    <AppLayout title="Quản lý lớp học">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

        {/* Toast is handled globally by Sonner */}

        {/* 1. Welcome + Quick stats */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 via-slate-800/90 to-teal-900/30 p-6 sm:p-8 mb-2">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1">
            Xin chào, {user?.name ?? 'Giáo viên'}! 👩‍🏫
          </h2>
          <p className="text-slate-400 text-sm">Đây là tổng quan lớp học của bạn hôm nay.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {QUICK_STATS.map((s) => (
            <div key={s.label} className={`relative rounded-2xl border ${s.border} bg-slate-800/60 p-4 overflow-hidden hover:scale-[1.02] transition-transform duration-200`}>
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.grad}`} />
              <div className="flex items-start justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium">{s.label}</p>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{s.icon}</div>
              </div>
              <p className="text-white text-2xl font-bold">{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* 2+3. Tabs + Table + Assign panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

          {/* Table side (2/3) */}
          <div className="xl:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex gap-2">
              {CLASS_OPTIONS.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setActiveTab(cls as '10A1' | '11B2')}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                    ${activeTab === cls
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-white/8 hover:border-white/20 hover:text-white'}`}
                >
                  Lớp {cls}
                </button>
              ))}
            </div>

            {/* Student table */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-teal-400" />
                  <span className="text-white font-semibold text-sm">Lớp {activeTab}</span>
                </div>
                <span className="text-xs text-slate-400">{STUDENTS.length} học sinh</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Học sinh</th>
                      <th className="text-right py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">XP</th>
                      <th className="text-center py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Đã xem</th>
                      <th className="text-center py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Tiến độ</th>
                      <th className="text-center py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Điểm TB</th>
                      <th className="text-center py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STUDENTS.map((stu) => {
                      const cfg = STATUS_CONFIG[stu.status as Status];
                      const pct = progressPct(stu);
                      return (
                        <tr key={stu.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/3 transition-colors">
                          <td className="py-3 px-4 text-slate-500 text-xs">{stu.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                {stu.avatar}
                              </div>
                              <span className="text-white text-sm font-medium whitespace-nowrap">{stu.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-yellow-400 font-semibold text-xs">{stu.xp.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-slate-300 text-xs">{stu.simsViewed}</span>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden min-w-[60px]">
                                <div
                                  className={`h-full rounded-full transition-all duration-500
                                    ${stu.status === 'excellent' ? 'bg-emerald-400'
                                      : stu.status === 'good' ? 'bg-blue-400'
                                      : stu.status === 'warning' ? 'bg-amber-400'
                                      : 'bg-red-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-slate-500 text-xs w-7 text-right">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-xs font-semibold ${
                              stu.avgScore >= 8 ? 'text-emerald-400' : stu.avgScore >= 6.5 ? 'text-blue-400' : 'text-red-400'
                            }`}>{stu.avgScore.toFixed(1)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                              {cfg.icon}
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Assign panel (1/3) */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5 space-y-4 sticky top-20">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Send size={16} className="text-teal-400" />
                Giao nhiệm vụ
              </h3>

              {/* Task select */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-medium">Chọn nhiệm vụ (Bài giảng / Mô phỏng)</label>
                <div className="relative">
                  <select
                    id="assign-task"
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full bg-slate-700/50 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-teal-500/50 cursor-pointer"
                  >
                    <option value="" disabled>-- Chọn nội dung --</option>
                    {TASK_OPTIONS.map((group, idx) => (
                      <optgroup key={idx} label={group.label} className="bg-slate-800 text-slate-400 font-bold">
                        {group.items.map(item => (
                          <option key={item.id} value={item.id} className="text-white font-normal">{item.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Class select */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-medium">Chọn lớp</label>
                <div className="relative">
                  <select
                    id="assign-class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-slate-700/50 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-teal-500/50 cursor-pointer"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c} className="bg-slate-800">Lớp {c}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-3 mt-4">
                    <button className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-colors">
                      Thêm Lớp Mới
                    </button>
                    <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-semibold text-sm hover:bg-emerald-500/20 transition-colors flex items-center gap-2">
                      <CalendarClock size={16} /> TKB & Nhiệm vụ
                    </button>
                  </div>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-medium flex items-center gap-1">
                  <CalendarClock size={12} /> Hạn chót
                </label>
                <input
                  id="assign-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-700/50 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500/50 [color-scheme:dark]"
                />
              </div>

              {/* Button */}
              <button
                id="assign-task-btn"
                onClick={handleAssign}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2"
              >
                <Send size={15} />
                📤 Giao nhiệm vụ
              </button>

              {/* Divider */}
              <div className="border-t border-white/5 pt-3">
                <p className="text-slate-500 text-xs text-center">Nhiệm vụ sẽ được gửi đến toàn lớp</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. AI Analysis */}
        <div className="rounded-2xl border border-white/10 bg-slate-800/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-transparent">
            <Brain size={18} className="text-violet-400" />
            <h3 className="text-white font-semibold">🤖 Phân tích AI</h3>
            <span className="ml-auto text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">Tự động</span>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                icon: '🧩',
                title: 'Câu khó nhất',
                value: 'Câu 3 — Lực Coriolis',
                sub: '42% học sinh trả lời sai',
                color: 'border-red-500/20 bg-red-500/5',
                pill: 'text-red-400 bg-red-500/10 border-red-500/20',
              },
              {
                icon: '🙋',
                title: 'Học sinh cần hỗ trợ',
                value: 'Bùi Quốc Cường',
                sub: 'Trương Thị Hoa',
                color: 'border-amber-500/20 bg-amber-500/5',
                pill: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              },
              {
                icon: '📉',
                title: 'Chủ đề yếu',
                value: 'Khí áp và gió',
                sub: 'Thủy triều',
                color: 'border-orange-500/20 bg-orange-500/5',
                pill: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
              },
              {
                icon: '💡',
                title: 'Gợi ý tiết sau',
                value: 'Ôn tập Hoàn lưu',
                sub: 'khí quyển',
                color: 'border-teal-500/20 bg-teal-500/5',
                pill: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
              },
            ].map((card) => (
              <div key={card.title} className={`rounded-xl border p-4 ${card.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{card.icon}</span>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                </div>
                <p className="text-white font-semibold text-sm mb-0.5">{card.value}</p>
                <p className="text-slate-400 text-xs">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Lesson Library */}
        <div className="rounded-2xl border border-white/10 bg-slate-800/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              <h3 className="text-white font-semibold">Thư viện Bài giảng của tôi</h3>
            </div>
            <button
              onClick={() => navigate('/lesson-builder')}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
            >
              + Tạo bài mới
            </button>
          </div>
          <div className="p-5">
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Chưa có bài giảng nào. Hãy bấm "Tạo bài mới" để bắt đầu!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map(lesson => (
                  <div key={lesson.id} className="border border-slate-700 bg-slate-800 rounded-xl p-4 hover:border-slate-500 transition-all duration-200">
                    <h4 className="text-white font-semibold text-base mb-1 truncate" title={lesson.title}>{lesson.title}</h4>
                    <p className="text-slate-400 text-xs mb-4">{lesson.grade} • {lesson.blocks?.length || 0} khối nội dung</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500">{new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString('vi-VN')}</span>
                      <button
                        onClick={() => navigate(`/lesson-builder/${lesson.id}`)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        ✏️ Sửa bài
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 6. Export buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-slate-400 text-sm font-medium">Xuất dữ liệu:</span>
          <button
            id="export-pdf-btn"
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 hover:border-red-400 transition-all duration-150 hover:scale-[1.03]"
          >
            <Download size={15} />
            📥 Xuất PDF
          </button>
          <button
            id="export-excel-btn"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 hover:border-emerald-400 transition-all duration-150 hover:scale-[1.03]"
          >
            <Table size={15} />
            📊 Xuất Excel
          </button>
        </div>

      </div>
    </AppLayout>
  );
}
