const SCRIPT_DIGIT_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9'
};

export const normalizeExtractedDocumentText = (value: unknown) => String(value || '')
  .replace(/\r\n?/g, '\n')
  .replace(/\u00a0/g, ' ')
  .split(/\n{2,}/)
  .map(paragraph => paragraph
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join(' '))
  .filter(Boolean)
  .join('\n\n')
  .replace(/[ \t]+/g, ' ')
  .trim();

export const normalizeSourceMatchText = (value: unknown) => String(value || '')
  .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/g, character => ' ' + SCRIPT_DIGIT_MAP[character] + ' ')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLocaleLowerCase('vi-VN')
  .replace(/([a-z])([0-9])/g, '$1 $2')
  .replace(/([0-9])([a-z])/g, '$1 $2')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const isEvidenceSupportedByNormalizedSource = (
  evidence: unknown,
  normalizedSource: string
) => {
  const normalizedEvidence = normalizeSourceMatchText(evidence);
  if (!normalizedEvidence || !normalizedSource) return false;
  if (normalizedSource.includes(normalizedEvidence)) return true;

  const evidenceTokens = normalizedEvidence.split(' ');
  const sourceTokens = normalizedSource.split(' ');
  if (evidenceTokens.length < 3) return false;

  let longestRun = 0;
  for (let evidenceIndex = 0; evidenceIndex < evidenceTokens.length; evidenceIndex += 1) {
    for (let sourceIndex = 0; sourceIndex < sourceTokens.length; sourceIndex += 1) {
      let runLength = 0;
      while (
        evidenceTokens[evidenceIndex + runLength] &&
        evidenceTokens[evidenceIndex + runLength] === sourceTokens[sourceIndex + runLength]
      ) runLength += 1;
      longestRun = Math.max(longestRun, runLength);
    }
  }

  const requiredRun = evidenceTokens.length <= 4
    ? evidenceTokens.length
    : Math.max(4, Math.ceil(evidenceTokens.length * 0.6));
  return longestRun >= requiredRun;
};
