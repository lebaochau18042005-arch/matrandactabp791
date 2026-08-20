import { GEOGRAPHY_SUBJECT_PROFILE } from './geography';
import type { SubjectProfile } from './types';

const profiles = new Map<string, SubjectProfile>([
  [GEOGRAPHY_SUBJECT_PROFILE.id, GEOGRAPHY_SUBJECT_PROFILE]
]);

export const SUBJECT_PROFILE_REGISTRY = profiles;

export const getSubjectProfile = (subjectId: string) => profiles.get(subjectId);

export const getAvailableSubjectProfiles = () => Array.from(profiles.values());
