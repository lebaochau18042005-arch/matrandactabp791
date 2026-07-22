import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

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

interface SubmissionState {
  submissions: Submission[];
  loading: boolean;
  startAssignment: (assignmentId: string, className: string) => Promise<void>;
  updateScore: (assignmentId: string, score: number) => Promise<void>;
  fetchClassSubmissions: (className: string) => Promise<void>;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissions: [],
  loading: false,

  startAssignment: async (assignmentId, className) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Silent return if not logged in

      // Check if already started
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
        student_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Học sinh',
        class_name: className,
        quiz_score: null, // Null means started but not finished quiz
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Lỗi khi ghi nhận bắt đầu làm bài:', error.message);
    }
  },

  updateScore: async (assignmentId, score) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('submissions')
        .update({ quiz_score: score, completed_at: new Date().toISOString() })
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id);

      if (error) throw error;
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
      set({ submissions: data as Submission[] });
    } catch (error: any) {
      console.error('Lỗi khi tải báo cáo tiến độ:', error.message);
      toast.error('Lỗi tải báo cáo: ' + error.message);
    } finally {
      set({ loading: false });
    }
  },
}));
