import { GEOGRAPHY_SUBJECT_PROFILE } from './geography';
import type { CognitiveLevelId, SubjectProfile } from './types';

export const CUSTOM_SUBJECT_PROFILES_STORAGE_KEY = 'geohub_custom_subject_profiles_v1';
export const ACTIVE_SUBJECT_PROFILE_STORAGE_KEY = 'geohub_active_subject_profile_v1';

export interface CustomSubjectProfileInput {
  name: string;
  code?: string;
}

export interface AiSubjectProfileConfiguration {
  supportedGrades?: unknown;
  competencies?: unknown;
  defaultPoints?: unknown;
  targetTotalPoints?: unknown;
  requireApplicationLevel?: unknown;
  sourceGuardrail?: unknown;
  rationale?: unknown;
  warnings?: unknown;
}

const normalizeText = (value: unknown) => String(value || '').trim();

const slugifySubject = (value: string) => {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || `mon-hoc-${Date.now()}`;
};

const createSubjectCode = (name: string, requestedCode?: string) => {
  const requested = normalizeText(requestedCode).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  if (requested) return requested;
  const words = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[A-Za-z0-9]+/g) || [];
  return (words.map(word => word[0]).join('').toUpperCase().slice(0, 8) || 'MON');
};

const filenameSlug = (name: string) => slugifySubject(name);

export const createCustomSubjectProfile = ({ name, code }: CustomSubjectProfileInput): SubjectProfile => {
  const subjectName = normalizeText(name);
  if (!subjectName) throw new Error('Tên môn học không được để trống.');
  const id = `custom-${slugifySubject(subjectName)}`;
  const fileSlug = filenameSlug(subjectName);
  const subjectCode = createSubjectCode(subjectName, code);

  return {
    id,
    version: 1,
    code: subjectCode,
    name: subjectName,
    displayName: `${subjectName} THPT`,
    aliases: [subjectName],
    supportedGrades: ['10', '11', '12'],
    cognitiveLevels: GEOGRAPHY_SUBJECT_PROFILE.cognitiveLevels.map(level => ({ ...level })),
    questionTypes: GEOGRAPHY_SUBJECT_PROFILE.questionTypes.map(questionType => ({
      ...questionType,
      defaultPoints: typeof questionType.defaultPoints === 'number'
        ? questionType.defaultPoints
        : { ...questionType.defaultPoints }
    })),
    competencies: [],
    validation: {
      targetTotalPoints: 10,
      requireApplicationLevel: true
    },
    storage: {
      draftKey: `geohub_assessment_${id}_draft_v1`,
      matrixHistoryKey: `geohub_assessment_${id}_matrices_v1`,
      examHistoryKey: `geohub_assessment_${id}_exams_v1`
    },
    document: {
      defaultHeader: {
        ...GEOGRAPHY_SUBJECT_PROFILE.document.defaultHeader,
        examName: 'KÌ KIỂM TRA ĐỊNH KÌ'
      },
      titles: {
        matrix: `MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ${subjectName.toUpperCase()}`,
        specification: `BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ${subjectName.toUpperCase()}`,
        exam: `ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ${subjectName.toUpperCase()}`,
        answerKey: `ĐÁP ÁN ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ${subjectName.toUpperCase()}`,
        bundle: `BỘ HỒ SƠ KIỂM TRA MÔN ${subjectName.toUpperCase()} - CV 7991`
      },
      filenames: {
        matrix: `ma-tran-${fileSlug}-7991`,
        specification: `bang-dac-ta-${fileSlug}-7991`,
        exam: `de-thi-${fileSlug}-7991`,
        answerKey: `dap-an-${fileSlug}-7991`,
        bundle: `bo-ho-so-kiem-tra-${fileSlug}-7991`
      }
    },
    ai: {
      roles: {
        sourceAnalysis: `trợ lý chuyên môn ${subjectName}`,
        specification: `chuyên gia xây dựng bản đặc tả môn ${subjectName}`,
        examGeneration: `trợ lý ra đề môn ${subjectName}`
      },
      subjectLabel: `môn ${subjectName} THPT`,
      sourceGuardrail: 'Chỉ sử dụng kiến thức và YCCĐ có trong dữ liệu nguồn; không tự sáng tác YCCĐ khi nguồn không cung cấp.'
    }
  };
};

const normalizePoint = (value: unknown, fallback: number) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
};

const normalizeStringArray = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;
  const result = value.map(normalizeText).filter(Boolean);
  return result.length > 0 ? Array.from(new Set(result)) : fallback;
};

export const applyAiSubjectProfileConfiguration = (
  profile: SubjectProfile,
  configuration: AiSubjectProfileConfiguration
): { profile: SubjectProfile; rationale: string[]; warnings: string[] } => {
  if (profile.id === GEOGRAPHY_SUBJECT_PROFILE.id) {
    throw new Error('Hồ sơ Địa lí hệ thống không được phép ghi đè bằng cấu hình AI.');
  }
  const defaults = Object.fromEntries(profile.questionTypes.map(item => [item.id, item.defaultPoints]));
  const essayDefaults = typeof defaults.essay === 'object' && defaults.essay ? defaults.essay : {};
  const requestedPoints = configuration.defaultPoints as any;
  const levelPoint = (level: CognitiveLevelId) => normalizePoint(
    requestedPoints?.essay?.[level],
    normalizePoint((essayDefaults as any)?.[level], 0)
  );
  const competencies = Array.isArray(configuration.competencies)
    ? configuration.competencies.map((item: any) => {
        const requestedCode = normalizeText(item?.code);
        return {
          code: /^NL[123]$/i.test(requestedCode) ? '' : requestedCode,
          label: normalizeText(item?.label),
          description: normalizeText(item?.description)
        };
      }).filter(item => item.label && item.description).slice(0, 8)
    : [];
  const targetScore = normalizePoint(configuration.targetTotalPoints, profile.validation.targetTotalPoints);

  return {
    profile: {
      ...profile,
      version: profile.version + 1,
      supportedGrades: normalizeStringArray(configuration.supportedGrades, profile.supportedGrades),
      questionTypes: profile.questionTypes.map(questionType => ({
        ...questionType,
        defaultPoints: questionType.id === 'essay'
          ? { know: levelPoint('know'), understand: levelPoint('understand'), apply: levelPoint('apply') }
          : normalizePoint(requestedPoints?.[questionType.id], normalizePoint(questionType.defaultPoints, 0))
      })),
      competencies: competencies.length > 0 ? competencies : profile.competencies,
      validation: {
        targetTotalPoints: targetScore > 0 ? targetScore : profile.validation.targetTotalPoints,
        requireApplicationLevel: typeof configuration.requireApplicationLevel === 'boolean'
          ? configuration.requireApplicationLevel
          : profile.validation.requireApplicationLevel
      },
      ai: {
        ...profile.ai,
        sourceGuardrail: normalizeText(configuration.sourceGuardrail) || profile.ai.sourceGuardrail
      }
    },
    rationale: normalizeStringArray(configuration.rationale, []),
    warnings: normalizeStringArray(configuration.warnings, [])
  };
};

const normalizeStoredCustomSubjectProfile = (value: unknown): SubjectProfile | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, any>;
  const id = normalizeText(candidate.id);
  const name = normalizeText(candidate.name).slice(0, 100);
  if (!/^custom-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !name) return null;

  const baseProfile = createCustomSubjectProfile({
    name,
    code: normalizeText(candidate.code)
  });
  const storedQuestionTypes = Array.isArray(candidate.questionTypes)
    ? candidate.questionTypes
    : [];
  const getStoredPoints = (questionTypeId: string) => storedQuestionTypes
    .find((questionType: any) => questionType?.id === questionTypeId)?.defaultPoints;
  const configured = applyAiSubjectProfileConfiguration(baseProfile, {
    supportedGrades: candidate.supportedGrades,
    competencies: candidate.competencies,
    defaultPoints: {
      mc: getStoredPoints('mc'),
      tf: getStoredPoints('tf'),
      short: getStoredPoints('short'),
      essay: getStoredPoints('essay')
    },
    targetTotalPoints: candidate.validation?.targetTotalPoints,
    requireApplicationLevel: candidate.validation?.requireApplicationLevel,
    sourceGuardrail: candidate.ai?.sourceGuardrail
  }).profile;
  const version = Number(candidate.version);

  return {
    ...configured,
    id,
    version: Number.isFinite(version) ? Math.max(1, Math.floor(version)) : 1,
    storage: {
      draftKey: `geohub_assessment_${id}_draft_v1`,
      matrixHistoryKey: `geohub_assessment_${id}_matrices_v1`,
      examHistoryKey: `geohub_assessment_${id}_exams_v1`
    }
  };
};

export const readCustomSubjectProfiles = (): SubjectProfile[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_SUBJECT_PROFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const profilesById = new Map<string, SubjectProfile>();
    parsed.forEach(item => {
      const profile = normalizeStoredCustomSubjectProfile(item);
      if (profile) profilesById.set(profile.id, profile);
    });
    const profiles = Array.from(profilesById.values());
    const normalizedValue = JSON.stringify(profiles);
    if (raw !== normalizedValue) {
      localStorage.setItem(CUSTOM_SUBJECT_PROFILES_STORAGE_KEY, normalizedValue);
    }
    return profiles;
  } catch {
    return [];
  }
};

export const writeCustomSubjectProfiles = (profiles: SubjectProfile[]) => {
  const profilesById = new Map<string, SubjectProfile>();
  profiles.forEach(item => {
    const profile = normalizeStoredCustomSubjectProfile(item);
    if (profile) profilesById.set(profile.id, profile);
  });
  const safeProfiles = Array.from(profilesById.values());
  localStorage.setItem(CUSTOM_SUBJECT_PROFILES_STORAGE_KEY, JSON.stringify(safeProfiles));
};
