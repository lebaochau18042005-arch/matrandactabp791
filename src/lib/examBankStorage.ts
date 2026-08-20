export interface StoredExamSubmission {
  id: string;
  examId: string;
  studentName: string;
  studentId: string;
  score: number;
  answers: Record<string, unknown>;
  submittedAt: string;
}

const EXAM_STORAGE_KEY = 'geohub-exam-bank';
const SUBMISSION_STORAGE_KEY = 'geohub-exam-bank-submissions';

function readCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function readStoredExams(): any[] {
  return readCollection<any>(EXAM_STORAGE_KEY);
}

export function saveStoredExam(exam: any): any[] {
  const exams = readStoredExams();
  const next = [exam, ...exams.filter((item) => item?.id !== exam?.id)];
  writeCollection(EXAM_STORAGE_KEY, next);
  return next;
}

export function findStoredExam(id: string): any | null {
  return readStoredExams().find((exam) => exam?.id === id) || null;
}

export function readStoredSubmissions(examId: string): StoredExamSubmission[] {
  return readCollection<StoredExamSubmission>(SUBMISSION_STORAGE_KEY)
    .filter((submission) => submission.examId === examId)
    .sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
}

export function saveStoredSubmission(submission: StoredExamSubmission): void {
  const submissions = readCollection<StoredExamSubmission>(SUBMISSION_STORAGE_KEY);
  writeCollection(SUBMISSION_STORAGE_KEY, [
    submission,
    ...submissions.filter((item) => item.id !== submission.id),
  ]);
}
// Shared links intentionally keep only a local record ID; no student data is placed in URLs.
