import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { AlertTriangle, BarChart3, CheckCircle2, Download, Filter, Search, Users } from 'lucide-react';
import { inferAssignmentType, useAssignmentStore } from '../store/assignmentStore';
import { useSubmissionStore } from '../store/submissionStore';
import { SIMULATIONS } from '../data/simulations';

type ReportTab = 'assignments' | 'students';
type ScoreFilter = 'all' | 'completed' | 'inProgress' | 'atRisk';

const CLASS_OPTIONS = ['10A1', '11B2'];
const SCORE_FILTERS: Array<{ id: ScoreFilter; label: string }> = [
  { id: 'all', label: 'Tất cả trạng thái' },
  { id: 'completed', label: 'Đã hoàn thành' },
  { id: 'inProgress', label: 'Đang làm' },
  { id: 'atRisk', label: 'Điểm thấp' },
];

const normalizeSearch = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('assignments');
  const [activeClass, setActiveClass] = useState('10A1');
  const [query, setQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const { assignments, fetchStudentTasks, loading: loadingAsn } = useAssignmentStore();
  const { submissions, fetchClassSubmissions, loading: loadingSub } = useSubmissionStore();

  useEffect(() => {
    fetchStudentTasks(activeClass);
    fetchClassSubmissions(activeClass);
  }, [activeClass, fetchStudentTasks, fetchClassSubmissions]);

  const assignmentTitle = (assignment: any) => {
    if (!assignment) return 'Không rõ';
    const taskType = inferAssignmentType(assignment);
    if (taskType === 'lesson') return `Bài giảng: ${assignment?.title || assignment?.lesson?.title || 'Không rõ'}`;
    if (taskType === 'simulation') return `Mô phỏng: ${assignment?.title || SIMULATIONS.find(sim => sim.id === assignment?.simulation_id)?.name || 'Không rõ'}`;
    if (taskType === 'quiz') return `Quiz: ${assignment?.title || 'Không rõ'}`;
    if (taskType === 'worksheet') return `Phiếu học tập: ${assignment?.title || 'Không rõ'}`;
    if (taskType === 'essay') return `Tự luận: ${assignment?.title || 'Không rõ'}`;
    return assignment?.title || 'Không rõ';
  };

  const handleExportExcel = () => {
    const data = activeTab === 'assignments'
      ? filteredAssignmentStats.map(a => ({
        'Bài tập': a.title,
        'Hạn chót': new Date(a.deadline).toLocaleDateString('vi-VN'),
        'Đã nộp': a.submittedCount,
        'Chưa nộp': a.missingCount,
        'Điểm TB': a.avgScore > 0 ? `${a.avgScore}%` : '-',
        'Hoàn thành': `${a.completionRate}%`,
      }))
      : filteredSubmissions.map(s => {
        const assignment = assignments.find(a => a.id === s.assignment_id);
        return {
        'Học sinh': s.student_name,
        'Lớp': s.class_name,
          'Bài tập': assignmentTitle(assignment),
        'Điểm Quiz': s.quiz_score !== null ? s.quiz_score : 'Chưa làm xong',
        'Ngày nộp': new Date(s.completed_at).toLocaleString('vi-VN'),
      };
      });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'assignments' ? 'TheoBaiTap' : 'TheoHocSinh');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `BaoCao_${activeClass}_${activeTab}.xlsx`);
    toast.success('Đã xuất báo cáo Excel!');
  };

  // Tính toán dữ liệu cho Tab 1
  const assignmentStats = useMemo(() => {
    const TOTAL_STUDENTS = activeClass === '10A1' ? 30 : 28;
    
    return assignments.map(a => {
      const subs = submissions.filter(s => s.assignment_id === a.id);
      const submittedCount = subs.length;
      
      const finishedSubs = subs.filter(s => s.quiz_score !== null);
      const avgScore = finishedSubs.length > 0 
        ? Math.round(finishedSubs.reduce((acc, s) => acc + (s.quiz_score || 0), 0) / finishedSubs.length) 
        : 0;

      return {
        ...a,
        title: assignmentTitle(a),
        submittedCount,
        missingCount: TOTAL_STUDENTS - submittedCount,
        avgScore,
        completionRate: Math.round((submittedCount / TOTAL_STUDENTS) * 100)
      };
    });
  }, [activeClass, assignments, submissions]);

  const filteredAssignmentStats = useMemo(() => {
    const q = normalizeSearch(query.trim());
    return assignmentStats.filter(a => {
      if (q && !normalizeSearch(a.title).includes(q)) return false;
      if (scoreFilter === 'completed') return a.completionRate >= 80;
      if (scoreFilter === 'inProgress') return a.completionRate < 80;
      if (scoreFilter === 'atRisk') return a.missingCount > 0 && a.avgScore < 50;
      return true;
    });
  }, [assignmentStats, query, scoreFilter]);

  const filteredSubmissions = useMemo(() => {
    const q = normalizeSearch(query.trim());
    return submissions.filter(s => {
      const assignment = assignments.find(a => a.id === s.assignment_id);
      const searchable = normalizeSearch(`${s.student_name} ${s.class_name} ${assignmentTitle(assignment)}`);
      if (q && !searchable.includes(q)) return false;
      if (scoreFilter === 'completed') return s.quiz_score !== null;
      if (scoreFilter === 'inProgress') return s.quiz_score === null;
      if (scoreFilter === 'atRisk') return s.quiz_score !== null && s.quiz_score < 50;
      return true;
    });
  }, [assignments, query, scoreFilter, submissions]);

  const reportSummary = useMemo(() => {
    const avgCompletion = assignmentStats.length
      ? Math.round(assignmentStats.reduce((sum, a) => sum + a.completionRate, 0) / assignmentStats.length)
      : 0;
    const missingTotal = assignmentStats.reduce((sum, a) => sum + Math.max(0, a.missingCount), 0);
    const scoredSubmissions = submissions.filter(s => s.quiz_score !== null);
    const avgScore = scoredSubmissions.length
      ? Math.round(scoredSubmissions.reduce((sum, s) => sum + (s.quiz_score || 0), 0) / scoredSubmissions.length)
      : 0;

    return {
      avgCompletion,
      missingTotal,
      avgScore,
      submissionsCount: submissions.length,
    };
  }, [assignmentStats, submissions]);

  const loading = loadingAsn || loadingSub;

  return (
    <AppLayout title="📊 Báo cáo tiến độ">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">📊 Báo cáo tiến độ lớp {activeClass}</h1>
            <p className="text-slate-400 text-sm mt-1">Theo dõi tiến độ làm bài và điểm số thực tế của học sinh</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={activeClass}
              onChange={(e) => setActiveClass(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs font-bold focus:outline-none focus:border-teal-500/50 [color-scheme:dark]"
            >
              {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>Lớp {cls}</option>)}
            </select>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
            >
              <Download size={14} /> Xuất Excel
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Bài đã giao', value: assignments.length, sub: `${filteredAssignmentStats.length} đang hiển thị`, icon: <BarChart3 size={20} className="text-teal-400" />, border: 'border-teal-500/20' },
            { label: 'Lượt nộp', value: reportSummary.submissionsCount, sub: `${filteredSubmissions.length} theo bộ lọc`, icon: <Users size={20} className="text-blue-400" />, border: 'border-blue-500/20' },
            { label: 'Hoàn thành TB', value: `${reportSummary.avgCompletion}%`, sub: 'toàn bộ nhiệm vụ', icon: <CheckCircle2 size={20} className="text-emerald-400" />, border: 'border-emerald-500/20' },
            { label: 'Cần nhắc', value: reportSummary.missingTotal, sub: `Điểm TB ${reportSummary.avgScore}%`, icon: <AlertTriangle size={20} className="text-amber-400" />, border: 'border-amber-500/20' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl border ${card.border} bg-slate-800/60 p-4`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium">{card.label}</p>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{card.icon}</div>
              </div>
              <p className="text-white text-2xl font-bold">{card.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_210px] gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <label className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm học sinh, bài tập hoặc mô phỏng..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500/50"
            />
          </label>
          <label className="relative">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value as ScoreFilter)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-teal-500/50 [color-scheme:dark]"
            >
              {SCORE_FILTERS.map(filter => <option key={filter.id} value={filter.id}>{filter.label}</option>)}
            </select>
          </label>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'assignments' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📋 Tiến độ theo Bài tập
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'students' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            👤 Chi tiết từng Học sinh
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">Đang tải dữ liệu báo cáo...</div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
            
            {activeTab === 'assignments' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/30">
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Bài tập</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hạn chót</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Đã nộp</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Chưa nộp</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm TB</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {filteredAssignmentStats.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">Chưa có bài tập nào.</td></tr>
                    ) : filteredAssignmentStats.map(a => (
                      <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-white">{a.title}</td>
                        <td className="px-5 py-4 text-sm text-slate-400">{new Date(a.deadline).toLocaleDateString('vi-VN')}</td>
                        <td className="px-5 py-4 text-sm text-teal-400 font-bold">{a.submittedCount}</td>
                        <td className="px-5 py-4 text-sm text-red-400 font-bold">{a.missingCount}</td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-bold ${a.avgScore >= 80 ? 'text-teal-400' : a.avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {a.avgScore > 0 ? `${a.avgScore}%` : '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-teal-500 rounded-full" 
                                style={{ width: `${a.completionRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-8">{a.completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/30">
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Học sinh</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Bài tập</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm Quiz</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày nộp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {filteredSubmissions.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Chưa có lượt nộp bài nào.</td></tr>
                    ) : filteredSubmissions.map(s => {
                      const assignment = assignments.find(a => a.id === s.assignment_id);

                      return (
                        <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                {s.student_name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span className="text-sm font-medium text-white">{s.student_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-400">{s.class_name}</td>
                          <td className="px-5 py-4 text-sm text-slate-300">{assignmentTitle(assignment)}</td>
                          <td className="px-5 py-4">
                            {s.quiz_score !== null ? (
                              <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.quiz_score >= 80 ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : s.quiz_score >= 50 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {s.quiz_score}%
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                Đang làm...
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-400">
                            {new Date(s.completed_at).toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
