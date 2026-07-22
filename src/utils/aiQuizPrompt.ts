export const AI_QUIZ_GENERATOR_PROMPT = `
Hãy bổ sung quy tắc tạo câu hỏi, đáp án và ngữ liệu cho module Quiz Địa lí. Tất cả câu hỏi được sinh ra phải tuân thủ các quy tắc sau:

# 1. QUY TẮC CHUNG KHI ĐẶT CÂU HỎI
Mỗi câu hỏi phải có:
- Mã câu hỏi, Dạng câu hỏi, Nội dung câu hỏi, Ngữ liệu nếu có, Đáp án đúng, Phương án nhiễu hoặc nhận định sai, Mức độ nhận thức, Chủ đề/bài học, Công thức nếu là câu tính toán, Đơn vị tính, Lời giải hoặc giải thích đáp án.

Câu hỏi phải:
- Bám sát nội dung bài học Địa lí.
- Không hỏi kiến thức ngoài bài nếu giáo viên không yêu cầu.
- Không dùng câu hỏi mơ hồ, có nhiều cách hiểu.
- Không có hai đáp án đúng trong câu trắc nghiệm một lựa chọn.
- Không để đáp án đúng quá dễ đoán.
- Không dùng từ tuyệt đối như “luôn luôn”, “tất cả”, “hoàn toàn” nếu không chính xác về mặt khoa học.
- Không gài bẫy bằng lỗi chính tả, lỗi diễn đạt.
- Không dùng dữ liệu sai thực tế hoặc sai đơn vị.
- Không để đáp án xuất hiện lộ liễu ngay trong câu hỏi.
- Không tạo câu hỏi quá dài nếu không có ngữ liệu cần thiết.

# 2. QUY TẮC VỀ NGỮ LIỆU
Ngữ liệu là phần thông tin học sinh dùng để trả lời câu hỏi. Ngữ liệu có thể là:
- Đoạn thông tin ngắn, Bảng số liệu, Biểu đồ, Bản đồ giả lập, Hình ảnh/mô phỏng 3D, Tình huống thực tiễn.
Ngữ liệu phải:
- Ngắn gọn, rõ ràng, đủ dữ kiện để trả lời.
- Có liên quan trực tiếp đến câu hỏi.
- Không thừa dữ liệu gây nhiễu quá mức.
- Có số liệu thống nhất về đơn vị.
- Nếu là bảng số liệu, phải có tên bảng, đơn vị, năm.

# 3. QUY TẮC ĐẶT CÂU TRẮC NGHIỆM KHÁCH QUAN
Mỗi câu trắc nghiệm khách quan phải có: 1 câu dẫn, 4 phương án A, B, C, D, Chỉ có 1 đáp án đúng, 3 phương án nhiễu hợp lí, Giải thích đáp án đúng.
Câu dẫn phải: Rõ yêu cầu cần hỏi, Không quá dài, Không phủ định kép.
Phương án trả lời phải: Tương đương nhau về độ dài tương đối, Cùng loại thông tin, Không có phương án “Tất cả các đáp án trên”, Không có phương án “Cả A và B”.

# 4. QUY TẮC ĐẶT CÂU ĐÚNG/SAI
Mỗi câu đúng/sai phải có: Một ngữ liệu hoặc tình huống chung, 4 nhận định a, b, c, d. Mỗi nhận định có đáp án Đúng hoặc Sai và giải thích riêng.
Yêu cầu:
- Mỗi câu đúng/sai phải có cả nhận định đúng và nhận định sai (Không để cả 4 ý đều đúng hoặc sai).
- Nhận định sai phải sai về bản chất kiến thức, không sai do mẹo chữ.

# 5. QUY TẮC ĐẶT CÂU TRẢ LỜI NGẮN
Môn Địa lí ưu tiên dạng tính toán. Mỗi câu phải có: Dữ liệu đề bài, Công thức, Yêu cầu tính toán rõ ràng, Đơn vị, Quy tắc làm tròn, Đáp án số, Sai số cho phép, Lời giải chi tiết.
- Không hỏi nhiều kết quả trong một câu.
- Có quy tắc làm tròn rõ ràng.

# 6. QUY TẮC CÔNG THỨC ĐỊA LÍ
1. Mật độ dân số = Dân số / Diện tích
2. Tỉ suất gia tăng dân số tự nhiên = Tỉ suất sinh thô - Tỉ suất tử thô
3. Sản lượng = Diện tích × Năng suất
4. Năng suất = Sản lượng / Diện tích
5. Bình quân lương thực theo đầu người = Sản lượng lương thực / Dân số
6. GDP bình quân đầu người = Tổng GDP / Dân số
7. Tỉ trọng = Giá trị thành phần / Tổng giá trị × 100
8. Tốc độ tăng trưởng = Giá trị năm sau / Giá trị năm gốc × 100
9. Mức tăng = Giá trị năm sau - Giá trị năm trước
10. Cán cân xuất nhập khẩu = Xuất khẩu - Nhập khẩu
11. Tổng kim ngạch xuất nhập khẩu = Xuất khẩu + Nhập khẩu
12. Tỉ lệ che phủ rừng = Diện tích rừng / Diện tích tự nhiên × 100
13. Biên độ nhiệt năm = Nhiệt độ tháng cao nhất - Nhiệt độ tháng thấp nhất
14. Lượng mưa năm = Tổng lượng mưa 12 tháng
15. Lượng mưa trung bình tháng = Tổng lượng mưa năm / 12
16. Tỉ lệ dân thành thị = Dân thành thị / Tổng dân số × 100
17. Tỉ lệ dân nông thôn = Dân nông thôn / Tổng dân số × 100
18. Tỉ trọng ngành kinh tế = Giá trị ngành / Tổng giá trị × 100
19. Cự li vận chuyển trung bình = Khối lượng luân chuyển / Khối lượng vận chuyển
20. Tốc độ tăng dân số = Dân số năm sau / Dân số năm gốc × 100

# 7. QUY TẮC ĐÁP ÁN
- correctAnswer phải là một trong A, B, C, D (cho trắc nghiệm).
- Mỗi nhận định phải có answer: true hoặc false (cho đúng/sai).
- Trả lời ngắn: correctAnswer phải là số, có unit, tolerance, solution trình bày phép tính.

# 8. QUY TẮC PHÂN BỐ MỨC ĐỘ (20 CÂU)
- 6 câu nhận biết, 6 câu thông hiểu, 5 câu vận dụng, 3 câu vận dụng cao.
- Trắc nghiệm (12): 4 NB, 4 TH, 3 VD, 1 VDC
- Đúng/sai (4): 1 NB, 1 TH, 1 VD, 1 VDC
- Trả lời ngắn (4): 1 NB, 1 TH, 1 VD, 1 VDC

# 9. QUY TẮC NGỮ LIỆU THEO DẠNG CÂU
- Đúng/sai: Bắt buộc nên có ngữ liệu chung.
- Trả lời ngắn: Bắt buộc có số liệu cụ thể đủ áp dụng công thức.

# 10. QUY TẮC CHỐNG LỖI
- Đúng cấu trúc số lượng câu.
- Không trùng lặp, không mơ hồ, không sai đơn vị.

# 11. CẤU TRÚC DỮ LIỆU CHUẨN (JSON)
\`\`\`json
{
  "id": "q001",
  "lessonId": "lesson_001",
  "type": "multiple_choice | true_false | short_answer",
  "section": "I | II | III",
  "level": "Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao",
  "topic": "Tên chủ đề",
  "stimulus": {
    "type": "none | text | table | chart | map | simulation",
    "title": "Tên ngữ liệu",
    "content": "Nội dung ngữ liệu",
    "unit": "Đơn vị nếu có",
    "source": "Nguồn gốc"
  },
  "question": "Nội dung câu hỏi",
  "options": [
    { "key": "A", "text": "Phương án A" },
    { "key": "B", "text": "Phương án B" },
    { "key": "C", "text": "Phương án C" },
    { "key": "D", "text": "Phương án D" }
  ],
  "correctAnswer": "A",
  "statements": [
    { "label": "a", "text": "Nhận định a", "answer": true, "explanation": "Giải thích" }
  ],
  "shortAnswer": {
    "formula": "Tên công thức",
    "inputData": {},
    "correctAnswer": 0,
    "unit": "Đơn vị",
    "tolerance": 0.1,
    "rounding": "Làm tròn đến hàng đơn vị",
    "solution": "Lời giải chi tiết"
  },
  "explanation": "Giải thích đáp án"
}
\`\`\`
`;
