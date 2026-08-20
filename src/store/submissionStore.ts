import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from './authStore';

export type Submission = {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  quiz_score: number | null;
  completed_at: string | null;
  activity_type?: SubmissionActivityType;
  activity_title?: string;
  score_label?: string;
  response_text?: string;
  attachment_name?: string;
  assignment?: {
    deadline: string;
    lesson_id: string | null;
    simulation_id: string | null;
  } | null;
};

export type SubmissionActivityType = 'simulation' | 'quiz' | 'lesson' | 'worksheet' | 'essay' | 'assignment';
export type SubmissionResultMetadata = {
  class_name: string;
  student_id?: string;
  student_name: string;
  activity_type: SubmissionActivityType;
  activity_title: string;
  score_label: string;
  response_text?: string;
  attachment_name?: string;
};

const LOCAL_SUBMISSIONS_KEY = 'geohub_local_submissions';

export const readLocalSubmissionResults = (): Submission[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const writeLocalSubmissions = (submissions: Submission[]) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions));
};

const upsertLocalSubmission = (submission: Submission) => {
  const submissions = readLocalSubmissionResults();
  const next = submissions.filter(item => !(item.assignment_id === submission.assignment_id && item.student_id === submission.student_id));
  next.unshift(submission);
  writeLocalSubmissions(next);
  return next;
};

interface SubmissionState {
  submissions: Submission[];
  loading: boolean;
  startAssignment: (assignmentId: string, className: string) => Promise<void>;
  updateScore: (assignmentId: string, score: number, metadata?: SubmissionResultMetadata) => Promise<void>;
  fetchClassSubmissions: (className: string) => Promise<void>;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissions: [],
  loading: false,

  startAssignment: async (assignmentId, className) => {
    const appUser = useAuthStore.getState().user;
    if (appUser) {
      const existingLocal = readLocalSubmissionResults().find(item => (
        item.assignment_id === assignmentId && item.student_id === appUser.id
      ));
      if (!existingLocal) {
        const localSubmission: Submission = {
          id: `local_${assignmentId}_${appUser.id}`,
          assignment_id: assignmentId,
          student_id: appUser.id,
          student_name: appUser.name || 'Học sinh',
          class_name: className,
          quiz_score: null,
          completed_at: null,
        };
        set({ submissions: upsertLocalSubmission(localSubmission) });
      }
    }

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: existing } = await supabase
        .from('submissions')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id)
        .single();
      if (existing) return;

      const { error } = await supabase.from('submissions').insert({
        assignment_id: assignmentId,
        student_id: user.id,
        student_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Học sinh',
        class_name: className,
        quiz_score: null,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Lỗi khi ghi nhận bắt đầu làm bài:', error.message);
    }
  },

  updateScore: async (assignmentId, score, metadata) => {
    const appUser = useAuthStore.getState().user;
    const localSubmissions = readLocalSubmissionResults();
    const studentId = metadata?.student_id || appUser?.id || 'local-student';
    const existingLocal = localSubmissions.find(item => (
      item.assignment_id === assignmentId && item.student_id === studentId
    ));
    const completedAt = new Date().toISOString();

    if (appUser || metadata || existingLocal) {
      const localSubmission: Submission = {
        id: existingLocal?.id || `local_${assignmentId}_${studentId}`,
        assignment_id: assignmentId,
        student_id: studentId,
        student_name: metadata?.student_name || existingLocal?.student_name || appUser?.name || 'Học sinh',
        class_name: metadata?.class_name || existingLocal?.class_name || '',
        quiz_score: score,
        completed_at: completedAt,
        activity_type: metadata?.activity_type || existingLocal?.activity_type,
        activity_title: metadata?.activity_title || existingLocal?.activity_title,
        score_label: metadata?.score_label || existingLocal?.score_label || `${score} điểm`,
        response_text: metadata?.response_text || existingLocal?.response_text,
        attachment_name: metadata?.attachment_name || existingLocal?.attachment_name,
        assignment: existingLocal?.assignment,
      };
      set({ submissions: upsertLocalSubmission(localSubmission) });
    }

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('submissions')
        .update({ quiz_score: score, completed_at: completedAt })
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id);
      if (error) throw error;
    } catch (error: any) {
      console.error('Lỗi khi cập nhật điểm quiz:', error.message);
    }
  },

  fetchClassSubmissions: async (className) => {
    set({ loading: true });
    const localSubmissions = readLocalSubmissionResults().filter(item => item.class_name === className);
    if (!isSupabaseConfigured) {
      set({ submissions: localSubmissions, loading: false });
      return;
    }

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
      const remoteSubmissions = (data || []) as Submission[];
      const localKeys = new Set(localSubmissions.map(item => `${item.assignment_id}_${item.student_id}`));
      const submissions = [...localSubmissions, ...remoteSubmissions.filter(item => !localKeys.has(`${item.assignment_id}_${item.student_id}`))];
      set({ submissions });
    } catch (error: any) {
      console.error('Lỗi khi tải báo cáo tiến độ:', error.message);
      toast.error('Lỗi tải báo cáo: ' + error.message);
    } finally {
      set({ loading: false });
    }
  },
}));
