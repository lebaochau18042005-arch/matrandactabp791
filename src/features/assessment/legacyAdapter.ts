import {
  ASSESSMENT_PROJECT_SCHEMA_VERSION,
  type AssessmentMatrixAllocation,
  type AssessmentMatrixRowModel,
  type AssessmentProject
} from './project';
import {
  COGNITIVE_LEVEL_IDS,
  LEGACY_QUESTION_TYPE_IDS,
  type SubjectProfile
} from './subjectProfiles/types';

const normalizeCount = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
};

const convertLegacyMatrixRow = (row: any, rowIndex: number): AssessmentMatrixRowModel => {
  const allocations: AssessmentMatrixAllocation[] = [];

  LEGACY_QUESTION_TYPE_IDS.forEach(questionTypeId => {
    COGNITIVE_LEVEL_IDS.forEach(cognitiveLevelId => {
      const count = normalizeCount(row?.[questionTypeId]?.[cognitiveLevelId]);
      if (count <= 0) return;

      const rawEssayLabels = questionTypeId === 'essay'
        ? String(row?.essayLabels?.[cognitiveLevelId] || '')
        : '';
      allocations.push({
        questionTypeId,
        cognitiveLevelId,
        count,
        labels: rawEssayLabels
          ? rawEssayLabels.split(/[;,\n]+/).map(label => label.trim()).filter(Boolean)
          : undefined
      });
    });
  });

  return {
    id: `legacy-row-${rowIndex + 1}`,
    topic: typeof row?.topic === 'string' ? row.topic : '',
    content: typeof row?.content === 'string' ? row.content : '',
    learningOutcomeIds: [],
    allocations,
    specification: {
      know: typeof row?.spec?.know === 'string' ? row.spec.know : '',
      understand: typeof row?.spec?.understand === 'string' ? row.spec.understand : '',
      apply: typeof row?.spec?.apply === 'string' ? row.spec.apply : ''
    }
  };
};

export const createAssessmentProjectFromLegacyRecord = (
  record: Record<string, any>,
  profile: SubjectProfile
): AssessmentProject => {
  const matrixRows = Array.isArray(record.rows)
    ? record.rows
    : Array.isArray(record.matrixRows)
      ? record.matrixRows
      : [];
  const fallbackHeader = profile.document.defaultHeader;
  const sourceText = typeof record.aiInput === 'string' ? record.aiInput : '';
  const sourceFileName = typeof record.sourceFileName === 'string' ? record.sourceFileName : '';
  const specificationSource = typeof record.specSourceInput === 'string' ? record.specSourceInput : '';
  const specificationFileName = typeof record.specSourceFileName === 'string' ? record.specSourceFileName : '';
  const fallbackTimestamp = String(record.createdAt || record.savedAt || '1970-01-01T00:00:00.000Z');

  return {
    schemaVersion: ASSESSMENT_PROJECT_SCHEMA_VERSION,
    id: typeof record.id === 'string' ? record.id : 'legacy-project',
    title: typeof record.title === 'string' ? record.title : `${profile.name} - Ma trận cũ`,
    subjectId: typeof record.subjectId === 'string' ? record.subjectId : profile.id,
    subjectName: typeof record.subjectName === 'string' ? record.subjectName : profile.name,
    subjectProfileVersion: Number(record.subjectProfileVersion) || profile.version,
    grade: String(record.grade || record.selectedGrade || profile.supportedGrades[profile.supportedGrades.length - 1] || ''),
    documentHeader: {
      department: String(record.header?.department || record.docHeader?.department || fallbackHeader.department),
      school: String(record.header?.school || record.docHeader?.school || fallbackHeader.school),
      examName: String(record.header?.examName || record.docHeader?.examName || fallbackHeader.examName),
      creator: String(record.header?.creator || record.docHeader?.creator || fallbackHeader.creator)
    },
    sources: [
      ...(sourceText ? [{
        id: 'legacy-knowledge-source',
        role: 'knowledge' as const,
        fileName: sourceFileName || 'Nội dung nhập trực tiếp',
        extractedText: sourceText,
        importedAt: fallbackTimestamp
      }] : []),
      ...(specificationSource ? [{
        id: 'legacy-learning-outcomes-source',
        role: 'learning-outcomes' as const,
        fileName: specificationFileName || 'YCCĐ nhập trực tiếp',
        extractedText: specificationSource,
        importedAt: fallbackTimestamp
      }] : [])
    ],
    knowledgeUnits: matrixRows.map((row: any, rowIndex: number) => ({
      id: `legacy-unit-${rowIndex + 1}`,
      topic: typeof row?.topic === 'string' ? row.topic : '',
      content: typeof row?.content === 'string' ? row.content : '',
      sourceDocumentIds: sourceText ? ['legacy-knowledge-source'] : []
    })),
    learningOutcomes: [],
    matrixRows: matrixRows.map(convertLegacyMatrixRow),
    pointConfiguration: record.pointConfig && typeof record.pointConfig === 'object'
      ? record.pointConfig
      : {},
    matrixTargets: record.matrixTargets && typeof record.matrixTargets === 'object'
      ? record.matrixTargets
      : {},
    workflow: {
      currentStep: Number.isFinite(Number(record.step)) ? Math.min(6, Math.max(1, Math.floor(Number(record.step)))) : 3,
      sourceConfirmed: typeof record.sourceConfirmed === 'boolean' ? record.sourceConfirmed : true,
      matrixConfirmed: Boolean(record.matrixConfirmed || record.workflowStage === 'matrix' || record.workflowStage === 'spec'),
      specificationConfirmed: Boolean(record.specConfirmed || record.workflowStage === 'spec'),
      examConfirmed: Boolean(record.examConfirmed)
    },
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : undefined,
    updatedAt: typeof record.savedAt === 'string' ? record.savedAt : undefined
  };
};
