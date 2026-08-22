export type ReverseQuestionType = 'mc' | 'tf' | 'short' | 'essay';
export type ReverseCognitiveLevel = 'know' | 'understand' | 'apply';

export interface ReverseExamQuestionAnalysis {
  id: string;
  label: string;
  questionType: ReverseQuestionType;
  topic: string;
  content: string;
  level: ReverseCognitiveLevel;
  learningOutcome: string;
  sourceEvidence: string;
  confidence: number;
  reasoning: string;
}

export interface ReverseExamMatrixRow {
  topic: string;
  content: string;
  mc: Record<ReverseCognitiveLevel, number>;
  tf: Record<ReverseCognitiveLevel, number>;
  short: Record<ReverseCognitiveLevel, number>;
  essay: Record<ReverseCognitiveLevel, number>;
  essayLabels: Record<ReverseCognitiveLevel, string>;
  spec: Record<ReverseCognitiveLevel, string>;
}

export interface ReverseExamSummary {
  totalQuestions: number;
  totalAssessmentItems: number;
  byType: Record<ReverseQuestionType, number>;
  byLevel: Record<ReverseCognitiveLevel, number>;
  topicCount: number;
  averageConfidence: number;
  cognitiveDemandLabel: string;
  topicCoverage: Array<{ topic: string; count: number; percentage: number }>;
}

export interface ReverseExamAnalysisResult {
  detectedSubject: string;
  grade: string;
  header: { department: string; school: string; examName: string; creator: string };
  examData: any;
  questions: ReverseExamQuestionAnalysis[];
  warnings: string[];
  summary: ReverseExamSummary;
}

const LEVELS: ReverseCognitiveLevel[] = ['know', 'understand', 'apply'];
const cleanText = (value: unknown, fallback = '') => String(value || fallback).trim();

const normalizeLevel = (value: unknown): ReverseCognitiveLevel => {
  const normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (['vd', 'van dung', 'apply', 'application'].includes(normalized)) return 'apply';
  if (['h', 'hieu', 'understand', 'comprehension'].includes(normalized)) return 'understand';
  return 'know';
};

const normalizeConfidence = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : 60;
};

const makeAnalysis = (
  item: any,
  questionType: ReverseQuestionType,
  label: string,
  id: string,
  evidenceFallback: string
): ReverseExamQuestionAnalysis => ({
  id,
  label,
  questionType,
  topic: cleanText(item?.topic, 'Chủ đề cần rà soát'),
  content: cleanText(item?.content, 'Nội dung kiến thức cần rà soát'),
  level: normalizeLevel(item?.level),
  learningOutcome: cleanText(item?.learningOutcome || item?.alignment, 'YCCĐ do AI suy luận; giáo viên cần rà soát.'),
  sourceEvidence: cleanText(item?.sourceEvidence, evidenceFallback),
  confidence: normalizeConfidence(item?.confidence),
  reasoning: cleanText(item?.reasoning, 'Phân loại theo thao tác nhận thức của câu hỏi.')
});

const normalizeOptions = (value: unknown) => {
  const options = Array.isArray(value) ? value.map(item => cleanText(item)) : [];
  while (options.length < 4) options.push('Phương án chưa nhận diện');
  return options.slice(0, 4);
};

export const summarizeReverseExam = (examData: any, questions: ReverseExamQuestionAnalysis[]): ReverseExamSummary => {
  const byType = { mc: 0, tf: 0, short: 0, essay: 0 };
  const byLevel = { know: 0, understand: 0, apply: 0 };
  const topicCounts = new Map<string, number>();
  questions.forEach(question => {
    byType[question.questionType] += 1;
    byLevel[question.level] += 1;
    const topic = cleanText(question.topic, 'Chủ đề cần rà soát');
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  });
  const demand = questions.length
    ? (byLevel.know + byLevel.understand * 2 + byLevel.apply * 3) / questions.length
    : 0;
  const totalQuestions = ['part1', 'part2', 'part3', 'part4']
    .reduce((total, part) => total + (Array.isArray(examData?.[part]) ? examData[part].length : 0), 0);
  return {
    totalQuestions,
    totalAssessmentItems: questions.length,
    byType,
    byLevel,
    topicCount: new Set(questions.map(question => question.topic).filter(Boolean)).size,
    averageConfidence: questions.length
      ? Math.round(questions.reduce((total, question) => total + question.confidence, 0) / questions.length)
      : 0,
    cognitiveDemandLabel: demand >= 2.15 ? 'Thiên về vận dụng' : demand >= 1.55 ? 'Cân bằng' : 'Thiên về nhận biết',
    topicCoverage: Array.from(topicCounts.entries())
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: questions.length ? Math.round(count * 100 / questions.length) : 0
      }))
      .sort((left, right) => right.count - left.count)
  };
};

export const normalizeReverseExamAnalysis = (raw: any): ReverseExamAnalysisResult => {
  const sourceExam = raw?.examData && typeof raw.examData === 'object' ? raw.examData : {};
  const part1 = (Array.isArray(sourceExam.part1) ? sourceExam.part1 : []).map((question: any, index: number) => ({
    ...question,
    id: index + 1,
    question: cleanText(question?.question, 'Câu hỏi chưa nhận diện'),
    options: normalizeOptions(question?.options),
    correctIdx: Math.min(3, Math.max(0, Math.floor(Number(question?.correctIdx) || 0)))
  }));
  const part2 = (Array.isArray(sourceExam.part2) ? sourceExam.part2 : []).map((question: any, index: number) => ({
    ...question,
    id: index + 1,
    question: cleanText(question?.question, 'Ngữ liệu Đúng/Sai chưa nhận diện'),
    subQuestions: (Array.isArray(question?.subQuestions) ? question.subQuestions : []).slice(0, 4).map((statement: any) => ({
      ...statement,
      text: cleanText(statement?.text, 'Nhận định chưa nhận diện'),
      correct: String(statement?.correct || '').toLowerCase().includes('đúng') ? 'Đúng' : 'Sai'
    }))
  }));
  const part3 = (Array.isArray(sourceExam.part3) ? sourceExam.part3 : []).map((question: any, index: number) => ({
    ...question,
    id: index + 1,
    question: cleanText(question?.question, 'Câu trả lời ngắn chưa nhận diện'),
    correctAnswer: cleanText(question?.correctAnswer, 'Chưa xác định'),
    solution: cleanText(question?.solution, 'Chưa có lời giải; giáo viên cần bổ sung.')
  }));
  const part4 = (Array.isArray(sourceExam.part4) ? sourceExam.part4 : []).map((question: any, index: number) => ({
    ...question,
    id: index + 1,
    question: cleanText(question?.question, 'Câu tự luận chưa nhận diện')
  }));

  const questions: ReverseExamQuestionAnalysis[] = [];
  part1.forEach((question: any, index: number) => questions.push(makeAnalysis(
    question, 'mc', `Phần I · Câu ${index + 1}`, `part1-${index + 1}`, question.question
  )));
  part2.forEach((question: any, questionIndex: number) => {
    question.subQuestions.forEach((statement: any, statementIndex: number) => {
      const letter = ['a', 'b', 'c', 'd'][statementIndex] || String(statementIndex + 1);
      questions.push(makeAnalysis({
        ...question,
        ...statement,
        topic: statement.topic || question.topic,
        content: statement.content || question.content,
        learningOutcome: statement.learningOutcome || statement.alignment || question.learningOutcome || question.alignment,
        sourceEvidence: statement.sourceEvidence || question.sourceEvidence,
        confidence: statement.confidence ?? question.confidence,
        reasoning: statement.reasoning || question.reasoning
      }, 'tf', `Phần II · Câu ${questionIndex + 1}${letter}`, `part2-${questionIndex + 1}-${letter}`, statement.text));
    });
  });
  part3.forEach((question: any, index: number) => questions.push(makeAnalysis(
    question, 'short', `Phần III · Câu ${index + 1}`, `part3-${index + 1}`, question.question
  )));
  part4.forEach((question: any, index: number) => questions.push(makeAnalysis(
    question, 'essay', `Phần IV · Câu ${index + 1}`, `part4-${index + 1}`, question.question
  )));

  const warnings = Array.isArray(raw?.warnings) ? raw.warnings.map(cleanText).filter(Boolean) : [];
  if (questions.some(question => question.confidence < 60)) warnings.push('Có câu có độ tin cậy dưới 60%; cần giáo viên kiểm tra.');
  if (part2.some((question: any) => question.subQuestions.length !== 4)) warnings.push('Có câu Đúng/Sai không đủ bốn ý.');
  const examData = { part1, part2, part3, part4 };
  return {
    detectedSubject: cleanText(raw?.detectedSubject, 'Chưa xác định'),
    grade: (() => {
      const match = cleanText(raw?.grade).match(/(?:^|\D)(10|11|12)(?:\D|$)/);
      return match?.[1] || '12';
    })(),
    header: {
      department: cleanText(raw?.header?.department),
      school: cleanText(raw?.header?.school),
      examName: cleanText(raw?.header?.examName, 'ĐỀ KIỂM TRA ĐỊNH KÌ'),
      creator: cleanText(raw?.header?.creator)
    },
    examData,
    questions,
    warnings: Array.from(new Set(warnings)),
    summary: summarizeReverseExam(examData, questions)
  };
};

export const buildMatrixRowsFromReverseAnalysis = (questions: ReverseExamQuestionAnalysis[]): ReverseExamMatrixRow[] => {
  const rows = new Map<string, ReverseExamMatrixRow>();
  const levels = () => ({ know: 0, understand: 0, apply: 0 });
  questions.forEach(question => {
    const topic = cleanText(question.topic, 'Chủ đề cần rà soát');
    const content = cleanText(question.content, 'Nội dung kiến thức cần rà soát');
    const key = `${topic.toLowerCase()}::${content.toLowerCase()}`;
    if (!rows.has(key)) rows.set(key, {
      topic, content, mc: levels(), tf: levels(), short: levels(), essay: levels(),
      essayLabels: { know: '', understand: '', apply: '' },
      spec: { know: '', understand: '', apply: '' }
    });
    const row = rows.get(key)!;
    row[question.questionType][question.level] += 1;
    if (question.questionType === 'essay') {
      const labels = row.essayLabels[question.level].split(';').map(item => item.trim()).filter(Boolean);
      const label = question.label.replace(/^Phần IV\s*·\s*Câu\s*/i, '');
      if (!labels.includes(label)) labels.push(label);
      row.essayLabels[question.level] = labels.join('; ');
    }
    const outcomes = row.spec[question.level].split('\n').map(item => item.trim()).filter(Boolean);
    if (question.learningOutcome && !outcomes.includes(question.learningOutcome)) outcomes.push(question.learningOutcome);
    row.spec[question.level] = outcomes.join('\n');
  });
  return Array.from(rows.values()).map(row => {
    LEVELS.forEach(level => {
      const used = row.mc[level] + row.tf[level] + row.short[level] + row.essay[level] > 0;
      if (used && !row.spec[level]) row.spec[level] = 'YCCĐ do AI suy luận; giáo viên cần rà soát.';
    });
    return row;
  });
};

const toStoredLevel = (level: ReverseCognitiveLevel) => level === 'apply' ? 'VD' : level === 'understand' ? 'H' : 'B';

export const synchronizeReverseExamData = (examData: any, questions: ReverseExamQuestionAnalysis[]) => {
  const source = examData && typeof examData === 'object' ? examData : {};
  const lookup = new Map(questions.map(question => [question.id, question]));
  const metadata = (question?: ReverseExamQuestionAnalysis) => question ? {
    topic: question.topic,
    content: question.content,
    level: toStoredLevel(question.level),
    learningOutcome: question.learningOutcome,
    alignment: question.learningOutcome,
    sourceEvidence: question.sourceEvidence,
    confidence: question.confidence,
    reasoning: question.reasoning
  } : {};
  const part1 = (Array.isArray(source.part1) ? source.part1 : []).map((item: any, index: number) => ({
    ...item,
    ...metadata(lookup.get(`part1-${index + 1}`)),
    id: index + 1
  }));
  const part2 = (Array.isArray(source.part2) ? source.part2 : []).map((item: any, questionIndex: number) => {
    const subQuestions = (Array.isArray(item?.subQuestions) ? item.subQuestions : []).map((statement: any, statementIndex: number) => {
      const letter = ['a', 'b', 'c', 'd'][statementIndex] || String(statementIndex + 1);
      return {
        ...statement,
        ...metadata(lookup.get(`part2-${questionIndex + 1}-${letter}`))
      };
    });
    const firstStatement = lookup.get(`part2-${questionIndex + 1}-a`);
    return { ...item, ...metadata(firstStatement), id: questionIndex + 1, subQuestions };
  });
  const part3 = (Array.isArray(source.part3) ? source.part3 : []).map((item: any, index: number) => ({
    ...item,
    ...metadata(lookup.get(`part3-${index + 1}`)),
    id: index + 1
  }));
  const part4 = (Array.isArray(source.part4) ? source.part4 : []).map((item: any, index: number) => ({
    ...item,
    ...metadata(lookup.get(`part4-${index + 1}`)),
    id: index + 1
  }));
  return { part1, part2, part3, part4 };
};

export const validateReverseExamAnalysis = (result: ReverseExamAnalysisResult) => {
  const blocking: string[] = [];
  const warnings: string[] = [];
  if (!result.questions.length) blocking.push('Không nhận diện được câu hỏi nào trong đề.');

  const incompleteClassification = result.questions.filter(question =>
    !question.topic.trim() || !question.content.trim() || !question.learningOutcome.trim() ||
    /cần rà soát/i.test(question.topic) || /cần rà soát/i.test(question.content) ||
    /cần rà soát/i.test(question.learningOutcome)
  );
  if (incompleteClassification.length) {
    blocking.push(`${incompleteClassification.length} câu chưa có chủ đề, đơn vị kiến thức hoặc YCCĐ đã được rà soát.`);
  }

  const part1 = Array.isArray(result.examData?.part1) ? result.examData.part1 : [];
  const invalidMultipleChoice = part1.filter((question: any) =>
    !String(question?.question || '').trim() ||
    !Array.isArray(question?.options) || question.options.length !== 4 ||
    question.options.some((option: unknown) => !String(option || '').trim() || /chưa nhận diện/i.test(String(option))) ||
    !Number.isInteger(Number(question?.correctIdx)) || Number(question.correctIdx) < 0 || Number(question.correctIdx) > 3
  );
  if (invalidMultipleChoice.length) blocking.push(`${invalidMultipleChoice.length} câu nhiều lựa chọn chưa đủ nội dung, bốn phương án hoặc đáp án.`);

  const part2 = Array.isArray(result.examData?.part2) ? result.examData.part2 : [];
  const invalidTrueFalse = part2.filter((question: any) =>
    !String(question?.question || '').trim() || !Array.isArray(question?.subQuestions) || question.subQuestions.length !== 4 ||
    question.subQuestions.some((statement: any) =>
      !String(statement?.text || '').trim() || !['Đúng', 'Sai'].includes(String(statement?.correct || '').trim())
    )
  );
  if (invalidTrueFalse.length) blocking.push(`${invalidTrueFalse.length} câu Đúng/Sai chưa đủ ngữ liệu hoặc bốn ý a), b), c), d).`);

  const lowConfidence = result.questions.filter(question => question.confidence < 60);
  if (lowConfidence.length) warnings.push(`${lowConfidence.length} mục có độ tin cậy dưới 60%.`);
  if (result.warnings.length) warnings.push(...result.warnings);

  return { blocking: Array.from(new Set(blocking)), warnings: Array.from(new Set(warnings)) };
};
