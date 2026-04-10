
import { GoogleGenAI, Type } from "@google/genai";
import type { ExamMatrix, ContentRow, CognitiveLevel as CognitiveLevelType, EssayQuestion } from '../types';
import { QuestionType, CognitiveLevel } from '../types';

// Lazy API client — reads key from localStorage at call-time so user-entered keys are always fresh.
const GEMINI_STORAGE_KEY = 'gemini_api_key';

/** Returns true only if the string is non-empty, pure ASCII, and not the literal "undefined" */
function isValidAsciiKey(key: string | null | undefined): key is string {
  if (!key || key === 'undefined' || key === 'null') return false;
  // HTTP headers only accept ISO-8859-1 (effectively ASCII for API keys)
  return /^[\x20-\x7E]+$/.test(key);
}

function getAiClient(): GoogleGenAI {
  const fromLocalStorage = typeof localStorage !== 'undefined' ? localStorage.getItem(GEMINI_STORAGE_KEY) : null;
  const fromEnvApiKey = process.env.API_KEY as string | undefined;
  const fromEnvGemini = process.env.GEMINI_API_KEY as string | undefined;

  const apiKey = [fromLocalStorage, fromEnvApiKey, fromEnvGemini].find(isValidAsciiKey);

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({ apiKey });
}


// Model fallback list — sử dụng các model có free tier (cập nhật tháng 4/2026)
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

async function generateContentWithFallback(requestOptions: any, fallbackModels: string[] = FALLBACK_MODELS): Promise<any> {
    // Collect all models. Remove duplicates.
    const modelsToTry = Array.from(new Set([requestOptions.model, ...fallbackModels]));
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            console.info(`[AI] Đang thử gửi request tới model: ${model}`);
            const options = { ...requestOptions, model };
            // Get a fresh client each call so updated localStorage keys are used
            const response = await getAiClient().models.generateContent(options);
            console.info(`[AI] Gọi ${model} thành công.`);
            return response;
        } catch (error: any) {
            // If API key is missing, abort immediately — no point retrying other models
            if (error?.message === 'MISSING_API_KEY') {
                throw new Error('❌ Chưa có API Key hợp lệ. Vui lòng nhấn nút "Settings (API Key)" trên Header để nhập key của bạn.');
            }
            console.error(`[AI] Lỗi model ${model}:`, error?.message || error);
            lastError = error;
            // Tiếp tục vòng lặp model khác
        }
    }
    throw lastError;
}

export async function suggestTopicsFromDescription(
  subject: string,
  grade: number,
  description: string
): Promise<{ chapterName: string; contentName: string }[]> {
  const modelName = 'gemini-2.5-flash';
  const prompt = `
    Bạn là một chuyên gia giáo dục. Dựa trên mô tả dưới đây về nội dung ôn tập cho môn ${subject} lớp ${grade}, hãy đề xuất danh sách các chương và nội dung kiến thức tương ứng để lập ma trận đề thi.
    
    Mô tả: "${description}"
    
    Yêu cầu:
    1. Phân chia nội dung thành các chương (chapterName) và các bài/nội dung cụ thể (contentName).
    2. Đảm bảo các nội dung này phù hợp với chương trình giáo dục phổ thông hiện hành của Việt Nam.
    3. Trả về kết quả dưới dạng mảng các đối tượng JSON.
  `;

  try {
    const response = await generateContentWithFallback({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chapterName: { type: Type.STRING },
              contentName: { type: Type.STRING },
            },
            required: ["chapterName", "contentName"],
          },
        },
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Lỗi khi gợi ý chủ đề:", error);
    return [];
  }
}

export async function suggestMatrixFromContent(
  subject: string,
  grade: number,
  content: string
): Promise<{ chapterName: string; contentName: string; learningOutcomes: Record<string, string> }[]> {
  const modelName = 'gemini-2.5-flash';
  const prompt = `
    Bạn là một chuyên gia giáo dục. Hãy phân tích tài liệu dưới đây (môn ${subject} lớp ${grade}) và trích xuất các chủ đề kiến thức quan trọng cùng với "Yêu cầu cần đạt" (Bản đặc tả) tương ứng cho 3 mức độ: Biết, Hiểu, Vận dụng.
    
    Tài liệu:
    """
    ${content}
    """
    
    Yêu cầu:
    1. Xác định các chương (chapterName) và nội dung (contentName).
    2. Với mỗi nội dung, hãy viết Yêu cầu cần đạt cho 3 mức độ: Biết, Hiểu, Vận dụng. Cú pháp BẮT BUỘC phải theo đúng chuẩn của Chương trình GDPT 2018: Luôn bắt đầu bằng động từ hành động kèm theo chữ "được" (ví dụ: Nêu được, Trình bày được, Phân tích được, Giải thích được, Vận dụng được,...).
    3. TUYỆT ĐỐI KHÔNG thêm bất kỳ tiền tố, ký hiệu phụ nào vào đầu câu như (NL1), (NL2), (VD) hay "Cập nhật TT...". YCCĐ phải là một câu văn chuẩn mực.
    4. Trả về kết quả dưới dạng mảng các đối tượng JSON.
  `;

  try {
    const response = await generateContentWithFallback({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chapterName: { type: Type.STRING },
              contentName: { type: Type.STRING },
              learningOutcomes: {
                type: Type.OBJECT,
                properties: {
                  [CognitiveLevel.KNOWLEDGE]: { type: Type.STRING },
                  [CognitiveLevel.COMPREHENSION]: { type: Type.STRING },
                  [CognitiveLevel.APPLICATION]: { type: Type.STRING },
                },
              },
            },
            required: ["chapterName", "contentName", "learningOutcomes"],
          },
        },
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Lỗi khi phân tích tài liệu:", error);
    return [];
  }
}

function formatMatrixForPrompt(matrix: ExamMatrix): string {
  let promptString = `
## THÔNG TIN CHUNG
- Sở GD&ĐT: ${matrix.header.departmentOfEducation}
- Đơn vị: ${matrix.header.schoolName}
- Môn học: ${matrix.header.subject}
- Kì kiểm tra: ${matrix.header.examPeriod}
- Tên bài kiểm tra: ${matrix.header.examName}
- Khối lớp: ${matrix.header.grade}
- Thời gian làm bài: ${matrix.header.duration} phút
- Người tạo: ${matrix.header.creator}
- Tổng điểm: ${matrix.header.totalPoints}

## MA TRẬN VÀ BẢN ĐẶC TẢ CHI TIẾT
`;
  
  const topicsByChapter: Record<string, ContentRow[]> = matrix.topics.reduce((acc, topic) => {
      if (!acc[topic.chapterName]) acc[topic.chapterName] = [];
      acc[topic.chapterName].push(topic);
      return acc;
  }, {} as Record<string, ContentRow[]>);


  Object.entries(topicsByChapter).forEach(([chapterName, topics]) => {
    promptString += `\n### CHỦ ĐỀ/CHƯƠNG: ${chapterName}\n`;
    topics.forEach((topic: ContentRow) => {
        promptString += `\n#### Nội dung: ${topic.contentName}\n`;
        
        // Thêm Bản đặc tả (Yêu cầu cần đạt) vào prompt
        if (topic.learningOutcomes && Object.keys(topic.learningOutcomes).length > 0) {
            promptString += `**Yêu cầu cần đạt (Bản đặc tả) cho nội dung này:**\n`;
            Object.entries(topic.learningOutcomes).forEach(([level, outcome]) => {
                if (outcome) {
                    promptString += `- [Mức độ ${level}]: ${outcome}\n`;
                }
            });
        }

        Object.entries(topic.questions).forEach(([qType, levels]) => {
          promptString += `- **Loại câu hỏi: ${qType}**\n`;
          Object.entries(levels as any).forEach(([cLevel, questionDetail]) => {
            const isEssay = qType === QuestionType.ESSAY;
            const hasQuestion = isEssay ? (questionDetail as EssayQuestion)?.id : (typeof questionDetail === 'object' ? (questionDetail as any).count > 0 : (questionDetail as number) > 0);
            
            if(hasQuestion) {
               const pointsPerQuestion = (typeof questionDetail === 'object' && (questionDetail as any).pointsPerQuestion !== undefined)
                   ? (questionDetail as any).pointsPerQuestion
                   : (matrix.points[qType as QuestionType]?.[cLevel as CognitiveLevel] || 0);
               const countValue = isEssay ? 1 : (typeof questionDetail === 'object' ? (questionDetail as any).count : (questionDetail as number));
               const totalPoints = countValue * pointsPerQuestion;
               const displayCount = isEssay ? (questionDetail as EssayQuestion).id : countValue;
               
               promptString += `  - **Mức độ:** ${cLevel}, **Số lượng/ID:** ${displayCount}, **Điểm mỗi câu:** ${pointsPerQuestion}, **Tổng điểm:** ${totalPoints.toFixed(2)}\n`;
               
               if (isEssay && (questionDetail as EssayQuestion).isChart) {
                    promptString += `    **Yêu cầu đặc biệt:** Câu hỏi này BẮT BUỘC phải là dạng vẽ biểu đồ và nhận xét từ bảng số liệu.\n`;
               }
            }
          });
        });
    });
  });

  const totals = calculateTotalQuestions(matrix);
  promptString += `\n## TỔNG HỢP SỐ LƯỢNG CÂU HỎI (BẮT BUỘC ĐỦ SỐ LƯỢNG NÀY):
- Trắc nghiệm nhiều lựa chọn: ${totals.totalMC} câu
- Trắc nghiệm Đúng - Sai: ${totals.totalTF} câu
- Trắc nghiệm Trả lời ngắn: ${totals.totalSA} câu
- Tự luận: ${totals.totalEssay} câu
`;

  return promptString;
}

function calculateTotalQuestions(matrix: ExamMatrix) {
    let totalMC = 0;
    let totalTF = 0;
    let totalSA = 0;
    let totalEssay = 0;

    matrix.topics.forEach(topic => {
        Object.entries(topic.questions).forEach(([qType, levels]) => {
            Object.values(levels as any).forEach((detail: any) => {
                const isEssay = qType === QuestionType.ESSAY;
                const hasQuestion = isEssay ? (detail as EssayQuestion)?.id : (typeof detail === 'object' ? (detail as any).count > 0 : (detail as number) > 0);
                
                if (hasQuestion) {
                    const count = isEssay ? 1 : (typeof detail === 'object' ? detail.count : detail);
                    if (qType === QuestionType.MULTIPLE_CHOICE) totalMC += count;
                    if (qType === QuestionType.TRUE_FALSE) totalTF += count;
                    if (qType === QuestionType.SHORT_ANSWER) totalSA += count;
                    if (qType === QuestionType.ESSAY) totalEssay += count;
                }
            });
        });
    });
    return { totalMC, totalTF, totalSA, totalEssay };
}

export async function generateLearningOutcome(
  subject: string,
  grade: number,
  contentName: string,
  cognitiveLevel: CognitiveLevelType,
  curriculumOutcome?: string
): Promise<string> {
  // Nếu đã tìm thấy YCCĐ trong chương trình đã nạp, trả về ngay — không cần gọi AI
  if (curriculumOutcome && curriculumOutcome.trim()) {
    console.info(`[AI] YCCĐ tìm thấy trong chương trình cho "${contentName}" - ${cognitiveLevel}, không cần gọi AI.`);
    return curriculumOutcome.trim();
  }
  const modelName = 'gemini-2.5-flash';
  
  let subjectSpecificInstructions = '';
  const subjectLower = subject.toLowerCase();
  if (subjectLower.includes('địa lý') || subjectLower.includes('địa lí')) {
      subjectSpecificInstructions = `
  Lưu ý quan trọng cho môn Địa lí: YCCĐ nên thể hiện rõ các kĩ năng đặc thù của môn học. Tùy vào nội dung và mức độ nhận thức, hãy lồng ghép các kĩ năng sau một cách phù hợp:
  - Kĩ năng làm việc với bản đồ.
  - Kĩ năng đọc, phân tích và nhận xét **bảng số liệu, biểu đồ**.
  - Kĩ năng tính toán (cơ cấu, mật độ, tốc độ tăng trưởng,...).
  - Kĩ năng **vẽ biểu đồ**.
  Ví dụ YCCĐ Địa lí mức độ Hiểu: "Phân tích được bảng số liệu về cơ cấu GDP để rút ra nhận xét."
  Ví dụ YCCĐ Địa lí mức độ Vận dụng: "Vận dụng kiến thức và kĩ năng vẽ biểu đồ để thể hiện sự thay đổi cơ cấu kinh tế qua bảng số liệu cho trước và rút ra nhận xét."
  `;
  } else if (subjectLower.includes('lịch sử')) {
      subjectSpecificInstructions = `
  Lưu ý quan trọng cho môn Lịch sử: YCCĐ nên thể hiện rõ các kĩ năng đặc thù của môn học. Hãy lồng ghép các kĩ năng sau một cách phù hợp:
  - Kĩ năng xác định thời gian, lập trục thời gian (timeline).
  - Kĩ năng phân tích sự kiện, nhân vật lịch sử.
  - Kĩ năng giải thích mối quan hệ nhân quả (nguyên nhân, diễn biến, kết quả, ý nghĩa).
  - Kĩ năng đánh giá, rút ra bài học lịch sử.
  Ví dụ YCCĐ Lịch sử mức độ Hiểu: "Giải thích được nguyên nhân bùng nổ và ý nghĩa lịch sử của Cách mạng tháng Tám năm 1945."
  Ví dụ YCCĐ Lịch sử mức độ Vận dụng: "Đánh giá được vai trò của khối đại đoàn kết dân tộc trong thắng lợi của cuộc kháng chiến chống thực dân Pháp."
  `;
  }

  const prompt = `
    Bạn là một chuyên gia xây dựng chương trình giáo dục tại Việt Nam. 
    Hãy viết một "Yêu cầu cần đạt" (YCCĐ) cho học sinh lớp ${grade}, môn ${subject}.

    - **Nội dung kiến thức:** "${contentName}"
    - **Mức độ nhận thức:** ${cognitiveLevel}
    
    ${subjectSpecificInstructions}

    Yêu cầu:
    1. Cú pháp BẮT BUỘC theo cấu trúc của Chương trình GDPT 2018: Luôn bắt đầu bằng một động từ hành động + chữ "được" (ví dụ: Trình bày được, Nêu được, Phân tích được, Giải thích được, Đánh giá được, So sánh được,...). Không bao giờ được thiếu chữ "được".
    2. YCCĐ phải ngắn gọn, súc tích, rõ nghĩa, và có thể đo lường được lượng kiến thức lõi.
    3. Trả về DUY NHẤT một câu YCCĐ. TUYỆT ĐỐI KHÔNG thêm lời giải thích, số thứ tự, hay các ký hiệu ngoài lề như (NL1), (NL2), hoặc "Cập nhật TT 17/2025" ở đầu hoặc cuối câu. YCCĐ phải chính quy như văn bản của BGD.

    Ví dụ:
    - Nội dung: "Vị trí địa lí", Mức độ: "Biết" -> Kết quả trả về: Trình bày được vị trí địa lí, các bộ phận hợp thành và ý nghĩa của phạm vi lãnh thổ Việt Nam.
    - Nội dung: "Thiên nhiên nhiệt đới", Mức độ: "Hiểu" -> Kết quả trả về: Phân tích được các biểu hiện của thiên nhiên nhiệt đới ẩm gió mùa qua các thành phần tự nhiên.
    - Nội dung: "Vùng Nam Trung Bộ", Mức độ: "Vận dụng" -> Kết quả trả về: Giải thích được sự tương hỗ kinh tế và chiến lược giữa vùng biển Duyên hải Nam Trung Bộ và Tây Nguyên.
  `;

  try {
    const response = await generateContentWithFallback({
      model: modelName,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Lỗi khi tạo YCCĐ:", error);
    throw new Error("Không thể tạo Yêu cầu cần đạt.");
  }
}

export async function parseMatrixFromText(text: string): Promise<ExamMatrix | null> {
  const modelName = 'gemini-2.5-flash';
  const prompt = `
    Bạn là một chuyên gia giáo dục. Hãy phân tích đoạn văn bản dưới đây (được trích xuất từ file Ma trận đề thi) và chuyển đổi nó thành một đối tượng JSON khớp với cấu trúc ExamMatrix.
    
    Văn bản trích xuất:
    """
    ${text}
    """
    
    Yêu cầu:
    1. Trích xuất thông tin tiêu đề (header): Sở GD&ĐT (departmentOfEducation), Tên trường (schoolName), Tên kỳ thi (examPeriod), Tên bài thi (examName), Người tạo (creator), Thời gian (duration), Khối lớp (grade), Môn học (subject), Tổng điểm (totalPoints).
    2. Trích xuất danh sách các chủ đề (topics). Mỗi chủ đề gồm:
       - id: chuỗi duy nhất (ví dụ: "topic-1")
       - chapterName: Tên chương/chủ đề lớn
       - contentName: Tên nội dung/đơn vị kiến thức
       - learningOutcomes: Đối tượng chứa Yêu cầu cần đạt cho các mức độ: "Biết", "Hiểu", "Vận dụng".
       - questions: Đối tượng chứa số lượng câu hỏi theo loại và mức độ.
         - Loại câu hỏi: "Nhiều lựa chọn", "Đúng - sai", "Trả lời ngắn", "Tự luận".
         - Mức độ: "Biết", "Hiểu", "Vận dụng".
         - Với Trắc nghiệm: Giá trị là số lượng câu hỏi (ví dụ: 2).
         - Với Tự luận: Giá trị là đối tượng { id: "Câu X", isChart: boolean }.
    3. Trích xuất cấu hình điểm (points): Điểm cho mỗi câu hỏi theo loại và mức độ.
    
    Lưu ý: Nếu không tìm thấy thông tin cụ thể, hãy để trống hoặc dùng giá trị mặc định hợp lý. Đảm bảo JSON trả về là hợp lệ và khớp chính xác với cấu trúc ExamMatrix.
  `;

  try {
    const response = await generateContentWithFallback({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Lỗi khi phân tích ma trận từ văn bản:", error);
    return null;
  }
}

export async function generateExam(matrix: ExamMatrix, documentContent?: string, customMatrixText?: string): Promise<string> {
  const modelName = 'gemini-2.5-flash';
  
  const formattedMatrix = customMatrixText ? `\nMA TRẬN VÀ BẢN ĐẶC TẢ TỪ FILE TẢI LÊN:\n${customMatrixText}\n\n(Lưu ý: Bám sát nội dung ma trận/đặc tả từ file này thay vì các thông số chuẩn)\n` : formatMatrixForPrompt(matrix);
  
  let subjectSpecificInstructions = '';
  const subjectLower = matrix.header.subject.toLowerCase();
  if (subjectLower.includes('địa lý') || subjectLower.includes('địa lí')) {
    subjectSpecificInstructions = `
6.  **LƯU Ý ĐẶC BIỆT CHO MÔN ĐỊA LÍ**:
    *   Các câu hỏi, đặc biệt ở mức độ Hiểu và Vận dụng, BẮT BUỘC phải tích hợp các kĩ năng địa lí.
    *   Tích cực sử dụng **bảng số liệu, biểu đồ**, hoặc yêu cầu học sinh sử dụng bản đồ (phải ghi rõ trong câu hỏi, ví dụ: "Dựa vào bản đồ X..."). Câu hỏi không được yêu cầu sử dụng Atlat.
    *   Các câu hỏi yêu cầu tính toán phải thực tế và phù hợp (ví dụ: tính mật độ dân số, tỉ lệ gia tăng, cơ cấu kinh tế, sản lượng trung bình).
    *   **Đối với năng lực "Tìm hiểu" (TH - mã hóa NL2)**: Nếu câu hỏi ở dạng "Trả lời ngắn" (Dạng thức 3), mặc định phải là các câu hỏi liên quan đến tính toán số liệu (TNHS TOÁN).
    *   **Nếu ma trận có "Yêu cầu đặc biệt" về vẽ biểu đồ cho một câu hỏi Tự luận, BẮT BUỘC phải tạo câu hỏi dạng cung cấp bảng số liệu và yêu cầu học sinh vẽ biểu đồ thích hợp, sau đó rút ra nhận xét, giải thích.** Điều này giúp kiểm tra kĩ năng toàn diện của học sinh.
`;
  } else if (subjectLower.includes('lịch sử')) {
    subjectSpecificInstructions = `
6.  **LƯU Ý ĐẶC BIỆT CHO MÔN LỊCH SỬ**:
    *   Các câu hỏi phải bám sát tiến trình lịch sử, đảm bảo tính khách quan và khoa học.
    *   Tăng cường các câu hỏi yêu cầu học sinh phân tích mối quan hệ nhân quả, so sánh các sự kiện/giai đoạn lịch sử.
    *   Sử dụng các nguồn tư liệu lịch sử (trích dẫn văn bản, hình ảnh, bản đồ lịch sử) làm ngữ cảnh cho câu hỏi.
    *   Câu hỏi mức độ Vận dụng nên yêu cầu học sinh liên hệ thực tiễn hoặc rút ra bài học kinh nghiệm từ quá khứ cho hiện tại.
    *   Đảm bảo các mốc thời gian và sự kiện hoàn toàn chính xác theo chương trình giáo dục phổ thông.
`;
  } else if (subjectLower.includes('toán')) {
    subjectSpecificInstructions = `
6.  **LƯU Ý ĐẶC BIỆT CHO MÔN TOÁN**:
    *   Tất cả các công thức toán học, biểu thức, đồ thị, phương trình và ký hiệu học thuật... BẮT BUỘC phải được định dạng theo cấu trúc mã chuẩn (LaTeX) phổ thông. TUYỆT ĐỐI KHÔNG dùng plain text (Ví dụ: không viết x^2, mà phải là $x^2$ hoặc $$x^2$$).
    *   Sử dụng cú pháp $$...$$ cho các công thức đứng riêng biệt một dòng và $...$ cho công thức xen giữa dòng text.
    *   Đảm bảo lời giải toán học phải cực kỳ logic, chặt chẽ, hiển thị MathType/LaTeX hoàn chỉnh để giáo viên có thể copy paste thẳng vào Word.
`;
  }

  const documentContext = documentContent ? `
**TÀI LIỆU THAM KHẢO (BẮT BUỘC SỬ DỤNG ĐỂ RA ĐỀ):**
Dưới đây là nội dung tài liệu mà bạn PHẢI sử dụng làm ngữ cảnh để đặt câu hỏi. Hãy ưu tiên trích dẫn các ví dụ, số liệu hoặc kiến thức từ tài liệu này:
"""
${documentContent}
"""
` : '';


  const prompt = `
Bạn là một chuyên gia giáo dục và giáo viên dạy giỏi môn ${matrix.header.subject} tại Việt Nam, có kinh nghiệm ra đề thi theo Công văn 7791 của Bộ Giáo dục và Đào tạo.
Dựa vào ma trận và bản đặc tả chi tiết dưới đây, hãy tạo ra một đề kiểm tra hoàn chỉnh cho học sinh lớp ${matrix.header.grade}, bao gồm cả đề bài, đáp án và lời giải chi tiết.

${documentContext}

**QUY TRÌNH THỰC HIỆN (BẮT BUỘC):**
1.  **Đọc kỹ Ma trận và Bản đặc tả**: Xác định rõ từng nội dung, mức độ nhận thức, loại câu hỏi và Yêu cầu cần đạt (YCCĐ) tương ứng.
2.  **Soạn thảo câu hỏi**: Với mỗi yêu cầu trong ma trận, hãy tạo ra một câu hỏi bám sát vào YCCĐ của mức độ đó. Không được tạo câu hỏi chung chung hoặc sai mức độ.
3.  **Kiểm soát số lượng**: Đảm bảo tổng số câu hỏi của từng loại (Nhiều lựa chọn, Đúng-Sai, Trả lời ngắn, Tự luận) phải khớp hoàn toàn với phần "TỔNG HỢP SỐ LƯỢNG CÂU HỎI" ở cuối ma trận.
4.  **Tự kiểm tra (Self-Check)**: Trước khi trả về kết quả, hãy rà soát lại xem đề thi đã đủ số lượng câu hỏi và đúng nội dung/mức độ theo ma trận chưa.

**YÊU CẦU BẮT BUỘC:**
1.  **TUÂN THỦ TUYỆT ĐỐI MA TRẬN VÀ BẢN ĐẶC TẢ**: 
    *   Số lượng câu hỏi, loại câu hỏi (${Object.values(QuestionType).join(', ')}), mức độ nhận thức (${Object.values(CognitiveLevel).join(', ')}) và nội dung chủ đề phải chính xác 100% như trong ma trận.
    *   **QUAN TRỌNG**: Mỗi câu hỏi được tạo ra BẮT BUỘC phải bám sát vào "Yêu cầu cần đạt" tương ứng với mức độ nhận thức đó trong Bản đặc tả. Nếu ma trận yêu cầu 1 câu trắc nghiệm mức độ "Biết" cho nội dung A, thì câu hỏi đó phải kiểm tra đúng YCCĐ mức độ "Biết" của nội dung A.
2.  **NỘI DUNG CHẤT LƯỢNG**: Các câu hỏi phải phù hợp với chương trình giáo dục phổ thông môn ${matrix.header.subject} lớp ${matrix.header.grade} của Việt Nam, đảm bảo tính chính xác, khoa học, rõ ràng và có khả năng phân loại học sinh.
3.  **ĐỊNH DẠNG CHUYÊN NGHIỆP**:
    *   Trình bày đề thi một cách chuyên nghiệp, sạch sẽ, có cấu trúc rõ ràng. Bắt đầu bằng thông tin Sở GD&ĐT và Tên đơn vị.
    *   Phần I: TRẮC NGHIỆM KHÁCH QUAN. Phần II: TỰ LUẬN.
    *   Đối với câu hỏi trắc nghiệm, đưa ra 4 phương án (A, B, C, D) và chỉ có một đáp án đúng duy nhất.
    *   Tách biệt rõ ràng 3 phần: **I. ĐỀ BÀI**, **II. ĐÁP ÁN**, và **III. LỜI GIẢI CHI TIẾT**.
    *   Trong phần **ĐÁP ÁN**, trình bày dưới dạng bảng hoặc danh sách ngắn gọn (ví dụ: 1. A, 2. B, ...).
    *   Trong phần **LỜI GIẢI CHI TIẾT**, giải thích cặn kẽ, rõ ràng tại sao đáp án đó lại đúng, đặc biệt với các câu hỏi mức độ Hiểu và Vận dụng.
4.  **LƯU Ý ĐẶC BIỆT VỀ DẠNG CÂU HỎI "ĐÚNG - SAI" (BẮT BUỘC THEO ĐÚNG CẤU TRÚC BGD 2025)**:

    > **⚠️ QUAN TRỌNG - ĐỌC KỸ TRƯỚC KHI TẠO CÂU HỎI ĐÚNG/SAI:**
    > Trong ma trận, khi ghi "Đúng/Sai: Biết 1, Hiểu 1, Vận dụng 1, Vận dụng cao 1" KHÔNG CÓ NGHĨA là tạo ra 4 câu hỏi riêng lẻ. Đây là CHỈ DẪN VỀ MỨC ĐỘ CÂU HỎI cho 4 nhận định a/b/c/d BÊN TRONG MỘT CÂU DUY NHẤT.

    *   **Cấu trúc CỦA MỖI CÂU Đúng/Sai theo BGD 2025:**
        - **1 câu Đúng/Sai** = 1 đoạn ngữ cảnh/thông tin + **đúng 4 nhận định a/b/c/d**
        - Nhận định **a)** → mức độ **Nhận biết** (sự kiện cơ bản, ghi nhớ thông tin)
        - Nhận định **b)** → mức độ **Thông hiểu** (giải thích, so sánh nguyên nhân-kết quả)
        - Nhận định **c)** → mức độ **Vận dụng** (áp dụng kiến thức vào tình huống mới)
        - Nhận định **d)** → mức độ **Vận dụng cao** (phân tích, đánh giá, đề xuất giải pháp)
        - Độ khó TĂNG DẦN từ a → d.
    *   **Cấu trúc trình bày đúng chuẩn BGD:**
        Câu X: [Đoạn thông tin/ngữ cảnh/bảng số liệu làm cơ sở cho cả 4 nhận định]
        Dựa vào thông tin trên, hãy xác định các nhận định sau là Đúng hay Sai:
        a) [Nhận định mức NHẬN BIẾT - đơn giản, nhớ/nhận ra sự kiện]         → Đúng/Sai
        b) [Nhận định mức THÔNG HIỂU - giải thích, phân biệt nguyên nhân]    → Đúng/Sai
        c) [Nhận định mức VẬN DỤNG - áp dụng kiến thức vào tình huống cụ thể]→ Đúng/Sai
        d) [Nhận định mức VẬN DỤNG CAO - phân tích, đánh giá đa chiều]       → Đúng/Sai
    *   Trong phần **ĐÁP ÁN**: "Câu X: a) Đúng, b) Sai, c) Đúng, d) Sai"
    *   Trong phần **LỜI GIẢI**: giải thích lý do đúng/sai cho từng nhận định a/b/c/d theo đúng mức độ nhận thức tương ứng.
    *   **TUYỆT ĐỐI KHÔNG**: tạo 4 câu hỏi Đúng/Sai riêng lẻ (mỗi câu cho 1 mức độ). Sai hoàn toàn với chuẩn BGD 2025.

5.  **LƯU Ý ĐẶC BIỆT VỀ DẠNG CÂU HỎI "TRẢ LỜI NGẮN"**:
    *   Tất cả các câu hỏi thuộc dạng "Trả lời ngắn" (Dạng thức 3) BẮT BUỘC phải là dạng câu hỏi **tính toán số liệu có công thức cụ thể** (năng lực Tìm hiểu địa lí - NL2). Câu trả lời là một **con số** (kèm đơn vị nếu có).
    *   Bạn phải cung cấp đầy đủ số liệu đầu vào (bảng Markdown hoặc đoạn văn) và yêu cầu tính toán rõ ràng, làm tròn đến chữ số thập phân cụ thể.
    *   **Các dạng tính toán ĐẶC TRƯNG cho môn Địa lí** — AI phải xoay vòng đa dạng các công thức sau, KHÔNG lặp lại cùng một dạng trong một đề:
        - **Mật độ dân số** = Dân số (người) ÷ Diện tích (km²), đơn vị: người/km²
        - **Tỉ lệ dân thành thị / nông thôn** = (Dân số thành thị ÷ Tổng dân số) × 100%, hoặc so sánh chênh lệch giữa hai năm
        - **Tốc độ tăng trưởng** = ((Giá trị năm sau − Giá trị năm trước) ÷ Giá trị năm trước) × 100%
        - **Tốc độ tăng trưởng trung bình** (CAGR đơn giản) = Tổng tăng ÷ Số năm (hoặc theo điểm phần trăm)
        - **Tỉ trọng (cơ cấu)** = (Giá trị thành phần ÷ Tổng) × 100%, ví dụ: cơ cấu GDP, cơ cấu lao động
        - **Tăng thêm / Giảm đi** (điểm phần trăm) = Giá trị năm sau − Giá trị năm trước (khi đã là %)
        - **Năng suất lao động / Năng suất cây trồng** = Sản lượng ÷ Diện tích canh tác (tạ/ha hoặc tấn/ha), hoặc Doanh thu ÷ Số lao động
        - **Sản lượng bình quân đầu người** = Tổng sản lượng ÷ Dân số, đơn vị: kg/người/năm hoặc tương đương
        - **Cự ly vận chuyển trung bình** = Tổng hàng hóa luân chuyển (tấn.km) ÷ Tổng lượng hàng hóa (tấn)
        - **Diện tích gieo trồng / Hệ số sử dụng đất** = Diện tích gieo trồng ÷ Diện tích canh tác
        - **Tổng sản lượng** = Năng suất (tạ/ha) × Diện tích (ha), tính ngược lại từ số liệu cho trước
        - **Giá trị xuất/nhập khẩu bình quân** hoặc **cán cân thương mại** = Xuất khẩu − Nhập khẩu
6.  **YÊU CẦU BẮT BUỘC VỀ ĐỊNH DẠNG BẢNG SỐ LIỆU VÀ BIỂU ĐỒ**:
    *   Bất kỳ câu hỏi nào có **bảng số liệu** PHẢI trình bày dưới dạng bảng Markdown chuẩn (dùng |, ---, :---:) để rõ ràng, dễ đọc.
    *   Bất kỳ **con số, đơn vị, phép tính, tỉ lệ %** trong đề bài hoặc lời giải PHẢI được định dạng LaTeX: dùng $...$ cho inline (ví dụ: $1\,234\,567$ người, $85{,}6\%$) và $$...$$ cho công thức trên dòng riêng.
    *   Các câu hỏi yêu cầu **vẽ biểu đồ** phải ghi rõ dạng biểu đồ phù hợp (cột, đường, tròn, miền) và cung cấp số liệu chuẩn dưới dạng bảng Markdown + LaTeX.
    *   TUYỆT ĐỐI KHÔNG viết số liệu dưới dạng plain text thuần tuý khi chúng xuất hiện trong bối cảnh tính toán hoặc phân tích định lượng.
${subjectSpecificInstructions}

**MA TRẬN VÀ BẢN ĐẶC TẢ:**
${formattedMatrix}
`;

  try {
    const response = await generateContentWithFallback({
        model: modelName,
        contents: prompt
    });
    
    const examText = response.text;
    
    // Add a check for an empty response to make the function more robust.
    if (!examText) {
        console.warn("Gemini API returned an empty or invalid response.");
        return "AI đã không thể tạo đề thi. Nội dung trả về trống.";
    }
    
    return examText;

  } catch (error: any) {
    console.error("Lỗi khi gọi Gemini API:", error);
    throw new Error(`[Lỗi Hệ Thống] Không thể tạo đề thi. Trace: ${error?.message || error}`);
  }
}
