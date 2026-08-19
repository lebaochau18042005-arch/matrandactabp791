export type StimulusTableCell = string | number | boolean | null | undefined;
export type StimulusTableRecord = Record<string, StimulusTableCell>;

export interface StimulusTableLike {
  type?: string;
  content?: string;
  tableData?: StimulusTableRecord[] | StimulusTableCell[][];
  chartConfig?: Record<string, any>;
}

export interface NormalizedStimulusTable {
  headers: string[];
  rows: string[][];
  source: 'tableData' | 'content';
}

export interface NormalizedStimulusChartSeries {
  name: string;
  values: number[];
}

export interface NormalizedStimulusChart {
  categories: string[];
  series: NormalizedStimulusChartSeries[];
}

const cellToString = (value: StimulusTableCell) => String(value ?? '').trim();

const parseChartNumber = (value: StimulusTableCell): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const raw = cellToString(value).replace(/\s/g, '');
  if (!raw) return null;

  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  let normalized = raw;

  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot
      ? raw.replace(/\./g, '').replace(',', '.')
      : raw.replace(/,/g, '');
  } else if (lastComma >= 0) {
    normalized = /^-?\d{1,3}(?:,\d{3})+$/.test(raw)
      ? raw.replace(/,/g, '')
      : raw.replace(',', '.');
  } else if (lastDot >= 0 && /^-?\d{1,3}(?:\.\d{3})+$/.test(raw)) {
    normalized = raw.replace(/\./g, '');
  }

  const parsed = Number(normalized.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

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
  parsePipeTable(stimulus?.content) ?? tableFromRecords(stimulus?.tableData)
);

export const hasRenderableStimulusTable = (stimulus?: StimulusTableLike) => Boolean(normalizeStimulusTable(stimulus));

export const normalizeStimulusChart = (stimulus?: StimulusTableLike): NormalizedStimulusChart | null => {
  const config = stimulus?.chartConfig;
  if (config && Array.isArray(config.labels) && Array.isArray(config.datasets)) {
    const categories = config.labels.map(cellToString).filter(Boolean);
    const series = config.datasets
      .map((dataset: any, index: number) => ({
        name: cellToString(dataset?.label) || `Chuỗi ${index + 1}`,
        values: Array.isArray(dataset?.data)
          ? dataset.data.slice(0, categories.length).map(parseChartNumber)
          : [],
      }))
      .filter((dataset: { values: Array<number | null> }) => (
        dataset.values.length === categories.length && dataset.values.every(value => value !== null)
      ))
      .map((dataset: { name: string; values: Array<number | null> }) => ({
        name: dataset.name,
        values: dataset.values as number[],
      }));

    if (categories.length > 0 && series.length > 0) return { categories, series };
  }

  const table = normalizeStimulusTable(stimulus);
  if (!table || table.headers.length < 2 || table.rows.length === 0) return null;

  const categories = table.rows.map(row => row[0]).filter(Boolean);
  if (categories.length !== table.rows.length) return null;

  const series = table.headers.slice(1)
    .map((header, columnIndex) => ({
      name: header,
      values: table.rows.map(row => parseChartNumber(row[columnIndex + 1])),
    }))
    .filter(dataset => dataset.values.every(value => value !== null))
    .map(dataset => ({ name: dataset.name, values: dataset.values as number[] }));

  return series.length > 0 ? { categories, series } : null;
};

export const hasRenderableStimulusChart = (stimulus?: StimulusTableLike) => Boolean(normalizeStimulusChart(stimulus));

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
