import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export type AssignmentTaskType = 'simulation' | 'lesson' | 'quiz' | 'worksheet' | 'essay';

export type Assignment = {
  id: string;
  teacher_id: string;
  class_name: string;
  lesson_id?: string | null;
  simulation_id?: string | null;
  quiz_id?: string | null;
  task_type?: AssignmentTaskType;
  title?: string;
  description?: string;
  points?: number;
  submission_type?: 'auto' | 'view' | 'text' | 'file';
  deadline: string;
  created_at: string;
  lesson?: { title: string } | null;
};

type AssignmentInput = Omit<Assignment, 'id' | 'created_at' | 'teacher_id'>;

interface AssignmentState {
  assignments: Assignment[];
  loading: boolean;
  assignTask: (task: AssignmentInput) => Promise<void>;
  fetchStudentTasks: (className: string) => Promise<void>;
}

const LOCAL_ASSIGNMENTS_KEY = 'geohub_local_assignments';

export function inferAssignmentType(assignment: Partial<Assignment>): AssignmentTaskType {
  if (assignment.task_type) return assignment.task_type;
  if (assignment.quiz_id) return 'quiz';
  if (assignment.lesson_id) return 'lesson';
  if (assignment.simulation_id) return 'simulation';
  return 'worksheet';
}

export function readLocalAssignments(): Assignment[] {
  try {
    const saved = localStorage.getItem(LOCAL_ASSIGNMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function writeLocalAssignments(assignments: Assignment[]) {
  localStorage.setItem(LOCAL_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

function normalizeAssignment(assignment: Assignment): Assignment {
  const taskType = inferAssignmentType(assignment);
  return {
    ...assignment,
    task_type: taskType,
    points: assignment.points ?? (
      taskType === 'quiz' || taskType === 'essay' ? 100 :
      taskType === 'worksheet' ? 70 :
      taskType === 'lesson' ? 50 :
      30
    ),
  };
}

function upsertLocalAssignment(assignment: Assignment) {
  const current = readLocalAssignments();
  const next = [
    normalizeAssignment(assignment),
    ...current.filter(item => item.id !== assignment.id),
  ];
  writeLocalAssignments(next);
  return next;
}

function mergeAssignments(remoteAssignments: Assignment[], localAssignments: Assignment[]) {
  const merged = new Map<string, Assignment>();
  [...remoteAssignments, ...localAssignments].forEach((assignment) => {
    merged.set(assignment.id, normalizeAssignment(assignment));
  });
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  loading: false,

  assignTask: async (task) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const teacherId = user?.id ?? 'local-teacher';
      const taskType = inferAssignmentType(task);
      let savedId = `local_assignment_${crypto.randomUUID()}`;
      let createdAt = new Date().toISOString();

      if (user && (taskType === 'lesson' || taskType === 'simulation')) {
        const { data, error } = await supabase
          .from('assignments')
          .insert({
            teacher_id: user.id,
            class_name: task.class_name,
            lesson_id: task.lesson_id ?? null,
            simulation_id: task.simulation_id ?? null,
            deadline: task.deadline,
          })
          .select('id, created_at')
          .single();

        if (error) {
          console.warn('Không lưu được nhiệm vụ lên máy chủ, đã lưu trong app:', error.message);
        } else if (data) {
          savedId = data.id;
          createdAt = data.created_at;
        }
      }

      const localAssignment: Assignment = {
        id: savedId,
        teacher_id: teacherId,
        class_name: task.class_name,
        lesson_id: task.lesson_id ?? null,
        simulation_id: task.simulation_id ?? null,
        quiz_id: task.quiz_id ?? null,
        task_type: taskType,
        title: task.title,
        description: task.description,
        points: task.points,
        submission_type: task.submission_type,
        deadline: task.deadline,
        created_at: createdAt,
        lesson: task.lesson ?? null,
      };

      upsertLocalAssignment(localAssignment);
      set((state) => ({
        assignments: mergeAssignments(
          state.assignments,
          task.class_name === localAssignment.class_name ? [localAssignment] : []
        ),
      }));
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
      const localAssignments = readLocalAssignments().filter(item => item.class_name === className);
      set({ assignments: mergeAssignments(data as Assignment[], localAssignments) });
    } catch (error: any) {
      console.error('Lỗi khi tải nhiệm vụ:', error.message);
      const localAssignments = readLocalAssignments().filter(item => item.class_name === className);
      set({ assignments: localAssignments.map(normalizeAssignment) });
    } finally {
      set({ loading: false });
    }
  },
}));
