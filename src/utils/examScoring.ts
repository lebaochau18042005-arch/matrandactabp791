import { GEOGRAPHY_GRADUATION_SCORE_CONFIG } from '../data/examBlueprint';

type ExamAnswers = Record<string, unknown>;

export interface ExamScoreResult {
  score: number;
  earnedPoints: number;
  maxPoints: number;
}

const normalizeAnswer = (value: unknown) =>
  String(value ?? '').trim().toLocaleLowerCase('vi-VN');

const answersMatch = (question: any, actual: unknown, expected: unknown) => {
  const expectedLetter = String(expected ?? '').trim().toUpperCase();
  if (/^[A-D]$/.test(expectedLetter) && Array.isArray(question?.options)) {
    const expectedOption = question.options[expectedLetter.charCodeAt(0) - 65];
    const normalizedActual = normalizeAnswer(actual);
    return normalizedActual === normalizeAnswer(expectedOption)
      || normalizedActual === normalizeAnswer(expectedLetter);
  }
  return normalizeAnswer(actual) === normalizeAnswer(expected);
};

const normalizeTruthValue = (value: unknown): 'Đ' | 'S' | '' => {
  const normalized = String(value ?? '').trim().toLocaleUpperCase('vi-VN');
  if (['Đ', 'D', 'ĐÚNG', 'DUNG', 'TRUE'].includes(normalized)) return 'Đ';
  if (['S', 'SAI', 'FALSE'].includes(normalized)) return 'S';
  return '';
};

const extractTruthAnswers = (value: unknown): Array<'Đ' | 'S' | ''> => {
  if (Array.isArray(value)) return value.map(normalizeTruthValue);
  const normalized = String(value ?? '')
    .toLocaleUpperCase('vi-VN')
    .replace(/ĐÚNG|DUNG|TRUE/g, 'Đ')
    .replace(/SAI|FALSE/g, 'S');
  return (normalized.match(/[ĐDS]/g) || []).map(item => item === 'S' ? 'S' : 'Đ');
};

export const getTrueFalsePoints = (correctStatements: number) => {
  const safeCount = Math.min(4, Math.max(0, Math.floor(correctStatements)));
  return GEOGRAPHY_GRADUATION_SCORE_CONFIG.trueFalseByCorrectStatements[
    safeCount as keyof typeof GEOGRAPHY_GRADUATION_SCORE_CONFIG.trueFalseByCorrectStatements
  ];
};

export const calculateGraduationExamScore = (
  parts: unknown,
  studentAnswers: ExamAnswers
): ExamScoreResult => {
  let earnedPoints = 0;
  let maxPoints = 0;

  (Array.isArray(parts) ? parts : []).forEach((part: any, partIndex: number) => {
    (Array.isArray(part?.questions) ? part.questions : []).forEach((question: any, questionIndex: number) => {
      const correctAnswer = question?.correctAnswer ?? question?.correct;

      if (partIndex === 1 && Array.isArray(question?.options)) {
        const statementCount = Math.min(4, question.options.length);
        if (statementCount === 0) return;

        const expectedAnswers = extractTruthAnswers(correctAnswer);
        const correctStatements = question.options
          .slice(0, statementCount)
          .reduce((count: number, _statement: unknown, statementIndex: number) => {
            const answerKey = partIndex + '-' + questionIndex + '-' + statementIndex;
            return count + (
              normalizeTruthValue(studentAnswers[answerKey]) === expectedAnswers[statementIndex]
              && Boolean(expectedAnswers[statementIndex])
                ? 1
                : 0
            );
          }, 0);

        earnedPoints += getTrueFalsePoints(correctStatements);
        maxPoints += getTrueFalsePoints(statementCount);
        return;
      }

      const pointsPerQuestion = partIndex === 0
        ? GEOGRAPHY_GRADUATION_SCORE_CONFIG.multipleChoicePerQuestion
        : partIndex === 2
          ? GEOGRAPHY_GRADUATION_SCORE_CONFIG.shortAnswerPerQuestion
          : 1;
      maxPoints += pointsPerQuestion;
      const answerKey = partIndex + '-' + questionIndex;
      if (answersMatch(question, studentAnswers[answerKey], correctAnswer)) {
        earnedPoints += pointsPerQuestion;
      }
    });
  });

  const score = maxPoints > 0
    ? Number(Math.min(10, (earnedPoints / maxPoints) * 10).toFixed(2))
    : 0;
  return {
    score,
    earnedPoints: Number(earnedPoints.toFixed(2)),
    maxPoints: Number(maxPoints.toFixed(2))
  };
};
