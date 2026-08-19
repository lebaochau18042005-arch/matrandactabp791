export type AssessmentSourceKind = 'textbook' | 'nso_yearbook_2025' | 'world_bank' | 'faostat' | 'unknown';

export interface AssessmentSourceDefinition {
  id: AssessmentSourceKind;
  label: string;
  description: string;
  url?: string;
}

export const APPROVED_ASSESSMENT_SOURCES: AssessmentSourceDefinition[] = [
  {
    id: 'textbook',
    label: 'SGK Địa lí – Kết nối tri thức với cuộc sống',
    description: 'Nguồn kiến thức khái niệm; phải ghi rõ lớp, bài và nội dung/vị trí tham chiếu.',
  },
  {
    id: 'nso_yearbook_2025',
    label: 'Niên giám thống kê Việt Nam năm 2025',
    description: 'Nguồn thống kê chính thức của Cục Thống kê; ghi rõ tên hoặc số bảng.',
    url: 'https://www.gso.gov.vn/nien-giam/',
  },
  {
    id: 'world_bank',
    label: 'World Development Indicators – World Bank',
    description: 'Ghi rõ mã/tên chỉ tiêu, quốc gia, năm dữ liệu và đường dẫn chỉ tiêu.',
    url: 'https://data.worldbank.org/indicator/all',
  },
  {
    id: 'faostat',
    label: 'FAOSTAT – Food and Agriculture Organization of the United Nations',
    description: 'Ghi rõ miền dữ liệu, phần tử/chỉ tiêu, khu vực, năm và đường dẫn truy xuất.',
    url: 'https://www.fao.org/faostat/',
  },
];

const normalizeForMatching = (value?: string) => (value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

const forbiddenSourcePatterns = [
  /so lieu gia dinh/,
  /du lieu gia dinh/,
  /du lieu do he thong/,
  /ngu lieu bien soan/,
  /tu bien soan/,
  /ai tao/,
  /nguon tham khao$/,
  /internet$/,
  /khong ro nguon/,
  /khong xac dinh/,
  /theo phong cach de/,
];

const textbookPatterns = [
  /sgk.+dia li/,
  /sach giao khoa.+dia li/,
  /ket noi tri thuc/,
  /nxbgd|nxb giao duc/,
];

const nsoYearbook2025Patterns = [
  /nien giam thong ke viet nam(?: nam)? 2025/,
  /statistical yearbook of vietnam 2025/,
];

const worldBankPatterns = [
  /world bank/,
  /ngan hang the gioi/,
  /world development indicators/,
  /\bwdi\b/,
];

const faostatPatterns = [
  /faostat/,
  /food and agriculture organization/,
  /to chuc luong thuc va nong nghiep lien hop quoc/,
  /\bfao\b/,
];

const approvedHostsByKind: Record<Exclude<AssessmentSourceKind, 'textbook' | 'unknown'>, string[]> = {
  nso_yearbook_2025: ['gso.gov.vn', 'nso.gov.vn'],
  world_bank: ['data.worldbank.org', 'api.worldbank.org', 'worldbank.org'],
  faostat: ['fao.org', 'faostat.org'],
};

export const isForbiddenGeneratedSource = (source?: string) => {
  const normalized = normalizeForMatching(source);
  return Boolean(normalized) && forbiddenSourcePatterns.some(pattern => pattern.test(normalized));
};

export const classifyAssessmentSource = (source?: string): AssessmentSourceKind => {
  const normalized = normalizeForMatching(source);
  if (!normalized || isForbiddenGeneratedSource(source)) return 'unknown';
  if (nsoYearbook2025Patterns.some(pattern => pattern.test(normalized))) return 'nso_yearbook_2025';
  if (worldBankPatterns.some(pattern => pattern.test(normalized))) return 'world_bank';
  if (faostatPatterns.some(pattern => pattern.test(normalized))) return 'faostat';
  if (textbookPatterns.some(pattern => pattern.test(normalized))) return 'textbook';
  return 'unknown';
};

export const isApprovedSourceUrl = (url: string | undefined, kind: AssessmentSourceKind) => {
  if (!url || kind === 'unknown' || kind === 'textbook') return false;
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return approvedHostsByKind[kind].some(host => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
};

export const isPreciseTextbookReference = (source?: string) => {
  const normalized = normalizeForMatching(source);
  if (classifyAssessmentSource(source) !== 'textbook') return false;
  return /\b(?:lop )?(10|11|12)\b/.test(normalized)
    && /\b(bai|chu de|trang|muc)\b/.test(normalized);
};

export const isTrustedStatisticalSource = (source?: string, sourceUrl?: string) => {
  const kind = classifyAssessmentSource(source);
  return ['nso_yearbook_2025', 'world_bank', 'faostat'].includes(kind)
    && isApprovedSourceUrl(sourceUrl, kind);
};

export const getSourceLabel = (kind: AssessmentSourceKind) => (
  APPROVED_ASSESSMENT_SOURCES.find(source => source.id === kind)?.label || 'Nguồn chưa được kiểm chứng'
);

export const hasDataYear = (value?: string) => /\b(?:19|20)\d{2}\b/.test(value || '');
