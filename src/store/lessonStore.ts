import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';

export interface LessonBlock {
  id: string;
  type: 'title' | 'objective' | 'simulation' | '3d-sim' | 'text' | 'image' | 'question' | 'worksheet' | 'group-task' | 'quiz' | 'quick-quiz';
  content: any;
}

export interface Lesson {
  id: string;
  title: string;
  grade: string;
  topic: string;
  blocks: LessonBlock[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  loading: boolean;
  setCurrentLesson: (lesson: Lesson | null) => void;
  fetchLessons: () => Promise<void>;
  addLesson: (lesson: Lesson) => Promise<void>;
  updateLesson: (id: string, data: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  saveCurrentLesson: (lesson: Lesson) => Promise<void>;
}

const LOCAL_LESSONS_KEY = 'geohub-lesson-storage';

const readLocalLessons = (): Lesson[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_LESSONS_KEY) || 'null');
    const lessons = Array.isArray(saved) ? saved : saved?.state?.lessons;
    return Array.isArray(lessons) ? lessons : [];
  } catch {
    return [];
  }
};

const writeLocalLessons = (lessons: Lesson[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LOCAL_LESSONS_KEY, JSON.stringify({ state: { lessons }, version: 0 }));
};

export const useLessonStore = create<LessonState>((set, get) => ({
  lessons: readLocalLessons(),
  currentLesson: null,
  loading: false,
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

  fetchLessons: async () => {
    const localLessons = readLocalLessons();
    set({ lessons: localLessons, loading: isSupabaseConfigured });
    if (!isSupabaseConfigured) {
      set({ loading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('author_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (Array.isArray(data)) {
        const lessons = data.map(d => ({
          id: d.id,
          title: d.title,
          grade: d.grade,
          topic: d.subject,
          blocks: Array.isArray(d.content) ? d.content as LessonBlock[] : [],
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          authorId: d.author_id,
        }));
        writeLocalLessons(lessons);
        set({ lessons });
      }
    } catch (error: any) {
      console.warn('Không thể tải bài giảng từ Supabase, tiếp tục dùng dữ liệu cục bộ:', error?.message || error);
    } finally {
      set({ loading: false });
    }
  },

  addLesson: async (lesson) => {
    set((state) => {
      const lessons = [lesson, ...state.lessons.filter(item => item.id !== lesson.id)];
      writeLocalLessons(lessons);
      return { lessons };
    });
    if (!isSupabaseConfigured) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('lessons').insert({
      id: lesson.id,
      author_id: session.user.id,
      title: lesson.title,
      grade: lesson.grade,
      subject: lesson.topic,
      content: lesson.blocks,
    });
    if (error) {
      console.error(error);
      toast.error('Bài đã lưu cục bộ nhưng chưa đồng bộ được lên máy chủ');
    }
  },

  updateLesson: async (id, data) => {
    const updatedAt = new Date().toISOString();
    set((state) => {
      const lessons = state.lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, ...data, updatedAt } : lesson
      );
      writeLocalLessons(lessons);
      return {
        lessons,
        currentLesson: state.currentLesson?.id === id
          ? { ...state.currentLesson, ...data, updatedAt }
          : state.currentLesson,
      };
    });
    if (!isSupabaseConfigured) return;

    const updateData: any = { updated_at: updatedAt };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.grade !== undefined) updateData.grade = data.grade;
    if (data.topic !== undefined) updateData.subject = data.topic;
    if (data.blocks !== undefined) updateData.content = data.blocks;

    const { error } = await supabase.from('lessons').update(updateData).eq('id', id);
    if (error) toast.error('Bài đã cập nhật cục bộ nhưng chưa đồng bộ được lên máy chủ');
  },

  deleteLesson: async (id) => {
    set((state) => {
      const lessons = state.lessons.filter((lesson) => lesson.id !== id);
      writeLocalLessons(lessons);
      return {
        lessons,
        currentLesson: state.currentLesson?.id === id ? null : state.currentLesson,
      };
    });
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) toast.error('Bài đã xóa cục bộ nhưng chưa xóa được trên máy chủ');
  },

  saveCurrentLesson: async (lesson) => {
    const exists = get().lessons.some((item) => item.id === lesson.id);
    if (exists) {
      await get().updateLesson(lesson.id, lesson);
      toast.success('Đã cập nhật bài giảng!');
    } else {
      await get().addLesson(lesson);
      set({ currentLesson: lesson });
      toast.success('Đã lưu bài giảng mới!');
    }
  },
}));
