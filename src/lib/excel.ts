export type ExcelCell = string | number | boolean | Date | null;
export type ExcelRow = ExcelCell[];

const FORBIDDEN_HEADERS = new Set(['__proto__', 'prototype', 'constructor']);

const cellToText = (cell: ExcelCell) => {
  if (cell === null) return '';
  if (cell instanceof Date) return cell.toLocaleString('vi-VN');
  return String(cell);
};

const createSafeHeaders = (row: ExcelRow) => {
  const usedHeaders = new Map<string, number>();

  return row.map((cell, index) => {
    let header = cellToText(cell).trim() || `Cột ${index + 1}`;
    if (FORBIDDEN_HEADERS.has(header.toLowerCase())) header = `Cột ${index + 1}`;

    const normalizedHeader = header.toLocaleLowerCase('vi-VN');
    const occurrence = (usedHeaders.get(normalizedHeader) ?? 0) + 1;
    usedHeaders.set(normalizedHeader, occurrence);
    return occurrence === 1 ? header : `${header} (${occurrence})`;
  });
};

export async function readXlsxRows(input: File | Blob | ArrayBuffer): Promise<ExcelRow[]> {
  const { readSheet } = await import('read-excel-file/browser');
  const rows = await readSheet(input);
  return rows as unknown as ExcelRow[];
}

export function xlsxRowsToObjects(rows: ExcelRow[]): Record<string, ExcelCell>[] {
  if (rows.length === 0) return [];
  const headers = createSafeHeaders(rows[0]);

  return rows
    .slice(1)
    .filter(row => row.some(cell => cell !== null && cellToText(cell).trim() !== ''))
    .map(row => {
      const record: Record<string, ExcelCell> = Object.create(null);
      headers.forEach((header, index) => {
        record[header] = row[index] ?? null;
      });
      return record;
    });
}

export function xlsxRowsToText(rows: ExcelRow[]) {
  return rows.map(row => row.map(cellToText).join('\t')).join('\n');
}

const toWritableCell = (value: unknown): ExcelCell => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const safeSheetName = (sheetName: string) => {
  const cleaned = sheetName.replace(/[\\/?*[\]:]/g, '_').trim();
  return (cleaned || 'Du lieu').slice(0, 31);
};

const safeFileName = (fileName: string) => {
  const cleaned = fileName.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_').trim() || 'du-lieu.xlsx';
  return cleaned.toLowerCase().endsWith('.xlsx') ? cleaned : `${cleaned}.xlsx`;
};

export async function downloadObjectsAsXlsx(
  objects: Array<Record<string, unknown>>,
  fileName: string,
  sheetName = 'Du lieu'
) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const headers = Array.from(new Set(objects.flatMap(object => Object.keys(object))));
  const data = headers.length === 0
    ? [['Không có dữ liệu']]
    : [
        headers.map(header => ({ value: header, fontWeight: 'bold' as const, backgroundColor: '#E2E8F0' })),
        ...objects.map(object => headers.map(header => (
          Object.prototype.hasOwnProperty.call(object, header) ? toWritableCell(object[header]) : null
        )))
      ];

  await writeXlsxFile(data, {
    sheet: safeSheetName(sheetName),
    stickyRowsCount: headers.length > 0 ? 1 : 0,
    columns: headers.map(header => ({ width: Math.min(50, Math.max(12, header.length + 2)) }))
  }).toFile(safeFileName(fileName));
}
