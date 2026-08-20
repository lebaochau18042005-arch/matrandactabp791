import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from './authStore';

export type Assignment = {
  id: string;
  teacher_id: string;
  class_name: string;
  lesson_id?: string | null;
  simulation_id?: string | null;
  deadline: string;
  title?: string | null;
  description?: string | null;
  points?: number | null;
  assignment_type?: 'lesson' | 'simulation' | 'worksheet' | 'essay' | null;
  created_at: string;
  lesson?: { title: string } | null;
};
export type AssignmentTaskType = 'lesson' | 'simulation' | 'worksheet' | 'essay';

export const inferAssignmentType = (assignment: Assignment): AssignmentTaskType => {
  if (assignment.assignment_type) return assignment.assignment_type;
  if (assignment.lesson_id) return 'lesson';
  if (assignment.simulation_id) return 'simulation';
  const text = `${assignment.title || ''} ${assignment.description || ''}`;
  if (/tự\s*luận|bài\s*viết|essay/i.test(text)) return 'essay';
  return 'worksheet';
};

const LOCAL_ASSIGNMENTS_KEY = 'geohub_local_assignments';

const readLocalAssignments = (): Assignment[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_ASSIGNMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const writeLocalAssignments = (assignments: Assignment[]) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LOCAL_ASSIGNMENTS_KEY, JSON.stringify(assignments));
};


interface AssignmentState {
  assignments: Assignment[];
  loading: boolean;
  assignTask: (task: Omit<Assignment, 'id' | 'created_at' | 'teacher_id'>) => Promise<boolean>;
  fetchStudentTasks: (className: string) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  loading: false,

  assignTask: async (task) => {
    try {
      if (!isSupabaseConfigured) {
        const appUser = useAuthStore.getState().user;
        if (!appUser) throw new Error('Chưa đăng nhập');
        const assignment: Assignment = {
          ...task,
          id: crypto.randomUUID(),
          teacher_id: appUser.id,
          created_at: new Date().toISOString(),
        };
        const assignments = [assignment, ...readLocalAssignments()];
        writeLocalAssignments(assignments);
        set({ assignments });
        toast.success('Đã giao nhiệm vụ thành công!');
        return true;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase.from('assignments').insert({
        teacher_id: user.id,
        class_name: task.class_name,
        lesson_id: task.lesson_id,
        simulation_id: task.simulation_id,
        deadline: task.deadline,
        title: task.title,
        description: task.description,
        points: task.points,
        assignment_type: task.assignment_type,
      });

      if (error) throw error;
      toast.success('Đã giao nhiệm vụ thành công!');
      return true;
    } catch (error: any) {
      toast.error('Lỗi giao bài: ' + error.message);
      return false;
    }
  },

  fetchStudentTasks: async (className) => {
    set({ loading: true });
    if (!isSupabaseConfigured) {
      const assignments = readLocalAssignments().filter(item => item.class_name === className);
      set({ assignments, loading: false });
      return;
    }
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
