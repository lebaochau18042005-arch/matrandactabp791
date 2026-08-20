import {
  isEvidenceSupportedByNormalizedSource,
  normalizeSourceMatchText
} from './sourceDocumentText';

export const EXAM_PART_IDS = ['part1', 'part2', 'part3', 'part4'] as const;
export type ExamPartId = typeof EXAM_PART_IDS[number];

export const EXAM_COGNITIVE_LEVEL_IDS = ['know', 'understand', 'apply'] as const;
export type ExamCognitiveLevelId = typeof EXAM_COGNITIVE_LEVEL_IDS[number];

export const EXAM_QUESTION_TYPE_IDS = ['mc', 'tf', 'short', 'essay'] as const;
export type ExamQuestionTypeId = typeof EXAM_QUESTION_TYPE_IDS[number];

type LevelCounts = Record<ExamCognitiveLevelId, number>;

export interface ExamPlanMatrixRow {
  topic: string;
  content: string;
  spec: Record<ExamCognitiveLevelId, string>;
  mc: LevelCounts;
  tf: LevelCounts;
  short: LevelCounts;
  essay: LevelCounts;
}

export interface ExamQuestionPlanItem {
  matrixRef: string;
  part: ExamPartId;
  questionType: ExamQuestionTypeId;
  rowIndex: number;
  topic: string;
  content: string;
  level?: 'B' | 'H' | 'VD';
  alignment: string;
  statements?: ExamStatementPlanItem[];
}

export interface ExamStatementPlanItem {
  matrixRef: string;
  level: 'B' | 'H' | 'VD';
  alignment: string;
}

const QUESTION_TYPE_PART: Record<ExamQuestionTypeId, ExamPartId> = {
  mc: 'part1',
  tf: 'part2',
  short: 'part3',
  essay: 'part4'
};

const LEVEL_CODE: Record<ExamCognitiveLevelId, 'B' | 'H' | 'VD'> = {
  know: 'B',
  understand: 'H',
  apply: 'VD'
};

const normalizeCount = (value: unknown) => {
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
};

export const buildExamQuestionPlan = (
  rows: ExamPlanMatrixRow[],
  trueFalseStatementsPerQuestion = 4
): ExamQuestionPlanItem[] => {
  const plan: ExamQuestionPlanItem[] = [];

  EXAM_QUESTION_TYPE_IDS.filter(questionType => questionType !== 'tf').forEach(questionType => {
    rows.forEach((row, rowIndex) => {
      EXAM_COGNITIVE_LEVEL_IDS.forEach(level => {
        const count = normalizeCount(row[questionType]?.[level]);
        for (let ordinal = 1; ordinal <= count; ordinal += 1) {
          plan.push({
            matrixRef: 'R' + (rowIndex + 1) + '-' + questionType.toUpperCase() + '-' + LEVEL_CODE[level] + '-' + ordinal,
            part: QUESTION_TYPE_PART[questionType],
            questionType,
            rowIndex,
            topic: String(row.topic || '').trim(),
            content: String(row.content || '').trim(),
            level: LEVEL_CODE[level],
            alignment: String(row.spec?.[level] || '').trim()
          });
        }
      });
    });
  });

  const statementGroupSize = Math.max(1, normalizeCount(trueFalseStatementsPerQuestion));
  rows.forEach((row, rowIndex) => {
    const statements: ExamStatementPlanItem[] = [];
    EXAM_COGNITIVE_LEVEL_IDS.forEach(level => {
      const count = normalizeCount(row.tf?.[level]);
      for (let ordinal = 1; ordinal <= count; ordinal += 1) {
        statements.push({
          matrixRef: 'R' + (rowIndex + 1) + '-TF-' + LEVEL_CODE[level] + '-' + ordinal,
          level: LEVEL_CODE[level],
          alignment: String(row.spec?.[level] || '').trim()
        });
      }
    });

    for (let offset = 0; offset < statements.length; offset += statementGroupSize) {
      const statementGroup = statements.slice(offset, offset + statementGroupSize);
      plan.push({
        matrixRef: 'R' + (rowIndex + 1) + '-TFQ-' + (Math.floor(offset / statementGroupSize) + 1),
        part: 'part2',
        questionType: 'tf',
        rowIndex,
        topic: String(row.topic || '').trim(),
        content: String(row.content || '').trim(),
        alignment: Array.from(new Set(statementGroup.map(item => item.alignment).filter(Boolean))).join(' | '),
        statements: statementGroup
      });
    }
  });

  return plan;
};

const isValidTruthAnswer = (value: unknown) => ['đúng', 'sai'].includes(
  String(value || '').trim().toLocaleLowerCase('vi-VN')
);

export const validateGeneratedExamAgainstPlan = (
  exam: any,
  plan: ExamQuestionPlanItem[],
  sourceText = ''
): string[] => {
  const issues: string[] = [];
  const planByRef = new Map(plan.map(item => [item.matrixRef, item]));
  const seenRefs = new Set<string>();
  const normalizedSource = normalizeSourceMatchText(sourceText);

  EXAM_PART_IDS.forEach(part => {
    const questions = Array.isArray(exam?.[part]) ? exam[part] : [];
    const expectedItems = plan.filter(item => item.part === part);
    if (questions.length !== expectedItems.length) {
      issues.push(part + ' có ' + questions.length + ' câu, cần đúng ' + expectedItems.length + ' câu theo ma trận.');
    }

    questions.forEach((question: any, questionIndex: number) => {
      const label = part + ' câu ' + (questionIndex + 1);
      const matrixRef = String(question?.matrixRef || '').trim();
      const expected = planByRef.get(matrixRef);

      if (!matrixRef) issues.push(label + ' thiếu mã tham chiếu ma trận.');
      else if (!expected || expected.part !== part) issues.push(label + ' có mã tham chiếu không thuộc phần này: ' + matrixRef + '.');
      else {
        if (seenRefs.has(matrixRef)) issues.push(label + ' bị trùng mã tham chiếu ' + matrixRef + '.');
        seenRefs.add(matrixRef);
        if (part !== 'part2' && String(question?.level || '').trim().toUpperCase() !== expected.level) {
          issues.push(label + ' sai mức độ; cần ' + expected.level + ' theo ' + matrixRef + '.');
        }
      }

      if (!String(question?.question || '').trim()) issues.push(label + ' chưa có nội dung câu hỏi.');
      if (!String(question?.alignment || '').trim()) issues.push(label + ' thiếu đối chiếu với đặc tả.');
      const evidence = String(question?.sourceEvidence || '').trim();
      if (!evidence) {
        issues.push(label + ' thiếu dẫn chứng nguyên văn từ tài liệu nguồn.');
      } else if (normalizedSource && !isEvidenceSupportedByNormalizedSource(evidence, normalizedSource)) {
        issues.push(label + ' có dẫn chứng không tìm thấy trong tài liệu nguồn.');
      }

      if (part === 'part1') {
        if (!Array.isArray(question?.options) || question.options.length !== 4) {
          issues.push(label + ' phải có đúng 4 phương án A, B, C, D.');
        }
        const correctIdx = Number(question?.correctIdx);
        if (!Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx > 3) {
          issues.push(label + ' có đáp án đúng không hợp lệ.');
        }
      }

      if (part === 'part2') {
        const expectedStatements = expected?.statements || [];
        if (!Array.isArray(question?.subQuestions) || question.subQuestions.length !== 4) {
          issues.push(label + ' phải gồm đúng 4 ý a), b), c), d).');
        } else {
          const expectedStatementsByRef = new Map(expectedStatements.map(item => [item.matrixRef, item]));
          const seenStatementRefs = new Set<string>();
          question.subQuestions.forEach((statement: any, statementIndex: number) => {
            const statementLabel = label + ' ý ' + ['a', 'b', 'c', 'd'][statementIndex] + ')';
            const statementRef = String(statement?.matrixRef || '').trim();
            const expectedStatement = expectedStatementsByRef.get(statementRef);
            if (!statementRef) {
              issues.push(statementLabel + ' thiếu mã tham chiếu ý trong ma trận.');
            } else if (!expectedStatement) {
              issues.push(statementLabel + ' có mã tham chiếu ý không thuộc câu lớn: ' + statementRef + '.');
            } else {
              if (seenStatementRefs.has(statementRef)) issues.push(statementLabel + ' bị trùng mã tham chiếu ' + statementRef + '.');
              seenStatementRefs.add(statementRef);
              if (String(statement?.level || '').trim().toUpperCase() !== expectedStatement.level) {
                issues.push(statementLabel + ' sai mức độ; cần ' + expectedStatement.level + ' theo ' + statementRef + '.');
              }
              if (!String(statement?.alignment || '').trim()) {
                issues.push(statementLabel + ' thiếu đối chiếu với đặc tả.');
              }
            }
            if (!String(statement?.text || '').trim()) issues.push(statementLabel + ' chưa có nội dung.');
            if (!isValidTruthAnswer(statement?.correct)) issues.push(statementLabel + ' phải có đáp án Đúng hoặc Sai.');
          });
          expectedStatements.forEach(statement => {
            if (!seenStatementRefs.has(statement.matrixRef)) {
              issues.push(label + ' thiếu ý cho ô ma trận ' + statement.matrixRef + '.');
            }
          });
        }
      }

      if (part === 'part3') {
        if (!String(question?.correctAnswer ?? '').trim()) issues.push(label + ' thiếu đáp án trả lời ngắn.');
        if (!String(question?.solution || '').trim()) issues.push(label + ' thiếu lời giải/căn cứ.');
      }
    });
  });

  plan.forEach(item => {
    if (!seenRefs.has(item.matrixRef)) issues.push('Thiếu câu cho ô ma trận ' + item.matrixRef + '.');
  });

  return Array.from(new Set(issues));
};
