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
  Filter,
  Search,
  Upload,
  Link2,
  Copy,
  Edit2,
  BookOpen,
  ClipboardList,
  PenLine,
  HelpCircle,
  Video,
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
import { useAssignmentStore, type AssignmentTaskType } from '../store/assignmentStore';
import { useQuizStore } from '../store/quizStore';
import {
  GOOGLE_SHEET_APPS_SCRIPT_SAMPLE,
  getGoogleSheetSettings,
  getSavedRosters,
  importRosterFromGoogleSheet,
  parseRosterFile,
  saveGoogleSheetSettings,
  saveRoster,
  syncResultToGoogleSheet,
  type ImportedStudent,
} from '../lib/googleSheetSync';

type Status = 'excellent' | 'good' | 'warning' | 'danger';
type ClassName = string;
type SortMode = 'risk' | 'score' | 'xp' | 'name';
type Student = ImportedStudent;

// ─── Mock students ────────────────────────────────────────────────────────────
const STUDENTS: Student[] = [
  { id: 1, name: 'Nguyễn Minh Tuấn', xp: 2100, simsViewed: 11, avgScore: 9.2, status: 'excellent', avatar: 'MT' },
  { id: 2, name: 'Lê Thị Lan Anh',    xp: 1850, simsViewed: 9,  avgScore: 8.8, status: 'good',      avatar: 'LA' },
  { id: 3, name: 'Trần Văn An',        xp: 1250, simsViewed: 6,  avgScore: 7.5, status: 'good',      avatar: 'TA' },
  { id: 4, name: 'Phạm Thu Hương',     xp: 1100, simsViewed: 5,  avgScore: 7.0, status: 'warning',   avatar: 'TH' },
  { id: 5, name: 'Hoàng Đức Nam',      xp: 980,  simsViewed: 4,  avgScore: 6.8, status: 'warning',   avatar: 'HN' },
  { id: 6, name: 'Vũ Thị Mai',         xp: 750,  simsViewed: 3,  avgScore: 6.2, status: 'warning',   avatar: 'VM' },
  { id: 7, name: 'Bùi Quốc Cường',     xp: 420,  simsViewed: 2,  avgScore: 5.5, status: 'danger',    avatar: 'QC' },
  { id: 8, name: 'Trương Thị Hoa',     xp: 200,  simsViewed: 1,  avgScore: 4.0, status: 'danger',    avatar: 'TH' },
];

const SIM_OPTIONS = [
  { id: 'daynight',     label: 'Ngày đêm luân phiên' },
  { id: 'seasons',      label: 'Các mùa trong năm' },
  { id: 'timezone',     label: 'Múi giờ quốc tế' },
  { id: 'windpressure', label: 'Khí áp và gió' },
  { id: 'tide',         label: 'Thủy triều' },
  { id: 'volcano',      label: 'Núi lửa' },
  { id: 'ocean',        label: 'Dòng biển' },
];

const DEFAULT_CLASS_OPTIONS: ClassName[] = ['10A1', '11B2'];

const CLASS_STUDENTS: Record<string, Student[]> = {
  '10A1': STUDENTS,
  '11B2': STUDENTS.map((student, index) => {
    const avgScore = Number(Math.max(4, student.avgScore - 0.35 + (index % 2) * 0.2).toFixed(1));
    const status: Status =
      avgScore >= 8.5 ? 'excellent' :
      avgScore >= 7 ? 'good' :
      avgScore >= 6 ? 'warning' :
      'danger';

    return {
      ...student,
      xp: Math.max(180, student.xp - 140 + index * 30),
      simsViewed: Math.max(1, student.simsViewed - (index % 3)),
      avgScore,
      status,
    };
  }),
};

const STATUS_FILTERS: Array<{ id: 'all' | Status; label: string }> = [
  { id: 'all', label: 'Tất cả trạng thái' },
  { id: 'excellent', label: 'Xuất sắc' },
  { id: 'good', label: 'Tốt' },
  { id: 'warning', label: 'Cần chú ý' },
  { id: 'danger', label: 'Nguy hiểm' },
];

const SORT_OPTIONS: Array<{ id: SortMode; label: string }> = [
  { id: 'risk', label: 'Ưu tiên hỗ trợ' },
  { id: 'score', label: 'Điểm cao trước' },
  { id: 'xp', label: 'XP cao trước' },
  { id: 'name', label: 'Tên A-Z' },
];

const ASSIGNMENT_TYPE_OPTIONS: Array<{ id: AssignmentTaskType; label: string; hint: string }> = [
  { id: 'simulation', label: 'Mô phỏng', hint: 'Tương tác 3D' },
  { id: 'quiz', label: 'Quiz', hint: 'Bài kiểm tra' },
  { id: 'lesson', label: 'Bài giảng', hint: 'Xem trực tuyến' },
  { id: 'worksheet', label: 'Phiếu học tập', hint: 'Trả lời theo yêu cầu' },
  { id: 'essay', label: 'Tự luận', hint: 'Bài viết dài' },
];

const DEFAULT_POINTS: Record<AssignmentTaskType, number> = {
  simulation: 30,
  quiz: 100,
  lesson: 50,
  worksheet: 70,
  essay: 100,
};

const normalizeSearch = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

const progressPct = (s: Student) => Math.round((s.simsViewed / 14) * 100);

const readClassOptions = (): ClassName[] => {
  try {
    const saved = localStorage.getItem('geohub_class_names');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) && parsed.length ? Array.from(new Set(parsed)) : DEFAULT_CLASS_OPTIONS;
  } catch {
    return DEFAULT_CLASS_OPTIONS;
  }
};

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
  const { generatedQuizzes } = useQuizStore();
  
  const [activeTab, setActiveTab] = useState<ClassName>(() => readClassOptions()[0] ?? '10A1');
  const [selectedTaskType, setSelectedTaskType] = useState<AssignmentTaskType>('simulation');
  const [selectedTask, setSelectedTask] = useState('');
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskDescription, setCustomTaskDescription] = useState('');
  const [taskPoints, setTaskPoints] = useState(DEFAULT_POINTS.simulation);
  const [selectedClass, setSelectedClass] = useState<ClassName>(() => readClassOptions()[0] ?? '10A1');
  const [deadline, setDeadline] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [sortMode, setSortMode] = useState<SortMode>('risk');
  const [classOptions, setClassOptions] = useState<ClassName[]>(() => readClassOptions());
  const [classRosters, setClassRosters] = useState<Record<string, Student[]>>(() => getSavedRosters());
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importingRoster, setImportingRoster] = useState(false);
  const [sheetSettings, setSheetSettings] = useState(() => getGoogleSheetSettings());

  React.useEffect(() => {
    if (user) {
      useLessonStore.getState().fetchLessons();
    }
  }, [user]);

  const quizzes = React.useMemo(() => Object.values(generatedQuizzes), [generatedQuizzes]);
  const contentOptions = React.useMemo(() => {
    if (selectedTaskType === 'lesson') {
      return lessons.map(lesson => ({ id: lesson.id, label: lesson.title }));
    }
    if (selectedTaskType === 'quiz') {
      return quizzes.map(quiz => ({ id: quiz.id, label: quiz.title }));
    }
    if (selectedTaskType === 'simulation') {
      return SIM_OPTIONS.map(sim => ({ id: sim.id, label: sim.label }));
    }
    return [];
  }, [lessons, quizzes, selectedTaskType]);
  const currentTaskType = ASSIGNMENT_TYPE_OPTIONS.find(option => option.id === selectedTaskType);
  const selectedContent = contentOptions.find(option => option.id === selectedTask);

  const changeTaskType = (taskType: AssignmentTaskType) => {
    setSelectedTaskType(taskType);
    setSelectedTask('');
    setTaskPoints(DEFAULT_POINTS[taskType]);
  };

  const activeStudents = classRosters[activeTab] ?? CLASS_STUDENTS[activeTab] ?? [];
  const filteredStudents = React.useMemo(() => {
    const q = normalizeSearch(studentQuery.trim());
    const riskRank: Record<Status, number> = { danger: 0, warning: 1, good: 2, excellent: 3 };

    return activeStudents
      .filter((student) => {
        const matchesQuery = !q || normalizeSearch(`${student.name} ${student.avatar}`).includes(q);
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortMode === 'risk') return riskRank[a.status] - riskRank[b.status] || a.avgScore - b.avgScore;
        if (sortMode === 'score') return b.avgScore - a.avgScore;
        if (sortMode === 'xp') return b.xp - a.xp;
        return a.name.localeCompare(b.name, 'vi');
      });
  }, [activeStudents, studentQuery, statusFilter, sortMode]);

  const averageScore = activeStudents.length
    ? activeStudents.reduce((sum, student) => sum + student.avgScore, 0) / activeStudents.length
    : 0;
  const completionRate = activeStudents.length
    ? Math.round(activeStudents.reduce((sum, student) => sum + progressPct(student), 0) / activeStudents.length)
    : 0;
  const attentionStudents = activeStudents
    .filter((student) => student.status === 'warning' || student.status === 'danger')
    .sort((a, b) => a.avgScore - b.avgScore);

  const persistClassOptions = (options: ClassName[]) => {
    const cleaned = Array.from(new Set(options.map(option => option.trim()).filter(Boolean)));
    localStorage.setItem('geohub_class_names', JSON.stringify(cleaned));
    return cleaned;
  };

  const applyRoster = (students: Student[], className = activeTab) => {
    if (!students.length) {
      toast.error('Không tìm thấy học sinh hợp lệ trong danh sách.');
      return;
    }

    saveRoster(className, students);
    setClassRosters((current) => ({ ...current, [className]: students }));
    setClassOptions((current) => persistClassOptions([...current, className]));
    setActiveTab(className);
    setSelectedClass(className);
    setStudentQuery('');
    setStatusFilter('all');
    toast.success(`Đã nhập ${students.length} học sinh cho lớp ${className}.`);
  };

  const handleRenameClass = (oldName: ClassName) => {
    const newName = window.prompt('Nhập tên lớp mới', oldName)?.trim();
    if (!newName || newName === oldName) return;
    if (classOptions.some(cls => cls !== oldName && cls.toLowerCase() === newName.toLowerCase())) {
      toast.error('Tên lớp này đã tồn tại.');
      return;
    }

    setClassOptions((current) => persistClassOptions(current.map(cls => cls === oldName ? newName : cls)));
    setClassRosters((current) => {
      const next = { ...current };
      const roster = current[oldName] ?? CLASS_STUDENTS[oldName];
      delete next[oldName];
      if (roster) next[newName] = roster;
      localStorage.setItem('geohub_class_rosters', JSON.stringify(next));
      return next;
    });

    if (activeTab === oldName) setActiveTab(newName);
    if (selectedClass === oldName) setSelectedClass(newName);
    toast.success(`Đã đổi tên lớp ${oldName} thành ${newName}.`);
  };

  const handleRosterFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportingRoster(true);
      const students = await parseRosterFile(file);
      applyRoster(students);
    } catch (error: any) {
      toast.error(error?.message || 'Không nhập được danh sách lớp.');
    } finally {
      setImportingRoster(false);
      event.target.value = '';
    }
  };

  const handleGoogleRosterImport = async () => {
    if (!sheetSettings.rosterSheetUrl.trim()) {
      toast.error('Vui lòng nhập link Google Sheet danh sách lớp.');
      return;
    }

    try {
      setImportingRoster(true);
      const students = await importRosterFromGoogleSheet(sheetSettings.rosterSheetUrl);
      saveGoogleSheetSettings(sheetSettings);
      applyRoster(students);
    } catch (error: any) {
      toast.error(error?.message || 'Không đọc được Google Sheet.');
    } finally {
      setImportingRoster(false);
    }
  };

  const handleSaveGoogleSheetSettings = () => {
    saveGoogleSheetSettings(sheetSettings);
    toast.success('Đã lưu kết nối Google Sheet.');
  };

  const handleCopyAppsScript = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_SHEET_APPS_SCRIPT_SAMPLE);
      toast.success('Đã sao chép Apps Script mẫu.');
    } catch {
      toast.info('Không sao chép tự động được, hãy thử lại trong trình duyệt.');
    }
  };

  const handleTestGoogleSheetSync = async () => {
    try {
      saveGoogleSheetSettings(sheetSettings);
      const synced = await syncResultToGoogleSheet({
        event: 'student_completed',
        completed_at: new Date().toISOString(),
        class_name: activeTab,
        student_name: activeStudents[0]?.name ?? 'Học sinh mẫu',
        activity_type: 'assignment',
        activity_title: 'Dòng kiểm tra kết nối GeoHub',
        score: 100,
        score_label: '100%',
        source: 'GeoHub',
      });

      if (!synced) {
        toast.error('Hãy bật đồng bộ và nhập Apps Script Web App URL.');
        return;
      }

      setSheetSettings(getGoogleSheetSettings());
      toast.success('Đã gửi dòng kiểm tra sang Google Sheet.');
    } catch (error: any) {
      toast.error(error?.message || 'Không gửi được dữ liệu sang Google Sheet.');
    }
  };

  const handleAssign = async () => {
    if (!deadline) { toast.error('Vui lòng chọn hạn chót!'); return; }

    const needsExistingContent = selectedTaskType === 'simulation' || selectedTaskType === 'lesson' || selectedTaskType === 'quiz';
    if (needsExistingContent && !selectedTask) {
      toast.error(`Vui lòng chọn ${currentTaskType?.label.toLowerCase() || 'nội dung'} để giao.`);
      return;
    }

    const customTitle = customTaskTitle.trim();
    const customDescription = customTaskDescription.trim();
    if ((selectedTaskType === 'worksheet' || selectedTaskType === 'essay') && !customTitle) {
      toast.error('Vui lòng nhập tên nhiệm vụ.');
      return;
    }
    if ((selectedTaskType === 'worksheet' || selectedTaskType === 'essay') && !customDescription) {
      toast.error('Vui lòng nhập yêu cầu cho học sinh.');
      return;
    }

    const title = needsExistingContent
      ? selectedContent?.label || currentTaskType?.label || 'Nhiệm vụ GeoHub'
      : customTitle;
    const description = needsExistingContent
      ? `Hoàn thành ${currentTaskType?.label.toLowerCase()} được giao trong GeoHub.`
      : customDescription;

    await assignTask({
      class_name: selectedClass,
      task_type: selectedTaskType,
      title,
      description,
      points: taskPoints,
      submission_type:
        selectedTaskType === 'lesson' ? 'view' :
        selectedTaskType === 'worksheet' || selectedTaskType === 'essay' ? 'text' :
        'auto',
      lesson_id: selectedTaskType === 'lesson' ? selectedTask : null,
      simulation_id: selectedTaskType === 'simulation' ? selectedTask : null,
      quiz_id: selectedTaskType === 'quiz' ? selectedTask : null,
      deadline,
    });

    setSelectedTask('');
    if (selectedTaskType === 'worksheet' || selectedTaskType === 'essay') {
      setCustomTaskTitle('');
      setCustomTaskDescription('');
    }
  };

  const handleExportExcel = () => {
    const data = filteredStudents.map(stu => ({
      'ID': stu.id,
      'Học sinh': stu.name,
      'XP': stu.xp,
      'Bài đã xem': stu.simsViewed,
      'Điểm TB': stu.avgScore,
      'Trạng thái': STATUS_CONFIG[stu.status].label,
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

    filteredStudents.forEach(stu => {
      tableRows.push([
        stu.id,
        stu.name,
        stu.xp,
        stu.simsViewed,
        stu.avgScore,
        STATUS_CONFIG[stu.status].label
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

  const QUICK_STATS = [
    { label: 'Lớp học', value: activeTab, sub: `${activeStudents.length} học sinh`, icon: <Users size={22} className="text-teal-400" />, border: 'border-teal-500/20', grad: 'from-teal-500/40 to-cyan-500/0' },
    { label: 'Nhiệm vụ đã giao', value: String(8 + lessons.length), sub: 'đang hoạt động', icon: <CheckSquare size={22} className="text-blue-400" />, border: 'border-blue-500/20', grad: 'from-blue-500/40 to-blue-400/0' },
    { label: 'Tỉ lệ hoàn thành', value: `${completionRate}%`, sub: `Điểm TB ${averageScore.toFixed(1)}/10`, icon: <TrendingUp size={22} className="text-emerald-400" />, border: 'border-emerald-500/20', grad: 'from-emerald-500/40 to-green-500/0' },
    { label: 'Cần hỗ trợ', value: String(attentionStudents.length), sub: attentionStudents[0]?.name ?? 'Lớp ổn định', icon: <Star size={22} className="text-amber-400" />, border: 'border-amber-500/20', grad: 'from-amber-500/40 to-yellow-500/0' },
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex gap-2 flex-wrap">
                {classOptions.map((cls) => (
                  <div
                    key={cls}
                    className={`flex items-center rounded-xl text-sm font-semibold border transition-all duration-150 overflow-hidden
                      ${activeTab === cls
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        : 'bg-slate-800/60 text-slate-400 border-white/8 hover:border-white/20 hover:text-white'}`}
                  >
                    <button
                      onClick={() => {
                        setActiveTab(cls);
                        setSelectedClass(cls);
                        setStudentQuery('');
                        setStatusFilter('all');
                      }}
                      className="px-4 py-2 text-left"
                    >
                      Lớp {cls}
                    </button>
                    <button
                      onClick={() => handleRenameClass(cls)}
                      title={`Sửa tên lớp ${cls}`}
                      aria-label={`Sửa tên lớp ${cls}`}
                      className={`px-2.5 py-2 border-l transition-colors ${
                        activeTab === cls
                          ? 'border-teal-500/30 hover:bg-teal-500/20'
                          : 'border-white/8 hover:bg-white/8'
                      }`}
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setIsImportOpen(v => !v)}
                className="px-4 py-2 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/30 text-sm font-bold hover:bg-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Upload size={16} /> Nhập danh sách lớp
              </button>
            </div>

            {isImportOpen && (
              <div className="rounded-2xl border border-blue-500/20 bg-slate-800/70 p-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Upload size={16} className="text-blue-400" />
                      <h3 className="text-white font-semibold text-sm">Nhập danh sách lớp {activeTab}</h3>
                    </div>
                    <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-slate-950/50 px-4 py-5 text-slate-300 text-sm font-semibold cursor-pointer hover:border-blue-500/40 hover:text-blue-300 transition-all">
                      <Upload size={16} />
                      Chọn file CSV/XLSX
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={handleRosterFileImport}
                      />
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={sheetSettings.rosterSheetUrl}
                        onChange={(e) => setSheetSettings({ ...sheetSettings, rosterSheetUrl: e.target.value })}
                        placeholder="Link Google Sheet danh sách lớp"
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                      <button
                        onClick={handleGoogleRosterImport}
                        disabled={importingRoster}
                        className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2"
                      >
                        <Link2 size={15} /> Nhập
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Database size={16} className="text-emerald-400" />
                        <h3 className="text-white font-semibold text-sm">Google Sheet nhận kết quả</h3>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={sheetSettings.enabled}
                          onChange={(e) => setSheetSettings({ ...sheetSettings, enabled: e.target.checked })}
                          className="accent-emerald-500"
                        />
                        Bật đồng bộ
                      </label>
                    </div>
                    <input
                      value={sheetSettings.webhookUrl}
                      onChange={(e) => setSheetSettings({ ...sheetSettings, webhookUrl: e.target.value })}
                      placeholder="Apps Script Web App URL"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={handleSaveGoogleSheetSettings}
                        className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/25 transition-all"
                      >
                        Lưu kết nối
                      </button>
                      <button
                        onClick={handleTestGoogleSheetSync}
                        className="px-3 py-2 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-bold hover:bg-teal-500/25 transition-all"
                      >
                        Gửi thử
                      </button>
                      <button
                        onClick={handleCopyAppsScript}
                        className="px-3 py-2 rounded-xl bg-slate-950 text-slate-300 border border-white/10 text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1"
                      >
                        <Copy size={13} /> Script mẫu
                      </button>
                    </div>
                    {sheetSettings.lastSyncAt && (
                      <p className="text-[11px] text-slate-500">
                        Gửi gần nhất: {new Date(sheetSettings.lastSyncAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Student table */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-teal-400" />
                    <span className="text-white font-semibold text-sm">Lớp {activeTab}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {filteredStudents.length}/{activeStudents.length} học sinh
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_170px] gap-2">
                  <label className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      value={studentQuery}
                      onChange={(e) => setStudentQuery(e.target.value)}
                      placeholder="Tìm học sinh..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/55 border border-white/10 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500/50"
                    />
                  </label>

                  <label className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | Status)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/55 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-teal-500/50 [color-scheme:dark]"
                    >
                      {STATUS_FILTERS.map((status) => (
                        <option key={status.id} value={status.id}>{status.label}</option>
                      ))}
                    </select>
                  </label>

                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/55 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-teal-500/50 [color-scheme:dark]"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
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
                    {filteredStudents.map((stu) => {
                      const cfg = STATUS_CONFIG[stu.status];
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
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 px-4 text-center">
                          <p className="text-slate-400 text-sm font-semibold">Không có học sinh phù hợp</p>
                          <button
                            onClick={() => {
                              setStudentQuery('');
                              setStatusFilter('all');
                            }}
                            className="mt-3 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold hover:bg-teal-500/20 transition-all"
                          >
                            Xoá bộ lọc
                          </button>
                        </td>
                      </tr>
                    )}
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

              {/* Task type */}
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-medium">Loại nhiệm vụ</label>
                <div className="grid grid-cols-2 gap-2">
                  {ASSIGNMENT_TYPE_OPTIONS.map((option) => {
                    const Icon =
                      option.id === 'simulation' ? Video :
                      option.id === 'quiz' ? HelpCircle :
                      option.id === 'lesson' ? BookOpen :
                      option.id === 'worksheet' ? ClipboardList :
                      PenLine;
                    const active = selectedTaskType === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => changeTaskType(option.id)}
                        className={`min-h-[70px] rounded-xl border p-3 text-left transition-all ${
                          active
                            ? 'border-teal-500/45 bg-teal-500/15 text-teal-200'
                            : 'border-white/10 bg-slate-900/45 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <Icon size={15} />
                          {option.label}
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-slate-500">{option.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task select / custom prompt */}
              {(selectedTaskType === 'simulation' || selectedTaskType === 'lesson' || selectedTaskType === 'quiz') ? (
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-medium">
                    Chọn {currentTaskType?.label.toLowerCase()}
                  </label>
                  {contentOptions.length === 0 ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 space-y-2">
                      <p className="text-amber-200 text-xs">
                        {selectedTaskType === 'quiz'
                          ? 'Chưa có quiz đã lưu. Hãy tạo quiz trước rồi quay lại giao cho lớp.'
                          : 'Chưa có bài giảng đã lưu. Hãy tạo bài giảng trước rồi quay lại giao cho lớp.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(selectedTaskType === 'quiz' ? '/quiz/create' : '/lesson-builder')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-100 border border-amber-400/25 text-xs font-bold hover:bg-amber-500/30 transition-colors"
                      >
                        {selectedTaskType === 'quiz' ? 'Tạo quiz' : 'Tạo bài giảng'}
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        id="assign-task"
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        className="w-full bg-slate-700/50 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-teal-500/50 cursor-pointer"
                      >
                        <option value="" disabled>-- Chọn nội dung --</option>
                        {contentOptions.map(item => (
                          <option key={item.id} value={item.id} className="text-white font-normal bg-slate-800">{item.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-xs font-medium">Tên nhiệm vụ</label>
                    <input
                      value={customTaskTitle}
                      onChange={(e) => setCustomTaskTitle(e.target.value)}
                      placeholder={selectedTaskType === 'worksheet' ? 'Ví dụ: Phiếu học tập khí áp và gió' : 'Ví dụ: Tự luận về biến đổi khí hậu'}
                      className="w-full bg-slate-700/50 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500/50 placeholder-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-xs font-medium">Yêu cầu cho học sinh</label>
                    <textarea
                      value={customTaskDescription}
                      onChange={(e) => setCustomTaskDescription(e.target.value)}
                      placeholder={selectedTaskType === 'worksheet'
                        ? 'Nhập câu hỏi hoặc yêu cầu theo từng dòng...'
                        : 'Nhập đề bài, tiêu chí nội dung, độ dài bài viết...'}
                      rows={5}
                      className="w-full bg-slate-700/50 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500/50 placeholder-slate-500 resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-medium">Điểm thưởng / điểm quy đổi</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taskPoints}
                  onChange={(e) => setTaskPoints(Number(e.target.value) || 0)}
                  className="w-full bg-slate-700/50 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500/50"
                />
              </div>

              {/* Class select */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-medium">Chọn lớp</label>
                <div className="relative">
                  <select
                    id="assign-class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value as ClassName)}
                    className="w-full bg-slate-700/50 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-teal-500/50 cursor-pointer"
                  >
                    {classOptions.map((c) => (
                      <option key={c} value={c} className="bg-slate-800">Lớp {c}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => {
                        const className = window.prompt('Nhập tên lớp mới');
                        const cleaned = className?.trim();
                        if (!cleaned) return;
                        setClassOptions((current) => persistClassOptions([...current, cleaned]));
                        setActiveTab(cleaned);
                        setSelectedClass(cleaned);
                        toast.success(`Đã thêm lớp ${cleaned}.`);
                      }}
                      className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-colors"
                    >
                      Thêm Lớp Mới
                    </button>
                    <button
                      onClick={() => navigate('/reports')}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-semibold text-sm hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
                    >
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
                value: attentionStudents[0]?.name ?? 'Không có',
                sub: attentionStudents[1]?.name ?? 'Lớp đang ổn định',
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
