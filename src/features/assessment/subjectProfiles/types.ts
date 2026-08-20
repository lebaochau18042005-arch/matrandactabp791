export const COGNITIVE_LEVEL_IDS = ['know', 'understand', 'apply'] as const;
export type CognitiveLevelId = typeof COGNITIVE_LEVEL_IDS[number];

export const LEGACY_QUESTION_TYPE_IDS = ['mc', 'tf', 'short', 'essay'] as const;
export type LegacyQuestionTypeId = typeof LEGACY_QUESTION_TYPE_IDS[number];

export interface CognitiveLevelProfile {
  id: CognitiveLevelId;
  label: string;
  shortLabel: string;
  aiCode: string;
}

export interface QuestionTypeProfile {
  id: LegacyQuestionTypeId | string;
  label: string;
  shortLabel: string;
  category: 'objective' | 'constructed-response';
  scoringMode: 'per-question' | 'per-level';
  defaultPoints: number | Partial<Record<CognitiveLevelId, number>>;
}

export interface SubjectCompetencyProfile {
  code: string;
  label: string;
  description: string;
}

export interface SubjectProfile {
  id: string;
  version: number;
  code: string;
  name: string;
  displayName: string;
  aliases: string[];
  supportedGrades: string[];
  cognitiveLevels: CognitiveLevelProfile[];
  questionTypes: QuestionTypeProfile[];
  competencies: SubjectCompetencyProfile[];
  validation: {
    targetTotalPoints: number;
    requireApplicationLevel: boolean;
  };
  storage: {
    draftKey: string;
    matrixHistoryKey: string;
    examHistoryKey: string;
  };
  document: {
    defaultHeader: {
      department: string;
      school: string;
      examName: string;
      creator: string;
    };
    titles: {
      matrix: string;
      specification: string;
      exam: string;
      answerKey: string;
      bundle: string;
    };
    filenames: {
      matrix: string;
      specification: string;
      exam: string;
      answerKey: string;
      bundle: string;
    };
  };
  ai: {
    roles: {
      sourceAnalysis: string;
      specification: string;
      examGeneration: string;
    };
    subjectLabel: string;
    sourceGuardrail: string;
  };
}
