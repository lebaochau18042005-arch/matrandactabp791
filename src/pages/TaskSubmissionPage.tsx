import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, ClipboardList, PenLine, Send, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { inferAssignmentType, useAssignmentStore } from '../store/assignmentStore';
import { useSubmissionStore } from '../store/submissionStore';

export default function TaskSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { assignments, fetchStudentTasks, loading } = useAssignmentStore();
  const { updateScore } = useSubmissionStore();
  const [answer, setAnswer] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudentTasks('10A1');
  }, [fetchStudentTasks]);

  const assignment = useMemo(
    () => assignments.find(item => item.id === id),
    [assignments, id]
  );
  const taskType = assignment ? inferAssignmentType(assignment) : 'worksheet';
  const isEssay = taskType === 'essay';
  const prompts = (assignment?.description || '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);
  const title = assignment?.title || (isEssay ? 'Bài tự luận' : 'Phiếu học tập');

  const handleSubmit = async () => {
    if (!assignment) return;
    if (!answer.trim()) {
      toast.error('Vui lòng nhập câu trả lời trước khi nộp.');
      return;
    }

    try {
      setSubmitting(true);
      await updateScore(assignment.id, 100, {
        class_name: assignment.class_name,
        student_id: user?.id,
        student_name: user?.name || 'Học sinh Demo',
        activity_type: isEssay ? 'essay' : 'worksheet',
        activity_title: title,
        score_label: 'Đã nộp - chờ chấm',
        response_text: answer.trim(),
        attachment_name: attachmentName.trim(),
      });
      toast.success('Đã ghi nhận bài nộp của em.');
      navigate('/student');
    } catch (error: any) {
      toast.error(error?.message || 'Không nộp được bài.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !assignment) {
    return (
      <AppLayout title="Làm nhiệm vụ">
        <div className="min-h-[55vh] flex items-center justify-center text-slate-400">
          Đang tải nhiệm vụ...
        </div>
      </AppLayout>
    );
  }

  if (!assignment) {
    return (
      <AppLayout title="Làm nhiệm vụ">
        <div className="max-w-3xl mx-auto p-6 text-center space-y-4">
          <p className="text-white font-bold text-xl">Không tìm thấy nhiệm vụ này.</p>
          <button
            onClick={() => navigate('/student')}
            className="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-bold hover:bg-teal-400"
          >
            Về trang học sinh
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={title}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5 pb-24">
        <button
          onClick={() => navigate('/student')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-slate-800/70 text-slate-300 text-sm font-semibold hover:text-white hover:border-white/20"
        >
          <ArrowLeft size={15} />
          Quay lại
        </button>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isEssay ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'
            }`}>
              {isEssay ? <PenLine size={22} /> : <ClipboardList size={22} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">
                {isEssay ? 'Bài tập tự luận' : 'Phiếu học tập'}
              </p>
              <h1 className="text-white text-2xl sm:text-3xl font-black mt-1 break-words">{title}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-teal-500/25 bg-teal-500/10 text-teal-300">
                  <CalendarClock size={12} />
                  Hạn: {new Date(assignment.deadline).toLocaleDateString('vi-VN')}
                </span>
                <span className="text-xs px-2 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-300">
                  +{assignment.points ?? (isEssay ? 100 : 70)} điểm
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-800/55 p-4">
            <p className="text-slate-300 text-sm font-semibold mb-3">Yêu cầu</p>
            {prompts.length > 1 ? (
              <ul className="space-y-2">
                {prompts.map((prompt, index) => (
                  <li key={`${prompt}_${index}`} className="flex gap-2 text-slate-300 text-sm leading-relaxed">
                    <span className="text-teal-300 font-bold">{index + 1}.</span>
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {assignment.description || 'Hoàn thành nội dung theo yêu cầu của giáo viên.'}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 space-y-4">
          <label className="block">
            <span className="text-slate-300 text-sm font-semibold">Câu trả lời của em</span>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={isEssay ? 12 : 8}
              placeholder={isEssay ? 'Viết bài tự luận tại đây...' : 'Nhập câu trả lời cho phiếu học tập...'}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-y"
            />
          </label>

          <label className="block">
            <span className="text-slate-300 text-sm font-semibold">Tên tệp đính kèm nếu có</span>
            <div className="mt-2 relative">
              <UploadCloud size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="Ví dụ: bai-tu-luan-nguyen-van-a.docx"
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/50"
              />
            </div>
          </label>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
