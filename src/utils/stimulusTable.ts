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
