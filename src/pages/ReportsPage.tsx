import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { toast } from 'sonner';
import { downloadObjectsAsXlsx } from '../lib/excel';
import { useAssignmentStore } from '../store/assignmentStore';
import { useSubmissionStore } from '../store/submissionStore';
import { SIMULATIONS } from '../data/simulations';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'students'>('assignments');
  const { assignments, fetchStudentTasks, loading: loadingAsn } = useAssignmentStore();
  const { submissions, fetchClassSubmissions, loading: loadingSub } = useSubmissionStore();

  useEffect(() => {
    fetchStudentTasks('10A1');
    fetchClassSubmissions('10A1');
  }, [fetchStudentTasks, fetchClassSubmissions]);

  const handleExportExcel = async () => {
    const data = submissions.map(s => {
      const assignment = assignments.find(a => a.id === s.assignment_id);
      const isLesson = !!assignment?.lesson_id;
      const title = isLesson 
        ? `Bài giảng: ${assignment?.lesson?.title || 'Không rõ'}`
        : `Mô phỏng: ${SIMULATIONS.find(sim => sim.id === assignment?.simulation_id)?.name || 'Không rõ'}`;
        
      return {
        'Học sinh': s.student_name,
        'Lớp': s.class_name,
        'Bài tập': title,
        'Điểm Quiz': s.quiz_score !== null ? s.quiz_score : 'Chưa làm xong',
        'Ngày nộp': new Date(s.completed_at).toLocaleString('vi-VN'),
      };
    });
    
    try {
      await downloadObjectsAsXlsx(data, 'TienDoHocSinh_10A1.xlsx', 'TienDoHocSinh');
      toast.success('Đã xuất báo cáo Excel!');
    } catch {
      toast.error('Không thể xuất báo cáo Excel. Vui lòng thử lại.');
    }
  };

  // Tính toán dữ liệu cho Tab 1
  const assignmentStats = useMemo(() => {
    // Số học sinh trong lớp (giả sử là 30 cho lớp 10A1)
    const TOTAL_STUDENTS = 30; 
    
    return assignments.map(a => {
      const subs = submissions.filter(s => s.assignment_id === a.id);
      const submittedCount = subs.length;
      
      const finishedSubs = subs.filter(s => s.quiz_score !== null);
      const avgScore = finishedSubs.length > 0 
        ? Math.round(finishedSubs.reduce((acc, s) => acc + (s.quiz_score || 0), 0) / finishedSubs.length) 
        : 0;

      const isLesson = !!a.lesson_id;
      const title = isLesson 
        ? `Bài giảng: ${a.lesson?.title || 'Không rõ'}`
        : `Mô phỏng: ${SIMULATIONS.find(sim => sim.id === a.simulation_id)?.name || 'Không rõ'}`;

      return {
        ...a,
        title,
        submittedCount,
        missingCount: TOTAL_STUDENTS - submittedCount,
        avgScore,
        completionRate: Math.round((submittedCount / TOTAL_STUDENTS) * 100)
      };
    });
  }, [assignments, submissions]);

  const loading = loadingAsn || loadingSub;

  return (
    <AppLayout title="📊 Báo cáo tiến độ">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">📊 Báo cáo tiến độ lớp 10A1</h1>
            <p className="text-slate-400 text-sm mt-1">Theo dõi tiến độ làm bài và điểm số thực tế của học sinh</p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
          >
            📊 Xuất Excel
          </button>
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
                    {assignmentStats.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">Chưa có bài tập nào.</td></tr>
                    ) : assignmentStats.map(a => (
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
                    {submissions.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Chưa có lượt nộp bài nào.</td></tr>
                    ) : submissions.map(s => {
                      const assignment = assignments.find(a => a.id === s.assignment_id);
                      const isLesson = !!assignment?.lesson_id;
                      const title = isLesson 
                        ? `Bài giảng: ${assignment?.lesson?.title || 'Không rõ'}`
                        : `Mô phỏng: ${SIMULATIONS.find(sim => sim.id === assignment?.simulation_id)?.name || 'Không rõ'}`;

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
                          <td className="px-5 py-4 text-sm text-slate-300">{title}</td>
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
