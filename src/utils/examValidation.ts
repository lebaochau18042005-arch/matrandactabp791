import {
  GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT,
  GEOGRAPHY_GRADUATION_SCORE_CONFIG,
} from '../data/examBlueprint';
import {
  GEOGRAPHY_COMPETENCIES,
  getAllowedFormulaNames,
  getLessonAssessmentProfile,
} from '../data/geographyLearningOutcomes';
import type { GeneratedQuiz, QuizQuestion, Stimulus } from './mockAIGenerator';
import { hasRenderableStimulusTable } from './stimulusTable';

export type ValidationSeverity = 'blocking' | 'warning';
export type ValidationScope = 'exam' | 'question' | 'table' | 'chart' | 'short_answer';
export type ReviewStatus = 'passed' | 'warning' | 'failed';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  scope: ValidationScope;
  criterion: string;
  message: string;
  suggestion: string;
  questionId?: string;
  questionNumber?: number;
  section?: 'I' | 'II' | 'III';
}

export interface QuestionValidationResult {
  questionId: string;
  questionNumber: number;
  section?: 'I' | 'II' | 'III';
  status: ReviewStatus;
  issues: ValidationIssue[];
}

export interface ExamValidationReport {
  id: string;
  quizId: string;
  createdAt: string;
  status: ReviewStatus;
  criteriaChecked: number;
  totalCriteria: number;
  canExport: boolean;
  blockingCount: number;
  mandatoryIssueCount: number;
  warningCount: number;
  checkedCriteriaCount: number;
  totalCriteriaCount: number;
  exportBlockMessage?: string;
  questionResults: QuestionValidationResult[];
  issues: ValidationIssue[];
}

export const EXPORT_BLOCK_MESSAGE = 'Chưa thể xuất đề vì còn lỗi bắt buộc trong thẩm định.';

const REQUIRED_CRITERIA = [
  'Đúng cấu trúc đề',
  'Đúng thang điểm',
  'Đúng lớp và chủ đề',
  'Đúng yêu cầu cần đạt',
  'Đúng mức độ nhận thức',
  'Phần dẫn rõ ràng',
  'Có một đáp án đúng',
  'Phương án nhiễu hợp lí',
  'Đúng thuật ngữ Địa lí',
  'Đúng chính tả',
  'Đúng đơn vị',
  'Đúng số liệu',
  'Đúng công thức',
  'Đúng quy tắc làm tròn',
  'Đúng định dạng trả lời',
  'Bảng số liệu đúng cấu trúc',
  'Biểu đồ đúng loại',
  'Có nguồn tài liệu',
] as const;

const acceptedLevels = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
const allowedChartTypes = ['column', 'bar', 'pie', 'area', 'combined', 'line', 'cột', 'tròn', 'miền', 'kết hợp', 'đường'];
const bannedOptionPatterns = [/tất cả/i, /không có phương án nào/i, /cả\s+[A-D]\s+và\s+[A-D]/i, /[A-D]\s+và\s+[A-D]\s+đúng/i];
const forbiddenToolPatterns = [/atlat/i, /át\s*lát/i, /trang\s+atlat/i, /dựa\s+vào\s+atlat/i];
const absoluteTerms = [/luôn luôn/i, /không bao giờ/i, /tất cả/i, /hoàn toàn/i, /duy nhất/i, /chỉ có/i];

const placeholderPatterns = [
  /nhận định thứ/i,
  /thành phần\s+[12]/i,
  /^phương án\s+[A-D]$/i,
  /đặc điểm này/i,
  /chỉ\s+dựa\s+vào\s+độ\s+dài/i,
  /từ\s+khóa/i,
  /cảm\s+tính/i,
  /truyền\s+miệng/i,
  /tên\s+chương|tên\s+bài/i,
  /cụm\s+từ\s+mang\s+tính/i,
  /sơ\s+đồ\s+tư\s+duy/i,
  /phủ\s+định\s+toàn\s+bộ/i,
  /xuất\s+hiện\s+nhiều\s+nhất/i,
  /\[có đính kèm/i,
  /trích dẫn:\s*"\.\.\./i,
  /số liệu giả định\s+về.+với các giá trị đầu vào/i,
];

const weakStemPatterns = [
  /phù\s+hợp\s+nhất\s+với\s+nội\s+dung/i,
  /phù\s+hợp\s+nhất\s+với\s+bài/i,
  /phản\s+ánh\s+đúng\s+nội\s+dung\s+bài/i,
  /việc\s+học\s+nội\s+dung/i,
  /khi\s+khai\s+thác\s+nội\s+dung/i,
  /để\s+giải\s+thích\s+đúng\s+nội\s+dung/i,
  /cách\s+tiếp\s+cận\s+nào/i,
  /cách\s+sử\s+dụng\s+kiến\s+thức\s+bài/i,
  /bước\s+đầu\s+tiên\s+cần\s+thực\s+hiện/i,
  /nội\s+dung\s+.+\s+là\s+gì/i,
];

const stemTaskPatterns = [
  /phát\s+biểu\s+nào/i,
  /nhận\s+xét\s+nào/i,
  /nhận\s+định\s+nào/i,
  /đặc\s+điểm\s+nào/i,
  /biểu\s+hiện\s+nào/i,
  /nguyên\s+nhân/i,
  /nhân\s+tố\s+nào/i,
  /yếu\s+tố\s+nào/i,
  /ý\s+nghĩa/i,
  /tác\s+động/i,
  /hệ\s+quả/i,
  /mối\s+quan\s+hệ/i,
  /biện\s+pháp/i,
  /giải\s+pháp/i,
  /dạng\s+biểu\s+đồ/i,
  /căn\s+cứ\s+vào/i,
  /vận\s+dụng/i,
  /đánh\s+giá/i,
  /tính/i,
  /đổi/i,
  /so\s+sánh/i,
  /giải\s+thích/i,
  /phân\s+tích/i,
  /xác\s+định/i,
  /cho\s+biết/i,
  /thao\s+tác\s+nào/i,
  /thông\s+tin\s+nào/i,
];

const normalize = (value?: string) => (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
const hasText = (value?: string) => Boolean(value && value.trim().length > 0);
const isObjectWithKeys = (value: unknown) => Boolean(value) && typeof value === 'object' && Object.keys(value as Record<string, unknown>).length > 0;

const addIssue = (
  issues: ValidationIssue[],
  severity: ValidationSeverity,
  scope: ValidationScope,
  criterion: string,
  message: string,
  suggestion: string,
  question?: QuizQuestion,
  questionNumber?: number
) => {
  issues.push({
    id: `${scope}_${criterion}_${question?.id || 'exam'}_${issues.length}`,
    severity,
    scope,
    criterion,
    message,
    suggestion,
    questionId: question?.id,
    questionNumber,
    section: question?.section,
  });
};

const collectQuestionText = (q: QuizQuestion): string[] => {
  const values = [
    q.topic,
    q.question || '',
    q.explanation || '',
    q.stimulus?.title || '',
    q.stimulus?.content || '',
    q.stimulus?.unit || '',
    q.stimulus?.source || '',
    q.learningOutcome || '',
    q.competency || '',
    (q as any).sourceReference || '',
  ];
  if (q.type === 'multiple_choice') values.push(...q.options.map(option => option.text));
  if (q.type === 'true_false') q.statements.forEach(statement => values.push(statement.text, statement.explanation));
  if (q.type === 'short_answer') values.push(q.shortAnswer?.formula || '', q.shortAnswer?.unit || '', q.shortAnswer?.rounding || '', q.shortAnswer?.solution || '', (q.shortAnswer as any)?.answerFormat || '');
  return values;
};

const hasQuestionSource = (q: QuizQuestion) => hasText((q as any).sourceReference) || hasText(q.stimulus?.source) || (hasText(q.lessonId) && hasText(q.learningOutcome));

const collectStemAndStimulusText = (q: QuizQuestion): string[] => {
  const values = [q.question || '', q.stimulus?.title || '', q.stimulus?.content || ''];
  if (q.type === 'true_false') q.statements.forEach(statement => values.push(statement.text));
  return values;
};

const referencesTable = (q: QuizQuestion) => q.stimulus?.type === 'table' || collectStemAndStimulusText(q).some(text => /bảng\s+số\s+liệu|căn cứ vào bảng/i.test(text));
const referencesChart = (q: QuizQuestion) => q.stimulus?.type === 'chart' || collectStemAndStimulusText(q).some(text => (
  /(?:dựa|căn\s+cứ)\s+vào\s+(?:biểu\s+đồ|hình)|cho\s+(?:biểu\s+đồ|hình)|quan\s+sát\s+(?:biểu\s+đồ|hình)|(?:biểu\s+đồ|hình)\s+(?:sau|dưới\s+đây|đính\s+kèm)/i
    .test(text)
));

const looksLikeStructuredTable = (content?: string) => {
  if (!content) return false;
  if (hasRenderableStimulusTable({ content })) return true;
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  return lines.length >= 2 && (lines.some(line => line.includes('|')) || lines.some(line => line.split(/\s{2,}|\t|;/).length >= 3));
};

const extractRoundingDigits = (rounding?: string) => {
  if (!rounding) return null;
  if (/hàng\s+đơn\s+vị|làm tròn đến 0/i.test(rounding)) return 0;
  const match = rounding.match(/(\d+)\s*(chữ số thập phân|số thập phân)/i);
  return match ? Number(match[1]) : null;
};

const validateStem = (q: QuizQuestion, questionNumber: number, issues: ValidationIssue[]) => {
  const questionText = q.question || '';
  if (normalize(questionText).length < 20) {
    addIssue(issues, 'blocking', 'question', 'Phần dẫn rõ ràng', 'Câu dẫn quá ngắn hoặc chưa nêu rõ yêu cầu.', 'Viết lại câu dẫn thành một yêu cầu rõ ràng, chỉ kiểm tra một vấn đề.', q, questionNumber);
  }
  if (weakStemPatterns.some(pattern => pattern.test(questionText))) {
    addIssue(issues, 'blocking', 'question', 'Phần dẫn rõ ràng', 'Câu dẫn còn chung chung hoặc đang hỏi về "nội dung bài", chưa giống quy cách câu hỏi trong đề thi.', 'Viết lại theo dạng nêu nhiệm vụ cụ thể: Phát biểu/nhận xét/đặc điểm/nguyên nhân/biểu đồ/căn cứ bảng số liệu...', q, questionNumber);
  }
  if (!stemTaskPatterns.some(pattern => pattern.test(questionText))) {
    addIssue(issues, 'warning', 'question', 'Phần dẫn rõ ràng', 'Câu dẫn chưa thể hiện rõ thao tác cần làm của học sinh.', 'Bổ sung động từ/nhiệm vụ kiểm tra như nhận xét, xác định, giải thích, so sánh, tính toán hoặc chọn dạng biểu đồ.', q, questionNumber);
  }
  if ((questionText.match(/\?/g)?.length ?? 0) > 1) {
    addIssue(issues, 'blocking', 'question', 'Phần dẫn rõ ràng', 'Câu dẫn có nhiều hơn một câu hỏi.', 'Tách thành câu hỏi khác hoặc chỉ giữ một yêu cầu kiểm tra duy nhất.', q, questionNumber);
  }
  if (q.type === 'multiple_choice' && !/[?？]\s*$/.test(questionText)) {
    addIssue(issues, 'warning', 'question', 'Phần dẫn rõ ràng', 'Câu trắc nghiệm chưa kết thúc bằng dấu hỏi.', 'Viết câu dẫn thành một câu hỏi hoàn chỉnh.', q, questionNumber);
  }
  const negationTerms = questionText.replace(/\bkhông\s+(?:khí|gian)/gi, '').match(/\b(?:không|chưa)\b/gi) || [];
  if (negationTerms.length > 1) {
    addIssue(issues, 'blocking', 'question', 'Phần dẫn rõ ràng', 'Câu dẫn có dấu hiệu phủ định kép.', 'Viết lại câu hỏi theo hướng khẳng định hoặc làm rõ từ phủ định bắt buộc.', q, questionNumber);
  }
  if (negationTerms.length > 0 && !/KHÔNG|CHƯA/.test(questionText)) {
    addIssue(issues, 'warning', 'question', 'Phần dẫn rõ ràng', 'Câu dẫn có từ phủ định nhưng chưa làm nổi bật từ KHÔNG/CHƯA.', 'Viết hoa từ KHÔNG hoặc CHƯA nếu bắt buộc dùng câu phủ định.', q, questionNumber);
  }
};

export const validateDataTable = (q: QuizQuestion, questionNumber: number): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const stimulus = q.stimulus as Stimulus | undefined;
  if (!referencesTable(q)) return issues;
  if (!stimulus || stimulus.type === 'none' || (!hasText(stimulus.content) && !hasRenderableStimulusTable(stimulus))) {
    addIssue(issues, 'blocking', 'table', 'Bảng số liệu đúng cấu trúc', 'Câu hỏi yêu cầu khai thác bảng số liệu nhưng chưa có bảng/ngữ liệu bảng đi kèm.', 'Bổ sung bảng số liệu có cấu trúc, tiêu đề, đơn vị và nguồn.', q, questionNumber);
    return issues;
  }
  if (!hasText(stimulus.title)) addIssue(issues, 'blocking', 'table', 'Bảng số liệu đúng cấu trúc', 'Bảng số liệu thiếu tên bảng.', 'Nhập tên bảng thể hiện đối tượng, thời gian và nội dung số liệu.', q, questionNumber);
  if (!hasText(stimulus.unit)) addIssue(issues, 'blocking', 'table', 'Đúng đơn vị', 'Bảng số liệu thiếu đơn vị.', 'Bổ sung đơn vị trong trường ngữ liệu hoặc ngay trên bảng.', q, questionNumber);
  if (!hasText(stimulus.source)) addIssue(issues, 'blocking', 'table', 'Có nguồn tài liệu', 'Bảng số liệu thiếu nguồn.', 'Ghi nguồn số liệu hoặc ghi rõ số liệu giả định nếu chỉ dùng dữ liệu mẫu.', q, questionNumber);
  if (!hasRenderableStimulusTable(stimulus) && !looksLikeStructuredTable(stimulus.content)) addIssue(issues, 'blocking', 'table', 'Bảng số liệu đúng cấu trúc', 'Bảng số liệu đang giống đoạn văn, chưa phải bảng có hàng/cột rõ.', 'Trình bày bảng theo cấu trúc hàng/cột hoặc nhập tableData có hàng/cột.', q, questionNumber);
  if (q.type === 'short_answer' && !isObjectWithKeys(q.shortAnswer?.inputData)) addIssue(issues, 'blocking', 'table', 'Đúng số liệu', 'Câu tính toán dùng bảng nhưng chưa lưu dữ liệu đầu vào có cấu trúc.', 'Lưu các số liệu cần tính vào inputData để hệ thống kiểm tra công thức.', q, questionNumber);
  return issues;
};

export const validateChart = (q: QuizQuestion, questionNumber: number): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const stimulus: any = q.stimulus;
  if (!referencesChart(q)) return issues;
  if (!stimulus || stimulus.type === 'none' || (!hasText(stimulus.content) && !hasRenderableStimulusTable(stimulus) && !isObjectWithKeys(stimulus.chartConfig))) {
    addIssue(issues, 'blocking', 'chart', 'Biểu đồ đúng loại', 'Câu hỏi yêu cầu dựa vào biểu đồ nhưng chưa có biểu đồ/ngữ liệu biểu đồ.', 'Bổ sung biểu đồ thật hoặc cấu hình dữ liệu biểu đồ trước khi xuất đề.', q, questionNumber);
    return issues;
  }
  const chartType = stimulus.chartType || stimulus.chartConfig?.type || '';
  if (!chartType && stimulus.type === 'chart') addIssue(issues, 'blocking', 'chart', 'Biểu đồ đúng loại', 'Biểu đồ chưa khai báo loại biểu đồ.', 'Chọn loại biểu đồ phù hợp: cột, tròn, miền, kết hợp hoặc đường.', q, questionNumber);
  else if (chartType && !allowedChartTypes.some(type => normalize(chartType).includes(type))) addIssue(issues, 'blocking', 'chart', 'Biểu đồ đúng loại', `Loại biểu đồ "${chartType}" chưa nằm trong danh sách được phép.`, 'Chỉ dùng biểu đồ cột, tròn, miền, kết hợp hoặc đường.', q, questionNumber);
  if (!hasText(stimulus.title)) addIssue(issues, 'blocking', 'chart', 'Biểu đồ đúng loại', 'Biểu đồ thiếu tên.', 'Bổ sung tên biểu đồ nêu rõ đối tượng, thời gian và chỉ tiêu.', q, questionNumber);
  if (!hasText(stimulus.unit)) addIssue(issues, 'blocking', 'chart', 'Đúng đơn vị', 'Biểu đồ thiếu đơn vị.', 'Bổ sung đơn vị cho trục hoặc dữ liệu biểu đồ.', q, questionNumber);
  if (!hasText(stimulus.source)) addIssue(issues, 'blocking', 'chart', 'Có nguồn tài liệu', 'Biểu đồ thiếu nguồn số liệu.', 'Ghi nguồn số liệu hoặc ghi rõ số liệu giả định nếu dùng dữ liệu mẫu.', q, questionNumber);
  return issues;
};

export const validateShortAnswer = (q: QuizQuestion, questionNumber: number, allowedFormulaNames: string[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (q.type !== 'short_answer') return issues;
  validateStem(q, questionNumber, issues);
  if (!/hãy\s+tính|hãy\s+đổi|tính|đổi|xác\s+định|cho\s+biết/i.test(q.question || '')) addIssue(issues, 'warning', 'question', 'Phần dẫn rõ ràng', 'Câu trả lời ngắn chưa nêu rõ thao tác tính toán/xác định.', 'Dùng câu dẫn trực tiếp như: Hãy tính..., Hãy đổi..., Cho biết..., Xác định...', q, questionNumber);
  const data: any = q.shortAnswer;
  if (!data) {
    addIssue(issues, 'blocking', 'short_answer', 'Đúng định dạng trả lời', 'Câu trả lời ngắn chưa có dữ liệu đáp án.', 'Bổ sung shortAnswer gồm công thức, dữ liệu đầu vào, đáp án, đơn vị và quy tắc làm tròn.', q, questionNumber);
    return issues;
  }
  if (!isObjectWithKeys(data.inputData)) addIssue(issues, 'blocking', 'short_answer', 'Đúng số liệu', 'Câu trả lời ngắn thiếu dữ liệu đầu vào có cấu trúc.', 'Bổ sung inputData để hệ thống đối chiếu phép tính.', q, questionNumber);
  if (!hasText(data.formula)) addIssue(issues, 'blocking', 'short_answer', 'Đúng công thức', 'Câu trả lời ngắn thiếu công thức/thao tác tính.', 'Chọn công thức phù hợp với YCCĐ của bài học.', q, questionNumber);
  else if (allowedFormulaNames.length > 0 && !allowedFormulaNames.includes(data.formula)) addIssue(issues, 'blocking', 'short_answer', 'Đúng yêu cầu cần đạt', `Công thức "${data.formula}" chưa phù hợp YCCĐ bài học này.`, `Chỉ dùng: ${allowedFormulaNames.join(', ')}.`, q, questionNumber);
  if (typeof data.correctAnswer !== 'number' || Number.isNaN(data.correctAnswer)) addIssue(issues, 'blocking', 'short_answer', 'Có một đáp án đúng', 'Câu trả lời ngắn chưa có đáp án chuẩn dạng số.', 'Nhập đáp án chuẩn là số để hệ thống chấm tự động.', q, questionNumber);
  if (!hasText(data.unit)) addIssue(issues, 'blocking', 'short_answer', 'Đúng đơn vị', 'Câu trả lời ngắn thiếu đơn vị.', 'Ghi rõ đơn vị trong câu dẫn và trường đáp án.', q, questionNumber);
  if (!hasText(data.rounding) || extractRoundingDigits(data.rounding) === null) addIssue(issues, 'blocking', 'short_answer', 'Đúng quy tắc làm tròn', 'Câu trả lời ngắn thiếu quy tắc làm tròn rõ ràng.', 'Ghi rõ làm tròn đến hàng đơn vị, 1 chữ số thập phân hoặc 2 chữ số thập phân.', q, questionNumber);
  if (!hasText(data.solution) || data.solution.length < 20) addIssue(issues, 'blocking', 'short_answer', 'Đúng công thức', 'Câu trả lời ngắn thiếu lời giải/công thức đủ rõ.', 'Bổ sung lời giải có phép tính và kết quả cuối cùng.', q, questionNumber);
  if (!hasText((data as any).answerFormat) || !/4\s*ô|nhập\s*số/i.test((data as any).answerFormat)) addIssue(issues, 'warning', 'short_answer', 'Đúng định dạng trả lời', 'Câu trả lời ngắn chưa mô tả rõ định dạng nhập đáp án.', 'Ghi rõ học sinh nhập số, không nhập đơn vị, mô phỏng phiếu trả lời 4 ô nếu cần.', q, questionNumber);
  return issues;
};

const validateMultipleChoice = (q: QuizQuestion, questionNumber: number): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (q.type !== 'multiple_choice') return issues;
  validateStem(q, questionNumber, issues);
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    addIssue(issues, 'blocking', 'question', 'Có một đáp án đúng', 'Câu trắc nghiệm phải có đúng 4 phương án A, B, C, D.', 'Bổ sung hoặc rút gọn về đúng 4 phương án.', q, questionNumber);
    return issues;
  }
  if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) addIssue(issues, 'blocking', 'question', 'Có một đáp án đúng', 'Đáp án đúng không hợp lệ.', 'Chọn một đáp án đúng trong A, B, C hoặc D.', q, questionNumber);
  const optionTexts = q.options.map(option => normalize(option.text));
  if (new Set(optionTexts).size !== optionTexts.length) addIssue(issues, 'blocking', 'question', 'Phương án nhiễu hợp lí', 'Có phương án bị trùng hoặc quá giống nhau.', 'Sửa các phương án nhiễu để độc lập và cùng phạm trù.', q, questionNumber);
  if (optionTexts.some(text => bannedOptionPatterns.some(pattern => pattern.test(text)))) addIssue(issues, 'blocking', 'question', 'Phương án nhiễu hợp lí', 'Có phương án bị cấm như "Tất cả", "Không có phương án nào" hoặc gộp A/B.', 'Thay bằng phương án nhiễu cụ thể, cùng phạm trù với đáp án đúng.', q, questionNumber);
  const correctOption = q.options.find(option => option.key === q.correctAnswer);
  const averageLength = q.options.reduce((sum, option) => sum + option.text.length, 0) / q.options.length;
  if (correctOption && correctOption.text.length > averageLength * 1.8 && correctOption.text.length > 80) addIssue(issues, 'warning', 'question', 'Phương án nhiễu hợp lí', 'Đáp án đúng dài hơn bất thường so với các nhiễu.', 'Rút gọn đáp án đúng hoặc làm các phương án tương đương hơn về độ dài.', q, questionNumber);
  return issues;
};

const validateTrueFalse = (q: QuizQuestion, questionNumber: number): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (q.type !== 'true_false') return issues;
  validateStem(q, questionNumber, issues);
  if (!/căn\s+cứ\s+vào|dựa\s+vào|cho\s+bảng|cho\s+biểu\s+đồ|hãy\s+(xác\s+định|phân\s+tích|cho\s+biết)|đúng\s+hay\s+sai/i.test(q.question || '')) addIssue(issues, 'warning', 'question', 'Phần dẫn rõ ràng', 'Câu dẫn đúng/sai chưa nêu rõ căn cứ hoặc lệnh xử lí nhận định.', 'Bổ sung ngữ liệu/tình huống và yêu cầu xác định đúng/sai cho 4 ý a, b, c, d.', q, questionNumber);
  if (!q.stimulus || q.stimulus.type === 'none' || (!hasText(q.stimulus.content) && !hasRenderableStimulusTable(q.stimulus))) addIssue(issues, 'blocking', 'question', 'Phần dẫn rõ ràng', 'Câu đúng/sai thiếu ngữ liệu chung.', 'Bổ sung đoạn thông tin, bảng, biểu đồ hoặc tình huống địa lí cho câu đúng/sai.', q, questionNumber);
  if (!Array.isArray(q.statements) || q.statements.length !== GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.trueFalseStatementsPerQuestion) {
    addIssue(issues, 'blocking', 'question', 'Có một đáp án đúng', 'Câu đúng/sai phải có đúng 4 ý a, b, c, d.', 'Sửa số lượng nhận định về đúng 4 ý.', q, questionNumber);
    return issues;
  }
  const labels = ['a', 'b', 'c', 'd'];
  if (new Set(q.statements.map(statement => statement.answer)).size < 2) addIssue(issues, 'warning', 'question', 'Có một đáp án đúng', 'Bốn ý đúng/sai đang cùng một trạng thái, dễ lệch cấu trúc kiểm tra.', 'Nên có cả ý đúng và ý sai nếu phù hợp ngữ liệu.', q, questionNumber);
  q.statements.forEach((statement, index) => {
    if (statement.label !== labels[index]) addIssue(issues, 'blocking', 'question', 'Đúng định dạng trả lời', `Ý thứ ${index + 1} chưa đúng nhãn ${labels[index]}.`, 'Đặt nhãn lần lượt a, b, c, d.', q, questionNumber);
    if (!hasText(statement.text)) addIssue(issues, 'blocking', 'question', 'Phần dẫn rõ ràng', `Ý ${labels[index]} chưa có mệnh đề.`, 'Viết mỗi ý thành một mệnh đề hoàn chỉnh.', q, questionNumber);
    if (typeof statement.answer !== 'boolean') addIssue(issues, 'blocking', 'question', 'Có một đáp án đúng', `Ý ${labels[index]} chưa có đáp án đúng/sai dạng boolean.`, 'Chọn Đúng hoặc Sai cho từng ý.', q, questionNumber);
    if (!hasText(statement.explanation)) addIssue(issues, 'warning', 'question', 'Đúng thuật ngữ Địa lí', `Ý ${labels[index]} chưa có giải thích.`, 'Bổ sung giải thích ngắn gọn dựa trên kiến thức/ngữ liệu.', q, questionNumber);
    if (absoluteTerms.some(pattern => pattern.test(statement.text)) && !/số liệu|ngữ liệu|theo bảng|trong bảng/i.test(statement.text)) addIssue(issues, 'warning', 'question', 'Phần dẫn rõ ràng', `Ý ${labels[index]} dùng từ tuyệt đối dễ tạo mẹo đoán.`, 'Chỉ dùng từ tuyệt đối khi có căn cứ rõ trong ngữ liệu.', q, questionNumber);
  });
  return issues;
};

export const validateQuestion = (q: QuizQuestion, questionNumber: number, allowedFormulaNames: string[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!hasText(q.lessonId) || !hasText(q.topic)) addIssue(issues, 'blocking', 'question', 'Đúng lớp và chủ đề', 'Câu hỏi chưa gắn đúng bài học/chủ đề.', 'Chọn đúng lớp, bài học và chủ đề trong SGK.', q, questionNumber);
  if (!hasText(q.learningOutcome)) addIssue(issues, 'blocking', 'question', 'Đúng yêu cầu cần đạt', 'Câu hỏi chưa gắn YCCĐ cụ thể.', 'Gắn câu hỏi với YCCĐ biết, hiểu hoặc vận dụng của bài học.', q, questionNumber);
  if (!q.competency || !GEOGRAPHY_COMPETENCIES.includes(q.competency as any)) addIssue(issues, 'blocking', 'question', 'Đúng yêu cầu cần đạt', 'Câu hỏi chưa gắn đúng thành phần năng lực đặc thù môn Địa lí.', 'Chọn một trong 3 năng lực đặc thù môn Địa lí.', q, questionNumber);
  if (!q.level || !acceptedLevels.includes(q.level)) addIssue(issues, 'blocking', 'question', 'Đúng mức độ nhận thức', 'Câu hỏi thiếu hoặc sai mức độ nhận thức.', 'Chọn Nhận biết, Thông hiểu, Vận dụng hoặc Vận dụng cao.', q, questionNumber);
  if (!hasQuestionSource(q)) addIssue(issues, 'blocking', 'question', 'Có nguồn tài liệu', 'Câu hỏi chưa xác định được nguồn tài liệu.', 'Bổ sung nguồn SGK/tài liệu giáo viên cung cấp hoặc nguồn số liệu rõ ràng.', q, questionNumber);
  if (collectQuestionText(q).map(normalize).some(text => forbiddenToolPatterns.some(pattern => pattern.test(text)))) addIssue(issues, 'blocking', 'question', 'Đúng nội dung tài liệu', 'Câu hỏi có nhắc tới Atlat. Đề thi không được yêu cầu sử dụng Atlat Địa lí Việt Nam.', 'Xóa yêu cầu dùng Atlat hoặc đưa bản đồ/lược đồ cần thiết vào ngay trong đề.', q, questionNumber);
  if (collectQuestionText(q).map(normalize).some(text => placeholderPatterns.some(pattern => pattern.test(text)))) addIssue(issues, 'blocking', 'question', 'Đúng nội dung tài liệu', 'Câu hỏi còn dấu hiệu câu mẫu/chung chung hoặc dữ liệu giả chưa đủ kiểm định.', 'Thay bằng dữ liệu, thuật ngữ và ngữ cảnh cụ thể của bài học.', q, questionNumber);
  if ((q.level === 'Vận dụng' || q.level === 'Vận dụng cao') && !referencesTable(q) && !referencesChart(q) && q.type !== 'short_answer' && !/tình huống|nhận xét|phân tích|so sánh|giải thích|vận dụng|đánh giá|thao tác/i.test(q.question || '')) addIssue(issues, 'warning', 'question', 'Đúng mức độ nhận thức', 'Câu đang gắn mức vận dụng nhưng chưa có dữ liệu, tình huống hoặc thao tác xử lí rõ.', 'Bổ sung bảng/biểu đồ/tình huống hoặc đổi mức độ nhận thức phù hợp.', q, questionNumber);
  issues.push(...validateMultipleChoice(q, questionNumber));
  issues.push(...validateTrueFalse(q, questionNumber));
  issues.push(...validateDataTable(q, questionNumber));
  issues.push(...validateChart(q, questionNumber));
  issues.push(...validateShortAnswer(q, questionNumber, allowedFormulaNames));
  return issues;
};

export const validateExam = (quiz: GeneratedQuiz): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const questions = quiz.questions || [];
  const mcCount = questions.filter(q => q.type === 'multiple_choice').length;
  const tfCount = questions.filter(q => q.type === 'true_false').length;
  const saCount = questions.filter(q => q.type === 'short_answer').length;
  if (questions.length !== GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.totalMainQuestions || mcCount !== GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.multipleChoice || tfCount !== GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.trueFalse || saCount !== GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.shortAnswer) addIssue(issues, 'blocking', 'exam', 'Đúng cấu trúc đề', `Cấu trúc hiện có: ${mcCount} TNKQ, ${tfCount} Đ/S, ${saCount} trả lời ngắn; tổng ${questions.length} câu.`, `Cần đúng ${GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.multipleChoice} TNKQ, ${GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.trueFalse} Đ/S, ${GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.shortAnswer} trả lời ngắn.`);
  const tfFullScore = GEOGRAPHY_GRADUATION_SCORE_CONFIG.trueFalseByCorrectStatements[4 as keyof typeof GEOGRAPHY_GRADUATION_SCORE_CONFIG.trueFalseByCorrectStatements];
  const totalScore = GEOGRAPHY_GRADUATION_SCORE_CONFIG.maxMultipleChoiceScore + GEOGRAPHY_GRADUATION_SCORE_CONFIG.maxShortAnswerScore + (tfFullScore * GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT.trueFalse);
  if (Math.abs(totalScore - GEOGRAPHY_GRADUATION_SCORE_CONFIG.totalScore) > 0.001) addIssue(issues, 'blocking', 'exam', 'Đúng thang điểm', `Tổng điểm cấu hình đang là ${totalScore}, chưa đúng ${GEOGRAPHY_GRADUATION_SCORE_CONFIG.totalScore}.`, 'Kiểm tra lại thang điểm TNKQ, Đ/S và trả lời ngắn.');
  const ids = questions.map(q => q.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) addIssue(issues, 'blocking', 'exam', 'Đúng cấu trúc đề', 'Có mã câu hỏi bị trùng.', 'Tạo lại hoặc sửa id câu hỏi để mỗi câu có mã riêng.');
  return issues;
};

export const getReviewStatusLabel = (status: ReviewStatus) => {
  if (status === 'passed') return 'Đạt';
  if (status === 'failed') return 'Chưa đạt';
  return 'Cần rà soát';
};

export const validateGeneratedQuiz = (quiz: GeneratedQuiz): ExamValidationReport => {
  const examIssues = validateExam(quiz);
  const questionResults = (quiz.questions || []).map((question, index) => {
    const profile = getLessonAssessmentProfile(question.lessonId || quiz.lessonId || '', quiz.title, question.topic || '');
    const allowedFormulaNames = getAllowedFormulaNames(profile);
    const issues = validateQuestion(question, index + 1, allowedFormulaNames);
    const status: ReviewStatus = issues.some(issue => issue.severity === 'blocking') ? 'failed' : (issues.length > 0 ? 'warning' : 'passed');
    return { questionId: question.id, questionNumber: index + 1, section: question.section, status, issues };
  });
  const issues = [...examIssues, ...questionResults.flatMap(result => result.issues)];
  const blockingCount = issues.filter(issue => issue.severity === 'blocking').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;
  return {
    id: `validation_${Date.now()}`,
    quizId: quiz.id,
    createdAt: new Date().toISOString(),
    status: blockingCount > 0 ? 'failed' : (warningCount > 0 ? 'warning' : 'passed'),
    criteriaChecked: REQUIRED_CRITERIA.length,
    totalCriteria: REQUIRED_CRITERIA.length,
    canExport: blockingCount === 0,
    blockingCount,
    mandatoryIssueCount: blockingCount,
    warningCount,
    checkedCriteriaCount: REQUIRED_CRITERIA.length,
    totalCriteriaCount: REQUIRED_CRITERIA.length,
    exportBlockMessage: blockingCount > 0 ? EXPORT_BLOCK_MESSAGE : undefined,
    questionResults,
    issues,
  };
};
