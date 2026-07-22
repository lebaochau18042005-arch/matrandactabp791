import { generateGeoAIContent, GeoAIInput, GeoAIOutput } from '../lib/mockGeoAI';

/**
 * Service to handle AI content generation.
 * Currently uses mockGeoAI for the MVP, but can be swapped with real API calls (OpenAI/Gemini) in the future.
 */
import { generateContentWithFallback } from '../utils/geminiUtils';

const SYSTEM_PROMPT = `Bạn là chuyên gia công nghệ giáo dục, giáo viên Địa lí giàu kinh nghiệm và chuyên gia thiết kế học liệu số.

Bạn am hiểu:
- Chương trình GDPT 2018 môn Địa lí.
- Cấu trúc kế hoạch bài dạy theo Công văn 5512.
- Dạy học phát triển phẩm chất và năng lực.
- Năng lực đặc thù môn Địa lí: nhận thức khoa học địa lí, tìm hiểu địa lí, vận dụng kiến thức và kĩ năng đã học.
- Tích hợp năng lực số, bản đồ số, GIS, Google Earth, dữ liệu địa lí, biểu đồ và AI.
- Kiểm tra đánh giá thường xuyên, rubric, bảng kiểm, phiếu học tập.
- Thiết kế hoạt động học khả thi trong lớp học phổ thông Việt Nam.

NGUYÊN TẮC BẮT BUỘC:
1. Bám đúng yêu cầu cần đạt do người dùng cung cấp.
2. Không tự bịa số liệu, đường dẫn, văn bản pháp lí hoặc mã năng lực.
3. Không dùng công nghệ chỉ để trình chiếu; công nghệ phải tạo ra hoạt động học hoặc minh chứng đánh giá.
4. Mỗi hoạt động phải có: mục tiêu, nội dung, sản phẩm, tổ chức thực hiện và đánh giá.
5. Tổ chức thực hiện theo 4 bước:
   - Chuyển giao nhiệm vụ.
   - Học sinh thực hiện nhiệm vụ.
   - Báo cáo, thảo luận.
   - Kết luận, nhận định.
6. Nếu sử dụng AI, phải có:
   - Câu lệnh mẫu.
   - Bước kiểm chứng bằng SGK, Atlat, bản đồ hoặc bản đồ số.
   - Yêu cầu chỉnh sửa sản phẩm.
   - Quy tắc bảo vệ dữ liệu cá nhân.
7. Nội dung phải phù hợp với lứa tuổi, thời lượng và điều kiện thiết bị.
8. Luôn có phương án thay thế khi mất Internet hoặc thiếu thiết bị.
9. Ngôn ngữ rõ ràng, đúng thuật ngữ Địa lí, có thể dùng trực tiếp trong lớp.
10. Chỉ trả về JSON hợp lệ theo đúng cấu trúc được yêu cầu. Không thêm lời dẫn ngoài JSON.`;

export const aiService = {
  generateAIContent: async (input: GeoAIInput): Promise<GeoAIOutput> => {
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const selectedModel = localStorage.getItem('gemini_model') || 'gemini-3.5-flash';
      if (apiKey) {
        let jsonFormatInstruction = `
Trả về đúng định dạng JSON sau (không thêm bất kỳ văn bản nào bên ngoài JSON):
{
  "title": "Tiêu đề của nội dung",
  "content": "Nội dung chi tiết (hỗ trợ Markdown)",
  "suggestions": ["Gợi ý 1", "Gợi ý 2"]
}`;

        if (input.contentType === "lesson_objectives") {
          jsonFormatInstruction = `
Hãy tạo mục tiêu bài học theo các nhóm:
1. Kiến thức.
2. Năng lực chung.
3. Năng lực đặc thù môn Địa lí.
4. Năng lực số.
5. Năng lực sử dụng AI.
6. Phẩm chất.

Mỗi mục tiêu phải:
- Dùng động từ có thể quan sát và đánh giá được.
- Gắn với sản phẩm học tập.
- Gắn với cách đánh giá.
- Không viết chung chung.
- Không tự tạo mã năng lực số nếu chưa chắc chắn.

Chỉ trả về JSON theo cấu trúc (KHÔNG trả về bất kỳ text nào khác):
{
  "knowledge": [
    { "objective": "", "evidence": "", "assessment": "" }
  ],
  "generalCompetencies": [
    { "name": "", "expression": "", "evidence": "" }
  ],
  "geographyCompetencies": [
    { "name": "", "expression": "", "evidence": "" }
  ],
  "digitalCompetencies": [
    { "domain": "", "expression": "", "tool": "", "evidence": "", "indicatorCode": "Giáo viên đối chiếu" }
  ],
  "aiCompetencies": [
    { "expression": "", "verificationMethod": "", "safetyNote": "" }
  ],
  "qualities": [
    { "name": "", "expression": "" }
  ]
}`;
        } else if (input.contentType === "warmup_activity") {
          jsonFormatInstruction = `
Dựa trên thông tin bài học và mục tiêu, hãy thiết kế HOẠT ĐỘNG KHỞI ĐỘNG cho bài học.
YÊU CẦU:
1. Thời lượng từ 3 đến 5 phút.
2. Hoạt động phải tạo hứng thú và dẫn trực tiếp vào nội dung bài học.
3. Ưu tiên sử dụng: hình ảnh, video ngắn, mô phỏng 3D, bản đồ, ảnh vệ tinh, câu hỏi dự đoán, tình huống thực tiễn địa lí.
4. Không biến hoạt động khởi động thành phần giảng kiến thức mới.
5. Câu hỏi phải gợi mở vấn đề và có dự kiến trả lời.
6. Có phương án thay thế khi mất Internet hoặc không có thiết bị.
7. Nếu có liên kết mô phỏng 3D, hãy khai thác làm tình huống mở đầu.

Chỉ trả về JSON hợp lệ theo cấu trúc sau (không thêm lời giải thích ngoài JSON):
{
  "title": "",
  "duration": "3-5 phút",
  "objective": "",
  "openingSituation": "",
  "learningMaterial": "",
  "teacherActions": [ "" ],
  "studentActions": [ "" ],
  "warmupQuestions": [ { "question": "", "expectedAnswer": "" } ],
  "learningProduct": "",
  "assessmentMethod": "",
  "transitionToLesson": "",
  "digitalTool": "",
  "offlineAlternative": ""
}`;
        } else if (input.contentType === "knowledge_activity") {
          jsonFormatInstruction = `
Dựa trên thông tin bài học, yêu cầu cần đạt và mục tiêu bài học đã được tạo, hãy thiết kế HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI cho môn Địa lí.
YÊU CẦU CHUNG:
1. Hoạt động bám sát yêu cầu cần đạt.
2. Phát triển năng lực đặc thù: Nhận thức khoa học địa lí, Tìm hiểu địa lí, Vận dụng.
3. Ưu tiên học sinh tự khai thác SGK, Atlat, bản đồ, biểu đồ, hình ảnh, mô phỏng 3D, bản đồ số.
4. Không thiết kế theo kiểu GV giảng giải toàn bộ.
5. Câu hỏi sắp xếp từ nhận biết, thông hiểu đến vận dụng.
6. Mỗi nhiệm vụ có sản phẩm học tập cụ thể.
7. Có phân hóa: Gợi ý cho HS cần hỗ trợ, Nhiệm vụ chuẩn, Câu hỏi nâng cao.
8. Nếu dùng công cụ số/AI: Nêu rõ thao tác, sản phẩm, cách kiểm chứng, và phương án dự phòng.
9. Có tiêu chí đánh giá, nội dung chuẩn hóa và nội dung ghi bài.
10. Tổ chức theo 4 bước: Chuyển giao nhiệm vụ, Thực hiện, Báo cáo & Thảo luận, Kết luận.

Chỉ trả về JSON hợp lệ theo cấu trúc sau (không thêm lời dẫn):
{
  "title": "",
  "activityType": "Hình thành kiến thức mới",
  "duration": "",
  "objective": "",
  "contentFocus": "",
  "learningMaterials": [ "" ],
  "organizationForm": "",
  "learningProduct": "",
  "tasks": [
    {
      "taskNumber": 1,
      "taskName": "",
      "duration": "",
      "objective": "",
      "learningContent": "",
      "questions": [ { "level": "Nhận biết/Thông hiểu/Vận dụng", "question": "", "expectedAnswer": "" } ],
      "steps": {
        "taskAssignment": { "teacherActions": [ "" ], "studentActions": [ "" ], "instructions": [ "" ], "time": "" },
        "taskPerformance": { "studentActions": [ "" ], "teacherSupport": [ "" ], "differentiation": { "supportForStrugglingStudents": [ "" ], "standardTask": [ "" ], "extensionForAdvancedStudents": [ "" ] } },
        "reportAndDiscussion": { "reportFormat": "", "studentPresentation": [ "" ], "peerFeedback": [ "" ], "discussionQuestions": [ "" ] },
        "conclusion": { "teacherComments": [ "" ], "standardizedKnowledge": [ "" ], "boardNotes": [ "" ] }
      },
      "digitalIntegration": { "tool": "", "studentTask": "", "digitalProduct": "", "verificationMethod": "", "safetyNote": "", "offlineAlternative": "" },
      "assessment": { "method": "", "instrument": "", "criteria": [ "" ] }
    }
  ],
  "overallAssessment": { "method": "", "evidence": [ "" ], "completionCriteria": [ "" ] },
  "transitionToNextActivity": ""
}`;
        } else if (input.contentType === "worksheet") {
          jsonFormatInstruction = `
Dựa trên thông tin bài học, mục tiêu bài học và hoạt động hình thành kiến thức mới đã được tạo, hãy thiết kế PHIẾU HỌC TẬP MÔN ĐỊA LÍ.
YÊU CẦU CHUNG:
1. Bám sát yêu cầu cần đạt, mục tiêu, nội dung hoạt động và thời lượng.
2. Giúp học sinh tự khai thác SGK, Atlat, bản đồ, bảng số liệu, biểu đồ, hình ảnh, mô phỏng 3D.
3. Không yêu cầu chép lại SGK. Câu hỏi xếp từ Nhận biết -> Thông hiểu -> Vận dụng.
4. Mỗi câu hỏi nêu rõ: Yêu cầu, Học liệu, Sản phẩm, Đáp án/Gợi ý, Điểm/Tiêu chí.
5. Phù hợp hình thức Cá nhân/Cặp đôi/Nhóm. Có phân hóa (Hỗ trợ, Chuẩn, Mở rộng).
6. Nếu dùng AI: AI chỉ gợi ý, HS phải đối chiếu nguồn chính thống.
7. Có phương án số, phương án giấy, dự phòng mất Internet.
8. Đúng thuật ngữ Địa lí.

Chỉ trả về JSON hợp lệ theo cấu trúc sau (không thêm lời dẫn ngoài JSON):
{
  "title": "",
  "worksheetCode": "PHT số 1",
  "lessonTitle": "",
  "grade": "",
  "activityName": "",
  "organizationForm": "Cá nhân/Cặp đôi/Nhóm",
  "duration": "",
  "objective": "",
  "learningMaterials": [ "" ],
  "studentInstructions": [ "" ],
  "groupRoles": [ { "role": "", "responsibility": "" } ],
  "tasks": [
    {
      "taskNumber": 1,
      "taskTitle": "",
      "level": "Nhận biết/Thông hiểu/Vận dụng/Vận dụng cao",
      "question": "",
      "dataOrMaterial": "",
      "studentResponseFormat": "",
      "expectedProduct": "",
      "supportHint": "",
      "extensionQuestion": "",
      "answerKey": "",
      "score": 0,
      "assessmentCriteria": [ "" ]
    }
  ],
  "summaryTask": { "instruction": "", "expectedProduct": "", "answerKey": "" },
  "selfAssessment": [ { "criterion": "", "completed": false } ],
  "peerAssessment": [ { "criterion": "", "ratingScale": "Tốt/Đạt/Cần bổ sung" } ],
  "teacherAssessment": { "method": "", "criteria": [ "" ], "maximumScore": 10 },
  "digitalVersion": { "suggestedTool": "", "studentActions": "", "submissionMethod": "", "dataSafetyNote": "" },
  "aiIntegration": { "useAI": false, "studentPrompt": "", "verificationSteps": [ "" ], "disclosureRequirement": "" },
  "offlineAlternative": "",
  "answerSection": { "detailedAnswers": [ { "taskNumber": 1, "answer": "", "explanation": "" } ] }
}`;
        } else if (input.contentType === "discussion_questions") {
          jsonFormatInstruction = `
Dựa trên thông tin bài học, mục tiêu, hoạt động kiến thức và phiếu học tập đã tạo, hãy xây dựng HỆ THỐNG CÂU HỎI THẢO LUẬN VÀ PHẢN BIỆN môn Địa lí.
YÊU CẦU CHUNG:
1. Bám sát mục tiêu, nội dung trọng tâm.
2. Nhiều mức độ: Nhận biết, Thông hiểu, Vận dụng, Phản biện, Liên hệ thực tiễn, Kiểm chứng AI.
3. Ưu tiên HS phân tích Atlat, bản đồ, số liệu, giải thích hệ quả, so sánh, bảo vệ quan điểm.
4. Mỗi câu hỏi nêu rõ mục tiêu, mức độ, học liệu, gợi ý, ý chính, tiêu chí đánh giá.
5. Yêu cầu ít nhất: 2 câu phân tích, 2 giải thích, 1 so sánh, 1 phản biện, 1 liên hệ, 1 kiểm chứng AI.
6. Có phân hóa: Hỗ trợ, Chuẩn, Mở rộng.
7. Có nhiệm vụ cho HS kiểm chứng thông tin AI tạo ra bằng tài liệu chính thống.
8. Có hướng dẫn phân vai (Trưởng, Thư kí, Phản biện...).

Chỉ trả về JSON hợp lệ theo cấu trúc sau (không thêm văn bản ngoài):
{
  "title": "",
  "lessonTitle": "",
  "grade": "",
  "discussionDuration": "",
  "discussionObjective": "",
  "organizationForm": "Cặp đôi/Nhóm/Lớp",
  "groupingSuggestion": "",
  "groupRoles": [ { "role": "", "responsibility": "" } ],
  "discussionRules": [ "" ],
  "questions": [
    {
      "questionNumber": 1,
      "questionType": "Phân tích/Giải thích/So sánh/Phản biện/Liên hệ/Kiểm chứng",
      "cognitiveLevel": "Nhận biết/Thông hiểu/Vận dụng/Vận dụng cao",
      "question": "",
      "learningMaterial": "",
      "supportingQuestions": [ "" ],
      "expectedIdeas": [ "" ],
      "evidenceRequired": [ "" ],
      "assessmentCriteria": [ "" ],
      "supportForStrugglingStudents": "",
      "extensionForAdvancedStudents": ""
    }
  ],
  "aiVerificationTask": {
    "aiGeneratedStatement": "",
    "verificationQuestion": "",
    "verificationSources": [ "" ],
    "verificationSteps": [ "" ],
    "expectedConclusion": "",
    "safetyNote": ""
  },
  "reportingPlan": {
    "presentationTimePerGroup": "",
    "reportFormat": "",
    "peerFeedbackMethod": "",
    "teacherQuestions": [ "" ]
  },
  "assessment": {
    "method": "",
    "instrument": "Bảng kiểm/Rubric/Quan sát",
    "criteria": [ "" ]
  },
  "offlineAlternative": ""
}`;
        } else if (input.contentType === "practice_activity") {
          jsonFormatInstruction = `
Dựa trên thông tin bài học, mục tiêu, hoạt động kiến thức, phiếu học tập và hệ thống câu hỏi thảo luận đã được tạo, hãy thiết kế HOẠT ĐỘNG LUYỆN TẬP môn Địa lí.
YÊU CẦU CHUNG:
1. Bám sát yêu cầu cần đạt, trọng tâm kiến thức và sản phẩm đã hình thành.
2. Thời lượng 5-10 phút. Khoảng 5-8 câu hỏi/nhiệm vụ.
3. Kết hợp nhiều dạng: Trắc nghiệm, Đúng/Sai, Ghép nối, Điền khuyết, Đọc Atlat, Biểu đồ...
4. Mức độ: Nhận biết, Thông hiểu, Vận dụng (Tối thiểu 2 nhận biết, 2 thông hiểu, 1 vận dụng, 1 khai thác bản đồ/số liệu).
5. Nếu dùng công cụ số (Quizizz, Kahoot, Azota...): Nêu rõ cách HS tham gia, cách GV xem kết quả.
6. Có phương án offline (Thẻ A-B-C-D, bảng con...).
7. Có hướng dẫn xử lý kết quả (Tốt, Đạt, Chưa đạt).

Chỉ trả về JSON hợp lệ theo cấu trúc sau (không thêm văn bản ngoài):
{
  "title": "",
  "lessonTitle": "",
  "grade": "",
  "activityType": "Luyện tập",
  "duration": "",
  "objective": "",
  "organizationForm": "Cá nhân/Cặp đôi/Nhóm/Toàn lớp",
  "exerciseFormat": "",
  "instructions": [ "" ],
  "questions": [
    {
      "questionNumber": 1,
      "questionType": "Trắc nghiệm/Đúng-Sai/Ghép nối/Điền khuyết/Bản đồ/Số liệu/Biểu đồ/Tình huống",
      "cognitiveLevel": "Nhận biết/Thông hiểu/Vận dụng/Vận dụng cao",
      "question": "",
      "learningMaterial": "",
      "options": [
        { "label": "A", "content": "" },
        { "label": "B", "content": "" },
        { "label": "C", "content": "" },
        { "label": "D", "content": "" }
      ],
      "correctAnswer": "",
      "explanation": "",
      "score": 1
    }
  ],
  "mapOrDataTask": {
    "useTask": true,
    "taskType": "Bản đồ/Atlat/Bảng số liệu/Biểu đồ",
    "instruction": "",
    "dataDescription": "",
    "expectedAnswer": "",
    "assessmentCriteria": [ "" ]
  },
  "digitalImplementation": {
    "suggestedTool": "",
    "participationMethod": "",
    "teacherMonitoringMethod": "",
    "resultDisplayMethod": "",
    "accountRequired": false
  },
  "offlineAlternative": {
    "method": "",
    "materials": [ "" ],
    "organization": ""
  },
  "scoringGuide": {
    "maximumScore": 10,
    "excellentLevel": "",
    "achievedLevel": "",
    "notAchievedLevel": ""
  },
  "resultAnalysis": {
    "excellentStudents": "",
    "achievedStudents": "",
    "studentsNeedingSupport": "",
    "immediateSupportActions": [ "" ]
  },
  "transitionToApplication": ""
}`;
        } else if (input.contentType === "export_word") {
          jsonFormatInstruction = `
Dựa trên toàn bộ nội dung kế hoạch bài dạy đã được tạo, hãy chuẩn hóa và sắp xếp lại thành một KẾ HOẠCH BÀI DẠY MÔN ĐỊA LÍ hoàn chỉnh.
MỤC ĐÍCH: Bảo đảm cấu trúc CV 5512, tích hợp năng lực số/AI, không làm mất nội dung đã sửa.

Chỉ trả về JSON hợp lệ theo cấu trúc sau (không thêm lời dẫn):
{
  "documentInfo": { "schoolName": "", "departmentName": "", "teacherName": "", "lessonTitle": "", "subject": "Địa lí", "grade": "", "textbook": "", "numberOfPeriods": 1, "implementationDate": "", "academicYear": "" },
  "formatting": { "paperSize": "A4", "orientation": "portrait", "fontFamily": "Times New Roman", "bodyFontSize": 13, "mainTitleFontSize": 16, "heading1FontSize": 14, "heading2FontSize": 13, "lineSpacing": 1.15, "paragraphAfterPt": 6, "marginTopCm": 2, "marginBottomCm": 2, "marginLeftCm": 2.5, "marginRightCm": 2, "bodyAlignment": "justify", "titleAlignment": "center", "pageNumberPosition": "footer-center" },
  "objectives": { "knowledge": [], "generalCompetencies": [], "geographyCompetencies": [], "digitalCompetencies": [], "aiCompetencies": [], "qualities": [] },
  "equipmentAndMaterials": { "teacher": [], "students": [], "digitalTools": [], "offlineAlternative": [] },
  "periods": [
    {
      "periodNumber": 1,
      "periodTitle": "",
      "durationMinutes": 45,
      "activities": [
        {
          "activityType": "Mở đầu/Hình thành kiến thức/Luyện tập/Vận dụng",
          "activityName": "",
          "duration": "",
          "objective": "",
          "content": "",
          "product": "",
          "steps": {
            "taskAssignment": { "teacherActions": [], "studentActions": [] },
            "taskPerformance": { "teacherActions": [], "studentActions": [] },
            "reportAndDiscussion": { "teacherActions": [], "studentActions": [] },
            "conclusion": { "teacherActions": [], "studentActions": [], "standardizedKnowledge": [] }
          },
          "digitalIntegration": { "tool": "", "studentTask": "", "digitalProduct": "", "offlineAlternative": "" },
          "assessment": { "method": "", "instrument": "", "criteria": [] },
          "differentiation": { "support": [], "standard": [], "advanced": [] }
        }
      ]
    }
  ],
  "assessmentPlan": [],
  "appendices": {
    "worksheets": [],
    "worksheetAnswers": [],
    "practiceQuestions": [],
    "practiceAnswers": [],
    "checklists": [],
    "rubrics": [],
    "selfAssessmentForms": [],
    "peerAssessmentForms": [],
    "studentAiPrompts": [],
    "aiSafetyRules": [],
    "digitalCompetencyMatrix": [],
    "aiIntegrationMatrix": []
  },
  "postLessonAdjustment": { "strengths": "", "limitations": "", "adjustments": "" },
  "validationWarnings": []
}`;
          
          if (input.blocks) {
            const getBlockContent = (type: string) => input.blocks?.filter(b => b.type === type).map(b => b.content).join("\n");
            
            userPromptTemplate = `
THÔNG TIN CHUNG:
- Lớp: ${input.grade}
- Bài học: ${input.lessonTitle}

MỤC TIÊU:
${getBlockContent("objective") || "Chưa có"}

HOẠT ĐỘNG KHỞI ĐỘNG:
${getBlockContent("warmup_activity") || "Chưa có"}

HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC:
${getBlockContent("knowledge_activity") || "Chưa có"}

PHIẾU HỌC TẬP:
${getBlockContent("worksheet") || "Chưa có"}

CÂU HỎI THẢO LUẬN:
${getBlockContent("discussion_questions") || "Chưa có"}

HOẠT ĐỘNG LUYỆN TẬP:
${getBlockContent("practice_activity") || "Chưa có"}

HOẠT ĐỘNG VẬN DỤNG:
${getBlockContent("application_activity") || "Chưa có"}

CÔNG CỤ ĐÁNH GIÁ:
${getBlockContent("rubric") || "Chưa có"}

YÊU CẦU:
Hãy chuẩn hóa toàn bộ dữ liệu trên theo prompt xuất giáo án Word và chỉ trả về JSON hợp lệ.
`;
          }
        } else if (input.contentType === "application_activity") {
          jsonFormatInstruction = `
Dựa trên thông tin bài học và các hoạt động trước đó, thiết kế HOẠT ĐỘNG VẬN DỤNG môn Địa lí.
YÊU CẦU CHUNG:
1. Gắn kiến thức vào thực tiễn địa phương, Việt Nam hoặc thế giới. Giải quyết vấn đề địa lí đời sống.
2. Không lặp lại bài luyện tập. Yêu cầu HS áp dụng tình huống mới, đề xuất giải pháp, tạo sản phẩm (Infographic, video, báo cáo...).
3. Nêu rõ bối cảnh, câu hỏi định hướng, nhiệm vụ, sản phẩm và thời hạn.
4. Có phân hóa, có sử dụng công cụ số (tùy chọn) và bắt buộc có phương án dự phòng offline.
5. Nếu dùng AI: AI chỉ gợi ý, HS phải đối chiếu nguồn, cấm sao chép, chú ý an toàn dữ liệu cá nhân.
6. Cung cấp Rubric đánh giá chi tiết 4 mức (Xuất sắc, Tốt, Đạt, Chưa đạt).

Chỉ trả về JSON hợp lệ theo cấu trúc sau (không thêm văn bản ngoài):
{
  "title": "",
  "lessonTitle": "",
  "grade": "",
  "activityType": "Vận dụng",
  "duration": "",
  "implementationTime": "Trên lớp/Ở nhà/Kết hợp",
  "objective": "",
  "realWorldContext": "",
  "drivingQuestion": "",
  "taskDescription": "",
  "organizationForm": "Cá nhân/Cặp đôi/Nhóm",
  "studentInstructions": [ "" ],
  "product": {
    "productType": "",
    "productTitle": "",
    "requiredContent": [ "" ],
    "lengthOrDuration": "",
    "fileFormat": "",
    "submissionMethod": "",
    "deadline": ""
  },
  "learningResources": [
    { "resourceType": "", "description": "", "sourceRequirement": "" }
  ],
  "digitalIntegration": {
    "useDigitalTool": true,
    "suggestedTools": [ "" ],
    "studentDigitalTask": "",
    "digitalProduct": "",
    "submissionPlatform": "",
    "dataSafetyNote": "",
    "offlineAlternative": ""
  },
  "aiIntegration": {
    "useAI": false,
    "allowedUses": [ "" ],
    "studentPrompt": "",
    "verificationSources": [ "" ],
    "verificationSteps": [ "" ],
    "aiDisclosureRequirement": "",
    "aiSafetyRules": [ "" ]
  },
  "differentiation": {
    "supportForStrugglingStudents": [ "" ],
    "standardTask": [ "" ],
    "extensionForAdvancedStudents": [ "" ]
  },
  "teacherSupport": [ "" ],
  "reportingAndSharing": {
    "presentationFormat": "",
    "presentationDuration": "",
    "peerFeedbackMethod": "",
    "teacherFeedbackMethod": ""
  },
  "assessment": {
    "method": "Đánh giá sản phẩm/Quan sát/Thuyết trình/Tự đánh giá/Đồng đẳng",
    "maximumScore": 10,
    "rubric": [
      {
        "criterion": "",
        "weight": "",
        "excellent": "",
        "good": "",
        "satisfactory": "",
        "needsImprovement": ""
      }
    ]
  },
  "expectedLearningOutcome": "",
  "postActivityReflection": [ "" ]
}`;
        }

        let userPrompt = `
THÔNG TIN BÀI HỌC:
- Lớp: ${input.grade}
- Tên bài học: ${input.lessonTitle}
- Chủ đề: ${input.topic}
- Bộ sách: ${input.textbook || 'Chưa xác định'}
- Số tiết: ${input.numberOfPeriods || '1'}
- Thời lượng: ${input.durationMinutes || '45'} phút
- Đặc điểm lớp học: ${input.classProfile || 'Chưa có thông tin'}
- Thiết bị sẵn có: ${input.availableDevices || 'Máy chiếu, bảng đen'}
- Liên kết mô phỏng 3D: ${input.simulationLink || input.simulationId || 'Không có'}
- Bối cảnh địa phương: ${input.localContext || 'Chưa có thông tin'}
- Công cụ số dự kiến: ${input.digitalTools || 'Chưa xác định'}

MỤC TIÊU BÀI HỌC:
- Mục tiêu hiện tại: ${input.currentObjective || input.objectives || 'Chưa có'}
- Yêu cầu cần đạt: ${input.learningOutcomes || 'Chưa có'}

${input.previousContext ? `CÁC HOẠT ĐỘNG ĐĐÃ TẠO TRƯỚC ĐÓ:\n${input.previousContext}\n` : ''}
Yêu cầu tạo nội dung: ${input.contentType} (Ví dụ: lesson_objectives, worksheet, simulation_script, group_tasks, v.v...)
`;

        if (input.contentType === "export_word" && input.blocks) {
          const getBlockContent = (type: string) => input.blocks?.filter(b => b.type === type).map(b => b.content).join("\n") || "Chưa có";
          userPrompt = `
THÔNG TIN CHUNG:
- Lớp: ${input.grade}
- Bài học: ${input.lessonTitle}

MỤC TIÊU:
${getBlockContent("objective")}

HOẠT ĐỘNG KHỞI ĐỘNG:
${getBlockContent("warmup_activity")}

HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC:
${getBlockContent("knowledge_activity")}

PHIẾU HỌC TẬP:
${getBlockContent("worksheet")}

CÂU HỎI THẢO LUẬN:
${getBlockContent("discussion_questions")}

HOẠT ĐỘNG LUYỆN TẬP:
${getBlockContent("practice_activity")}

HOẠT ĐỘNG VẬN DỤNG:
${getBlockContent("application_activity")}

CÔNG CỤ ĐÁNH GIÁ:
${getBlockContent("rubric")}

YÊU CẦU:
Hãy chuẩn hóa toàn bộ dữ liệu trên theo prompt xuất giáo án Word và chỉ trả về JSON hợp lệ.
`;
        }

        userPrompt += `
Vui lòng sinh nội dung chuyên sâu, phù hợp chương trình GDPT 2018 và tuân thủ các NGUYÊN TẮC BẮT BUỘC.
${jsonFormatInstruction}
`;

        const response = await generateContentWithFallback(apiKey, selectedModel, {
          contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }] }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });

        const text = response.text || "{}";
        interface GeoAIOutput {
          title: string;
          content: string;
          suggestions: string[];
          createdAt?: string;
          resultContent?: string;
          rawData?: any;
        }
        let parsed: GeoAIOutput = { title: "Lỗi tạo nội dung", content: text, suggestions: [] };
        let rawJsonObj: any = null;
        
        try {
          parsed = JSON.parse(text);
          rawJsonObj = JSON.parse(text); // Keep a copy of the original raw JSON for specific handlers
        } catch (e) {
          const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]);
          }
        }

        // Nếu là export_word
        if (input.contentType === "export_word") {
          return {
            title: `Giáo án Word: ${input.lessonTitle}`,
            content: "Đã tổng hợp thành công giáo án chuẩn CV5512.",
            suggestions: [],
            createdAt: new Date().toISOString(),
            resultContent: "Đã tổng hợp thành công giáo án chuẩn CV5512.",
            rawData: rawJsonObj
          };
        }
        // Nếu là lesson_objectives với cấu trúc JSON phức tạp, parse thành Markdown
        if (input.contentType === "lesson_objectives" && parsed.knowledge) {
          let md = `### 1. Yêu cầu về Kiến thức\n`;
          (parsed.knowledge || []).forEach((k: any) => {
            md += `- **Mục tiêu:** ${k.objective}\n  - *Minh chứng:* ${k.evidence}\n  - *Đánh giá:* ${k.assessment}\n\n`;
          });
          
          md += `### 2. Năng lực đặc thù môn Địa lí\n`;
          (parsed.geographyCompetencies || []).forEach((c: any) => {
            md += `- **${c.name}**: ${c.expression}\n  - *Minh chứng:* ${c.evidence}\n\n`;
          });
          
          md += `### 3. Năng lực chung\n`;
          (parsed.generalCompetencies || []).forEach((c: any) => {
            md += `- **${c.name}**: ${c.expression}\n  - *Minh chứng:* ${c.evidence}\n\n`;
          });
          
          md += `### 4. Năng lực số\n`;
          (parsed.digitalCompetencies || []).forEach((c: any) => {
            md += `- **${c.domain}**: ${c.expression}\n  - *Công cụ:* ${c.tool}\n  - *Minh chứng:* ${c.evidence} (${c.indicatorCode})\n\n`;
          });
          
          if (parsed.aiCompetencies && parsed.aiCompetencies.length > 0) {
            md += `### 5. Năng lực sử dụng AI\n`;
            parsed.aiCompetencies.forEach((c: any) => {
              md += `- **Biểu hiện:** ${c.expression}\n  - *Kiểm chứng:* ${c.verificationMethod}\n  - *Lưu ý an toàn:* ${c.safetyNote}\n\n`;
            });
          }
          
          md += `### 6. Phẩm chất\n`;
          (parsed.qualities || []).forEach((q: any) => {
            md += `- **${q.name}**: ${q.expression}\n\n`;
          });

          parsed = {
            title: `Mục tiêu bài học: ${input.lessonTitle}`,
            content: md.trim(),
            suggestions: ["Tạo ma trận đánh giá từ mục tiêu này?", "Phân bổ thời gian cho từng mục tiêu?"]
          };
        } 
        // Nếu là warmup_activity với cấu trúc JSON phức tạp, parse thành Markdown
        else if (input.contentType === "warmup_activity" && parsed.openingSituation) {
          let md = `### 1. Mục tiêu và Thời lượng\n`;
          md += `- **Thời lượng:** ${parsed.duration}\n`;
          md += `- **Mục tiêu:** ${parsed.objective}\n\n`;

          md += `### 2. Tình huống mở đầu & Học liệu\n`;
          md += `- **Tình huống:** ${parsed.openingSituation}\n`;
          md += `- **Học liệu/Công cụ số:** ${parsed.learningMaterial} (Công cụ: ${parsed.digitalTool})\n\n`;

          md += `### 3. Tổ chức thực hiện\n`;
          md += `**Hoạt động của Giáo viên:**\n`;
          (parsed.teacherActions || []).forEach((a: string) => md += `- ${a}\n`);
          md += `\n**Hoạt động của Học sinh:**\n`;
          (parsed.studentActions || []).forEach((a: string) => md += `- ${a}\n`);
          md += `\n`;

          md += `### 4. Câu hỏi gợi mở\n`;
          (parsed.warmupQuestions || []).forEach((q: any) => {
            md += `- **CH:** ${q.question}\n  - *Dự kiến trả lời:* ${q.expectedAnswer}\n`;
          });
          md += `\n`;

          md += `### 5. Đánh giá & Dẫn nhập\n`;
          md += `- **Sản phẩm:** ${parsed.learningProduct}\n`;
          md += `- **Cách đánh giá:** ${parsed.assessmentMethod}\n`;
          md += `- **Dẫn vào bài mới:** ${parsed.transitionToLesson}\n\n`;

          md += `### 6. Phương án dự phòng (Mất kết nối)\n`;
          md += `- ${parsed.offlineAlternative}\n`;

          parsed = {
            title: parsed.title || `Hoạt động khởi động: ${input.lessonTitle}`,
            content: md.trim(),
            suggestions: ["Biến hoạt động này thành game trên Quizizz?", "Rút ngắn thời gian khởi động?"]
          };
        }
        // Nếu là knowledge_activity
        else if (input.contentType === "knowledge_activity" && parsed.tasks) {
          let md = `### THÔNG TIN CHUNG\n`;
          md += `- **Thời lượng:** ${parsed.duration}\n`;
          md += `- **Mục tiêu:** ${parsed.objective}\n`;
          md += `- **Trọng tâm kiến thức:** ${parsed.contentFocus}\n`;
          md += `- **Học liệu:** ${(parsed.learningMaterials || []).join(", ")}\n`;
          md += `- **Hình thức tổ chức:** ${parsed.organizationForm}\n`;
          md += `- **Sản phẩm học tập:** ${parsed.learningProduct}\n\n`;

          (parsed.tasks || []).forEach((task: any) => {
            md += `### NHIỆM VỤ ${task.taskNumber}: ${task.taskName} (${task.duration})\n`;
            md += `- **Mục tiêu:** ${task.objective}\n`;
            md += `- **Nội dung:** ${task.learningContent}\n\n`;
            
            if (task.questions && task.questions.length > 0) {
              md += `**Hệ thống câu hỏi:**\n`;
              task.questions.forEach((q: any) => {
                md += `- [${q.level}] ${q.question}\n  *Dự kiến trả lời:* ${q.expectedAnswer}\n`;
              });
              md += `\n`;
            }

            md += `**Các bước tổ chức:**\n`;
            if (task.steps) {
              md += `- **Bước 1 (Chuyển giao - ${task.steps.taskAssignment?.time || ""}):**\n`;
              (task.steps.taskAssignment?.teacherActions || []).forEach((a: string) => md += `  + ${a}\n`);
              (task.steps.taskAssignment?.instructions || []).forEach((a: string) => md += `  + *Lệnh:* ${a}\n`);
              
              md += `- **Bước 2 (Thực hiện):**\n`;
              (task.steps.taskPerformance?.studentActions || []).forEach((a: string) => md += `  + HS: ${a}\n`);
              (task.steps.taskPerformance?.teacherSupport || []).forEach((a: string) => md += `  + GV: ${a}\n`);
              if (task.steps.taskPerformance?.differentiation) {
                md += `  + *Phân hóa:* Hỗ trợ HS yếu (${(task.steps.taskPerformance.differentiation.supportForStrugglingStudents || []).join(", ")}). Nâng cao (${(task.steps.taskPerformance.differentiation.extensionForAdvancedStudents || []).join(", ")}).\n`;
              }

              md += `- **Bước 3 (Báo cáo & Thảo luận):**\n`;
              (task.steps.reportAndDiscussion?.studentPresentation || []).forEach((a: string) => md += `  + ${a}\n`);
              (task.steps.reportAndDiscussion?.peerFeedback || []).forEach((a: string) => md += `  + ${a}\n`);
              
              md += `- **Bước 4 (Kết luận):**\n`;
              (task.steps.conclusion?.teacherComments || []).forEach((a: string) => md += `  + ${a}\n`);
              md += `  + **Chốt kiến thức:** ${(task.steps.conclusion?.standardizedKnowledge || []).join(" ")}\n`;
              md += `  + **Ghi bảng:** ${(task.steps.conclusion?.boardNotes || []).join(" ")}\n\n`;
            }

            if (task.digitalIntegration && task.digitalIntegration.tool) {
              md += `**Tích hợp Công nghệ/AI:**\n`;
              md += `- Công cụ: ${task.digitalIntegration.tool}\n`;
              md += `- Thao tác: ${task.digitalIntegration.studentTask}\n`;
              md += `- Kiểm chứng: ${task.digitalIntegration.verificationMethod}\n`;
              md += `- Dự phòng (Offline): ${task.digitalIntegration.offlineAlternative}\n\n`;
            }
          });

          if (parsed.overallAssessment) {
            md += `### ĐÁNH GIÁ CHUNG\n`;
            md += `- **Phương pháp:** ${parsed.overallAssessment.method}\n`;
            md += `- **Minh chứng:** ${(parsed.overallAssessment.evidence || []).join(", ")}\n`;
            md += `- **Tiêu chí hoàn thành:** ${(parsed.overallAssessment.completionCriteria || []).join(", ")}\n`;
          }

          if (parsed.transitionToNextActivity) {
            md += `\n**Dẫn sang hoạt động tiếp theo:** ${parsed.transitionToNextActivity}\n`;
          }

          parsed = {
            title: parsed.title || `Hoạt động hình thành kiến thức: ${input.lessonTitle}`,
            content: md.trim(),
            suggestions: ["Tạo Phiếu học tập tương ứng cho hoạt động này?", "Tách thành 2 hoạt động nhỏ hơn?"]
          };
        }
        // Nếu là worksheet
        else if (input.contentType === "worksheet" && parsed.tasks) {
          let md = `### PHIẾU HỌC TẬP: ${parsed.title || parsed.worksheetCode}\n`;
          md += `- **Bài học:** ${parsed.lessonTitle} (Lớp ${parsed.grade})\n`;
          md += `- **Hoạt động:** ${parsed.activityName}\n`;
          md += `- **Mục tiêu:** ${parsed.objective}\n`;
          md += `- **Hình thức & Thời gian:** ${parsed.organizationForm} | ${parsed.duration}\n\n`;

          md += `### 1. HƯỚNG DẪN\n`;
          md += `- **Học liệu:** ${(parsed.learningMaterials || []).join(", ")}\n`;
          (parsed.studentInstructions || []).forEach((inst: string) => md += `- ${inst}\n`);
          if (parsed.groupRoles && parsed.groupRoles.length > 0) {
            md += `\n**Phân công nhóm:**\n`;
            parsed.groupRoles.forEach((r: any) => md += `- *${r.role}*: ${r.responsibility}\n`);
          }
          md += `\n`;

          md += `### 2. NHIỆM VỤ HỌC TẬP\n`;
          (parsed.tasks || []).forEach((task: any) => {
            md += `#### CÂU ${task.taskNumber}: ${task.taskTitle} [${task.level}]\n`;
            md += `**Nhiệm vụ:** ${task.question}\n`;
            md += `- *Dữ liệu/Học liệu:* ${task.dataOrMaterial}\n`;
            md += `- *Hình thức trả lời:* ${task.studentResponseFormat}\n`;
            if (task.supportHint) md += `- 💡 *Gợi ý hỗ trợ:* ${task.supportHint}\n`;
            if (task.extensionQuestion) md += `- 🚀 *Câu hỏi mở rộng:* ${task.extensionQuestion}\n`;
            md += `\n`;
          });

          if (parsed.summaryTask && parsed.summaryTask.instruction) {
            md += `#### CÂU HỎI TỔNG KẾT\n`;
            md += `${parsed.summaryTask.instruction}\n\n`;
          }

          md += `### 3. ĐÁNH GIÁ & DỰ PHÒNG\n`;
          if (parsed.teacherAssessment) {
            md += `- **Đánh giá của GV (${parsed.teacherAssessment.maximumScore}đ):** ${parsed.teacherAssessment.method}\n`;
            (parsed.teacherAssessment.criteria || []).forEach((c: string) => md += `  + ${c}\n`);
          }
          if (parsed.offlineAlternative) {
            md += `- **Dự phòng (Offline):** ${parsed.offlineAlternative}\n`;
          }

          md += `\n---\n`;
          md += `### HƯỚNG DẪN CHẤM (DÀNH CHO GIÁO VIÊN)\n`;
          (parsed.answerSection?.detailedAnswers || []).forEach((ans: any) => {
            md += `- **Câu ${ans.taskNumber}:** ${ans.answer}\n  *Giải thích:* ${ans.explanation}\n`;
          });
          if (parsed.summaryTask?.answerKey) {
            md += `- **Tổng kết:** ${parsed.summaryTask.answerKey}\n`;
          }

          parsed = {
            title: parsed.title || `Phiếu học tập: ${input.lessonTitle}`,
            content: md.trim(),
            suggestions: ["Tạo Rubric chấm điểm chi tiết?", "Chia nhỏ phiếu thành 2 phiếu cho 2 nhóm khác nhau?"]
          };
        }
        // Nếu là discussion_questions
        else if (input.contentType === "discussion_questions" && parsed.questions) {
          let md = `### HỆ THỐNG CÂU HỎI THẢO LUẬN & PHẢN BIỆN: ${parsed.title || input.lessonTitle}\n`;
          md += `- **Mục tiêu:** ${parsed.discussionObjective}\n`;
          md += `- **Hình thức & Thời gian:** ${parsed.organizationForm} | ${parsed.discussionDuration}\n\n`;

          md += `### 1. TỔ CHỨC VÀ KỶ LUẬT\n`;
          md += `- **Gợi ý chia nhóm:** ${parsed.groupingSuggestion}\n`;
          if (parsed.groupRoles && parsed.groupRoles.length > 0) {
            md += `- **Phân vai:**\n`;
            parsed.groupRoles.forEach((r: any) => md += `  + *${r.role}:* ${r.responsibility}\n`);
          }
          if (parsed.discussionRules && parsed.discussionRules.length > 0) {
            md += `- **Kỷ luật thảo luận:** ${(parsed.discussionRules || []).join(", ")}\n`;
          }
          md += `\n`;

          md += `### 2. HỆ THỐNG CÂU HỎI THẢO LUẬN\n`;
          (parsed.questions || []).forEach((q: any) => {
            md += `#### CÂU ${q.questionNumber} [${q.questionType} - ${q.cognitiveLevel}]\n`;
            md += `**Nội dung:** ${q.question}\n`;
            md += `- *Học liệu:* ${q.learningMaterial}\n`;
            if (q.supportingQuestions && q.supportingQuestions.length > 0) {
              md += `- *Gợi ý triển khai:* ${(q.supportingQuestions || []).join(" -> ")}\n`;
            }
            md += `- *Ý chính dự kiến:* ${(q.expectedIdeas || []).join("; ")}\n`;
            md += `- *Minh chứng bắt buộc:* ${(q.evidenceRequired || []).join(", ")}\n`;
            if (q.supportForStrugglingStudents) md += `- 💡 *Hỗ trợ:* ${q.supportForStrugglingStudents}\n`;
            if (q.extensionForAdvancedStudents) md += `- 🚀 *Nâng cao:* ${q.extensionForAdvancedStudents}\n`;
            md += `\n`;
          });

          if (parsed.aiVerificationTask && parsed.aiVerificationTask.aiGeneratedStatement) {
            md += `### 3. NHIỆM VỤ KIỂM CHỨNG AI\n`;
            md += `> **Thông tin do AI tạo ra:** "${parsed.aiVerificationTask.aiGeneratedStatement}"\n\n`;
            md += `- **Câu hỏi kiểm chứng:** ${parsed.aiVerificationTask.verificationQuestion}\n`;
            md += `- **Nguồn đối chiếu:** ${(parsed.aiVerificationTask.verificationSources || []).join(", ")}\n`;
            md += `- **Các bước thực hiện:**\n`;
            (parsed.aiVerificationTask.verificationSteps || []).forEach((s: string, i: number) => md += `  ${i+1}. ${s}\n`);
            md += `- **Kết luận mong đợi:** ${parsed.aiVerificationTask.expectedConclusion}\n`;
            if (parsed.aiVerificationTask.safetyNote) {
              md += `- ⚠️ *Lưu ý an toàn:* ${parsed.aiVerificationTask.safetyNote}\n`;
            }
            md += `\n`;
          }

          md += `### 4. BÁO CÁO & ĐÁNH GIÁ\n`;
          if (parsed.reportingPlan) {
            md += `- **Thời gian báo cáo:** ${parsed.reportingPlan.presentationTimePerGroup}\n`;
            md += `- **Hình thức:** ${parsed.reportingPlan.reportFormat}\n`;
            md += `- **Phản biện chéo:** ${parsed.reportingPlan.peerFeedbackMethod}\n`;
            if (parsed.reportingPlan.teacherQuestions && parsed.reportingPlan.teacherQuestions.length > 0) {
              md += `- **Câu hỏi chất vấn của GV:** ${(parsed.reportingPlan.teacherQuestions || []).join("; ")}\n`;
            }
          }
          if (parsed.assessment) {
            md += `\n**Đánh giá (${parsed.assessment.method} - ${parsed.assessment.instrument}):**\n`;
            (parsed.assessment.criteria || []).forEach((c: string) => md += `- ${c}\n`);
          }
          
          if (parsed.offlineAlternative) {
            md += `\n### 5. PHƯƠNG ÁN DỰ PHÒNG\n- ${parsed.offlineAlternative}\n`;
          }

          parsed = {
            title: parsed.title || `Hệ thống câu hỏi thảo luận: ${input.lessonTitle}`,
            content: md.trim(),
            suggestions: ["Biến phần kiểm chứng AI thành một trò chơi thi đua?", "Thêm câu hỏi tranh biện (Debate)?"]
          };
        }
        // Nếu là practice_activity
        else if (input.contentType === "practice_activity" && parsed.questions) {
          let md = `### HOẠT ĐỘNG LUYỆN TẬP: ${parsed.title || input.lessonTitle}\n`;
          md += `- **Mục tiêu:** ${parsed.objective}\n`;
          md += `- **Hình thức & Thời gian:** ${parsed.organizationForm} | ${parsed.duration}\n`;
          md += `- **Cách thức triển khai:** ${parsed.exerciseFormat}\n\n`;

          md += `### 1. BỘ CÂU HỎI LUYỆN TẬP\n`;
          if (parsed.instructions && parsed.instructions.length > 0) {
            md += `> **Hướng dẫn:** ${(parsed.instructions || []).join(" ")}\n\n`;
          }
          (parsed.questions || []).forEach((q: any) => {
            md += `#### Câu ${q.questionNumber}: [${q.questionType} - ${q.cognitiveLevel}] (${q.score}đ)\n`;
            md += `**${q.question}**\n`;
            if (q.learningMaterial) md += `*(Dữ liệu: ${q.learningMaterial})*\n`;
            
            if (q.options && q.options.length > 0) {
              q.options.forEach((opt: any) => {
                const isCorrect = opt.label === q.correctAnswer;
                md += `- [${isCorrect ? 'x' : ' '}] **${opt.label}.** ${opt.content}\n`;
              });
            } else {
              md += `- **Đáp án:** ${q.correctAnswer}\n`;
            }
            md += `*Giải thích:* ${q.explanation}\n\n`;
          });

          if (parsed.mapOrDataTask && parsed.mapOrDataTask.useTask) {
            md += `### 2. BÀI TẬP BẢN ĐỒ / SỐ LIỆU\n`;
            md += `- **Loại bài tập:** ${parsed.mapOrDataTask.taskType}\n`;
            md += `- **Dữ liệu:** ${parsed.mapOrDataTask.dataDescription}\n`;
            md += `- **Yêu cầu:** ${parsed.mapOrDataTask.instruction}\n`;
            md += `- **Đáp án:** ${parsed.mapOrDataTask.expectedAnswer}\n`;
            md += `- **Tiêu chí:** ${(parsed.mapOrDataTask.assessmentCriteria || []).join(", ")}\n\n`;
          }

          md += `### 3. TỔ CHỨC THỰC HIỆN & ĐÁNH GIÁ\n`;
          if (parsed.digitalImplementation && parsed.digitalImplementation.suggestedTool) {
            md += `**🌐 Ứng dụng Công nghệ (${parsed.digitalImplementation.suggestedTool}):**\n`;
            md += `- Cần tài khoản: ${parsed.digitalImplementation.accountRequired ? "Có" : "Không"}\n`;
            md += `- Cách thức HS tham gia: ${parsed.digitalImplementation.participationMethod}\n`;
            md += `- Theo dõi kết quả: ${parsed.digitalImplementation.resultDisplayMethod}\n`;
          }
          if (parsed.offlineAlternative && parsed.offlineAlternative.method) {
            md += `\n**🏫 Phương án Offline (${parsed.offlineAlternative.method}):**\n`;
            md += `- Chuẩn bị: ${(parsed.offlineAlternative.materials || []).join(", ")}\n`;
            md += `- Tổ chức: ${parsed.offlineAlternative.organization}\n`;
          }
          
          if (parsed.resultAnalysis) {
            md += `\n**📊 Phân tích & Hỗ trợ sau luyện tập:**\n`;
            md += `- Nhóm Tốt: ${parsed.resultAnalysis.excellentStudents}\n`;
            md += `- Nhóm Đạt: ${parsed.resultAnalysis.achievedStudents}\n`;
            md += `- Nhóm Cần hỗ trợ: ${parsed.resultAnalysis.studentsNeedingSupport}\n`;
            md += `- **Biện pháp can thiệp ngay:** ${(parsed.resultAnalysis.immediateSupportActions || []).join("; ")}\n`;
          }

          if (parsed.transitionToApplication) {
            md += `\n---\n*Dẫn sang hoạt động Vận dụng:* ${parsed.transitionToApplication}\n`;
          }

          parsed = {
            title: parsed.title || `Hoạt động luyện tập: ${input.lessonTitle}`,
            content: md.trim(),
            suggestions: ["Tạo file Excel nhập điểm tự động?", "Gợi ý trò chơi khởi động khác?"]
          };
        }
        // Nếu là application_activity
        else if (input.contentType === "application_activity" && parsed.taskDescription) {
          let md = `### HOẠT ĐỘNG VẬN DỤNG: ${parsed.title || input.lessonTitle}\n`;
          md += `- **Mục tiêu:** ${parsed.objective}\n`;
          md += `- **Bối cảnh thực tiễn:** ${parsed.realWorldContext}\n`;
          md += `- **Thời gian & Hình thức:** ${parsed.duration} | ${parsed.implementationTime} | ${parsed.organizationForm}\n\n`;

          md += `### 1. NHIỆM VỤ CỦA HỌC SINH\n`;
          md += `> **Câu hỏi định hướng:** *${parsed.drivingQuestion}*\n\n`;
          md += `**Mô tả nhiệm vụ:** ${parsed.taskDescription}\n`;
          (parsed.studentInstructions || []).forEach((inst: string) => md += `- ${inst}\n`);
          md += `\n`;

          if (parsed.product) {
            md += `### 2. SẢN PHẨM YÊU CẦU\n`;
            md += `- **Loại sản phẩm:** ${parsed.product.productType} (${parsed.product.productTitle})\n`;
            md += `- **Yêu cầu nội dung:** ${(parsed.product.requiredContent || []).join("; ")}\n`;
            md += `- **Định dạng / Độ dài:** ${parsed.product.fileFormat} | ${parsed.product.lengthOrDuration}\n`;
            md += `- **Cách nộp / Hạn chót:** ${parsed.product.submissionMethod} | ${parsed.product.deadline}\n\n`;
          }

          if (parsed.aiIntegration && parsed.aiIntegration.useAI) {
            md += `### 3. TÍCH HỢP AI & CÔNG NGHỆ\n`;
            md += `- **Được phép dùng AI để:** ${(parsed.aiIntegration.allowedUses || []).join(", ")}\n`;
            md += `- **Kiểm chứng thông tin:** ${(parsed.aiIntegration.verificationSteps || []).join(" -> ")}\n`;
            md += `- ⚠️ **Quy tắc an toàn:** ${(parsed.aiIntegration.aiSafetyRules || []).join("; ")}\n`;
          } else if (parsed.digitalIntegration && parsed.digitalIntegration.useDigitalTool) {
            md += `### 3. TÍCH HỢP CÔNG NGHỆ\n`;
            md += `- **Công cụ gợi ý:** ${(parsed.digitalIntegration.suggestedTools || []).join(", ")}\n`;
            md += `- **Thao tác:** ${parsed.digitalIntegration.studentDigitalTask}\n`;
          }
          if (parsed.digitalIntegration?.offlineAlternative) {
            md += `- 🏫 **Dự phòng Offline:** ${parsed.digitalIntegration.offlineAlternative}\n`;
          }
          md += `\n`;

          if (parsed.assessment && parsed.assessment.rubric && parsed.assessment.rubric.length > 0) {
            md += `### 4. RUBRIC ĐÁNH GIÁ SẢN PHẨM (${parsed.assessment.maximumScore}đ - ${parsed.assessment.method})\n`;
            md += `| Tiêu chí | Trọng số | Xuất sắc | Tốt | Đạt | Cần cố gắng |\n`;
            md += `|---|---|---|---|---|---|\n`;
            parsed.assessment.rubric.forEach((r: any) => {
              md += `| **${r.criterion}** | ${r.weight || '-'} | ${r.excellent} | ${r.good} | ${r.satisfactory} | ${r.needsImprovement} |\n`;
            });
            md += `\n`;
          }

          if (parsed.reportingAndSharing) {
            md += `### 5. TRÌNH BÀY & CHIA SẺ\n`;
            md += `- **Hình thức:** ${parsed.reportingAndSharing.presentationFormat} (${parsed.reportingAndSharing.presentationDuration})\n`;
            md += `- **Phản biện / Góp ý:** ${parsed.reportingAndSharing.peerFeedbackMethod}\n`;
          }

          parsed = {
            title: parsed.title || `Hoạt động vận dụng: ${input.lessonTitle}`,
            content: md.trim(),
            suggestions: ["Chia sẻ sản phẩm xuất sắc lên trang web trường?", "Tạo một buổi triển lãm nhỏ cho các dự án này?"]
          };
        }

        return {
          title: parsed.title || `Nội dung AI: ${input.lessonTitle}`,
          content: parsed.content || "Không có nội dung.",
          suggestions: parsed.suggestions || [],
          createdAt: new Date().toISOString()
        };
      }
      
      // Fallback to Mock
      const result = await generateGeoAIContent(input);
      return result;
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      throw new Error(error.message || "Không thể tạo nội dung AI. Vui lòng thử lại.");
    }
  }
};
