import { GoogleGenAI } from '@google/genai';

export const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-pro'
];

export const parseApiError = (error: any): string => {
  const message = error?.message || error?.toString() || '';
  const serialized = JSON.stringify(error) || '';

  if (
    serialized.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.toLowerCase().includes('quota')
  ) return 'QUOTA_EXCEEDED';

  if (
    serialized.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.toLowerCase().includes('high demand') ||
    message.toLowerCase().includes('overloaded')
  ) return 'MODEL_OVERLOADED';

  if (
    message.includes('API_KEY_INVALID') ||
    message.includes('401') ||
    message.includes('PERMISSION_DENIED') ||
    serialized.includes('404') // 404 is also seen for discontinued models like 2.5-flash
  ) return 'INVALID_API_KEY';

  return 'UNKNOWN';
};

export const getOrderedModels = (selectedModel?: string): string[] => {
  if (!selectedModel || !FALLBACK_MODELS.includes(selectedModel)) return FALLBACK_MODELS;
  return [selectedModel, ...FALLBACK_MODELS.filter((model) => model !== selectedModel)];
};

export const generateContentWithFallback = async (
  apiKey: string,
  preferredModel: string,
  params: { contents: any; config?: any }
) => {
  // Fallback to environment variable if no key provided
  const resolvedKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!resolvedKey) {
    throw new Error('Chưa có API Key. Vui lòng nhập Gemini API Key ở trang Cài đặt.');
  }
  const ai = new GoogleGenAI({ apiKey: resolvedKey });
  let lastError: any = null;

  for (const model of getOrderedModels(preferredModel)) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        ...(params.config ? { config: params.config } : {})
      });
      return response;
    } catch (error: any) {
      console.warn(`Model ${model} failed. Error:`, error);
      lastError = error;
      const errorType = parseApiError(error);
      
      if (errorType === 'INVALID_API_KEY') {
        throw new Error("API Key không hợp lệ hoặc mô hình bị khóa. Vui lòng vào ⚙️ Cài đặt để kiểm tra lại API Key.");
      } else if (errorType === 'QUOTA_EXCEEDED') {
        throw new Error("API Key đã hết hạn mức sử dụng (Quota Exceeded). Vui lòng dùng API Key khác.");
      } else if (errorType === 'MODEL_OVERLOADED') {
        console.warn(`Model ${model} đang bị quá tải. Đang chuyển sang model dự phòng...`);
        continue;
      } else {
        // Unknown error, try next model just in case, but usually a syntax issue
        continue;
      }
    }
  }

  throw lastError || new Error("Tất cả các model AI đều đang quá tải hoặc gặp lỗi. Vui lòng thử lại sau.");
};
