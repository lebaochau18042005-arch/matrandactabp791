import { GoogleGenAI } from '@google/genai';

export const FALLBACK_MODELS = [
  'gemini-3.0-pro',
  'gemini-2.5-pro',
  'gemini-2.5-flash'
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
  const ai = new GoogleGenAI({ apiKey });
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
        throw new Error("API Key không hợp lệ, không có quyền truy cập, hoặc mô hình bị khóa. Vui lòng kiểm tra lại cấu hình AI ở trang Đăng nhập.");
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
