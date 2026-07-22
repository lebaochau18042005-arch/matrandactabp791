import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export type Assignment = {
  id: string;
  teacher_id: string;
  class_name: string;
  lesson_id?: string | null;
  simulation_id?: string | null;
  deadline: string;
  created_at: string;
  lesson?: { title: string } | null;
};

interface AssignmentState {
  assignments: Assignment[];
  loading: boolean;
  assignTask: (task: Omit<Assignment, 'id' | 'created_at' | 'teacher_id'>) => Promise<void>;
  fetchStudentTasks: (className: string) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  loading: false,

  assignTask: async (task) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase.from('assignments').insert({
        teacher_id: user.id,
        class_name: task.class_name,
        lesson_id: task.lesson_id,
        simulation_id: task.simulation_id,
        deadline: task.deadline,
      });

      if (error) throw error;
      toast.success('Đã giao nhiệm vụ thành công!');
    } catch (error: any) {
      toast.error('Lỗi giao bài: ' + error.message);
    }
  },

  fetchStudentTasks: async (className) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          lesson:lessons(title)
        `)
        .eq('class_name', className)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ assignments: data as Assignment[] });
    } catch (error: any) {
      console.error('Lỗi khi tải nhiệm vụ:', error.message);
    } finally {
      set({ loading: false });
    }
  },
}));
