import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { syncResultToGoogleSheet, type StudentResultPayload } from '../lib/googleSheetSync';

export type Submission = {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  quiz_score: number | null;
  completed_at: string;
  assignment?: {
    deadline: string;
    lesson_id: string | null;
    simulation_id: string | null;
  } | null;
};

const LOCAL_SUBMISSIONS_KEY = 'geohub_local_submissions';

function readLocalSubmissions(): Submission[] {
  try {
    const saved = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function writeLocalSubmissions(submissions: Submission[]) {
  localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions));
}

function upsertLocalSubmission(submission: Submission) {
  const current = readLocalSubmissions();
  const next = [
    submission,
    ...current.filter(item => item.assignment_id !== submission.assignment_id || item.student_id !== submission.student_id),
  ];
  writeLocalSubmissions(next);
  return next;
}

function mergeSubmissions(remoteSubmissions: Submission[], localSubmissions: Submission[]) {
  const merged = new Map<string, Submission>();
  [...remoteSubmissions, ...localSubmissions].forEach((submission) => {
    merged.set(`${submission.assignment_id}_${submission.student_id}`, submission);
  });
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
}

interface SubmissionState {
  submissions: Submission[];
  loading: boolean;
  startAssignment: (assignmentId: string, className: string) => Promise<void>;
  updateScore: (assignmentId: string, score: number, metadata?: Partial<StudentResultPayload>) => Promise<void>;
  fetchClassSubmissions: (className: string) => Promise<void>;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissions: [],
  loading: false,

  startAssignment: async (assignmentId, className) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const studentId = user?.id ?? 'demo-student';
      const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Học sinh Demo';

      // Check if already started
      if (user) {
        const { data: existing } = await supabase
          .from('submissions')
          .select('id')
          .eq('assignment_id', assignmentId)
          .eq('student_id', user.id)
          .single();

        if (existing) return; // Already started

        const { error } = await supabase.from('submissions').insert({
          assignment_id: assignmentId,
          student_id: user.id,
          student_name: studentName,
          class_name: className,
          quiz_score: null, // Null means started but not finished quiz
        });

        if (error) throw error;
      }

      upsertLocalSubmission({
        id: `local_submission_${assignmentId}_${studentId}`,
        assignment_id: assignmentId,
        student_id: studentId,
        student_name: studentName,
        class_name: className,
        quiz_score: null,
        completed_at: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Lỗi khi ghi nhận bắt đầu làm bài:', error.message);
    }
  },

  updateScore: async (assignmentId, score, metadata = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const completedAt = new Date().toISOString();
      const studentId = user?.id ?? metadata.student_id ?? 'demo-student';
      const studentName = metadata.student_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Học sinh Demo';
      const className = metadata.class_name || '10A1';

      if (user) {
        const { error } = await supabase
          .from('submissions')
          .update({ quiz_score: score, completed_at: completedAt })
          .eq('assignment_id', assignmentId)
          .eq('student_id', user.id);

        if (error) throw error;
      }

      const localSubmission: Submission = {
        id: `local_submission_${assignmentId}_${studentId}`,
        assignment_id: assignmentId,
        student_id: studentId,
        student_name: studentName,
        class_name: className,
        quiz_score: score,
        completed_at: completedAt,
      };
      upsertLocalSubmission(localSubmission);
      set((state) => ({
        submissions: mergeSubmissions(state.submissions, [localSubmission]),
      }));

      await syncResultToGoogleSheet({
        event: 'student_completed',
        completed_at: completedAt,
        class_name: className,
        student_id: studentId,
        student_name: studentName,
        activity_type: metadata.activity_type || 'assignment',
        activity_title: metadata.activity_title || 'Nhiệm vụ GeoHub',
        assignment_id: assignmentId,
        score,
        score_label: metadata.score_label || `${score}%`,
        response_text: metadata.response_text,
        attachment_name: metadata.attachment_name,
        source: 'GeoHub',
      });
    } catch (error: any) {
      console.error('Lỗi khi cập nhật điểm quiz:', error.message);
    }
  },

  fetchClassSubmissions: async (className) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          assignment:assignments(deadline, lesson_id, simulation_id)
        `)
        .eq('class_name', className)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      const localSubmissions = readLocalSubmissions().filter(item => item.class_name === className);
      set({ submissions: mergeSubmissions(data as Submission[], localSubmissions) });
    } catch (error: any) {
      console.error('Lỗi khi tải báo cáo tiến độ:', error.message);
      const localSubmissions = readLocalSubmissions().filter(item => item.class_name === className);
      set({ submissions: localSubmissions });
    } finally {
      set({ loading: false });
    }
  },
}));
