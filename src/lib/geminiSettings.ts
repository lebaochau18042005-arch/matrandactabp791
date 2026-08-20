export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
export const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';
export const GEMINI_MODEL_STORAGE_KEY = 'gemini_model';
const LEGACY_GEMINI_MODEL_STORAGE_KEY = 'gemini_preferred_model';

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
  return storage?.getItem(GEMINI_MODEL_STORAGE_KEY)
    || storage?.getItem(LEGACY_GEMINI_MODEL_STORAGE_KEY)
    || fallback;
};

export const saveGeminiModel = (model: string): void => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(GEMINI_MODEL_STORAGE_KEY, model);
  storage.removeItem(LEGACY_GEMINI_MODEL_STORAGE_KEY);
};
