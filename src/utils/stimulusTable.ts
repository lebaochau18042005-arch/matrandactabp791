export type StimulusTableCell = string | number | boolean | null | undefined;
export type StimulusTableRecord = Record<string, StimulusTableCell>;

export interface StimulusTableLike {
  type?: string;
  content?: string;
  tableData?: StimulusTableRecord[] | StimulusTableCell[][];
}

export interface NormalizedStimulusTable {
  headers: string[];
  rows: string[][];
  source: 'tableData' | 'content';
}

export interface InlineQuestionTable {
  lead: string;
  headers: string[];
  rows: string[][];
  layout: 'horizontal' | 'vertical';
  tail?: string;
}

const cellToString = (value: StimulusTableCell) => String(value ?? '').trim();

const cleanPipeCells = (line: string) => {
  const cells = line.split('|').map(cell => cell.trim());
  if (cells[0] === '') cells.shift();
  if (cells[cells.length - 1] === '') cells.pop();
  return cells;
};

const isSeparatorRow = (cells: string[]) => (
  cells.length > 0 && cells.every(cell => /^:?-{2,}:?$/.test(cell.replace(/\s+/g, '')))
);

const tableFromRecords = (tableData?: StimulusTableLike['tableData']): NormalizedStimulusTable | null => {
  if (!Array.isArray(tableData) || tableData.length === 0) return null;

  const firstRow = tableData[0];
  if (Array.isArray(firstRow)) {
    const rows = tableData
      .map(row => row.map(cellToString))
      .filter(row => row.some(Boolean));

    if (rows.length < 2 || rows[0].length < 2) return null;
    return {
      headers: rows[0],
      rows: rows.slice(1),
      source: 'tableData',
    };
  }

  const recordRows = tableData.filter(row => row && typeof row === 'object' && !Array.isArray(row)) as StimulusTableRecord[];
  if (recordRows.length === 0) return null;

  const headers = recordRows.reduce<string[]>((acc, row) => {
    Object.keys(row).forEach(key => {
      if (!acc.includes(key)) acc.push(key);
    });
    return acc;
  }, []);

  if (headers.length < 2) return null;

  return {
    headers,
    rows: recordRows.map(row => headers.map(header => cellToString(row[header]))),
    source: 'tableData',
  };
};

export const parsePipeTable = (content?: string): NormalizedStimulusTable | null => {
  if (!content) return null;

  const rows = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.includes('|'))
    .map(cleanPipeCells)
    .filter(cells => cells.length >= 2 && !isSeparatorRow(cells));

  if (rows.length < 2 || rows[0].length < 2) return null;

  const headers = rows[0];
  const bodyRows = rows.slice(1).map(row => (
    headers.map((_, index) => cellToString(row[index]))
  ));

  if (bodyRows.length === 0) return null;

  return {
    headers,
    rows: bodyRows,
    source: 'content',
  };
};

const instructionStartPattern = /(?:căn cứ|dựa(?:\s+vào)?|hãy|tính|cho biết|nhận xét|xác định|lựa chọn|so sánh|theo bảng|từ bảng|biểu đồ)\b/iu;

const splitTrailingInstruction = (rawValue: string) => {
  const source = rawValue.trim();
  const boundaryPattern = /(?:[.!?,]\s+|\r?\n+|\s+)(?=(?:căn cứ|dựa(?:\s+vào)?|hãy|tính|cho biết|nhận xét|xác định|lựa chọn|so sánh|theo bảng|từ bảng|biểu đồ)\b)/iu;
  const boundary = boundaryPattern.exec(source);
  if (!boundary || boundary.index <= 0) return { value: source, tail: '' };

  return {
    value: source.slice(0, boundary.index).replace(/[.!?,]+$/, '').trim(),
    tail: source.slice(boundary.index + boundary[0].length).trim(),
  };
};

const parseInlineLabelValue = (segment: string, allowTail = false) => {
  const separatorIndex = segment.lastIndexOf(':');
  if (separatorIndex <= 0) return null;

  const label = segment.slice(0, separatorIndex).trim();
  const rawValue = segment.slice(separatorIndex + 1).trim();
  const parsedValue = allowTail ? splitTrailingInstruction(rawValue) : { value: rawValue, tail: '' };
  const value = parsedValue.value.replace(/[.!?]+$/, '').trim();
  if (!label || !value || value.length > 60 || !/\d/.test(value)) return null;

  const numericValue = value.match(/^([-+]?\d(?:[\d\s.,]*\d)?)(?:\s*([%‰°A-Za-zÀ-ỹ0-9²³/.-]+(?:\s+[A-Za-zÀ-ỹ0-9²³/.-]+)*))?$/u);
  if (!numericValue) return null;
  const unitText = String(numericValue[2] || '').trim();

  return {
    label,
    value,
    numericValue: numericValue[1].trim(),
    unitText,
    unitSuffix: unitText.toLocaleLowerCase('vi-VN'),
    tail: parsedValue.tail,
  };
};

export const parseInlineQuestionTable = (question?: string): InlineQuestionTable | null => {
  const source = String(question || '').trim();
  if (!source || !/(?:bảng|số liệu|dữ liệu)/i.test(source)) return null;

  const segments = source.split(';').map(segment => segment.trim()).filter(Boolean);
  if (segments.length < 3) return null;

  const firstSeparatorIndex = segments[0].lastIndexOf(':');
  if (firstSeparatorIndex <= 0) return null;

  const firstValue = segments[0].slice(firstSeparatorIndex + 1).trim();
  const leadAndLabel = segments[0].slice(0, firstSeparatorIndex).trim();
  const leadSeparatorIndex = leadAndLabel.lastIndexOf(':');
  if (leadSeparatorIndex <= 0) return null;

  const lead = leadAndLabel.slice(0, leadSeparatorIndex + 1).trim();
  const firstLabel = leadAndLabel.slice(leadSeparatorIndex + 1).trim();
  const firstPair = parseInlineLabelValue(firstLabel + ': ' + firstValue);
  if (!firstPair) return null;

  const pairs = [firstPair];
  let tail = '';
  for (let index = 1; index < segments.length; index += 1) {
    const isLastSegment = index === segments.length - 1;
    const pair = parseInlineLabelValue(segments[index], isLastSegment);
    if (pair) {
      if (pair.tail && !isLastSegment) return null;
      pairs.push(pair);
      tail = pair.tail;
      continue;
    }

    const trailingText = segments.slice(index).join('; ').trim();
    if (pairs.length < 3 || !instructionStartPattern.test(trailingText)) return null;
    tail = trailingText;
    break;
  }

  if (pairs.length < 3) return null;
  const unitSuffixes = new Set(pairs.map(pair => pair.unitSuffix).filter(Boolean));
  if (unitSuffixes.size > 1) return null;

  const leadUnit = lead.match(/\(\s*đơn\s*vị\s*:\s*([^)]+)\)/i)?.[1]?.trim();
  const sharedInlineUnit = !leadUnit && pairs.every(pair => pair.unitSuffix && pair.unitSuffix === pairs[0].unitSuffix)
    ? pairs[0].unitText
    : '';
  const displayUnit = leadUnit || sharedInlineUnit;
  const valueHeader = displayUnit ? 'Giá trị (' + displayUnit + ')' : 'Giá trị';
  const values = sharedInlineUnit || (leadUnit && pairs.every(pair => pair.unitSuffix === pairs[0].unitSuffix))
    ? pairs.map(pair => pair.numericValue)
    : pairs.map(pair => pair.value);
  const dimensionParts = pairs.map(pair => pair.label.match(/^(.+?)\s+((?:\d{1,4}(?:\s*[-/]\s*\d{1,4})?)|[IVX]+)$/i));
  const plainYearLabels = pairs.every(pair => /^(?:18|19|20|21)\d{2}$/.test(pair.label));
  const canUseHorizontalLayout = pairs.length <= 16 && dimensionParts.every(Boolean) &&
    new Set(dimensionParts.map(match => match?.[1].trim().toLocaleLowerCase('vi-VN'))).size === 1;

  if (canUseHorizontalLayout || plainYearLabels) {
    const dimensionLabel = plainYearLabels ? 'Năm' : (dimensionParts[0]?.[1].trim() || 'Nội dung');
    return {
      lead,
      headers: [dimensionLabel, ...(plainYearLabels ? pairs.map(pair => pair.label) : dimensionParts.map(match => match?.[2] || ''))],
      rows: [[valueHeader, ...values]],
      layout: 'horizontal',
      tail,
    };
  }

  return {
    lead,
    headers: ['Nội dung', valueHeader],
    rows: pairs.map((pair, index) => [pair.label, values[index]]),
    layout: 'vertical',
    tail,
  };
};
export const normalizeStimulusTable = (stimulus?: StimulusTableLike): NormalizedStimulusTable | null => (
  tableFromRecords(stimulus?.tableData) ?? parsePipeTable(stimulus?.content)
);

export const hasRenderableStimulusTable = (stimulus?: StimulusTableLike) => Boolean(normalizeStimulusTable(stimulus));

export const withNormalizedTableData = <T extends StimulusTableLike>(stimulus: T): T => {
  if (!stimulus || !['table', 'chart'].includes(stimulus.type || '')) return stimulus;

  const existing = tableFromRecords(stimulus.tableData);
  if (existing) return stimulus;

  const parsed = parsePipeTable(stimulus.content);
  if (!parsed) return stimulus;

  return {
    ...stimulus,
    tableData: parsed.rows.map(row => (
      parsed.headers.reduce<StimulusTableRecord>((record, header, index) => {
        record[header] = row[index] ?? '';
        return record;
      }, {})
    )),
  };
};
