export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
export const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';
export const GEMINI_MODEL_STORAGE_KEY = 'gemini_model';
const LEGACY_GEMINI_MODEL_STORAGE_KEY = 'gemini_preferred_model';

export const GEMINI_MODEL_OPTIONS = [
  {
    id: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    description: 'Mô hình ổn định, nhanh và hỗ trợ đầu vào PDF — khuyến nghị cho mọi tác vụ.'
  },
  {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    description: 'Mô hình ổn định thế hệ trước, dùng làm phương án dự phòng.'
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro (Preview)',
    description: 'Mô hình mạnh cho tác vụ phức tạp; bản Preview có thể có hạn mức chặt hơn.'
  }
] as const;

const LEGACY_MODEL_ALIASES: Record<string, string> = {
  'gemini-3.1-pro': 'gemini-3.1-pro-preview'
};

export const normalizeGeminiModel = (model?: string): string => {
  const normalized = String(model || '').trim();
  return LEGACY_MODEL_ALIASES[normalized] || normalized || DEFAULT_GEMINI_MODEL;
};

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

export const readGeminiApiKey = (): string => {
  return getStorage()?.getItem(GEMINI_API_KEY_STORAGE_KEY) || '';
};

export const saveGeminiApiKey = (apiKey: string): void => {
  getStorage()?.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey.trim());
};

export const readGeminiModel = (fallback = DEFAULT_GEMINI_MODEL): string => {
  const storage = getStorage();
  const storedModel = storage?.getItem(GEMINI_MODEL_STORAGE_KEY)
    || storage?.getItem(LEGACY_GEMINI_MODEL_STORAGE_KEY)
    || fallback;
  const normalizedModel = normalizeGeminiModel(storedModel);
  if (storage && normalizedModel !== storedModel) {
    storage.setItem(GEMINI_MODEL_STORAGE_KEY, normalizedModel);
    storage.removeItem(LEGACY_GEMINI_MODEL_STORAGE_KEY);
  }
  return normalizedModel;
};

export const saveGeminiModel = (model: string): void => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(GEMINI_MODEL_STORAGE_KEY, normalizeGeminiModel(model));
  storage.removeItem(LEGACY_GEMINI_MODEL_STORAGE_KEY);
};
