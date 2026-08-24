import { GoogleGenAI } from '@google/genai';
import { DEFAULT_GEMINI_MODEL, normalizeGeminiModel } from '../lib/geminiSettings';

export const FALLBACK_MODELS = [
  DEFAULT_GEMINI_MODEL,
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite'
];

export type GeminiApiErrorType =
  | 'INVALID_API_KEY'
  | 'PERMISSION_DENIED'
  | 'MODEL_NOT_FOUND'
  | 'QUOTA_EXCEEDED'
  | 'MODEL_OVERLOADED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN';

export class GeminiRequestError extends Error {
  code: Exclude<GeminiApiErrorType, 'UNKNOWN'>;

  constructor(code: Exclude<GeminiApiErrorType, 'UNKNOWN'>, message: string) {
    super(message);
    this.name = 'GeminiRequestError';
    this.code = code;
  }
}

const getErrorStatus = (error: any): number => {
  const candidates = [
    error?.status,
    error?.statusCode,
    error?.response?.status,
    error?.error?.code
  ];
  const status = candidates.map(Number).find(Number.isFinite);
  return status || 0;
};

export const parseApiError = (error: any): GeminiApiErrorType => {
  const message = String(error?.message || error?.toString?.() || '');
  let serialized = '';
  try {
    serialized = JSON.stringify(error) || '';
  } catch {
    serialized = '';
  }
  const normalized = (message + ' ' + serialized).toUpperCase();
  const status = getErrorStatus(error);

  if (
    status === 429 ||
    normalized.includes('RESOURCE_EXHAUSTED') ||
    normalized.includes('RATE_LIMIT_EXCEEDED') ||
    normalized.includes('QUOTA')
  ) return 'QUOTA_EXCEEDED';

  if (
    status === 503 ||
    status === 502 ||
    status === 504 ||
    normalized.includes('UNAVAILABLE') ||
    normalized.includes('HIGH DEMAND') ||
    normalized.includes('OVERLOADED')
  ) return 'MODEL_OVERLOADED';

  if (
    status === 404 ||
    normalized.includes('MODEL_NOT_FOUND') ||
    normalized.includes('NOT_FOUND') ||
    normalized.includes('MODEL WAS NOT FOUND') ||
    normalized.includes('MODEL IS NOT FOUND')
  ) return 'MODEL_NOT_FOUND';

  if (
    status === 401 ||
    normalized.includes('API_KEY_INVALID') ||
    normalized.includes('AUTHENTICATION')
  ) return 'INVALID_API_KEY';

  if (
    status === 403 ||
    normalized.includes('PERMISSION_DENIED')
  ) return 'PERMISSION_DENIED';

  if (
    status === 400 ||
    normalized.includes('INVALID_ARGUMENT') ||
    normalized.includes('INVALID_REQUEST')
  ) return 'INVALID_REQUEST';

  return 'UNKNOWN';
};

export const getOrderedModels = (selectedModel?: string): string[] => {
  const preferredModel = normalizeGeminiModel(selectedModel);
  return Array.from(new Set([preferredModel, ...FALLBACK_MODELS].filter(Boolean)));
};

const createFinalError = (
  failures: Array<{ model: string; type: GeminiApiErrorType }>
): GeminiRequestError => {
  const failureTypes = new Set(failures.map(failure => failure.type));

  if (failureTypes.has('PERMISSION_DENIED')) {
    return new GeminiRequestError(
      'PERMISSION_DENIED',
      'API Key không có quyền sử dụng Gemini API hoặc mô hình đã chọn. Hãy kiểm tra giới hạn của khóa/dự án trong Google AI Studio, hoặc tạo API Key mới.'
    );
  }
  if (failureTypes.has('QUOTA_EXCEEDED')) {
    return new GeminiRequestError(
      'QUOTA_EXCEEDED',
      'API Key đã hết hạn mức sử dụng. Hãy chờ hạn mức được làm mới hoặc dùng API Key khác.'
    );
  }
  if (failureTypes.has('INVALID_REQUEST')) {
    return new GeminiRequestError(
      'INVALID_REQUEST',
      'Yêu cầu gửi tới Gemini chưa được chấp nhận. Hãy tải lại trang và thử lại; nếu lỗi còn xuất hiện, hãy kiểm tra kích thước tài liệu nguồn.'
    );
  }
  if (failureTypes.has('MODEL_OVERLOADED')) {
    return new GeminiRequestError(
      'MODEL_OVERLOADED',
      'Các mô hình Gemini đang quá tải hoặc tạm thời không phản hồi. Hãy thử lại sau ít phút.'
    );
  }
  return new GeminiRequestError(
    'MODEL_NOT_FOUND',
    'Các mô hình Gemini được cấu hình hiện không khả dụng cho API Key này. Hãy chọn một mô hình ổn định khác trong Cài đặt.'
  );
};

export const generateContentWithFallback = async (
  apiKey: string,
  preferredModel: string,
  params: { contents: any; config?: any }
) => {
  const resolvedKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!resolvedKey) {
    throw new GeminiRequestError(
      'INVALID_API_KEY',
      'Chưa có API Key. Vui lòng nhập Gemini API Key ở trang Cài đặt.'
    );
  }

  const ai = new GoogleGenAI({ apiKey: resolvedKey });
  const failures: Array<{ model: string; type: GeminiApiErrorType }> = [];

  for (const model of getOrderedModels(preferredModel)) {
    try {
      return await ai.models.generateContent({
        model,
        contents: params.contents,
        ...(params.config ? { config: params.config } : {})
      });
    } catch (error: any) {
      const errorType = parseApiError(error);
      console.warn('Gemini model failed', { model, errorType, status: getErrorStatus(error), error });
      failures.push({ model, type: errorType });

      if (errorType === 'INVALID_API_KEY') {
        throw new GeminiRequestError(
          'INVALID_API_KEY',
          'API Key Gemini không hợp lệ hoặc đã hết hạn. Hãy nhập lại khóa được tạo trong Google AI Studio.'
        );
      }

      if (
        errorType === 'MODEL_NOT_FOUND' ||
        errorType === 'PERMISSION_DENIED' ||
        errorType === 'QUOTA_EXCEEDED' ||
        errorType === 'MODEL_OVERLOADED' ||
        errorType === 'UNKNOWN'
      ) {
        continue;
      }

      throw createFinalError(failures);
    }
  }

  throw createFinalError(failures);
};
