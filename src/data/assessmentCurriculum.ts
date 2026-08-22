export interface CurriculumTopic {
  title: string;
  lessons: string[];
}

export const GEOGRAPHY_CURRICULUM: Record<string, CurriculumTopic[]> = {
  "10": [
    {
      title: "Sử dụng bản đồ",
      lessons: [
        "Bài 1: Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ",
        "Bài 2: Phương pháp sử dụng bản đồ trong học tập địa lí và đời sống",
        "Bài 3: Một số ứng dụng của GPS và bản đồ số trong đời sống",
        "Thực hành: Xác định phương hướng, khoảng cách và vị trí của các đối tượng địa lí trên bản đồ"
      ]
    },
    {
      title: "Trái Đất",
      lessons: [
        "Bài 4: Nguồn gốc hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất",
        "Bài 5: Hệ quả địa lí các chuyển động của Trái Đất",
        "Thực hành: Hệ quả địa lí các chuyển động của Trái Đất"
      ]
    },
    {
      title: "Thạch quyển",
      lessons: [
        "Bài 6: Thạch quyển, thuyết kiến tạo mảng",
        "Bài 7: Nội lực và ngoại lực",
        "Thực hành: Đọc bản đồ các mảng kiến tạo, các vành đai động đất, núi lửa"
      ]
    },
    {
      title: "Khí quyển",
      lessons: [
        "Bài 8: Khí quyển, sự phân bố nhiệt độ không khí trên Trái Đất",
        "Bài 9: Khí áp và gió",
        "Bài 10: Thủy quyển. Nước trên lục địa",
        "Bài 11: Mưa",
        "Thực hành: Đọc bản đồ các đới khí hậu trên Trái Đất, phân tích biểu đồ một số kiểu khí hậu"
      ]
    },
    {
      title: "Thủy quyển",
      lessons: [
        "Bài 12: Nước biển và đại dương",
        "Thực hành: Đọc bản đồ các dòng biển trên thế giới"
      ]
    },
    {
      title: "Thổ nhưỡng quyển. Sinh quyển",
      lessons: [
        "Bài 13: Đất",
        "Bài 14: Sinh quyển",
        "Thực hành: Tìm hiểu về sự phân bố các đới đất và các kiểu thảm thực vật trên thế giới"
      ]
    },
    {
      title: "Địa lí dân cư",
      lessons: [
        "Bài 15: Quy mô dân số, gia tăng dân số và cơ cấu dân số thế giới",
        "Bài 16: Phân bố dân cư và đô thị hóa",
        "Thực hành: Vẽ và phân tích biểu đồ về dân số"
      ]
    },
    {
      title: "Các nguồn lực, cơ cấu kinh tế",
      lessons: [
        "Bài 17: Các nguồn lực phát triển kinh tế",
        "Bài 18: Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia"
      ]
    },
    {
      title: "Địa lí các ngành kinh tế",
      lessons: [
        "Bài 19: Địa lí ngành nông nghiệp, lâm nghiệp, thủy sản",
        "Bài 20: Tổ chức lãnh thổ nông nghiệp, một số vấn đề phát triển nông nghiệp hiện đại",
        "Bài 21: Địa lí ngành công nghiệp",
        "Bài 22: Tổ chức lãnh thổ công nghiệp, một số vấn đề phát triển công nghiệp hiện đại",
        "Bài 23: Địa lí ngành dịch vụ",
        "Bài 24: Địa lí ngành giao thông vận tải và bưu chính viễn thông",
        "Bài 25: Địa lí ngành tài chính ngân hàng và du lịch",
        "Bài 26: Địa lí ngành thương mại"
      ]
    },
    {
      title: "Phát triển bền vững",
      lessons: [
        "Bài 27: Môi trường và tài nguyên thiên nhiên",
        "Bài 28: Phát triển bền vững và tăng trưởng xanh",
        "Thực hành: Tìm hiểu về phát triển bền vững và tăng trưởng xanh"
      ]
    }
  ],
  "11": [
    {
      title: "Một số vấn đề về kinh tế - xã hội thế giới",
      lessons: [
        "Bài 1: Sự khác biệt về trình độ phát triển kinh tế - xã hội của các nhóm nước",
        "Bài 2: Toàn cầu hóa và khu vực hóa kinh tế",
        "Bài 3: Một số vấn đề an ninh toàn cầu",
        "Bài 4: Thực hành: Tìm hiểu về toàn cầu hóa, khu vực hóa",
        "Bài 5: Một số vấn đề về dân số thế giới và kinh tế tri thức"
      ]
    },
    {
      title: "Khu vực Mỹ La tinh",
      lessons: [
        "Bài 6: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Mỹ La tinh",
        "Bài 7: Kinh tế khu vực Mỹ La tinh",
        "Bài 8: Thực hành: Viết báo cáo về tình hình phát triển kinh tế - xã hội ở khu vực Mỹ La tinh"
      ]
    },
    {
      title: "Liên minh châu Âu (EU)",
      lessons: [
        "Bài 9: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Liên minh châu Âu (EU)",
        "Bài 10: Kinh tế Liên minh châu Âu (EU)",
        "Bài 11: Thực hành: Tìm hiểu về sự phát triển công nghiệp của Liên minh châu Âu"
      ]
    },
    {
      title: "Khu vực Đông Nam Á",
      lessons: [
        "Bài 12: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Đông Nam Á",
        "Bài 13: Kinh tế khu vực Đông Nam Á",
        "Bài 14: Hiệp hội các quốc gia Đông Nam Á (ASEAN)",
        "Bài 15: Thực hành: Viết báo cáo về các giai đoạn phát triển của ASEAN"
      ]
    },
    {
      title: "Khu vực Tây Nam Á",
      lessons: [
        "Bài 16: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Tây Nam Á",
        "Bài 17: Kinh tế khu vực Tây Nam Á"
      ]
    },
    {
      title: "Hợp chủng quốc Hoa Kỳ",
      lessons: [
        "Bài 18: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Hoa Kỳ",
        "Bài 19: Kinh tế Hoa Kỳ"
      ]
    },
    {
      title: "Liên bang Nga",
      lessons: [
        "Bài 20: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Liên bang Nga",
        "Bài 21: Kinh tế Liên bang Nga"
      ]
    },
    {
      title: "Nhật Bản",
      lessons: [
        "Bài 22: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Nhật Bản",
        "Bài 23: Kinh tế Nhật Bản"
      ]
    },
    {
      title: "Cộng hòa Nhân dân Trung Hoa",
      lessons: [
        "Bài 24: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Trung Quốc",
        "Bài 25: Kinh tế Trung Quốc"
      ]
    },
    {
      title: "Ô-xtrây-li-a",
      lessons: [
        "Bài 26: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Ô-xtrây-li-a",
        "Bài 27: Kinh tế Ô-xtrây-li-a"
      ]
    }
  ],
  "12": [
    {
      title: "Địa lí tự nhiên Việt Nam",
      lessons: [
        "Bài 1: Vị trí địa lí và phạm vi lãnh thổ",
        "Bài 2: Thiên nhiên nhiệt đới ẩm gió mùa",
        "Bài 3: Sự phân hóa đa dạng của thiên nhiên",
        "Bài 4: Vấn đề sử dụng và bảo vệ tài nguyên thiên nhiên",
        "Bài 5: Vấn đề bảo vệ môi trường và phòng chống thiên tai",
        "Bài 6: Thực hành: Đọc bản đồ, phân tích số liệu về tự nhiên Việt Nam"
      ]
    },
    {
      title: "Địa lí dân cư Việt Nam",
      lessons: [
        "Bài 7: Đặc điểm dân số và phân bố dân cư ở nước ta",
        "Bài 8: Lao động và việc làm",
        "Bài 9: Đô thị hóa",
        "Bài 10: Thực hành: Vẽ biểu đồ và phân tích sự phân hóa thu nhập theo vùng"
      ]
    },
    {
      title: "Địa lí các ngành kinh tế Việt Nam",
      lessons: [
        "Bài 11: Chuyển dịch cơ cấu kinh tế",
        "Bài 12: Vấn đề phát triển nông nghiệp",
        "Bài 13: Vấn đề phát triển ngành lâm nghiệp và thủy sản",
        "Bài 14: Tổ chức lãnh thổ nông nghiệp",
        "Bài 15: Vấn đề phát triển công nghiệp",
        "Bài 16: Tổ chức lãnh thổ công nghiệp",
        "Bài 17: Vấn đề phát triển ngành giao thông vận tải và bưu chính viễn thông",
        "Bài 18: Vấn đề phát triển ngành du lịch và thương mại"
      ]
    },
    {
      title: "Địa lí các vùng kinh tế Việt Nam (TT 17/2025)",
      lessons: [
        "Bài 19: Khai thác thế mạnh ở Trung du và miền núi phía Bắc",
        "Bài 20: Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng",
        "Bài 21: Phát triển kinh tế - xã hội ở Bắc Trung Bộ và Duyên hải miền Trung",
        "Bài 22: Khai thác thế mạnh ở Tây Nguyên",
        "Bài 23: Khai thác lãnh thổ theo chiều sâu ở Đông Nam Bộ",
        "Bài 24: Phát triển kinh tế - xã hội ở Đồng bằng sông Cửu Long",
        "Bài 25: Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo"
      ]
    },
    {
      title: "Địa lí địa phương",
      lessons: [
        "Bài 26: Tìm hiểu địa lí tỉnh, thành phố",
        "Bài 27: Thực hành: Viết báo cáo về địa lí địa phương"
      ]
    }
  ]
};
// Cơ sở dữ liệu Yêu cầu cần đạt (YCCĐ) chuẩn quốc gia Địa lí 12 theo CTPT 2018 & TT 17/2025

// Cơ sở dữ liệu Yêu cầu cần đạt (YCCĐ) chuẩn quốc gia Địa lí 10, 11, 12 theo CTPT 2018 & TT 17/2025

// Cơ sở dữ liệu Yêu cầu cần đạt (YCCĐ) chuẩn quốc gia Địa lí 10, 11, 12 theo CTPT 2018 & TT 17/2025
export const OFFICIAL_GEOGRAPHY_CURRICULUM_SPECS: Record<string, { know: string; understand: string; apply: string }> = {
  // --- GRADE 12 ---
  "Vị trí địa lí và phạm vi lãnh thổ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được đặc điểm vị trí địa lí và phạm vi lãnh thổ nước ta (vùng đất, vùng biển với 5 bộ phận, vùng trời).\n- [NL2 - Tìm hiểu địa lí]: Sử dụng bản đồ địa lí để xác định tọa độ các điểm cực và các nước tiếp giáp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được ảnh hưởng của vị trí địa lí và phạm vi lãnh thổ đối với đặc điểm tự nhiên, kinh tế - xã hội và an ninh quốc phòng.\n- [NL2 - Tìm hiểu địa lí]: Rút ra nhận xét từ các bản đồ khí hậu, sông ngòi.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá ý nghĩa chiến lược của vị trí địa lí nước ta trong khu vực và bảo vệ chủ quyền biên giới, hải đảo."
  },
  "Thiên nhiên nhiệt đới ẩm gió mùa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được các biểu hiện của thiên nhiên nhiệt đới ẩm gió mùa qua khí hậu, địa hình, sông ngòi, đất và sinh vật.\n- [NL2 - Tìm hiểu địa lí]: Sử dụng bản đồ địa lí để xác định hướng gió mùa và mạng lưới sông ngòi.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân hình thành tính chất nhiệt đới ẩm gió mùa của khí hậu Việt Nam. Phân tích ảnh hưởng của tính chất này đến hoạt động sản xuất nông nghiệp và đời sống.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các giải pháp thích ứng và phòng chống thiên tai (bão, lũ, hạn hán) tại địa phương."
  },
  "Sự phân hóa đa dạng của thiên nhiên": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm thiên nhiên phân hóa theo Bắc - Nam, Đông - Tây và theo độ cao địa hình.\n- [NL2 - Tìm hiểu địa lí]: Sử dụng bản đồ địa lí để nhận diện sự thay đổi của đất và thực vật theo độ cao.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân tạo nên sự phân hóa đa dạng của thiên nhiên (tác động của vĩ độ và địa hình đồi núi hướng sườn).\n- [NL2 - Tìm hiểu địa lí]: Phân tích các lát cắt tự nhiên từ tây sang đông.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất hướng sử dụng hợp lý tài nguyên của mỗi vùng miền để phát triển kinh tế bền vững."
  },
  "Vấn đề sử dụng và bảo vệ tài nguyên thiên nhiên": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được hiện trạng sử dụng và bảo vệ tài nguyên rừng, tài nguyên đất và đa dạng sinh học ở nước ta.\n- [NL2 - Tìm hiểu địa lí]: Xác định sự phân bố các vườn quốc gia và khu bảo tồn thiên nhiên trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích nguyên nhân làm suy thoái tài nguyên rừng và đất đai. Giải thích sự cần thiết của phát triển lâm nghiệp bền vững.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Xây dựng kế hoạch nhỏ tuyên truyền bảo vệ tài nguyên sinh vật và môi trường sống của học sinh."
  },
  "Vấn đề bảo vệ môi trường và phòng chống thiên tai": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng ô nhiễm môi trường và đặc điểm, hậu quả của các thiên tai chính (bão, lũ quét, hạn hán).\n- [NL2 - Tìm hiểu địa lí]: Xác định các vùng chịu ảnh hưởng nặng nề nhất của bão trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân ô nhiễm môi trường nước, không khí và sự gia tăng cường độ thiên tai do biến đổi khí hậu.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất và thực hiện các kỹ năng phòng chống thiên tai cơ bản trong gia đình và nhà trường."
  },
  "Dân số, lao động và việc làm": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm dân số, cơ cấu lao động theo ngành kinh tế và vấn đề việc làm hiện nay ở Việt Nam.\n- [NL2 - Tìm hiểu địa lí]: Xác định các khu vực có mật độ dân số cao và trung tâm đô thị lớn.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích sức ép dân số đối với phát triển kinh tế, xã hội, môi trường và xu hướng chuyển dịch cơ cấu lao động.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp định hướng nghề nghiệp và tự học để đáp ứng nhu cầu thị trường lao động."
  },
  "Đặc điểm dân số và phân bố dân cư ở nước ta": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được quy mô dân số, gia tăng dân số và sự phân bố dân cư không đồng đều ở Việt Nam.\n- [NL2 - Tìm hiểu địa lí]: Đọc bản đồ dân số để xác định các đô thị lớn.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của phân bố dân cư không đều đến sử dụng lao động và khai thác tài nguyên.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Liên hệ chính sách phân bố lại dân cư ở nước ta và tác động của nó tới kinh tế vùng sâu vùng xa."
  },
  "Lao động và việc làm": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được đặc điểm nguồn lao động nước ta (số lượng, chất lượng). Nêu hiện trạng sử dụng lao động và vấn đề việc làm hiện nay.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân của tình trạng thiếu việc làm ở nông thôn và thất nghiệp ở thành thị.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các biện pháp nâng cao kỹ năng nghề nghiệp và tự tạo việc làm của thanh niên hiện nay."
  },
  "Đô thị hóa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được đặc điểm đô thị hóa ở nước ta (quá trình đô thị hóa diễn ra chậm, trình độ thấp nhưng mạng lưới đang mở rộng). Nêu sự phân loại đô thị Việt Nam.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng hai mặt của quá trình đô thị hóa đến sự chuyển dịch cơ cấu kinh tế và môi trường.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp quản lý và phát triển đô thị xanh, bền vững tại địa phương."
  },
  "Chuyển dịch cơ cấu kinh tế": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày các biểu hiện chuyển dịch cơ cấu kinh tế theo ngành, theo thành phần kinh tế và theo lãnh thổ.\n- [NL2 - Tìm hiểu địa lí]: Phân tích bảng số liệu thể hiện cơ cấu GDP phân theo ngành.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân chuyển dịch cơ cấu kinh tế nước ta phù hợp xu thế công nghiệp hóa và hội nhập quốc tế.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Nhận xét sự chuyển dịch cơ cấu kinh tế địa phương em trong giai đoạn hiện nay."
  },
  "Vấn đề phát triển nông nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu hiện trạng phát triển và phân bố ngành trồng trọt (lúa, cây công nghiệp) và ngành chăn nuôi ở Việt Nam.\n- [NL2 - Tìm hiểu địa lí]: Xác định các vùng trồng cây công nghiệp lâu năm trọng điểm trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của điều kiện tự nhiên, nguồn nước và chính sách phát triển đến nông nghiệp xanh, công nghệ cao.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp phát triển thương hiệu nông sản xuất khẩu tại địa phương."
  },
  "Vấn đề phát triển ngành lâm nghiệp và thủy sản": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vai trò, hiện trạng và phân bố ngành lâm nghiệp (rừng sản xuất, rừng phòng hộ) và ngành thủy sản (nuôi trồng, đánh bắt).\n- [NL2 - Tìm hiểu địa lí]: Xác định các vùng nuôi trồng thủy sản lớn nhất nước ta.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích thế mạnh và hạn chế đối với ngành lâm nghiệp và nuôi trồng thủy sản ven biển nước ta.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất biện pháp khai thác thủy hải sản xa bờ an toàn, bền vững gắn với quốc phòng an ninh."
  },
  "Tổ chức lãnh thổ nông nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm của 7 vùng nông nghiệp ở nước ta. Nêu được các hình thức tổ chức lãnh thổ nông nghiệp chính.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được sự thay đổi trong tổ chức lãnh thổ nông nghiệp theo hướng tăng chuyên môn hóa.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất mô hình trang trại nông nghiệp kết hợp du lịch sinh thái phù hợp."
  },
  "Vấn đề phát triển công nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày cơ cấu ngành công nghiệp (khai thác, chế biến, sản xuất điện). Nêu sự phân bố ngành công nghiệp trọng điểm.\n- [NL2 - Tìm hiểu địa lí]: Xác định vị trí các mỏ than, mỏ dầu và nhà máy thủy điện lớn.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích các nhân tố tự nhiên và kinh tế - xã hội ảnh hưởng đến cơ cấu công nghiệp nước ta.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các biện pháp tiết kiệm năng lượng và giảm phát thải khí nhà kính trong sản xuất."
  },
  "Tổ chức lãnh thổ công nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày các hình thức tổ chức lãnh thổ công nghiệp chính: khu công nghiệp, khu chế xuất, trung tâm công nghiệp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích vai trò của tổ chức lãnh thổ công nghiệp đối với thu hút đầu tư FDI và thúc đẩy công nghiệp hóa.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích tác động của khu công nghiệp đối với kinh tế địa phương nơi em sinh sống."
  },
  "Vấn đề phát triển ngành giao thông vận tải và bưu chính viễn thông": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng phát triển và phân bố mạng lưới giao thông (đường bộ, sắt, thủy, hàng không) và bưu chính viễn thông.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa phát triển giao thông vận tải đối với liên kết vùng và hội nhập kinh tế quốc tế.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò của các trục hành lang kinh tế xuyên quốc gia đi qua nước ta."
  },
  "Vấn đề phát triển ngành du lịch và thương mại": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng phát triển nội thương, ngoại thương và du lịch. Nêu tên các di sản thế giới tại Việt Nam.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích tác động của hội nhập toàn cầu đến cán cân thương mại và các trung tâm du lịch lớn của nước ta.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất phương án quảng bá thương mại hoặc thu hút khách du lịch xanh tại địa phương."
  },
  "Khai thác thế mạnh ở Trung du và miền núi phía Bắc": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lý, phạm vi lãnh thổ và hiện trạng khai thác thế mạnh: khoáng sản, thủy điện, cây lâu năm, kinh tế biển.\n- [NL2 - Tìm hiểu địa lí]: Xác định vị trí nhà máy thủy điện Hòa Bình, Sơn La và mỏ đồng Sinh Quyền trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân cần bảo vệ môi trường sinh thái rừng đầu nguồn khi khai thác khoáng sản và làm thủy điện ở vùng.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các mô hình trồng trọt hữu cơ bền vững đi đôi với giữ nước, chống sạt lở đồi núi."
  },
  "Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vị trí địa lý và các thế mạnh chính: lao động dồi dào, cơ sở hạ tầng phát triển, thị trường lớn.\n- [NL2 - Tìm hiểu địa lí]: Xác định các trung tâm công nghiệp lớn (Hà Nội, Hải Phòng) trên bản đồ công nghiệp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích sức ép dân số đối với kinh tế và môi trường. Giải thích tại sao cần thiết phải chuyển dịch cơ cấu ngành kinh tế của vùng.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất định hướng bảo vệ đất đai canh tác phù sa sông Hồng trước sức ép của đô thị hóa."
  },
  "Phát triển kinh tế - xã hội ở Bắc Trung Bộ và Duyên hải miền Trung": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí, phạm vi lãnh thổ và đặc điểm phát triển nông - lâm - ngư nghiệp, công nghiệp, cơ sở hạ tầng ven biển.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa việc hình thành cơ cấu nông - lâm - ngư nghiệp ở Bắc Trung Bộ và Duyên hải miền Trung đối với phát triển kinh tế vùng.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất biện pháp phòng chống cát bay, cát chảy, khô hạn và thích ứng biến đổi khí hậu ven biển miền Trung."
  },
  "Khai thác thế mạnh ở Tây Nguyên": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng trồng cây công nghiệp lâu năm (cà phê, cao su), lâm nghiệp và thủy năng kết hợp thủy lợi.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa kinh tế và môi trường của việc phát triển các vùng chuyên canh cây công nghiệp lớn ở Tây Nguyên.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các giải pháp bảo tồn rừng đầu nguồn và quản lý nguồn nước ngọt mùa khô cho Tây Nguyên."
  },
  "Khai thác lãnh thổ theo chiều sâu ở Đông Nam Bộ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí và hiện trạng khai thác theo chiều sâu trong công nghiệp, dịch vụ, nông nghiệp, phát triển tổng hợp kinh tế biển.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích khái niệm và làm rõ nguyên nhân cần khai thác theo chiều sâu để nâng cao giá trị kinh tế và bảo vệ môi trường.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất định hướng giải quyết vấn đề ô nhiễm nước sông Đồng Nai và tình trạng quá tải hạ tầng đô thị."
  },
  "Phát triển kinh tế - xã hội ở Đồng bằng sông Cửu Long": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày thế mạnh chính: đất phù sa ngọt, sông ngòi chằng chịt, sinh vật ngập mặn. Nêu hiện trạng sản xuất lương thực thực phẩm.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích khó khăn: hạn mặn xâm nhập sâu mùa khô, đất phèn mặn diện rộng. Giải thích sự cần thiết cải tạo đất và sử dụng hợp lý nguồn nước.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất mô hình kinh tế nông nghiệp thích ứng hiệu quả với biến đổi khí hậu và xâm nhập mặn ở vùng sông nước."
  },
  "Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu đặc điểm vùng biển nước ta; xác định vị trí các quần đảo lớn Hoàng Sa, Trường Sa; kể tên 4 ngành kinh tế biển chính.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích ý nghĩa chiến lược của biển đảo đối với kinh tế và an ninh quốc gia. Làm rõ sự cần thiết của Luật Biển Việt Nam.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích vai trò và trách nhiệm của thế hệ trẻ trong công cuộc xây dựng, phát triển kinh tế biển và bảo vệ chủ quyền hải đảo."
  },

  // --- GRADE 11 ---
  "Sự khác biệt về trình độ phát triển kinh tế - xã hội của các nhóm nước": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được sự phân chia các nhóm nước phát triển và đang phát triển theo GDP, GNI bình quan và HDI.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích sự khác biệt về trình độ phát triển kinh tế - xã hội và cơ cấu kinh tế giữa 2 nhóm nước.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán chỉ số phát triển con người HDI hoặc so sánh cơ cấu kinh tế từ bảng số liệu."
  },
  "Toàn cầu hóa và khu vực hóa kinh tế": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu biểu hiện của toàn cầu hóa và khu vực hóa kinh tế; kể tên các liên kết kinh tế khu vực lớn.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của toàn cầu hóa và khu vực hóa đến phát triển kinh tế nước đang phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá cơ hội và thách thức của nền kinh tế Việt Nam trong quá trình hội nhập quốc tế toàn cầu."
  },
  "Một số vấn đề an ninh toàn cầu": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được một số vấn đề an ninh toàn cầu (an ninh lương thực, an ninh năng lượng, an ninh nguồn nước).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích nguyên nhân và tầm quan trọng của việc chung tay hợp tác giải quyết các vấn đề an ninh toàn cầu.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp tiết kiệm điện, bảo vệ nước ngọt trong cuộc sống hằng ngày của bản thân."
  },
  "Một số vấn đề về dân số thế giới và kinh tế tri thức": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được đặc điểm già hóa dân số thế giới và khái niệm về nền kinh tế tri thức.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích tác động kinh tế của sự già hóa dân số đối với các nước phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Nhận thức và trình bày vai trò của tri thức trong bối cảnh cuộc cách mạng công nghệ hiện đại."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Mỹ La tinh": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vị trí địa lí, tự nhiên phong phú của Mỹ La tinh; quy mô dân số lớn và đặc trưng văn hóa đặc sắc.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của điều kiện tự nhiên đa dạng đến phát triển kinh tế và các vấn đề đô thị hóa tự phát.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đọc bản đồ tự nhiên Mỹ La tinh để xác định các mỏ khoáng sản kim loại màu lớn."
  },
  "Kinh tế khu vực Mỹ La tinh": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng kinh tế khu vực (tốc độ tăng trưởng không ổn định, nợ nước ngoài cao) và cơ cấu nông, công nghiệp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân dẫn đến tình trạng phát triển kinh tế thiếu ổn định của các nước Mỹ La tinh.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán cơ cấu ngành nông nghiệp của khu vực Mỹ La tinh từ bảng số liệu."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Liên minh châu Âu (EU)": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí, quy mô lãnh thổ, đặc điểm dân cư và xã hội của Liên minh châu Âu.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa của vị trí địa lý thuận lợi trong việc kết nối giao thương giữa EU và các châu lục khác.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Xác định các quốc gia sáng lập và các thành viên chính của EU trên bản đồ hành chính."
  },
  "Kinh tế Liên minh châu Âu (EU)": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm kinh tế EU (một trung tâm kinh tế hàng đầu thế giới, sử dụng đồng Euro, thị trường tự do).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa việc thiết lập thị trường chung châu Âu đối với sự lưu thông tự do hàng hóa và tiền tệ.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích bài học từ sự liên kết kinh tế khu vực của EU đối với quá trình phát triển của ASEAN."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Đông Nam Á": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm vị trí địa lí cầu nối, giới hạn lãnh thổ Đông Nam Á lục địa và biển đảo; đặc điểm tự nhiên nhiệt đới gió mùa ẩm và dân cư đông đúc của khu vực.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được các thuận lợi và khó khăn của vị trí, tự nhiên, dân cư đối với phát triển kinh tế nông nghiệp nhiệt đới và công nghiệp dịch vụ khu vực.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Liên hệ văn hóa và lối sống Đông Nam Á có nhiều nét tương đồng làm tiền đề hợp tác phát triển."
  },
  "Kinh tế khu vực Đông Nam Á": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng phát triển kinh tế Đông Nam Á (chuyển dịch cơ cấu từ nông nghiệp sang công nghiệp và dịch vụ). Nêu sự phân bộ ngành lúa nước, khai khoáng.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích nguyên nhân làm cơ cấu kinh tế các nước Đông Nam Á thay đổi theo hướng công nghiệp hóa.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Viết báo cáo ngắn về tình hình sản xuất lúa gạo hoặc phát triển thủy hải sản của một nước Đông Nam Á."
  },
  "Hiệp hội các quốc gia Đông Nam Á (ASEAN)": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được mục tiêu, cơ chế hợp tác và quá trình phát triển thành viên của ASEAN.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích các thành tựu của ASEAN (kinh tế tăng trưởng ổn định, khu vực hòa bình) và các thách thức lớn (chênh lệch trình độ, vấn đề biển Đông).",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò, vị thế và những đóng góp tích cực của Việt Nam kể từ khi gia nhập ASEAN."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Tây Nam Á": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí ngã ba châu lục, khí hậu khô hạn, nhiều sa mạc, trữ lượng dầu mỏ lớn bậc nhất thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng tài nguyên dầu mỏ và các xung đột tôn giáo đối với địa chính trị, kinh tế Tây Nam Á.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Xác định các quốc gia tiếp giáp vịnh Ba Tư có trữ lượng dầu mỏ lớn trên bản đồ."
  },
  "Kinh tế khu vực Tây Nam Á": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu hiện trạng kinh tế Tây Nam Á phụ thuộc vào khai thác dầu khí và các nỗ lực đa dạng hóa nền kinh tế.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích sự chuyển dịch cơ cấu kinh tế theo hướng phát triển dịch vụ, tài chính và du lịch ở một số nước Trung Đông.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán sản lượng xuất khẩu dầu mỏ trung bình vùng Vịnh."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Hoa Kỳ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được vị trí địa lí, phạm vi lãnh thổ rộng lớn của Hoa Kỳ; các đặc điểm tự nhiên phân hóa giữa miền Đông, Trung bộ và miền Tây; quy mô và cơ cấu dân số (dân nhập cư phong phú).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của vị trí địa lý thuận lợi và tài nguyên thiên nhiên đa dạng đến sự phát triển kinh tế Hoa Kỳ. Phân tích tác động của nguồn lao động nhập cư chất lượng cao.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Viết báo cáo ngắn giới thiệu về một bang hoặc một ngành công nghiệp công nghệ cao nổi bật của Hoa Kỳ (Silicon Valley)."
  },
  "Kinh tế Hoa Kỳ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được vị thế của kinh tế Hoa Kỳ trên thế giới; đặc điểm phát triển các ngành công nghiệp, nông nghiệp và dịch vụ của Hoa Kỳ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được nguyên nhân giúp kinh tế Hoa Kỳ đứng đầu thế giới (vị trí, nguồn lực, khoa học công nghệ, thị trường tiêu thụ rộng lớn). Giải thích xu hướng chuyển dịch cơ cấu ngành kinh tế.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích tác động của các chính sách thương mại quốc tế của Hoa Kỳ đến hoạt động xuất khẩu của Việt Nam."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Liên bang Nga": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm lãnh thổ rộng lớn nhất thế giới, điều kiện tự nhiên giàu có (rừng taiga, khoáng sản bauxit, dầu mỏ, khí tự nhiên) và dân cư Nga (quy mô lớn, dân tộc đa dạng).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được ảnh hưởng của điều kiện tự nhiên và sự phân bố dân cư đến phân bố công nghiệp của Liên bang Nga.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá tiềm năng hợp tác khoa học công nghệ và năng lượng giữa Việt Nam và Liên bang Nga."
  },
  "Kinh tế Liên bang Nga": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu hiện trạng phát triển và phân bố các ngành công nghiệp (khai thác dầu khí, quân sự), nông nghiệp và dịch vụ của Liên bang Nga.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích sự chuyển dịch cơ cấu kinh tế của Liên bang Nga qua các giai đoạn lịch sử và vai trò các vùng kinh tế chính.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò của Liên bang Nga trong thị trường năng lượng toàn cầu hiện nay."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Nhật Bản": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được vị trí địa lí, điều kiện tự nhiên đặc trưng (đất nước quần đảo, nhiều thiên tai, nghèo khoáng sản), dân cư và xã hội Nhật Bản (dân số già, lao động kỷ luật tốt).\n- [NL2 - Tìm hiểu địa lí]: Xác định vị trí địa lý của Nhật Bản và các đảo lớn (Hôn-su, Hốc-cai-đô, Kiêu-siu, Xi-cô-cư) trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được ảnh hưởng của điều kiện tự nhiên (nhiều núi lửa, động đất, tài nguyên hạn chế) và đặc điểm dân cư (già hóa dân số, tính kỷ luật cao) đến sự phát triển kinh tế của Nhật Bản.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích bài học kinh nghiệm từ mô hình giáo dục và đầu tư khoa học công nghệ của Nhật Bản đối với sự phát triển kinh tế Việt Nam."
  },
  "Kinh tế Nhật Bản": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được đặc điểm phát triển kinh tế Nhật Bản (thời kỳ phát triển thần kỳ, vị thế cường quốc kinh tế thế giới) và sự phân bố các ngành công nghiệp, nông nghiệp, dịch vụ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được nguyên nhân dẫn đến sự phát triển kinh tế và vai trò của các vùng kinh tế chính của Nhật Bản. Phân tích cơ cấu xuất nhập khẩu.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích mối quan hệ hợp tác đối tác chiến lược sâu rộng giữa Việt Nam và Nhật Bản trong các lĩnh vực ODA, lao động.\n- [NL2 - Tìm hiểu địa lí (Trả lời ngắn)]: Tính toán cán cân thương mại hoặc tốc độ tăng trưởng kinh tế Nhật Bản qua các giai đoạn."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Trung Quốc": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí, phạm vi lãnh thổ rộng lớn; sự khác biệt về tự nhiên giữa miền Đông (đồng bằng màu mỡ) và miền Tây (sơn nguyên, hoang mạc); quy mô dân số lớn nhất thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được tác động của điều kiện tự nhiên miền Đông và miền Tây đối với phân bố dân cư và phát triển nông nghiệp Trung Quốc.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: So sánh sự phân bố dân cư và đô thị hóa giữa miền Đông và miền Tây Trung Quốc."
  },
  "Kinh tế Trung Quốc": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được hiện trạng phát triển kinh tế Trung Quốc (tốc độ tăng trưởng vượt bậc, quy mô kinh tế thứ 2 thế giới) và phân bố các ngành công nghiệp, nông nghiệp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân mang lại sự phát triển kinh tế vượt bậc của Trung Quốc nhờ thực hiện chính sách cải cách mở cửa từ năm 1978.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích mối quan hệ giao thương biên mậu và tiềm năng xuất khẩu nông sản của Việt Nam sang thị trường Trung Quốc."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Ô-xtrây-li-a": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí cô lập ở bán cầu Nam, khí hậu khô hạn phần lớn lãnh thổ, dân cư chủ yếu phân bố ở duyên hải ven biển Ô-xtrây-li-a.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của cảnh quan hoang mạc đến hoạt động du lịch và chăn nuôi gia súc của Ô-xtrây-li-a.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích bản đồ tự nhiên Ô-xtrây-li-a để làm rõ đặc điểm địa hình."
  },
  "Kinh tế Ô-xtrây-li-a": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu hiện trạng kinh tế Ô-xtrây-li-a (phát triển dịch vụ chất lượng cao, công nghiệp khai khoáng và nông nghiệp hiện đại).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân nền nông nghiệp Ô-xtrây-li-a đạt trình độ cơ giới hóa và năng suất hàng đầu thế giới.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán giá trị xuất khẩu khoáng sản và nông sản trong cơ cấu thương mại Ô-xtrây-li-a."
  },

  // --- GRADE 10 ---
  "Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu tên và nhận diện được các phương pháp biểu hiện đối tượng địa lí trên bản đồ: ký hiệu, ký hiệu đường chuyển động, chấm điểm, bản đồ - biểu đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích đặc điểm, đối tượng biểu hiện và khả năng thể hiện của từng phương pháp bản đồ (vị trí, hướng di chuyển, quy mô).",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đọc hiểu và phân tích bản đồ khí hậu, bản đồ công nghiệp sử dụng các phương pháp biểu hiện trên."
  },
  "Phương pháp sử dụng bản đồ trong học tập địa lí và đời sống": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được vai trò của bản đồ trong học tập Địa lí (rèn luyện kỹ năng quan sát, tư duy) và trong đời sống (định vị, quy hoạch).\n- [NL2 - Tìm hiểu địa lí]: Biết cách khai thác thông tin từ bản đồ bằng cách đọc bảng chú giải, xác định tọa độ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được tầm quan trọng của việc hiểu các ký hiệu bản đồ và tỉ lệ bản đồ đối với độ chính xác của thông tin.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Áp dụng các phương pháp đọc bản đồ để phân tích một bản đồ hành chính hoặc bản đồ khí hậu thực tế."
  },
  "Một số ứng dụng của GPS và bản đồ số trong đời sống": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được khái niệm GPS và bản đồ số. Kể tên các ứng dụng cơ bản của chúng trong đời sống.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên lí hoạt động cơ bản của hệ thống định vị toàn cầu GPS và tiện ích của bản đồ số trong tìm đường, theo dõi phương tiện.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Sử dụng các phần mềm bản đồ số trên thiết bị thông minh để tìm đường đi ngắn nhất, ước tính thời gian và xác định vị trí hiện tại."
  },
  "Nguồn gốc hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được nguồn gốc hình thành Trái Đất; cấu tạo vỏ Trái Đất (vỏ lục địa và đại dương); nêu được các nhóm đá cấu tạo nên vỏ Trái Đất.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được sự khác biệt về độ dày, thành phần và đặc tính vật lí giữa vỏ lục địa và vỏ đại dương.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân biệt được các mẫu đá trầm tích, macma và biến chất dựa trên đặc điểm hình thái bên ngoài."
  },
  "Hệ quả địa lí các chuyển động của Trái Đất": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu các hệ quả chuyển động tự quay của Trái Đất (ngày đêm luân phiên, giờ trên Trái Đất) và chuyển động quanh Mặt Trời (mùa, ngày đêm dài ngắn theo vĩ độ).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được cơ chế sinh ra hiện tượng mùa trong năm và hiện tượng lệch hướng chuyển động của các vật thể (lực Coriôlit).",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán giờ múi của các địa điểm khác nhau khi biết giờ của một địa điểm cho trước.\n- [NL2 - Tìm hiểu địa lí (Trả lời ngắn)]: Tính chênh lệch múi giờ giữa các địa điểm kinh tuyến."
  },
  "Thạch quyển, thuyết kiến tạo mảng": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được khái niệm thạch quyển; nội dung chính của thuyết kiến tạo mảng (sự di chuyển của các mảng kiến tạo).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân hình thành các vành đai động đất và núi lửa tại các vùng tiếp xúc giữa các mảng kiến tạo.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích lược đồ các mảng kiến tạo thế giới để xác định các khu vực có nguy cơ xảy ra động đất cao."
  },
  "Nội lực và ngoại lực": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm nội lực, ngoại lực; các tác nhân hình thành địa hình (uốn nếp, đứt gãy do nội lực; phong hóa, bồi tụ do ngoại lực).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích mối quan hệ tác động qua lại đồng thời giữa nội lực và ngoại lực trong việc tạo lập địa hình bề mặt Trái Đất.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Nhận diện các dạng địa hình cacxtơ, địa hình thung lũng sông do các tác nhân ngoại lực tạo thành ở Việt Nam."
  },
  "Khí quyển, sự phân bố nhiệt độ không khí trên Trái Đất": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm khí quyển; cấu trúc của khí quyển; quy luật phân bố nhiệt độ không khí theo vĩ độ địa lí, lục địa - đại dương và độ cao.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của góc nhập xạ và tính chất bề mặt đệm đến nhiệt độ không khí trung bình năm.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Áp dụng công thức tính nhiệt độ không khí tại một độ cao nhất định khi biết nhiệt độ chân núi."
  },
  "Khí áp và gió": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu sự hình thành các đai khí áp trên Trái Đất; các loại gió thổi thường xuyên (gió Tín phong, gió Tây ôn đới) và gió địa phương (gió đất, gió biển, gió phơn).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được nguyên nhân làm khí áp thay đổi (nhiệt độ, độ ẩm, độ cao) và nguyên lí thổi của gió mùa châu Á.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích ảnh hưởng của gió phơn tây nam khô nóng đến sản xuất nông nghiệp khu vực miền Trung nước ta."
  },
  "Thủy quyển. Nước trên lục địa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm thủy quyển; vòng tuần hoàn nước; các nguồn nước trên lục địa (sông, hồ, nước ngầm, băng hà).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của chế độ mưa, địa hình, lớp phủ thực vật đến chế độ nước sông.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp tiết kiệm nước ngọt và bảo vệ nguồn nước ngầm khỏi ô nhiễm tại đô thị."
  },
  "Mưa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được các nhân tố ảnh hưởng đến lượng mưa (khí áp, frông, gió, dòng biển, địa hình).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích quy luật phân bố lượng mưa trên Trái Đất (mưa nhiều ở vùng xích đạo, mưa ít ở vùng chí tuyến).",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Giải thích nguyên nhân gây mưa lớn kèm lũ lụt vào mùa thu đông ở dải duyên hải miền Trung nước ta."
  },
  "Nước biển và đại dương": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được độ muối và nhiệt độ của nước biển và đại dương; trình bày được hoạt động và phân bố các dòng biển (nóng và lạnh) trên thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được nguyên nhân gây ra sự thay đổi độ muối và nhiệt độ nước biển theo vĩ độ và theo mùa.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích lược đồ dòng biển để nhận xét hướng chảy và ảnh hưởng của chúng đến khí hậu ven bờ nơi chúng đi qua."
  },
  "Đất": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm đất; các nhân tố hình thành đất (đá mẹ, khí hậu, sinh vật, địa hình, thời gian, con người).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích vai trò quyết định của đá mẹ đối với thành phần khoáng vật và khí hậu đối với quá trình phong hóa tạo đất.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất biện pháp cải tạo và chống xói mòn đất đai đồi dốc tại địa phương."
  },
  "Sinh quyển": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm sinh quyển; giới hạn của sinh quyển; các nhân tố ảnh hưởng đến sự phát triển và phân bố sinh vật.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích quy luật phân bố các vành đai thực vật theo vĩ độ và theo độ cao địa hình.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp bảo vệ rừng tự nhiên nhằm bảo tồn nguồn gen quý hiếm và cân bằng sinh thái."
  },
  "Quy mô dân số, gia tăng dân số và cơ cấu dân số thế giới": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày quy mô dân số thế giới; cơ cấu dân số theo tuổi và giới (cơ cấu dân số trẻ và già); các chỉ số gia tăng dân số.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích tác động kinh tế - xã hội của cơ cấu dân số già (thiếu lao động, chi phí phúc lợi lớn) đối với các nước phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán tỉ suất gia tăng dân số tự nhiên của quốc gia khi biết tỉ suất sinh và tử."
  },
  "Phân bộ dân cư và đô thị hóa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu đặc điểm phân bố dân cư thế giới; các nhân tố ảnh hưởng phân bố; khái niệm và đặc điểm quá trình đô thị hóa.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của quá trình đô thị hóa tự phát đến việc làm, nhà ở và ô nhiễm môi trường tại các nước đang phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: So sánh đặc điểm đô thị hóa giữa nhóm nước phát triển và đang phát triển."
  },
  "Các nguồn lực phát triển kinh tế": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm nguồn lực; phân loại nguồn lực (vị trí địa lí, tự nhiên, kinh tế - xã hội).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích vai trò của nguồn lực kinh tế - xã hội (lao động, vốn, công nghệ) quyết định hướng đi và trình độ phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá thế mạnh nguồn lực nổi bật nhất của Việt Nam trong bối cảnh toàn cầu hóa."
  },
  "Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm GDP, GNI; cơ cấu ngành kinh tế (Khu vực I, II, III).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa sự chuyển dịch cơ cấu ngành kinh tế phản ánh trình độ phát triển khoa học công nghệ của quốc gia.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán GDP bình quan đầu người của một quốc gia dựa trên tổng GDP và tổng số dân."
  },
  "Địa lí ngành nông nghiệp, lâm nghiệp, thủy sản": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vai trò, đặc điểm và phân bố các ngành sản xuất nông nghiệp, lâm nghiệp và thủy hải sản trên thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của điều kiện đất, nước, khí hậu đối với tính mùa vụ và cơ cấu cây trồng.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích xu hướng phát triển nông nghiệp sinh thái hiện đại thế giới."
  },
  "Tổ chức lãnh thổ nông nghiệp, một số vấn đề phát triển nông nghiệp hiện đại": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được vai trò, đặc điểm của tổ chức lãnh thổ nông nghiệp (hộ gia đình, trang trại, vùng nông nghiệp); nêu một số xu hướng phát triển nông nghiệp hiện đại.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được ý nghĩa của tổ chức lãnh thổ nông nghiệp đối với phát triển bền vững và liên kết sản xuất.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò của công nghệ sinh học và nông nghiệp số tại một số quốc gia tiên tiến."
  },
  "Địa lí ngành công nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vai trò, đặc điểm của công nghiệp; phân loại công nghiệp trọng điểm (năng lượng, luyện kim, hóa chất, hàng tiêu dùng).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích các nhân tố vị trí địa lí và thị trường ảnh hưởng đến sự phân bố các trung tâm công nghiệp lớn.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các giải pháp tăng cường sử dụng năng lượng tái tạo (mặt trời, gió) thay thế nhiên liệu hóa thạch."
  },
  "Tổ chức lãnh thổ công nghiệp, một số vấn đề phát triển công nghiệp hiện đại": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu các hình thức tổ chức lãnh thổ công nghiệp (điểm công nghiệp, khu công nghiệp, trung tâm công nghiệp); xu hướng phát triển công nghiệp hiện đại.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được tầm quan trọng của khu công nghiệp, khu chế xuất trong việc thúc đẩy xuất khẩu và thu hút đầu tư.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích một mô hình khu công nghiệp sinh thái hoặc khu công nghiệp thông minh trên thế giới."
  },
  "Địa lí ngành dịch vụ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vai trò, đặc điểm và cơ cấu ngành dịch vụ (dịch vụ tiêu dùng, kinh doanh, công cộng).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích sự phân bố dịch vụ chịu ảnh hưởng quyết định bởi quy mô dân số và sức mua của người dân.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá tầm quan trọng của phát triển thương mại điện tử đối với dịch vụ bán lẻ hiện nay."
  },
  "Địa lí ngành giao thông vận tải và bưu chính viễn thông": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vai trò, đặc điểm và phân bố của các ngành giao thông vận tải và bưu chính viễn thông thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của sự phát triển internet và công nghệ số đến sự thay đổi hình thức bưu chính viễn thông.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò của các cảng biển trung chuyển lớn quốc tế đối với thương mại toàn cầu."
  },
  "Địa lí ngành tài chính ngân hàng và du lịch": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vai trò, đặc điểm và sự phân bố của ngành tài chính ngân hàng và du lịch trên thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích ảnh hưởng của tài nguyên du lịch (tự nhiên và nhân văn) đến sự hình thành các trung tâm du lịch thế giới.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Thiết kế một tour du lịch ảo hoặc đề xuất một giải pháp tài chính cá nhân an toàn thời kỳ công nghệ số."
  },
  "Địa lí ngành thương mại": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vai trò, đặc điểm của ngành thương mại; cán cân thương mại và các tổ chức thương mại thế giới (WTO).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích xu hướng phát triển của thương mại điện tử và sự thay đổi mạng lưới bán lẻ toàn cầu.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán cán cân xuất nhập khẩu của các quốc gia dựa trên số liệu giá trị xuất khẩu và nhập khẩu."
  },
  "Môi trường và tài nguyên thiên nhiên": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm môi trường, tài nguyên thiên nhiên; phân loại tài nguyên (tái sinh, không tái sinh, vô hạn).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích nguyên nhân gây suy thoái môi trường toàn cầu (hiệu ứng nhà kính, rác thải đại dương) và sự khan hiếm tài nguyên.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các hành động cụ thể để phân loại rác thải tại nguồn và tái chế tài nguyên tại trường học."
  },
  "Phát triển bền vững và tăng trưởng xanh": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm phát triển bền vững và tăng trưởng xanh; các biểu hiện cơ bản của tăng trưởng xanh.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích tại sao phát triển bền vững cần kết hợp hài hòa giữa tăng trưởng kinh tế, công bằng xã hội và bảo vệ môi trường.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Thiết lập một thói quen tiêu dùng xanh hằng ngày của bản thân (tiết kiệm điện, hạn chế rác thải nhựa) tại gia đình."
  }
};


// --- Mock Data ---
