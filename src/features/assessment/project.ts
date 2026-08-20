import type {
  CognitiveLevelId,
  LegacyQuestionTypeId
} from './subjectProfiles/types';

export const ASSESSMENT_PROJECT_SCHEMA_VERSION = 1;

export type AssessmentSourceRole = 'knowledge' | 'learning-outcomes';

export interface AssessmentSourceDocument {
  id: string;
  role: AssessmentSourceRole;
  fileName: string;
  mimeType?: string;
  extractedText: string;
  importedAt: string;
}

export interface AssessmentKnowledgeUnit {
  id: string;
  topic: string;
  content: string;
  sourceDocumentIds: string[];
}

export interface AssessmentLearningOutcome {
  id: string;
  text: string;
  sourceDocumentId?: string;
  sourceExcerpt?: string;
  knowledgeUnitIds: string[];
}

export interface AssessmentMatrixAllocation {
  questionTypeId: LegacyQuestionTypeId | string;
  cognitiveLevelId: CognitiveLevelId;
  count: number;
  labels?: string[];
}

export interface AssessmentMatrixRowModel {
  id: string;
  topic: string;
  content: string;
  knowledgeUnitId?: string;
  learningOutcomeIds: string[];
  allocations: AssessmentMatrixAllocation[];
  specification: Partial<Record<CognitiveLevelId, string>>;
}

export interface AssessmentProject {
  schemaVersion: number;
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectProfileVersion: number;
  grade: string;
  documentHeader: {
    department: string;
    school: string;
    examName: string;
    creator: string;
  };
  sources: AssessmentSourceDocument[];
  knowledgeUnits: AssessmentKnowledgeUnit[];
  learningOutcomes: AssessmentLearningOutcome[];
  matrixRows: AssessmentMatrixRowModel[];
  pointConfiguration: Record<string, unknown>;
  matrixTargets: Record<string, unknown>;
  workflow: {
    currentStep: number;
    sourceConfirmed: boolean;
    matrixConfirmed: boolean;
    specificationConfirmed: boolean;
    examConfirmed: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}
