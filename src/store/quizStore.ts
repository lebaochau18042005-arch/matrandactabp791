import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeneratedQuiz } from '../utils/mockAIGenerator';

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  startTime: string;
  endTime?: string;
  
  answers: Record<string, any>;
  
  score?: number;
  mcScore?: number;
  tfScore?: number;
  saScore?: number;
}

interface QuizState {
  generatedQuizzes: Record<string, GeneratedQuiz>;
  quizAttempts: Record<string, QuizAttempt>;
  
  addQuiz: (quiz: GeneratedQuiz) => void;
  updateQuiz: (quizId: string, quiz: GeneratedQuiz) => void;
  deleteQuiz: (quizId: string) => void;
  
  startAttempt: (quizId: string, studentId: string, studentName: string) => string;
  updateAnswer: (attemptId: string, questionId: string, answer: any) => void;
  submitAttempt: (attemptId: string, results: Partial<QuizAttempt>) => void;
  
  liveQuizData: any | null;
  setLiveQuizData: (data: any) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      generatedQuizzes: {},
      quizAttempts: {},
      liveQuizData: null,
      
      addQuiz: (quiz) => set((state) => ({
        generatedQuizzes: { ...state.generatedQuizzes, [quiz.id]: quiz }
      })),
      
      updateQuiz: (quizId, quiz) => set((state) => ({
        generatedQuizzes: { ...state.generatedQuizzes, [quizId]: quiz }
      })),
      
      deleteQuiz: (quizId) => set((state) => {
        const next = { ...state.generatedQuizzes };
        delete next[quizId];
        return { generatedQuizzes: next };
      }),
      
      startAttempt: (quizId, studentId, studentName) => {
        const attemptId = `attempt_${crypto.randomUUID()}`;
        const newAttempt: QuizAttempt = {
          id: attemptId,
          quizId,
          studentId,
          studentName,
          startTime: new Date().toISOString(),
          answers: {}
        };
        set((state) => ({
          quizAttempts: { ...state.quizAttempts, [attemptId]: newAttempt }
        }));
        return attemptId;
      },
      
      updateAnswer: (attemptId, questionId, answer) => set((state) => {
        const attempt = state.quizAttempts[attemptId];
        if (!attempt) return state;
        return {
          quizAttempts: {
            ...state.quizAttempts,
            [attemptId]: {
              ...attempt,
              answers: { ...attempt.answers, [questionId]: answer }
            }
          }
        };
      }),
      
      submitAttempt: (attemptId, results) => set((state) => {
        const attempt = state.quizAttempts[attemptId];
        if (!attempt) return state;
        return {
          quizAttempts: {
            ...state.quizAttempts,
            [attemptId]: {
              ...attempt,
              ...results,
              endTime: new Date().toISOString()
            }
          }
        };
      }),
      
      setLiveQuizData: (data) => set(() => ({ liveQuizData: data })),
    }),
    {
      name: 'geohub-quiz-store',
    }
  )
);
