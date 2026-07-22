import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface LessonBlock {
  id: string;
  type: 'title' | 'objective' | '3d-sim' | 'text' | 'image' | 'question' | 'worksheet' | 'group-task' | 'quick-quiz';
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

export const useLessonStore = create<LessonState>((set, get) => ({
  lessons: [],
  currentLesson: null,
  loading: false,
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  
  fetchLessons: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      set({ lessons: [], loading: false });
      return;
    }
    
    // We try to fetch from Supabase. If error (table doesn't exist yet), fallback to empty.
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('author_id', session.user.id)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.warn('Could not fetch lessons from Supabase (tables might not be set up yet):', error.message);
    } else if (data) {
      const lessons = data.map(d => ({
        id: d.id,
        title: d.title,
        grade: d.grade,
        topic: d.subject,
        blocks: d.content as LessonBlock[],
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        authorId: d.author_id,
      }));
      set({ lessons });
    }
    set({ loading: false });
  },

  addLesson: async (lesson) => {
    set((state) => ({ lessons: [lesson, ...state.lessons] }));
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
      toast.error('Lỗi khi lưu bài giảng mới lên máy chủ');
    }
  },

  updateLesson: async (id, data) => {
    set((state) => ({
      lessons: state.lessons.map((l) =>
        l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l
      ),
      currentLesson:
        state.currentLesson?.id === id
          ? { ...state.currentLesson, ...data, updatedAt: new Date().toISOString() }
          : state.currentLesson,
    }));
    
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.grade) updateData.grade = data.grade;
    if (data.topic) updateData.subject = data.topic;
    if (data.blocks) updateData.content = data.blocks;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase.from('lessons').update(updateData).eq('id', id);
    if (error) toast.error('Lỗi khi cập nhật bài giảng');
  },

  deleteLesson: async (id) => {
    set((state) => ({
      lessons: state.lessons.filter((l) => l.id !== id),
      currentLesson: state.currentLesson?.id === id ? null : state.currentLesson,
    }));
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) toast.error('Lỗi khi xóa bài giảng');
  },

  saveCurrentLesson: async (lesson) => {
    const exists = get().lessons.some((l) => l.id === lesson.id);
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
