
// FIX: Removed self-import of `CognitiveLevel` and `QuestionType` which was causing
// a circular dependency and declaration conflicts. These enums are defined in this file.

export enum CognitiveLevel {
  KNOWLEDGE = "Biết",
  COMPREHENSION = "Hiểu",
  APPLICATION = "Vận dụng",
  HIGH_APPLICATION = "Vận dụng cao",
}

export const COGNITIVE_LEVELS = Object.values(CognitiveLevel);

// Chỉ 3 mức độ dùng trong MA TRẬN và BẢN ĐẶC TẢ (không có Vận dụng cao)
export const DISPLAY_COGNITIVE_LEVELS = [
  CognitiveLevel.KNOWLEDGE,
  CognitiveLevel.COMPREHENSION,
  CognitiveLevel.APPLICATION,
] as const;

export enum QuestionType {
  MULTIPLE_CHOICE = "Nhiều lựa chọn",
  TRUE_FALSE = "Đúng - sai",
  SHORT_ANSWER = "Trả lời ngắn",
  ESSAY = "Tự luận",
}

export const QUESTION_TYPES = Object.values(QuestionType);

export const TNKQ_QUESTION_TYPES = [
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.TRUE_FALSE,
  QuestionType.SHORT_ANSWER,
];

export const ESSAY_QUESTION_TYPES = [QuestionType.ESSAY];

// Năng lực đặc thù môn Địa lí theo chương trình GDPT 2018
export enum Competency {
  NL1 = "NL1: Nhận thức khoa học địa lí", // Gồm kiến thức, kĩ năng cơ bản
  NL2 = "NL2: Tìm hiểu địa lí", // Gồm sử dụng công cụ, khai thác thông tin
  NL3 = "NL3: Vận dụng kiến thức, kĩ năng đã học", // Giải quyết vấn đề thực tiễn
}

// Ánh xạ đơn giản hóa để hiển thị trong bản đặc tả theo mẫu
export const getCompetencyCode = (level: CognitiveLevel, subject: string): string => {
  const s = subject.toLowerCase();
  
  if (s.includes('địa lý') || s.includes('địa lí')) {
    switch (level) {
      case CognitiveLevel.KNOWLEDGE:
        return 'NL1';
      case CognitiveLevel.COMPREHENSION:
        return 'NL2';
      case CognitiveLevel.APPLICATION:
        return 'NL3';
      default:
        return '';
    }
  }
  
  if (s.includes('lịch sử')) {
    switch (level) {
      case CognitiveLevel.KNOWLEDGE:
        return 'NL1'; // Tìm hiểu lịch sử
      case CognitiveLevel.COMPREHENSION:
        return 'NL2'; // Nhận thức và tư duy lịch sử
      case CognitiveLevel.APPLICATION:
        return 'NL3'; // Vận dụng kiến thức, kĩ năng đã học
      default:
        return '';
    }
  }
  
  return '';
};


export type QuestionCount = {
  [key in CognitiveLevel]?: number | { count: number; pointsPerQuestion: number };
};

// NEW: A specific type for Essay questions to track chart-drawing requirement
export type EssayQuestion = {
  id: string;
  isChart: boolean;
};

// UPDATED: EssayQuestionDetails now uses the EssayQuestion type
export type EssayQuestionDetails = {
  [key in CognitiveLevel]?: EssayQuestion;
}

export interface ContentRow {
  id: string;
  chapterName: string; // VD: "Địa lí tự nhiên"
  contentName: string; // VD: "Vị trí địa lí và phạm vi lãnh thổ"
  learningOutcomes?: {
    [key in CognitiveLevel]?: string;
  };
  questions: {
    // Use the specific types for TNKQ
    [QuestionType.MULTIPLE_CHOICE]?: QuestionCount;
    [QuestionType.TRUE_FALSE]?: QuestionCount;
    [QuestionType.SHORT_ANSWER]?: QuestionCount;
    // Use the new type for Essay
    [QuestionType.ESSAY]?: EssayQuestionDetails;
  };
}

export type PointsConfig = {
  [key in QuestionType]?: {
    [key in CognitiveLevel]?: number;
  };
};

export interface ExamMatrix {
  header: {
    departmentOfEducation: string;
    schoolName: string;
    examName: string;
    examPeriod: string;
    creator: string;
    duration: number;
    grade: number;
    subject: string;
    totalPoints: number;
  };
  topics: ContentRow[];
  points: PointsConfig;
}
