export const parseNumericAnswer = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const raw = String(value ?? '').trim().replace(/\s/g, '');
  if (!raw) return null;

  const numericOnly = raw.replace(/[^\d,.-]/g, '');
  const lastComma = numericOnly.lastIndexOf(',');
  const lastDot = numericOnly.lastIndexOf('.');
  let normalized = numericOnly;

  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot
      ? numericOnly.replace(/\./g, '').replace(',', '.')
      : numericOnly.replace(/,/g, '');
  } else if ((numericOnly.match(/,/g) || []).length > 1) {
    normalized = numericOnly.replace(/,/g, '');
  } else if (lastComma >= 0) {
    normalized = numericOnly.replace(',', '.');
  } else if ((numericOnly.match(/\./g) || []).length > 1) {
    normalized = numericOnly.replace(/\./g, '');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getRoundingDigits = (rounding?: string): number | null => {
  if (!rounding) return null;
  if (/hàng\s+đơn\s+vị|đến\s+đơn\s+vị|làm\s*tròn\s+đến\s+0/i.test(rounding)) return 0;

  const numericMatch = rounding.match(/(\d+)\s*(?:chữ\s*số|số)\s*thập\s*phân/i);
  if (numericMatch) return Number(numericMatch[1]);
  if (/\b(?:một|nhất)\s+(?:chữ\s+)?số\s+thập\s+phân/i.test(rounding)) return 1;
  if (/\bhai\s+(?:chữ\s+)?số\s+thập\s+phân/i.test(rounding)) return 2;
  if (/\bba\s+(?:chữ\s+)?số\s+thập\s+phân/i.test(rounding)) return 3;
  return null;
};

export const formatNumericAnswer = (value: number, rounding?: string) => {
  const digits = getRoundingDigits(rounding);
  return digits === null ? String(value) : value.toFixed(digits).replace('.', ',');
};

export const isShortAnswerCorrect = (
  answer: unknown,
  target: unknown,
  rounding?: string,
  tolerance = 0
) => {
  const parsedAnswer = parseNumericAnswer(answer);
  const parsedTarget = parseNumericAnswer(target);
  if (parsedAnswer === null || parsedTarget === null) return false;

  const digits = getRoundingDigits(rounding);
  if (digits !== null) {
    const roundedTarget = Number(parsedTarget.toFixed(digits));
    const epsilon = 10 ** (-(digits + 6));
    return Math.abs(parsedAnswer - roundedTarget) <= epsilon;
  }

  const safeTolerance = Number.isFinite(tolerance) && tolerance > 0 ? tolerance : 0;
  return Math.abs(parsedAnswer - parsedTarget) <= safeTolerance + Number.EPSILON;
};

export const sanitizeShortAnswerInput = (value: string, maxCharacters = 4) => {
  const normalized = value
    .replace(/\./g, ',')
    .replace(/[^\d,-]/g, '')
    .replace(/(?!^)-/g, '');
  const firstCommaIndex = normalized.indexOf(',');
  const singleDecimalSeparator = firstCommaIndex < 0
    ? normalized
    : normalized.slice(0, firstCommaIndex + 1) + normalized.slice(firstCommaIndex + 1).replace(/,/g, '');
  return singleDecimalSeparator.slice(0, Math.max(1, maxCharacters));
};
