export type GeographyCompetencyCode = 'NL1' | 'NL2' | 'NL3';
export type GeographyQuestionType = 'mc' | 'tf' | 'short' | 'essay';
export type GeographyCognitiveLevel = 'know' | 'understand' | 'apply';

export interface GeographyCompetencyAllocationInput {
  specText: string;
  level: GeographyCognitiveLevel;
  questionType: GeographyQuestionType;
  questionCount: number;
}

const getDefaultCompetencyCode = (
  level: GeographyCognitiveLevel,
  questionType: GeographyQuestionType
): GeographyCompetencyCode => {
  if (questionType === 'short') {
    return level === 'apply' ? 'NL3' : 'NL2';
  }
  return level === 'apply' ? 'NL3' : 'NL1';
};

/**
 * Phân bổ mã năng lực cho một ô trong bản đặc tả.
 *
 * Một câu chỉ có một mã năng lực chính. Vì một ô có thể chứa nhiều câu,
 * số mã hiển thị không bao giờ được vượt quá số câu trong ô đó.
 */
export const allocateGeographyCompetencyCodes = ({
  specText,
  level,
  questionType,
  questionCount
}: GeographyCompetencyAllocationInput): GeographyCompetencyCode[] => {
  const normalizedCount = Number.isFinite(Number(questionCount))
    ? Math.max(0, Math.floor(Number(questionCount)))
    : 0;
  if (normalizedCount === 0) return [];

  const explicitCodes = Array.from(new Set(
    (String(specText || '').match(/\bNL[123]\b/gi) || [])
      .map(code => code.toUpperCase() as GeographyCompetencyCode)
  ));
  const fallbackCode = getDefaultCompetencyCode(level, questionType);
  const primaryCode = explicitCodes.includes(fallbackCode)
    ? fallbackCode
    : explicitCodes[0] || fallbackCode;
  const orderedCodes = Array.from(new Set([primaryCode, ...explicitCodes]));

  return orderedCodes.slice(0, Math.min(normalizedCount, orderedCodes.length));
};
