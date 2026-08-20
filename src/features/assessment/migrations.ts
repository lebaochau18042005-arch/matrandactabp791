import type { SubjectProfile } from './subjectProfiles/types';

export const ASSESSMENT_SCHEMA_VERSION = 1;

export type AssessmentRecordKind = 'draft' | 'matrix' | 'exam';

export interface AssessmentRecordMetadata {
  schemaVersion: number;
  subjectId: string;
  subjectName: string;
  subjectProfileVersion: number;
  recordKind: AssessmentRecordKind;
}

export const createAssessmentMetadata = (
  profile: SubjectProfile,
  recordKind: AssessmentRecordKind
): AssessmentRecordMetadata => ({
  schemaVersion: ASSESSMENT_SCHEMA_VERSION,
  subjectId: profile.id,
  subjectName: profile.name,
  subjectProfileVersion: profile.version,
  recordKind
});

export const migrateAssessmentRecord = <T extends Record<string, any>>(
  record: T,
  profile: SubjectProfile,
  recordKind: AssessmentRecordKind
): T & AssessmentRecordMetadata => ({
  ...record,
  schemaVersion: Number.isFinite(Number(record.schemaVersion))
    ? Number(record.schemaVersion)
    : ASSESSMENT_SCHEMA_VERSION,
  subjectId: typeof record.subjectId === 'string' && record.subjectId
    ? record.subjectId
    : profile.id,
  subjectName: typeof record.subjectName === 'string' && record.subjectName
    ? record.subjectName
    : profile.name,
  subjectProfileVersion: Number.isFinite(Number(record.subjectProfileVersion))
    ? Number(record.subjectProfileVersion)
    : profile.version,
  recordKind: record.recordKind === 'draft' || record.recordKind === 'matrix' || record.recordKind === 'exam'
    ? record.recordKind
    : recordKind
});

export const migrateAssessmentCollection = (
  value: unknown,
  profile: SubjectProfile,
  recordKind: Exclude<AssessmentRecordKind, 'draft'>
) => Array.isArray(value)
  ? value
      .filter((item): item is Record<string, any> => Boolean(item) && typeof item === 'object')
      .map(item => migrateAssessmentRecord(item, profile, recordKind))
  : [];

export const readMigratedAssessmentCollection = (
  storage: Storage,
  key: string,
  profile: SubjectProfile,
  recordKind: Exclude<AssessmentRecordKind, 'draft'>
) => {
  try {
    const rawValue = storage.getItem(key);
    const migrated = migrateAssessmentCollection(rawValue ? JSON.parse(rawValue) : [], profile, recordKind);
    if (rawValue !== JSON.stringify(migrated)) {
      storage.setItem(key, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
};
