import { generateContentWithFallback } from './geminiUtils';
import { AI_QUIZ_GENERATOR_PROMPT } from './aiQuizPrompt';
import type { QuizQuestion, GeneratedQuiz } from './mockAIGenerator';

export const generateQuizWithGemini = async (
  apiKey: string,
  selectedModel: string,
  lessonTitle: string,
  grade: number,
  topic: string,
  lessonId: string,
  documentContext?: string
): Promise<GeneratedQuiz> => {
  const userPrompt = `
Hãy tạo bộ 20 câu hỏi cho bài học Địa lí sau:
- Tên bài học: ${lessonTitle}
- Lớp: ${grade}
- Chủ đề: ${topic}
${documentContext ? `\n- BẮT BUỘC: Bạn phải trích xuất dữ liệu, đặc điểm từ TÀI LIỆU THAM KHẢO dưới đây để đưa vào câu dẫn hoặc ngữ liệu (stimulus) thay vì tự bịa kiến thức:\n"""\n${documentContext}\n"""` : ''}

YÊU CẦU ĐẦU RA (QUAN TRỌNG): 
- Mảng JSON chứa chính xác 20 object câu hỏi theo đúng Cấu trúc dữ liệu chuẩn đã nêu trong System Prompt.
- Định dạng JSON hợp lệ, không bọc trong markdown code block (không dùng \`\`\`json).
- Phân bổ đúng: 12 trắc nghiệm khách quan (multiple_choice), 4 đúng/sai (true_false), 4 trả lời ngắn tính toán (short_answer).
  `;

  try {
    const response = await generateContentWithFallback(apiKey, selectedModel, {
      contents: [
        { role: 'user', parts: [{ text: AI_QUIZ_GENERATOR_PROMPT + '\n\n' + userPrompt }] }
      ],
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Không nhận được phản hồi từ Gemini.");

    const questions: QuizQuestion[] = JSON.parse(responseText);

    if (!Array.isArray(questions)) {
      throw new Error("Dữ liệu trả về không phải là một mảng JSON.");
    }

    // Bổ sung các id nếu thiếu
    const finalQuestions = questions.map((q, index) => ({
      ...q,
      id: q.id || `gemini_q_${index}`,
      lessonId: lessonId
    }));

    return {
      id: `quiz_${crypto.randomUUID()}`,
      lessonId,
      title: `Quiz: ${lessonTitle}`,
      grade,
      totalQuestions: finalQuestions.length,
      questions: finalQuestions,
      createdAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.warn(`Lỗi khi tạo quiz:`, error);
    throw error;
  }
};
