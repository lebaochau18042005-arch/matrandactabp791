import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { ExamMatrix } from '../types';

export interface SavedExam {
  id?: string;
  matrix: ExamMatrix;
  examContent: string;
  createdAt: number;
}

export const saveExamToCloud = async (matrix: ExamMatrix, examContent: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "exams"), {
      matrix,
      examContent,
      createdAt: Timestamp.now().toMillis()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error saving exam to Firebase: ", e);
    throw e;
  }
};

export const getSavedExams = async (): Promise<SavedExam[]> => {
  try {
    const examsRef = collection(db, "exams");
    const q = query(examsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedExam[];
  } catch (e) {
    console.error("Error getting exams from Firebase: ", e);
    throw e;
  }
};
