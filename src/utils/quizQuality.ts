import { validateGeneratedQuiz } from './examValidation';
import type { GeneratedQuiz, QuizQuestion } from './mockAIGenerator';

export { EXPORT_BLOCK_MESSAGE, getReviewStatusLabel, validateGeneratedQuiz } from './examValidation';
export type {
  ExamValidationReport,
  QuestionValidationResult,
  ReviewStatus,
  ValidationIssue,
  ValidationScope,
  ValidationSeverity,
} from './examValidation';

export const validateQuizQuality = (questions: QuizQuestion[]): string[] => {
  const quiz: GeneratedQuiz = {
    id: 'draft_quality_check',
    lessonId: questions[0]?.lessonId || '',
    title: 'Bản nháp thẩm định',
    grade: 12,
    totalQuestions: questions.length,
    questions,
    createdAt: new Date().toISOString(),
  };

  return validateGeneratedQuiz(quiz).issues.map(issue => {
    const prefix = issue.questionNumber ? `Câu ${issue.questionNumber}: ` : '';
    return `${prefix}${issue.message}`;
  });
};
