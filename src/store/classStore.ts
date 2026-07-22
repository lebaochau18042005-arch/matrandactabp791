import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Student {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  badges: string[];
}

export interface Assignment {
  id: string;
  lessonId: string;
  className: string;
  dueDate: string;
  notes: string;
  createdAt: string;
}

export interface ClassData {
  id: string;
  name: string;
  students: Student[];
  assignments: Assignment[];
}

interface ClassState {
  classes: ClassData[];
  addClass: (cls: ClassData) => void;
  assignLesson: (assignment: Assignment) => void;
  addStudentToClass: (classId: string, student: Student) => void;
}

export const useClassStore = create<ClassState>()(
  persist(
    (set) => ({
      classes: [],
      addClass: (cls) =>
        set((state) => ({ classes: [...state.classes, cls] })),
      assignLesson: (assignment) =>
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.name === assignment.className
              ? { ...cls, assignments: [...cls.assignments, assignment] }
              : cls
          ),
        })),
      addStudentToClass: (classId, student) =>
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === classId
              ? { ...cls, students: [...cls.students, student] }
              : cls
          ),
        })),
    }),
    {
      name: 'geohub-class-storage',
    }
  )
);
