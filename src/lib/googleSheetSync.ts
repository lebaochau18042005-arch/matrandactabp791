import Papa from 'papaparse';
import { readXlsxRows, xlsxRowsToObjects } from './excel';

export interface ImportedStudent {
  id: number;
  name: string;
  xp: number;
  simsViewed: number;
  avgScore: number;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  avatar: string;
  email?: string;
  studentCode?: string;
}

export interface GoogleSheetSettings {
  enabled: boolean;
  webhookUrl: string;
  rosterSheetUrl: string;
  lastSyncAt?: string;
}

export interface StudentResultPayload {
  event: 'student_completed';
  completed_at: string;
  class_name: string;
  student_id?: string;
  student_name: string;
  activity_type: 'simulation' | 'quiz' | 'lesson' | 'worksheet' | 'essay' | 'assignment';
  activity_title: string;
  assignment_id?: string;
  score: number;
  score_label: string;
  response_text?: string;
  attachment_name?: string;
  source: 'GeoHub';
}

const SETTINGS_KEY = 'geohub_google_sheet_settings';
const ROSTER_KEY = 'geohub_class_rosters';

export const defaultGoogleSheetSettings: GoogleSheetSettings = {
  enabled: false,
  webhookUrl: '',
  rosterSheetUrl: '',
};

export function getGoogleSheetSettings(): GoogleSheetSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultGoogleSheetSettings, ...JSON.parse(saved) } : defaultGoogleSheetSettings;
  } catch {
    return defaultGoogleSheetSettings;
  }
}

export function saveGoogleSheetSettings(settings: GoogleSheetSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getSavedRosters(): Record<string, ImportedStudent[]> {
  try {
    const saved = localStorage.getItem(ROSTER_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveRoster(className: string, students: ImportedStudent[]) {
  const rosters = getSavedRosters();
  rosters[className] = students;
  localStorage.setItem(ROSTER_KEY, JSON.stringify(rosters));
  const classNames = Array.from(new Set([...Object.keys(rosters), '10A1', '11B2']));
  localStorage.setItem('geohub_class_names', JSON.stringify(classNames));
}

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

function pick(row: Record<string, any>, keys: string[]) {
  const normalized = Object.entries(row).reduce<Record<string, any>>((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});

  for (const key of keys) {
    const value = normalized[normalizeHeader(key)];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
}

function avatarFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'HS';
}

function statusFromScore(score: number): ImportedStudent['status'] {
  if (score >= 8.5) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 6) return 'warning';
  return 'danger';
}

export function rowsToStudents(rows: Record<string, any>[]): ImportedStudent[] {
  return rows
    .map((row, index) => {
      const fallbackValues = Object.values(row).map(value => String(value ?? '').trim()).filter(Boolean);
      const name = pick(row, ['Học sinh', 'Ho ten', 'Họ tên', 'Tên học sinh', 'name', 'student_name']) || fallbackValues[0];
      if (!name) return null;

      const scoreText = pick(row, ['Điểm TB', 'Diem TB', 'Điểm trung bình', 'avgScore', 'average']);
      const score = Number.parseFloat(scoreText.replace(',', '.'));
      const avgScore = Number.isFinite(score) ? score : 7;
      const xpText = pick(row, ['XP', 'Kinh nghiệm']);
      const simText = pick(row, ['Bài đã xem', 'Mo phong da xem', 'simsViewed']);

      return {
        id: index + 1,
        name,
        xp: Number.parseInt(xpText, 10) || 0,
        simsViewed: Number.parseInt(simText, 10) || 0,
        avgScore,
        status: statusFromScore(avgScore),
        avatar: avatarFromName(name),
        email: pick(row, ['Email', 'mail']),
        studentCode: pick(row, ['Mã học sinh', 'Ma hoc sinh', 'studentCode', 'id']),
      };
    })
    .filter(Boolean) as ImportedStudent[];
}

export async function parseRosterFile(file: File): Promise<ImportedStudent[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'xlsx') {
    return rowsToStudents(xlsxRowsToObjects(await readXlsxRows(file)));
  }
  if (extension === 'xls') throw new Error('File .xls cũ không được hỗ trợ. Hãy lưu lại dưới dạng .xlsx hoặc CSV.');

  return parseRosterCsv(await file.text());
}

export function parseRosterCsv(csvText: string): ImportedStudent[] {
  const parsed = Papa.parse<Record<string, any>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return rowsToStudents(parsed.data);
}

export function toGoogleCsvUrl(url: string) {
  const trimmed = url.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return trimmed;
  const gid = trimmed.match(/[?&#]gid=(\d+)/)?.[1] ?? '0';
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
}

export async function importRosterFromGoogleSheet(url: string): Promise<ImportedStudent[]> {
  const response = await fetch(toGoogleCsvUrl(url));
  if (!response.ok) throw new Error('Không đọc được Google Sheet. Hãy chia sẻ Sheet ở chế độ xem hoặc dùng link CSV.');
  return parseRosterCsv(await response.text());
}

export async function syncResultToGoogleSheet(payload: StudentResultPayload) {
  const settings = getGoogleSheetSettings();
  if (!settings.enabled || !settings.webhookUrl.trim()) return false;

  await fetch(settings.webhookUrl.trim(), {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  saveGoogleSheetSettings({
    ...settings,
    lastSyncAt: new Date().toISOString(),
  });
  return true;
}

export const GOOGLE_SHEET_APPS_SCRIPT_SAMPLE = `function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('KetQua') ||
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('KetQua');
  const data = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Thời gian', 'Lớp', 'Học sinh', 'Hoạt động', 'Tên bài', 'Điểm', 'Câu trả lời', 'Tệp đính kèm', 'Mã nhiệm vụ']);
  }
  sheet.appendRow([
    data.completed_at,
    data.class_name,
    data.student_name,
    data.activity_type,
    data.activity_title,
    data.score_label,
    data.response_text || '',
    data.attachment_name || '',
    data.assignment_id || ''
  ]);
  return ContentService.createTextOutput('OK');
}`;
