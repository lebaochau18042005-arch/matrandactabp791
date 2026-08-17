export interface GeoAIInput {
  grade: string;
  lessonTitle: string;
  topic: string;
  objectives: string;
  simulationId?: string;
  contentType: string;
  textbook?: string;
  numberOfPeriods?: string;
  durationMinutes?: string;
  currentObjective?: string;
  learningOutcomes?: string;
  classProfile?: string;
  availableDevices?: string;
  simulationLink?: string;
  localContext?: string;
  previousContext?: string; // Tích hợp các nội dung đã sinh trước đó (Mục tiêu, Khởi động...)
  blocks?: any[]; // To hold all blocks for the export_word prompt
  digitalTools?: any;
}

export interface GeoAIOutput {
  title: string;
  content: string;
  suggestions: string[];
  createdAt: string;
  rawData?: any;
  resultContent?: string;
}

export const generateGeoAIContent = async (input: GeoAIInput): Promise<GeoAIOutput> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const { grade, lessonTitle, topic, contentType } = input;
  const now = new Date().toISOString();

  let title = "Kết quả AI";
  let content = "";
  let suggestions: string[] = [];

  switch (contentType) {
    case "lesson_objectives":
      title = `Yêu cầu cần đạt: ${lessonTitle}`;
      content = `### 1. Năng lực đặc thù (Năng lực Địa lí)\n**a. Nhận thức khoa học Địa lí:**\n- Trình bày được khái niệm, biểu hiện và nguyên nhân cốt lõi của ${topic}.\n- Nhận biết và phân biệt được các yếu tố tự nhiên/kinh tế - xã hội tác động đến ${lessonTitle}.\n- Nêu được ý nghĩa thực tiễn của hiện tượng này đối với tự nhiên và đời sống con người.\n\n**b. Tìm hiểu Địa lí:**\n- Đọc và phân tích được bản đồ, lược đồ, biểu đồ liên quan đến ${topic}.\n- Khai thác hiệu quả thông tin từ mô phỏng 3D, video, hình ảnh để mô tả không gian Địa lí.\n- Thu thập và chọn lọc được các số liệu, tài liệu thực tế phục vụ cho việc thảo luận.\n\n**c. Vận dụng kiến thức, kĩ năng đã học:**\n- Giải thích được một số hiện tượng tự nhiên hoặc vấn đề kinh tế - xã hội tại địa phương thông qua kiến thức của bài ${lessonTitle}.\n- Đề xuất được các giải pháp cơ bản nhằm ứng phó thiên tai, bảo vệ môi trường hoặc phát triển bền vững.\n\n### 2. Năng lực chung\n- **Năng lực tự chủ và tự học:** Chủ động hoàn thành các nhiệm vụ học tập cá nhân, tự nghiên cứu SGK.\n- **Năng lực giao tiếp và hợp tác:** Tích cực tham gia hoạt động nhóm, biết lắng nghe, phản biện và thuyết trình.\n- **Năng lực giải quyết vấn đề và sáng tạo:** Có tư duy đa chiều khi phân tích các tác động của ${topic}.\n\n### 3. Phẩm chất\n- **Chăm chỉ:** Có ý thức học tập nghiêm túc, tích cực hoàn thành Phiếu học tập.\n- **Trách nhiệm:** Nâng cao nhận thức bảo vệ tài nguyên thiên nhiên và môi trường sống.\n- **Yêu nước:** Thêm yêu thiên nhiên, đất nước thông qua việc tìm hiểu các đặc điểm địa lí.`;
      suggestions = ["Thêm mục tiêu cho học sinh khá giỏi (vận dụng cao)?", "Tạo ma trận đánh giá năng lực từ các mục tiêu này?"];
      break;

    case "warmup_activity":
      title = `Hoạt động khởi động: ${lessonTitle}`;
      content = `**Tình huống mở đầu:** Giáo viên trình chiếu một đoạn video ngắn (hoặc hình ảnh) về một hiện tượng tự nhiên liên quan đến ${topic} và yêu cầu học sinh quan sát.\n\n**Câu hỏi khởi động:** Theo các em, nguyên nhân chính nào dẫn đến hiện tượng chúng ta vừa xem? Hiện tượng này có tác động gì đến đời sống con người?\n\n**Cách tổ chức:** Làm việc cá nhân trong 2 phút, sau đó gọi ngẫu nhiên 2-3 học sinh trả lời nhanh.\n\n**Dự kiến câu trả lời:** Học sinh có thể trả lời dựa trên trực quan, chưa cần chính xác tuyệt đối. Giáo viên dựa vào đó để dẫn dắt vào bài mới ${lessonTitle}.`;
      suggestions = ["Tạo thêm trò chơi Kahoot khởi động?", "Đổi thành hoạt động đóng vai?"];
      break;

    case "knowledge_activity":
      title = `Hoạt động hình thành kiến thức: ${lessonTitle}`;
      content = `**Nhiệm vụ học sinh:** Học sinh được chia làm 4 nhóm, đọc SGK kết hợp quan sát mô hình 3D trên bảng để tìm hiểu về ${topic}.\n\n**Cách khai thác mô phỏng 3D:** Giáo viên xoay mô hình, chỉ rõ các thành phần cấu tạo và tiến trình biến đổi của hiện tượng. Yêu cầu học sinh chỉ ra điểm khác biệt giữa các khu vực.\n\n**Câu hỏi gợi mở:** Tại sao hiện tượng này lại diễn ra mạnh mẽ ở khu vực X mà không phải khu vực Y?\n\n**Kết luận kiến thức:** ${lessonTitle} là quá trình phức tạp chịu tác động của nhiều nhân tố tự nhiên. Khẳng định quy luật phân bố không gian của đối tượng Địa lí.`;
      suggestions = ["Tạo thêm phiếu học tập cho hoạt động này?", "Chia nhỏ nhiệm vụ cho từng cá nhân?"];
      break;

    case "worksheet":
      title = `Phiếu học tập: ${lessonTitle}`;
      content = `### PHIẾU HỌC TẬP SỐ 1\n**Bài học:** ${lessonTitle}\n**Lớp:** ${grade}\n\n**Nhiệm vụ 1: Quan sát**\nQuan sát mô phỏng 3D và liệt kê ít nhất 3 đặc điểm nổi bật của ${topic} mà em thấy được.\n1. ........................................................\n2. ........................................................\n3. ........................................................\n\n**Nhiệm vụ 2: Phân tích**\nDựa vào kiến thức SGK, hãy giải thích tại sao lại có những đặc điểm trên?\n................................................................\n\n**Nhiệm vụ 3: Vận dụng**\nNếu em là một nhà hoạch định chính sách, em sẽ đề xuất giải pháp gì để tận dụng/phòng tránh hiện tượng này ở địa phương em?\n................................................................\n\n**Câu hỏi kết luận:** Viết 1 câu tóm tắt nội dung cốt lõi của bài học hôm nay.\n................................................................`;
      suggestions = ["Tạo đáp án cho phiếu học tập này?", "Chuyển thành dạng câu hỏi trắc nghiệm?"];
      break;

    case "simulation_script":
      title = `Lời thuyết minh mô phỏng 3D: ${topic}`;
      content = `(Giáo viên bắt đầu bật mô phỏng 3D chạy chậm)\n\n"Các em hãy chú ý quan sát mô hình không gian trên bảng. Như các em đang thấy, đây là mô phỏng trực quan của ${topic}. Hãy nhìn kĩ vào khu vực trung tâm, nơi sự chuyển động đang diễn ra rõ nét nhất."\n\n"Tại sao các đường sức (hoặc dòng chảy/luồng gió) lại có xu hướng chuyển hướng như vậy? Đó chính là do tác động của lực xoay Trái Đất (hoặc các nhân tố địa hình)." \n\n"Bây giờ, thầy/cô sẽ tua nhanh thời gian... Các em thấy hệ quả của quá trình này là gì? Đúng vậy, nó tạo ra sự thay đổi rõ rệt trên bề mặt. Đây chính là bản chất của ${lessonTitle} mà chúng ta đang học."`;
      suggestions = ["Tạo phiên bản thuyết minh cho học sinh tự trình bày?", "Thêm câu hỏi tương tác ngắt quãng?"];
      break;

    case "discussion_questions":
      title = `Câu hỏi thảo luận: ${lessonTitle}`;
      content = `1. Phân tích nguyên nhân sâu xa dẫn đến sự phân hóa của ${topic} theo vĩ độ?\n*(Gợi ý: Dựa vào góc chiếu sáng mặt trời và lượng bức xạ)*\n\n2. Mối quan hệ tương hỗ giữa ${topic} và các thành phần tự nhiên khác là gì?\n*(Gợi ý: Tác động đến sinh vật, sông ngòi, thổ nhưỡng...)*\n\n3. Con người đang làm gia tăng/biến đổi hiện tượng này như thế nào?\n*(Gợi ý: Đưa ra ví dụ về biến đổi khí hậu, phát thải nhà kính)*\n\n4. Lấy ví dụ thực tế tại Việt Nam chứng minh sự hiện diện của quy luật này?\n*(Gợi ý: Liên hệ địa phương hoặc các vùng miền)*\n\n5. Đánh giá tính hai mặt (lợi ích và tác hại) của ${lessonTitle} đối với phát triển kinh tế xã hội?\n*(Gợi ý: Lợi thế nông nghiệp vs. thiên tai)*`;
      suggestions = ["Chuyển thành câu hỏi trắc nghiệm?", "Làm đáp án chi tiết?"];
      break;

    case "group_tasks":
      title = `Nhiệm vụ nhóm: ${lessonTitle}`;
      content = `**Nhóm 1:** Khảo sát đặc điểm tự nhiên của ${topic}.\n- *Sản phẩm nộp:* Sơ đồ tư duy trên giấy A0.\n\n**Nhóm 2:** Tìm hiểu tác động đến con người.\n- *Sản phẩm nộp:* Bài thuyết trình PowerPoint (3-5 slide).\n\n**Nhóm 3:** Đề xuất giải pháp bảo vệ/thích ứng.\n- *Sản phẩm nộp:* Poster tuyên truyền thiết kế trên Canva.\n\n**Nhóm 4:** Đóng vai chuyên gia khí tượng/địa chất.\n- *Sản phẩm nộp:* Một bài phỏng vấn ngắn (đóng kịch 2 phút).\n\n**Tiêu chí đánh giá chung:** Tính chính xác khoa học, hình thức trình bày sáng tạo, kỹ năng làm việc nhóm, kỹ năng thuyết trình.`;
      suggestions = ["Tạo rubric chấm điểm chi tiết?", "Cung cấp tài liệu tham khảo cho các nhóm?"];
      break;

    case "rubric":
      title = `Rubric đánh giá: ${topic}`;
      content = `| Tiêu chí đánh giá | Mức Tốt (9-10đ) | Mức Đạt (5-8đ) | Cần cố gắng (<5đ) |\n|---|---|---|---|\n| **Tính chính xác khoa học** | Trình bày đúng 100% bản chất của ${topic}, có mở rộng nâng cao. | Trình bày cơ bản đúng, còn thiếu sót vài tiểu tiết nhỏ. | Hiểu sai bản chất Địa lí, kiến thức chưa chuẩn xác. |\n| **Sử dụng thuật ngữ Địa lí** | Sử dụng linh hoạt, chính xác các thuật ngữ chuyên ngành. | Có sử dụng thuật ngữ nhưng chưa thật sự nhuần nhuyễn. | Dùng từ ngữ đời sống, không dùng từ chuyên môn. |\n| **Trình bày/Hình thức** | Sinh động, sáng tạo, bố cục rõ ràng, cực kì thu hút. | Gọn gàng, đọc được, đủ ý. | Trình bày cẩu thả, chữ viết khó đọc, lộn xộn. |\n| **Làm việc nhóm** | Tất cả thành viên tham gia nhiệt tình, phân công rõ ràng. | Có phân công nhưng vài thành viên còn ỷ lại. | Chỉ 1-2 người làm, không có sự phối hợp. |`;
      suggestions = ["Bổ sung thang điểm 10 chi tiết?", "Tạo phiếu tự đánh giá cho học sinh?"];
      break;

    case "common_mistakes":
      title = `Sai lầm thường gặp: ${lessonTitle}`;
      content = `### 1. Nhầm lẫn khái niệm\n- **Sai lầm:** Học sinh hay nhầm lẫn giữa ${topic} và một khái niệm tương đồng khác.\n- **Nguyên nhân:** Do học sinh học vẹt, chưa hiểu bản chất động lực học của quá trình.\n- **Cách khắc phục:** Giáo viên nên dùng mô hình 3D trực quan và vẽ bảng so sánh 2 cột để học sinh phân biệt rõ ràng.\n\n### 2. Xác định sai quy luật phân bố\n- **Sai lầm:** Cho rằng ${lessonTitle} phân bố đồng đều ở mọi nơi trên Trái Đất.\n- **Nguyên nhân:** Thiếu kĩ năng đọc bản đồ và nhận diện phân bố không gian.\n- **Cách khắc phục:** Cho học sinh chỉ trực tiếp trên bản đồ giáo khoa treo tường, yêu cầu tự rút ra nhận xét.\n\n### 3. Thiếu tư duy nhân quả\n- **Sai lầm:** Chỉ liệt kê được hiện tượng mà không giải thích được vì sao.\n- **Nguyên nhân:** Thói quen học thuộc lòng thay vì tư duy logic.\n- **Cách khắc phục:** Luôn đặt câu hỏi "Vì sao?", "Tại sao?" sau mỗi luận điểm được đưa ra.`;
      suggestions = ["Tạo bài tập trắc nghiệm gài bẫy các sai lầm này?", "Tích hợp vào phần củng cố bài học?"];
      break;

    case "scientific_check":
      title = `Kiểm định khoa học (AI Review)`;
      content = `**1. Tính chính xác thuật ngữ:** ✅ Đạt. Các thuật ngữ liên quan đến ${topic} được sử dụng chính xác.\n\n**2. Phù hợp chương trình GDPT 2018 (${grade}):** ⚠️ Lưu ý. Cần đảm bảo không vượt quá mức độ yêu cầu cần đạt của cấp THPT.\n\n**3. Đánh giá Mục tiêu & Hoạt động:** ❌ Thiếu sót. Bài giảng cần bổ sung thêm câu hỏi vận dụng thực tế địa phương để đạt mức độ vận dụng cao.\n\n**4. Khả năng tích hợp mô phỏng:** ✅ Tốt. Cấu trúc bài giảng rất phù hợp để sử dụng mô hình 3D làm giáo cụ trực quan chính.\n\n**Khuyến nghị:** Cần điều chỉnh lại thời lượng phân bổ, giảm bớt lý thuyết suông và tăng thời gian cho học sinh thực hành phân tích mô phỏng.`;
      suggestions = ["Tự động viết lại đoạn lý thuyết bị dư thừa?", "Tạo đề xuất phân bổ thời gian chi tiết?"];
      break;

    default:
      title = `Nội dung AI: ${lessonTitle}`;
      content = `Đây là nội dung được tạo tự động cho bài ${lessonTitle}, chủ đề ${topic}. Giáo viên có thể dùng nội dung này để bổ sung vào giáo án hoặc bài giảng trên lớp. Kiến thức Địa lí cần đảm bảo tính logic, trực quan và cập nhật.`;
      suggestions = ["Làm lại với văn phong khác?", "Thêm nhiều số liệu thống kê?"];
      break;
  }

  return {
    title,
    content,
    suggestions,
    createdAt: now,
  };
};
