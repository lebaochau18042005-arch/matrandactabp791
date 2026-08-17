export const GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT = {
  label: 'Chuẩn đề thi tốt nghiệp THPT môn Địa lí từ năm 2025',
  durationMinutes: 50,
  multipleChoice: 18,
  trueFalse: 4,
  trueFalseStatementsPerQuestion: 4,
  shortAnswer: 6,
  totalMainQuestions: 28,
  totalAnswerCommands: 40,
} as const;

export const GEOGRAPHY_GRADUATION_SCORE_CONFIG = {
  multipleChoicePerQuestion: 0.25,
  trueFalseByCorrectStatements: {
    0: 0,
    1: 0.1,
    2: 0.25,
    3: 0.5,
    4: 1,
  },
  shortAnswerPerQuestion: 0.25,
  maxMultipleChoiceScore: 4.5,
  maxTrueFalseScore: 4,
  maxShortAnswerScore: 1.5,
  totalScore: 10,
} as const;

export const MC_LEVEL_SEQUENCE = [
  'Nhận biết',
  'Nhận biết',
  'Nhận biết',
  'Nhận biết',
  'Nhận biết',
  'Nhận biết',
  'Thông hiểu',
  'Thông hiểu',
  'Thông hiểu',
  'Thông hiểu',
  'Thông hiểu',
  'Thông hiểu',
  'Vận dụng',
  'Vận dụng',
  'Vận dụng',
  'Vận dụng',
  'Vận dụng',
  'Vận dụng cao',
] as const;

export const TF_LEVEL_SEQUENCE = [
  'Nhận biết',
  'Thông hiểu',
  'Vận dụng',
  'Vận dụng cao',
] as const;

export const SA_LEVEL_SEQUENCE = [
  'Nhận biết',
  'Thông hiểu',
  'Vận dụng',
  'Vận dụng',
  'Vận dụng cao',
  'Vận dụng cao',
] as const;

export const MC_CORRECT_ANSWER_SEQUENCE = [
  'B',
  'D',
  'A',
  'C',
  'C',
  'B',
  'A',
  'D',
  'A',
  'C',
  'B',
  'D',
  'D',
  'A',
  'C',
  'B',
  'A',
  'D',
] as const;

export const QUESTION_TECHNICAL_CHECKLIST = [
  'Mỗi câu đo một mục tiêu học tập quan trọng và một vấn đề duy nhất.',
  'Câu dẫn rõ yêu cầu, ngắn gọn, tránh phủ định không cần thiết và tránh thuật ngữ mơ hồ.',
  'Câu nhiều lựa chọn có đúng một đáp án đúng; ba phương án nhiễu đồng dạng, hợp lí, độc lập.',
  'Không dùng phương án "Tất cả đều đúng", "Không có phương án nào đúng", "A và B đúng".',
  'Không dùng nguyên văn máy móc từ SGK; câu hỏi phải gắn với năng lực hiểu, phân tích, xử lí số liệu.',
  'Bảng/biểu đồ/ngữ liệu phải có tên, đơn vị, năm và đủ dữ kiện để trả lời.',
  'Câu đúng/sai có bốn nhận định, có cả ý đúng và ý sai, sai vì bản chất kiến thức chứ không vì mẹo chữ.',
  'Câu trả lời ngắn có dữ liệu cụ thể, công thức, đơn vị, quy tắc làm tròn và lời giải.',
];
