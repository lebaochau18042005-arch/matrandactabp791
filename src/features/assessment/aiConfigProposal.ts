export const MATRIX_QUESTION_TYPE_IDS = ['mc', 'tf', 'short', 'essay'] as const;
export const MATRIX_COGNITIVE_LEVEL_IDS = ['know', 'understand', 'apply'] as const;

export type MatrixQuestionTypeId = typeof MATRIX_QUESTION_TYPE_IDS[number];
export type MatrixCognitiveLevelId = typeof MATRIX_COGNITIVE_LEVEL_IDS[number];

export type MatrixLevelCounts = Record<MatrixCognitiveLevelId, number>;
export type MatrixTargets = Record<MatrixQuestionTypeId, MatrixLevelCounts>;

export interface MatrixPointConfig {
  mc: number;
  tf: number;
  short: number;
  essay: Record<MatrixCognitiveLevelId, number>;
}

export interface MatrixProposalBasis {
  topic: string;
  learningOutcome: string;
  level: MatrixCognitiveLevelId;
  evidence: string;
}

export interface AiMatrixConfigProposal {
  targets: MatrixTargets;
  points: MatrixPointConfig;
  rationale: string[];
  sourceBasis: MatrixProposalBasis[];
  warnings: string[];
}

const normalizeCount = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
};

const normalizePoint = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
};

const normalizeLevel = (value: unknown): MatrixCognitiveLevelId => {
  const normalized = String(value || '').trim().toLowerCase();
  if (['apply', 'vd', 'vận dụng', 'van dung'].includes(normalized)) return 'apply';
  if (['understand', 'h', 'hiểu', 'hieu'].includes(normalized)) return 'understand';
  return 'know';
};

export const normalizeAiMatrixConfigProposal = (value: unknown): AiMatrixConfigProposal => {
  const candidate = value && typeof value === 'object' ? value as Record<string, any> : {};
  const targets = Object.fromEntries(MATRIX_QUESTION_TYPE_IDS.map(questionType => [
    questionType,
    Object.fromEntries(MATRIX_COGNITIVE_LEVEL_IDS.map(level => [
      level,
      normalizeCount(candidate.targets?.[questionType]?.[level])
    ]))
  ])) as MatrixTargets;

  const proposal: AiMatrixConfigProposal = {
    targets,
    points: {
      mc: normalizePoint(candidate.points?.mc),
      tf: normalizePoint(candidate.points?.tf),
      short: normalizePoint(candidate.points?.short),
      essay: {
        know: normalizePoint(candidate.points?.essay?.know),
        understand: normalizePoint(candidate.points?.essay?.understand),
        apply: normalizePoint(candidate.points?.essay?.apply)
      }
    },
    rationale: Array.isArray(candidate.rationale)
      ? candidate.rationale.map((item: unknown) => String(item || '').trim()).filter(Boolean)
      : [],
    sourceBasis: Array.isArray(candidate.sourceBasis)
      ? candidate.sourceBasis.map((item: any) => ({
          topic: String(item?.topic || '').trim(),
          learningOutcome: String(item?.learningOutcome || '').trim(),
          level: normalizeLevel(item?.level),
          evidence: String(item?.evidence || '').trim()
        })).filter((item: MatrixProposalBasis) => item.topic || item.learningOutcome || item.evidence)
      : [],
    warnings: Array.isArray(candidate.warnings)
      ? candidate.warnings.map((item: unknown) => String(item || '').trim()).filter(Boolean)
      : []
  };

  const totalQuestions = MATRIX_QUESTION_TYPE_IDS.reduce((sum, questionType) =>
    sum + MATRIX_COGNITIVE_LEVEL_IDS.reduce((levelSum, level) => levelSum + proposal.targets[questionType][level], 0), 0);
  if (totalQuestions === 0) {
    throw new Error('AI chưa đề xuất được số câu hỏi hợp lệ.');
  }
  return proposal;
};

export const calculateMatrixProposalPoints = (proposal: AiMatrixConfigProposal) =>
  MATRIX_COGNITIVE_LEVEL_IDS.reduce((total, level) => total
    + proposal.targets.mc[level] * proposal.points.mc
    + proposal.targets.tf[level] * (proposal.points.tf / 4)
    + proposal.targets.short[level] * proposal.points.short
    + proposal.targets.essay[level] * proposal.points.essay[level], 0);

export const countMatrixProposalQuestions = (proposal: AiMatrixConfigProposal) => {
  const countByType = (questionType: MatrixQuestionTypeId) =>
    MATRIX_COGNITIVE_LEVEL_IDS.reduce((sum, level) => sum + proposal.targets[questionType][level], 0);
  return countByType('mc') + (countByType('tf') / 4) + countByType('short') + countByType('essay');
};
