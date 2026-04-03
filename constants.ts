
import type { ExamMatrix, ContentRow, EssayQuestion } from './types';
import { QuestionType, CognitiveLevel } from './types';

export const GRADES = [6, 7, 8, 9, 10, 11, 12];
export const EXAM_PERIODS = ['Kiểm tra giữa kỳ', 'Kiểm tra cuối kỳ'];
export const SUBJECTS = ["Toán học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "Lịch sử - Địa lí", "GD Kinh tế & Pháp luật", "Giáo dục công dân", "Công nghệ"];

// NEW: Define a type for sample content with learning outcomes
export interface SampleContent {
  contentName: string;
  learningOutcomes?: { [key in CognitiveLevel]?: string };
}

export const SAMPLE_TOPICS_BY_GRADE_MATH: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  1: {
    "Số và Phép tính": [
      { 
        contentName: "Số tự nhiên trong phạm vi 100", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Đếm, đọc, viết được các số trong phạm vi 100; Nhận biết được chục và đơn vị, số tròn chục.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết được cách so sánh, xếp thứ tự các số trong phạm vi 100.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được phép cộng, phép trừ (không nhớ) các số trong phạm vi 100; Thực hiện được việc cộng, trừ nhẩm trong phạm vi 10."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Hình học trực quan và Đo lường", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được vị trí, định hướng trong không gian: trên – dưới, phải – trái, trước – sau, ở giữa; Nhận dạng được hình vuông, hình tròn, hình tam giác, hình chữ nhật; Nhận biết được đơn vị đo độ dài: cm.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được việc đo độ dài bằng thước thẳng với đơn vị đo là cm; Nhận biết được giờ đúng trên đồng hồ."
        }
      }
    ]
  },
  2: {
    "Số và Phép tính": [
      { 
        contentName: "Số tự nhiên trong phạm vi 1000", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Đếm, đọc, viết được các số trong phạm vi 1000; Nhận biết được số tròn trăm; Nhận biết được các thành phần của phép cộng, phép trừ, phép nhân, phép chia.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết được cách so sánh hai số trong phạm vi 1000; Nhận biết ý nghĩa thực tiễn của phép tính (cộng, trừ, nhân, chia).",
          [CognitiveLevel.APPLICATION]: "Thực hiện được phép cộng, phép trừ (có nhớ không quá một lượt) các số trong phạm vi 1000; Vận dụng được bảng nhân 2, bảng nhân 5, bảng chia 2, bảng chia 5."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Hình học và Đo lường cơ bản", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được điểm, đoạn thẳng, đường cong, đường thẳng, đường gấp khúc; Nhận dạng được hình tứ giác, khối trụ, khối cầu; Nhận biết đơn vị khối lượng kg, đơn vị dung tích lít.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết được các đơn vị đo độ dài dm, m, km và quan hệ giữa chúng.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được việc vẽ đoạn thẳng có độ dài cho trước; Thực hiện được việc chuyển đổi và tính toán với các số đo độ dài, khối lượng, dung tích đã học."
        }
      }
    ]
  },
  3: {
    "Số và Phép tính": [
      { 
        contentName: "Số tự nhiên và Phân số", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Đọc, viết được các số trong phạm vi 100 000; Nhận biết được chữ số La Mã; Nhận biết được về phân số 1/2, 1/3, ..., 1/9.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết được tính chất giao hoán, kết hợp của phép cộng, phép nhân.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được phép cộng, phép trừ các số có đến 5 chữ số; Thực hiện được phép nhân, chia với số có một chữ số."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Hình học và Đo lường nâng cao", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được điểm ở giữa, trung điểm của đoạn thẳng; Nhận biết được góc vuông, góc không vuông; Nhận biết tâm, bán kính, đường kính của hình tròn.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết được đơn vị diện tích cm2; Nhận biết các đơn vị đo khối lượng g, dung tích ml.",
          [CognitiveLevel.APPLICATION]: "Tính được chu vi tam giác, tứ giác, hình chữ nhật, hình vuông; Tính được diện tích hình chữ nhật, hình vuông."
        }
      }
    ]
  },
  4: {
    "Số và Phép tính": [
      { 
        contentName: "Số tự nhiên và Phân số nâng cao", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Đọc, viết được các số đến lớp triệu; Nhận biết được khái niệm phân số, tử số, mẫu số.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết được tính chất cơ bản của phân số; So sánh được các phân số.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được 4 phép tính với phân số; Tính được số trung bình cộng của hai hay nhiều số."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Hình học phẳng và Đại lượng", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được góc nhọn, góc tù, góc bẹt; Nhận biết được hai đường thẳng vuông góc, song song; Nhận biết hình bình hành, hình thoi.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết các đơn vị đo khối lượng yến, tạ, tấn; Nhận biết đơn vị diện tích dm2, m2, mm2; Nhận biết đơn vị đo góc: độ.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được việc vẽ đường thẳng vuông góc, song song; Thực hiện được việc chuyển đổi và tính toán với các số đo đại lượng đã học."
        }
      }
    ]
  },
  5: {
    "Số và Phép tính": [
      { 
        contentName: "Số thập phân và Tỉ số phần trăm", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Đọc, viết được số thập phân; Nhận biết được tỉ số, tỉ số phần trăm của hai đại lượng.",
          [CognitiveLevel.COMPREHENSION]: "So sánh được các số thập phân; Hiểu ý nghĩa của tỉ số phần trăm.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được 4 phép tính với số thập phân; Giải quyết được các bài toán liên quan đến tỉ số phần trăm."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Hình khối và Đo lường nâng cao", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được hình thang, hình tròn; Nhận biết hình khai triển của hình lập phương, hình hộp chữ nhật, hình trụ; Nhận biết đơn vị đo thể tích cm3, dm3, m3.",
          [CognitiveLevel.COMPREHENSION]: "Hiểu công thức tính diện tích hình tam giác, hình thang, hình tròn.",
          [CognitiveLevel.APPLICATION]: "Tính được diện tích xung quanh, diện tích toàn phần, thể tích của hình hộp chữ nhật, hình lập phương; Giải quyết bài toán về chuyển động đều."
        }
      }
    ]
  },
  6: {
    "Số và Đại số": [
      { 
        contentName: "Số tự nhiên và Số nguyên", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Sử dụng được thuật ngữ tập hợp; Nhận biết được tập hợp các số tự nhiên, số nguyên; Nhận biết được số đối của một số nguyên.",
          [CognitiveLevel.COMPREHENSION]: "Vận dụng được các tính chất giao hoán, kết hợp, phân phối trong tính toán; Nhận biết được quan hệ chia hết, khái niệm ước và bội.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được các phép tính trong tập hợp số tự nhiên, số nguyên; Vận dụng được dấu hiệu chia hết cho 2, 5, 9, 3."
        }
      },
      {
        contentName: "Phân số và Số thập phân",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được phân số với tử và mẫu là số nguyên; Nhận biết được số thập phân âm, số đối của số thập phân.",
          [CognitiveLevel.COMPREHENSION]: "So sánh được hai phân số, hai số thập phân.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được các phép tính cộng, trừ, nhân, chia với phân số và số thập phân; Tính được giá trị phân số của một số cho trước."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Hình học trực quan và Hình học phẳng", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận dạng được tam giác đều, hình vuông, lục giác đều, hình chữ nhật, hình thoi, hình bình hành, hình thang cân; Nhận biết được điểm, đường thẳng, tia, đoạn thẳng, góc.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết được trục đối xứng và tâm đối xứng của một hình phẳng.",
          [CognitiveLevel.APPLICATION]: "Tính được chu vi và diện tích của các hình phẳng đã học; Sử dụng được thước, compa, êke để vẽ hình."
        }
      }
    ]
  },
  7: {
    "Số và Đại số": [
      { 
        contentName: "Số hữu tỉ và Số thực", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được số hữu tỉ, số thực, số vô tỉ; Nhận biết được số đối, giá trị tuyệt đối của một số thực.",
          [CognitiveLevel.COMPREHENSION]: "Nhận biết được căn bậc hai số học của một số không âm; Nhận biết được tỉ lệ thức và dãy tỉ số bằng nhau.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được các phép tính trong tập hợp số hữu tỉ; Giải được các bài toán đơn giản về đại lượng tỉ lệ thuận, tỉ lệ nghịch."
        }
      },
      {
        contentName: "Biểu thức đại số",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được biểu thức số, biểu thức đại số; Nhận biết được đa thức một biến, nghiệm của đa thức một biến.",
          [CognitiveLevel.COMPREHENSION]: "Tính được giá trị của một biểu thức đại số.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được các phép tính cộng, trừ, nhân, chia đa thức một biến."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Hình học trực quan và Hình học phẳng nâng cao", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được hình lăng trụ đứng tam giác, lăng trụ đứng tứ giác; Nhận biết được các góc ở vị trí đặc biệt, tia phân giác; Nhận biết được hai tam giác bằng nhau.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được định lí về tổng các góc trong một tam giác bằng 180 độ; Giải thích được các trường hợp bằng nhau của tam giác.",
          [CognitiveLevel.APPLICATION]: "Tính được diện tích xung quanh và thể tích của hình lăng trụ đứng; Chứng minh được các đoạn thẳng bằng nhau, góc bằng nhau dựa trên tam giác bằng nhau."
        }
      }
    ]
  },
  8: {
    "Số và Đại số": [
      { 
        contentName: "Đa thức và Hằng đẳng thức", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được đơn thức, đa thức nhiều biến; Nhận biết được các hằng đẳng thức đáng nhớ.",
          [CognitiveLevel.COMPREHENSION]: "Mô tả được các tính chất cơ bản của phân thức đại số.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được việc thu gọn đơn thức, đa thức; Vận dụng được hằng đẳng thức để phân tích đa thức thành nhân tử."
        }
      },
      {
        contentName: "Hàm số và Phương trình",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được khái niệm hàm số, đồ thị hàm số; Nhận biết được phương trình bậc nhất một ẩn.",
          [CognitiveLevel.COMPREHENSION]: "Thiết lập được bảng giá trị và vẽ được đồ thị hàm số bậc nhất; Hiểu cách giải phương trình bậc nhất một ẩn.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được hàm số bậc nhất và đồ thị vào giải quyết bài toán thực tiễn; Giải được phương trình bậc nhất một ẩn."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Định lí Pythagore và Tứ giác", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được hình chóp tam giác đều, hình chóp tứ giác đều; Nhận biết được các loại tứ giác đặc biệt (hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông).",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được định lí Pythagore; Giải thích được tính chất và dấu hiệu nhận biết các tứ giác đặc biệt.",
          [CognitiveLevel.APPLICATION]: "Tính được độ dài cạnh trong tam giác vuông bằng định lí Pythagore; Tính được diện tích xung quanh và thể tích của hình chóp đều."
        }
      },
      {
        contentName: "Định lí Thalès và Hình đồng dạng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được hình đồng dạng phối cảnh, hình đồng dạng.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được định lí Thalès trong tam giác; Giải thích được các trường hợp đồng dạng của tam giác.",
          [CognitiveLevel.APPLICATION]: "Tính được độ dài đoạn thẳng bằng định lí Thalès; Giải quyết bài toán thực tiễn bằng kiến thức tam giác đồng dạng."
        }
      }
    ]
  },
  9: {
    "Số và Đại số": [
      { 
        contentName: "Căn thức và Hàm số bậc hai", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được căn bậc hai, căn bậc ba của số thực; Nhận biết được đồ thị hàm số y = ax^2.",
          [CognitiveLevel.COMPREHENSION]: "Hiểu các phép biến đổi đơn giản về căn thức bậc hai; Hiểu tính đối xứng của đồ thị hàm số y = ax^2.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được các phép tính về căn bậc hai; Vẽ được đồ thị hàm số y = ax^2."
        }
      },
      {
        contentName: "Phương trình và Bất phương trình",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được phương trình bậc nhất hai ẩn, hệ hai phương trình bậc nhất hai ẩn; Nhận biết được bất đẳng thức, bất phương trình bậc nhất một ẩn.",
          [CognitiveLevel.COMPREHENSION]: "Hiểu định lí Viète và ứng dụng; Hiểu cách giải hệ phương trình và bất phương trình.",
          [CognitiveLevel.APPLICATION]: "Giải được hệ hai phương trình bậc nhất hai ẩn; Giải được phương trình bậc hai một ẩn; Giải được bất phương trình bậc nhất một ẩn."
        }
      }
    ],
    "Hình học và Đo lường": [
      { 
        contentName: "Hệ thức lượng và Đường tròn", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được các giá trị lượng giác của góc nhọn; Nhận biết được tâm đối xứng, trục đối xứng của đường tròn; Nhận biết được tứ giác nội tiếp.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được các hệ thức về cạnh và góc trong tam giác vuông; Giải thích được các vị trí tương đối của đường thẳng và đường tròn, của hai đường tròn.",
          [CognitiveLevel.APPLICATION]: "Vận dụng tỉ số lượng giác để giải tam giác vuông; Chứng minh được tứ giác nội tiếp và vận dụng tính chất tứ giác nội tiếp."
        }
      },
      {
        contentName: "Hình khối và Đa giác đều",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được hình trụ, hình nón, hình cầu; Nhận dạng được đa giác đều.",
          [CognitiveLevel.COMPREHENSION]: "Hiểu các công thức tính diện tích và thể tích của hình trụ, hình nón, hình cầu.",
          [CognitiveLevel.APPLICATION]: "Tính được diện tích xung quanh, thể tích của hình trụ, hình nón, hình cầu; Thực hiện được phép quay giữ nguyên hình đa giác đều."
        }
      }
    ]
  },
  10: {
    "Mệnh đề và Tập hợp": [
      { 
        contentName: "Mệnh đề toán học và Tập hợp", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Thiết lập và phát biểu được các mệnh đề toán học; Nhận biết được các khái niệm cơ bản về tập hợp.",
          [CognitiveLevel.COMPREHENSION]: "Xác định được tính đúng/sai của mệnh đề; Hiểu các phép toán trên tập hợp.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được các phép toán trên tập hợp (hợp, giao, hiệu, phần bù); Vận dụng biểu đồ Ven để giải toán."
        }
      }
    ],
    "Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn": [
      { 
        contentName: "Bất phương trình bậc nhất hai ẩn", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được bất phương trình và hệ bất phương trình bậc nhất hai ẩn.",
          [CognitiveLevel.COMPREHENSION]: "Biểu diễn được miền nghiệm của bất phương trình và hệ bất phương trình bậc nhất hai ẩn trên mặt phẳng toạ độ.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức về hệ bất phương trình bậc nhất hai ẩn vào giải quyết bài toán thực tiễn (tìm cực trị trên miền đa giác)."
        }
      }
    ],
    "Hàm số bậc hai và Đồ thị": [
      { 
        contentName: "Hàm số và Đồ thị bậc hai", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được các khái niệm cơ bản về hàm số; Nhận biết được các tính chất cơ bản của Parabola.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được định lí về dấu của tam thức bậc hai; Hiểu cách vẽ đồ thị hàm số bậc hai.",
          [CognitiveLevel.APPLICATION]: "Vẽ được Parabola; Giải được bất phương trình bậc hai một ẩn; Vận dụng hàm số bậc hai vào giải quyết bài toán thực tiễn."
        }
      }
    ],
    "Đại số tổ hợp": [
      {
        contentName: "Quy tắc đếm và Nhị thức Newton",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Tính được số các hoán vị, chỉnh hợp, tổ hợp.",
          [CognitiveLevel.COMPREHENSION]: "Vận dụng được quy tắc cộng và quy tắc nhân trong các tình huống đơn giản; Hiểu sơ đồ hình cây.",
          [CognitiveLevel.APPLICATION]: "Khai triển được nhị thức Newton (a + b)^n với n = 4 hoặc n = 5."
        }
      }
    ],
    "Hình học phẳng": [
      {
        contentName: "Vectơ và Hệ thức lượng trong tam giác",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được khái niệm vectơ, các phép toán vectơ; Nhận biết được giá trị lượng giác của một góc từ 0 đến 180 độ.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được các hệ thức lượng cơ bản trong tam giác (định lí côsin, định lí sin).",
          [CognitiveLevel.APPLICATION]: "Thực hiện được các phép toán trên vectơ; Vận dụng hệ thức lượng để giải tam giác và bài toán thực tiễn."
        }
      },
      {
        contentName: "Phương pháp toạ độ trong mặt phẳng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được toạ độ của vectơ, phương trình tổng quát và tham số của đường thẳng; Nhận biết phương trình đường tròn, ba đường conic.",
          [CognitiveLevel.COMPREHENSION]: "Thiết lập được phương trình đường thẳng, đường tròn; Hiểu điều kiện song song, vuông góc giữa hai đường thẳng.",
          [CognitiveLevel.APPLICATION]: "Vận dụng phương pháp toạ độ để giải các bài toán liên quan đến đường thẳng, đường tròn và thực tiễn."
        }
      }
    ]
  },
  11: {
    "Hàm số lượng giác và Phương trình lượng giác": [
      { 
        contentName: "Lượng giác", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được các khái niệm về góc lượng giác, giá trị lượng giác; Nhận biết được đồ thị các hàm số lượng giác cơ bản.",
          [CognitiveLevel.COMPREHENSION]: "Mô tả được các phép biến đổi lượng giác cơ bản; Giải thích được tập xác định, tập giá trị, tính tuần hoàn của hàm số lượng giác.",
          [CognitiveLevel.APPLICATION]: "Giải được phương trình lượng giác cơ bản; Vận dụng lượng giác vào giải quyết bài toán thực tiễn (dao động điều hoà)."
        }
      }
    ],
    "Dãy số. Cấp số cộng và Cấp số nhân": [
      { 
        contentName: "Dãy số và Cấp số", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được dãy số hữu hạn, vô hạn; Nhận biết được cấp số cộng, cấp số nhân.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được công thức số hạng tổng quát của cấp số cộng, cấp số nhân.",
          [CognitiveLevel.APPLICATION]: "Tính được tổng n số hạng đầu tiên của cấp số cộng, cấp số nhân; Giải quyết bài toán thực tiễn liên quan đến cấp số."
        }
      }
    ],
    "Giới hạn. Hàm số liên tục": [
      {
        contentName: "Giới hạn và Tính liên tục",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được khái niệm giới hạn của dãy số, giới hạn của hàm số; Nhận dạng được hàm số liên tục.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được một số giới hạn cơ bản; Hiểu tính liên tục của các hàm số sơ cấp.",
          [CognitiveLevel.APPLICATION]: "Tính được giới hạn của dãy số, hàm số bằng các phép toán giới hạn; Vận dụng tính liên tục để xét tính chất của hàm số."
        }
      }
    ],
    "Hàm số mũ và Hàm số lôgarit": [
      {
        contentName: "Luỹ thừa, Mũ và Lôgarit",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được khái niệm luỹ thừa, lôgarit; Nhận biết được hàm số mũ, hàm số lôgarit.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được các tính chất của luỹ thừa, lôgarit; Hiểu đồ thị hàm số mũ, lôgarit.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được các phép tính luỹ thừa, lôgarit; Giải được phương trình, bất phương trình mũ và lôgarit đơn giản."
        }
      }
    ],
    "Đạo hàm": [
      {
        contentName: "Đạo hàm và Ứng dụng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được định nghĩa đạo hàm, ý nghĩa hình học của đạo hàm; Nhận biết được đạo hàm cấp hai.",
          [CognitiveLevel.COMPREHENSION]: "Hiểu các quy tắc tính đạo hàm của tổng, hiệu, tích, thương và hàm hợp.",
          [CognitiveLevel.APPLICATION]: "Tính được đạo hàm của các hàm số sơ cấp; Thiết lập được phương trình tiếp tuyến của đồ thị hàm số."
        }
      }
    ],
    "Hình học không gian": [
      {
        contentName: "Quan hệ song song và vuông góc",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được các quan hệ liên thuộc cơ bản; Nhận biết đường thẳng, mặt phẳng song song, vuông góc.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được các điều kiện song song, vuông góc; Hiểu khái niệm phép chiếu song song, phép chiếu vuông góc.",
          [CognitiveLevel.APPLICATION]: "Xác định được giao tuyến, giao điểm; Vận dụng quan hệ song song, vuông góc để giải bài tập và mô tả thực tiễn."
        }
      }
    ]
  },
  12: {
    "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số": [
      { 
        contentName: "Khảo sát hàm số", 
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được tính đơn điệu, điểm cực trị, giá trị cực trị của hàm số; Nhận biết được hình ảnh hình học của các đường tiệm cận.",
          [CognitiveLevel.COMPREHENSION]: "Mô tả được sơ đồ tổng quát để khảo sát hàm số; Hiểu cách tìm giá trị lớn nhất, nhỏ nhất của hàm số.",
          [CognitiveLevel.APPLICATION]: "Khảo sát và vẽ được đồ thị của các hàm số đa thức và phân thức hữu tỉ; Vận dụng đạo hàm để giải quyết bài toán tối ưu thực tiễn."
        }
      }
    ],
    "Nguyên hàm. Tích phân": [
      {
        contentName: "Nguyên hàm và Tích phân",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được khái niệm nguyên hàm, tích phân; Nhận biết bảng nguyên hàm của một số hàm số sơ cấp.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được các tính chất của nguyên hàm, tích phân; Hiểu ý nghĩa hình học của tích phân.",
          [CognitiveLevel.APPLICATION]: "Tính được nguyên hàm, tích phân trong những trường hợp đơn giản; Sử dụng tích phân để tính diện tích hình phẳng, thể tích vật thể tròn xoay."
        }
      }
    ],
    "Phương pháp toạ độ trong không gian": [
      {
        contentName: "Toạ độ trong không gian Oxyz",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được toạ độ của vectơ trong không gian; Nhận biết phương trình mặt phẳng, đường thẳng, mặt cầu.",
          [CognitiveLevel.COMPREHENSION]: "Thiết lập được phương trình mặt phẳng, đường thẳng, mặt cầu; Hiểu điều kiện song song, vuông góc trong không gian.",
          [CognitiveLevel.APPLICATION]: "Vận dụng phương pháp toạ độ để giải quyết các bài toán liên quan đến vị trí tương đối, khoảng cách và góc trong không gian."
        }
      }
    ]
  }
};

export const SAMPLE_TOPICS_BY_GRADE_PHYSICS: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  10: {
    "Mở đầu": [
      {
        contentName: "Giới thiệu mục đích học tập môn Vật lí",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được đối tượng nghiên cứu của Vật lí học và mục tiêu của môn Vật lí.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được một số ảnh hưởng của vật lí đối với cuộc sống, đối với sự phát triển của khoa học, công nghệ và kĩ thuật.",
          [CognitiveLevel.APPLICATION]: "Nêu được ví dụ chứng tỏ kiến thức, kĩ năng vật lí được sử dụng trong một số lĩnh vực khác nhau."
        }
      },
      {
        contentName: "Phương pháp nghiên cứu vật lí, sai số và an toàn",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được một số ví dụ về phương pháp nghiên cứu vật lí (phương pháp thực nghiệm và phương pháp lí thuyết).",
          [CognitiveLevel.COMPREHENSION]: "Mô tả được các bước trong tiến trình tìm hiểu thế giới tự nhiên dưới góc độ vật lí.",
          [CognitiveLevel.APPLICATION]: "Thảo luận để nêu được: Một số loại sai số đơn giản hay gặp khi đo các đại lượng vật lí và cách khắc phục chúng; Các quy tắc an toàn trong nghiên cứu và học tập môn Vật lí."
        }
      }
    ],
    "Động học": [
      {
        contentName: "Mô tả chuyển động",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Định nghĩa được tốc độ theo một phương, độ dịch chuyển.",
          [CognitiveLevel.COMPREHENSION]: "So sánh được quãng đường đi được và độ dịch chuyển. Lập luận để rút ra được công thức tính tốc độ trung bình. Vẽ được đồ thị độ dịch chuyển – thời gian trong chuyển động thẳng.",
          [CognitiveLevel.APPLICATION]: "Tính được tốc độ từ độ dốc của đồ thị độ dịch chuyển – thời gian. Xác định được độ dịch chuyển tổng hợp, vận tốc tổng hợp. Thiết kế phương án đo tốc độ bằng dụng cụ thực hành."
        }
      },
      {
        contentName: "Chuyển động biến đổi",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được ý nghĩa, đơn vị của gia tốc.",
          [CognitiveLevel.COMPREHENSION]: "Rút ra được công thức tính gia tốc, các công thức của chuyển động thẳng biến đổi đều. Vẽ được đồ thị vận tốc – thời gian.",
          [CognitiveLevel.APPLICATION]: "Vận dụng đồ thị vận tốc – thời gian để tính được độ dịch chuyển và gia tốc. Thiết kế phương án đo gia tốc rơi tự do bằng dụng cụ thực hành."
        }
      }
    ],
    "Động lực học": [
      {
        contentName: "Ba định luật Newton về chuyển động",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Phát biểu định luật 1, 2, 3 Newton. Nêu được khối lượng là đại lượng đặc trưng cho mức quán tính của vật.",
          [CognitiveLevel.COMPREHENSION]: "Rút ra được biểu thức a = F/m hoặc F = ma. Giải thích được chuyển động rơi trong trường trọng lực đều khi có sức cản của không khí.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được định luật 2, 3 Newton trong một số trường hợp đơn giản. Vận dụng được mối liên hệ đơn vị dẫn xuất với 7 đơn vị cơ bản của hệ SI."
        }
      },
      {
        contentName: "Một số lực trong thực tiễn",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được trọng lực, lực ma sát, lực cản, lực nâng, lực căng dây.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được lực nâng tác dụng lên một vật ở trong nước hoặc trong không khí.",
          [CognitiveLevel.APPLICATION]: "Biểu diễn được các lực bằng hình vẽ."
        }
      },
      {
        contentName: "Cân bằng lực, moment lực",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm moment lực, moment ngẫu lực.",
          [CognitiveLevel.COMPREHENSION]: "Rút ra được điều kiện để vật cân bằng: lực tổng hợp bằng không và tổng moment lực bằng không.",
          [CognitiveLevel.APPLICATION]: "Tổng hợp được các lực trên một mặt phẳng. Phân tích được một lực thành các lực thành phần vuông góc. Vận dụng được quy tắc moment cho một số trường hợp đơn giản."
        }
      }
    ],
    "Khối lượng riêng, áp suất chất lỏng": [
      {
        contentName: "Khối lượng riêng, áp suất chất lỏng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được định nghĩa khối lượng riêng.",
          [CognitiveLevel.COMPREHENSION]: "Thành lập được phương trình Δp = ρgΔh.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được phương trình Δp = ρgΔh trong một số trường hợp đơn giản; thiết kế được mô hình minh hoạ."
        }
      }
    ],
    "Công, năng lượng, công suất": [
      {
        contentName: "Công và năng lượng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được biểu thức tính công, đơn vị đo công.",
          [CognitiveLevel.COMPREHENSION]: "Trình bày được ví dụ truyền năng lượng từ vật này sang vật khác bằng cách thực hiện công.",
          [CognitiveLevel.APPLICATION]: "Tính được công trong một số trường hợp đơn giản. Chế tạo mô hình minh hoạ định luật bảo toàn năng lượng."
        }
      },
      {
        contentName: "Động năng và thế năng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được công thức tính thế năng trọng trường, khái niệm cơ năng.",
          [CognitiveLevel.COMPREHENSION]: "Rút ra được động năng của vật bằng công của lực tác dụng. Phân tích được sự chuyển hoá động năng và thế năng.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được định luật bảo toàn cơ năng trong một số trường hợp đơn giản."
        }
      },
      {
        contentName: "Công suất và hiệu suất",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được định nghĩa công suất, hiệu suất.",
          [CognitiveLevel.COMPREHENSION]: "Thảo luận để nêu được ý nghĩa vật lí của công suất và hiệu suất.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được mối liên hệ công suất với lực và vận tốc. Vận dụng được hiệu suất trong một số trường hợp thực tế."
        }
      }
    ],
    "Động lượng": [
      {
        contentName: "Động lượng và va chạm",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được định nghĩa động lượng, phát biểu định luật bảo toàn động lượng.",
          [CognitiveLevel.COMPREHENSION]: "Rút ra được mối liên hệ giữa lực tổng hợp và tốc độ thay đổi của động lượng. Giải thích được một số hiện tượng đơn giản.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được định luật bảo toàn động lượng trong một số trường hợp đơn giản. Xác định được tốc độ và đánh giá động lượng trước và sau va chạm bằng dụng cụ thực hành."
        }
      }
    ],
    "Chuyển động tròn": [
      {
        contentName: "Chuyển động tròn đều",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được định nghĩa radian, khái niệm tốc độ góc.",
          [CognitiveLevel.COMPREHENSION]: "Biểu diễn được độ dịch chuyển góc theo radian.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được biểu thức gia tốc hướng tâm a = rω², a = v²/r và lực hướng tâm F = mrω², F = mv²/r."
        }
      }
    ],
    "Biến dạng của vật rắn": [
      {
        contentName: "Biến dạng của vật rắn. Định luật Hooke",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được sự biến dạng kéo, nén; các đặc tính của lò xo: giới hạn đàn hồi, độ dãn, độ cứng.",
          [CognitiveLevel.COMPREHENSION]: "Thảo luận để tìm mối liên hệ giữa lực đàn hồi và độ biến dạng, từ đó phát biểu định luật Hooke.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được định luật Hooke trong một số trường hợp đơn giản."
        }
      }
    ]
  },
  11: {
    "Dao động": [
      {
        contentName: "Dao động điều hoà",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được định nghĩa: biên độ, chu kì, tần số, tần số góc, độ lệch pha.",
          [CognitiveLevel.COMPREHENSION]: "Dùng đồ thị li độ – thời gian để mô tả dao động. Phân tích sự chuyển hoá động năng và thế năng trong dao động điều hoà.",
          [CognitiveLevel.APPLICATION]: "Vận dụng các phương trình về li độ, vận tốc, gia tốc của dao động điều hoà. Xác định các đại lượng từ đồ thị."
        }
      },
      {
        contentName: "Dao động tắt dần và cộng hưởng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được ví dụ thực tế về dao động tắt dần, dao động cưỡng bức và hiện tượng cộng hưởng.",
          [CognitiveLevel.COMPREHENSION]: "Thảo luận, đánh giá được sự có lợi hay có hại của cộng hưởng trong một số trường hợp cụ thể."
        }
      }
    ],
    "Sóng": [
      {
        contentName: "Mô tả sóng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả sóng qua các khái niệm bước sóng, biên độ, tần số, tốc độ và cường độ sóng. Nêu được ví dụ sóng truyền năng lượng.",
          [CognitiveLevel.COMPREHENSION]: "Rút ra được biểu thức v = λf. Sử dụng mô hình sóng giải thích tính chất của âm thanh và ánh sáng.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được biểu thức v = λf. So sánh được sóng dọc và sóng ngang."
        }
      },
      {
        contentName: "Sóng điện từ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được trong chân không, tất cả các sóng điện từ đều truyền với cùng tốc độ. Liệt kê được bậc độ lớn bước sóng của các bức xạ chủ yếu trong thang sóng điện từ."
        }
      },
      {
        contentName: "Giao thoa sóng và sóng dừng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Xác định được nút và bụng của sóng dừng.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích điều kiện để quan sát được hệ vân giao thoa. Giải thích sự hình thành sóng dừng.",
          [CognitiveLevel.APPLICATION]: "Vận dụng biểu thức i = λD/a cho giao thoa ánh sáng. Đo tốc độ truyền âm bằng dụng cụ thực hành."
        }
      }
    ],
    "Trường điện (Điện trường)": [
      {
        contentName: "Lực điện và điện trường",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Phát biểu định luật Coulomb, nêu đơn vị đo điện tích. Nêu khái niệm điện trường.",
          [CognitiveLevel.COMPREHENSION]: "Mô tả sự hút hoặc đẩy giữa các điện tích. Sử dụng biểu thức tính lực Coulomb và cường độ điện trường.",
          [CognitiveLevel.APPLICATION]: "Vận dụng biểu thức E = Q/4πε₀r². Vẽ được điện phổ trong một số trường hợp đơn giản."
        }
      },
      {
        contentName: "Điện trường đều, điện thế và tụ điện",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Định nghĩa điện thế, điện dung và đơn vị đo.",
          [CognitiveLevel.COMPREHENSION]: "Sử dụng biểu thức E = U/d cho điện trường đều. Thảo luận về thế năng của điện tích trong điện trường.",
          [CognitiveLevel.APPLICATION]: "Vận dụng mối liên hệ V = A/q. Vận dụng công thức điện dung cho bộ tụ ghép nối tiếp, song song. Xây dựng biểu thức tính năng lượng tụ điện."
        }
      }
    ],
    "Dòng điện, mạch điện": [
      {
        contentName: "Cường độ dòng điện, mạch điện và điện trở",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Định nghĩa cường độ dòng điện, điện trở, suất điện động. Phát biểu định luật Ohm.",
          [CognitiveLevel.COMPREHENSION]: "Vẽ phác đường đặc trưng I – U. Mô tả ảnh hưởng của nhiệt độ lên điện trở. So sánh suất điện động và hiệu điện thế.",
          [CognitiveLevel.APPLICATION]: "Vận dụng biểu thức I = Snve. Đo suất điện động và điện trở trong bằng dụng cụ thực hành."
        }
      },
      {
        contentName: "Năng lượng và công suất điện",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được năng lượng điện tiêu thụ và công suất tiêu thụ điện của đoạn mạch.",
          [CognitiveLevel.APPLICATION]: "Tính được năng lượng điện và công suất tiêu thụ năng lượng điện của đoạn mạch."
        }
      }
    ]
  },
  12: {
    "Vật lí nhiệt": [
      {
        contentName: "Sự chuyển thể và nội năng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được sơ lược cấu trúc chất rắn, lỏng, khí. Nêu định luật 1 nhiệt động lực học.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích sơ lược hiện tượng nóng chảy, hoá hơi. Nêu mối liên hệ nội năng với năng lượng phân tử.",
          [CognitiveLevel.APPLICATION]: "Vận dụng định luật 1 nhiệt động lực học trong một số trường hợp đơn giản."
        }
      },
      {
        contentName: "Thang nhiệt độ và nhiệt dung riêng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Định nghĩa nhiệt dung riêng, nhiệt nóng chảy riêng, nhiệt hoá hơi riêng. Nêu nhiệt độ không tuyệt đối.",
          [CognitiveLevel.COMPREHENSION]: "Thảo luận về sự truyền năng lượng nhiệt giữa hai vật tiếp xúc. Chuyển đổi giữa thang Celsius and Kelvin.",
          [CognitiveLevel.APPLICATION]: "Thiết kế phương án đo nhiệt dung riêng, nhiệt nóng chảy riêng, nhiệt hoá hơi riêng bằng dụng cụ thực hành."
        }
      }
    ],
    "Khí lí tưởng": [
      {
        contentName: "Mô hình động học phân tử và phương trình trạng thái",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu các giả thuyết của thuyết động học phân tử chất khí. Nêu biểu thức hằng số Boltzmann.",
          [CognitiveLevel.COMPREHENSION]: "Thực hiện thí nghiệm khảo sát định luật Boyle, định luật Charles. Rút ra phương trình trạng thái khí lí tưởng.",
          [CognitiveLevel.APPLICATION]: "Vận dụng phương trình trạng thái khí lí tưởng. Giải thích áp suất khí theo mô hình động học phân tử."
        }
      }
    ],
    "Trường từ (Từ trường)": [
      {
        contentName: "Khái niệm từ trường và lực từ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu định nghĩa từ trường, cảm ứng từ B và đơn vị tesla.",
          [CognitiveLevel.COMPREHENSION]: "Mô tả hướng và độ lớn của lực từ tác dụng lên đoạn dây dẫn mang dòng điện.",
          [CognitiveLevel.APPLICATION]: "Vận dụng biểu thức F = BILsinθ. Thiết kế phương án đo cảm ứng từ bằng cân dòng điện."
        }
      },
      {
        contentName: "Từ thông và cảm ứng điện từ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Định nghĩa từ thông, đơn vị weber. Nêu các giá trị đặc trưng của dòng điện xoay chiều.",
          [CognitiveLevel.COMPREHENSION]: "Vận dụng định luật Faraday và định luật Lenz. Giải thích sự tạo thành và lan truyền sóng điện từ.",
          [CognitiveLevel.APPLICATION]: "Thiết kế phương án tạo ra dòng điện xoay chiều."
        }
      }
    ],
    "Vật lí hạt nhân và phóng xạ": [
      {
        contentName: "Cấu trúc hạt nhân và năng lượng liên kết",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả mô hình nguyên tử. Biểu diễn kí hiệu hạt nhân. Nêu sự phân hạch, tổng hợp hạt nhân.",
          [CognitiveLevel.COMPREHENSION]: "Rút ra sự tồn tại hạt nhân từ thí nghiệm tán xạ α. Thảo luận hệ thức E = mc². Nêu liên hệ giữa năng lượng liên kết riêng và độ bền vững.",
          [CognitiveLevel.APPLICATION]: "Viết đúng phương trình phân rã hạt nhân đơn giản."
        }
      },
      {
        contentName: "Sự phóng xạ và chu kì bán rã",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Định nghĩa độ phóng xạ, chu kì bán rã. Nhận biết biển báo phóng xạ.",
          [CognitiveLevel.COMPREHENSION]: "Mô tả sơ lược tính chất các tia phóng xạ α, β, γ.",
          [CognitiveLevel.APPLICATION]: "Vận dụng công thức H = λN và x = x₀e⁻λt. Tuân thủ quy tắc an toàn phóng xạ."
        }
      }
    ]
  }
};

export const SAMPLE_TOPICS_BY_GRADE_CHEMISTRY: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  10: {
    "Cấu tạo nguyên tử": [
      { contentName: "Thành phần của nguyên tử" },
      { contentName: "Nguyên tố hóa học" },
      { contentName: "Cấu trúc lớp vỏ electron của nguyên tử" }
    ],
    "Bảng tuần hoàn các nguyên tố hóa học": [
      { contentName: "Cấu tạo của bảng tuần hoàn các nguyên tố hóa học" },
      { contentName: "Xu hướng biến đổi một số tính chất của nguyên tử các nguyên tố" }
    ]
  }
};

export const SAMPLE_TOPICS_BY_GRADE_BIOLOGY: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  10: {
    "Giới thiệu chương trình môn Sinh học": [
      { contentName: "Giới thiệu chương trình môn Sinh học và các cấp độ tổ chức của thế giới sống" }
    ],
    "Sinh học tế bào": [
      { contentName: "Thành phần hóa học của tế bào" },
      { contentName: "Cấu trúc tế bào" },
      { contentName: "Chuyển hóa vật chất và năng lượng trong tế bào" },
      { contentName: "Thông tin tế bào" },
      { contentName: "Chu kì tế bào và phân bào" }
    ],
    "Vi sinh vật": [
      { contentName: "Vi sinh vật và các phương pháp nghiên cứu vi sinh vật" },
      { contentName: "Sinh trưởng và sinh sản của vi sinh vật" },
      { contentName: "Một số ứng dụng vi sinh vật trong thực tiễn" }
    ]
  },
  11: {
    "Trao đổi chất và chuyển hóa năng lượng": [
      {
        contentName: "Khái quát về trao đổi chất và chuyển hóa năng lượng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm trao đổi chất và chuyển hóa năng lượng ở sinh vật. Mô tả được vai trò của ATP trong trao đổi chất và chuyển hóa năng lượng.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được mối quan hệ giữa trao đổi chất và chuyển hóa năng lượng.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức về trao đổi chất để giải thích một số hiện tượng thực tiễn."
        }
      },
      {
        contentName: "Trao đổi nước và khoáng ở thực vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được quá trình hấp thụ nước và khoáng ở rễ, vận chuyển nước qua thân, thoát hơi nước qua lá.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được vai trò của thoát hơi nước, giải thích cơ chế đóng mở khí khổng.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức vào thực tiễn trồng trọt: tưới nước, bón phân hợp lý."
        }
      },
      {
        contentName: "Quang hợp ở thực vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm, nguyên liệu, sản phẩm và phương trình tổng quát của quang hợp. Mô tả được pha sáng và pha tối của quang hợp.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được mối quan hệ giữa pha sáng và pha tối. So sánh con đường C3, C4, CAM.",
          [CognitiveLevel.APPLICATION]: "Giải thích ảnh hưởng của các nhân tố ngoại cảnh tới quang hợp và ứng dụng trong nông nghiệp."
        }
      },
      {
        contentName: "Hô hấp ở thực vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu khái niệm, vai trò, phương trình tổng quát của hô hấp tế bào. Mô tả các giai đoạn đường phân, chu trình Krebs, chuỗi chuyền electron.",
          [CognitiveLevel.COMPREHENSION]: "Phân biệt hô hấp hiếu khí và kị khí. Phân tích mối quan hệ giữa quang hợp và hô hấp.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức hô hấp vào bảo quản nông sản, thực phẩm."
        }
      },
      {
        contentName: "Dinh dưỡng và tiêu hóa ở động vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được các nhóm dinh dưỡng. Mô tả cấu tạo và chức năng các cơ quan tiêu hóa của người.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích quá trình tiêu hóa cơ học và hóa học. So sánh tiêu hóa nội bào và ngoại bào.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức xây dựng chế độ ăn uống hợp lý, phòng chống các bệnh tiêu hóa."
        }
      },
      {
        contentName: "Hô hấp ở động vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được các hình thức hô hấp ở động vật (qua bề mặt cơ thể, mang, phổi, ống khí).",
          [CognitiveLevel.COMPREHENSION]: "Phân tích cơ chế trao đổi khí ở phổi và tế bào.",
          [CognitiveLevel.APPLICATION]: "Giải thích ảnh hưởng của ô nhiễm không khí đến hô hấp, liên hệ bảo vệ sức khỏe."
        }
      },
      {
        contentName: "Tuần hoàn máu",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả cấu tạo và chức năng của máu, tim và hệ mạch. Phân biệt hệ tuần hoàn hở và kín, đơn và kép.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích cơ chế điều hòa hoạt động tim mạch.",
          [CognitiveLevel.APPLICATION]: "Giải thích các chỉ số huyết áp, nhịp tim và liên hệ phòng chống bệnh tim mạch."
        }
      }
    ],
    "Cảm ứng": [
      {
        contentName: "Cảm ứng ở thực vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu khái niệm cảm ứng. Mô tả các loại hướng động và ứng động ở thực vật.",
          [CognitiveLevel.COMPREHENSION]: "Phân biệt hướng động và ứng động. Giải thích cơ chế của một số hướng động.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức cảm ứng thực vật vào thực tiễn trồng trọt."
        }
      },
      {
        contentName: "Cảm ứng ở động vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả cấu tạo và chức năng của hệ thần kinh. Nêu cơ chế dẫn truyền xung thần kinh qua synapse.",
          [CognitiveLevel.COMPREHENSION]: "Phân biệt phản xạ có điều kiện và không điều kiện. Phân tích chức năng các bộ phận của não.",
          [CognitiveLevel.APPLICATION]: "Giải thích tác hại của các chất kích thích thần kinh; liên hệ bảo vệ sức khỏe hệ thần kinh."
        }
      }
    ],
    "Sinh trưởng và phát triển": [
      {
        contentName: "Sinh trưởng và phát triển ở thực vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu khái niệm sinh trưởng, phát triển. Mô tả vai trò các hormone thực vật (auxin, gibberellin, cytokinin, ethylene, ABA).",
          [CognitiveLevel.COMPREHENSION]: "Phân tích các nhân tố ảnh hưởng đến sinh trưởng và phát triển thực vật.",
          [CognitiveLevel.APPLICATION]: "Ứng dụng hormone thực vật trong nông nghiệp (kích thích ra rễ, tạo quả không hạt...)."
        }
      },
      {
        contentName: "Sinh trưởng và phát triển ở động vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm sinh trưởng và phát triển ở động vật. Phân biệt phát triển qua biến thái và không qua biến thái.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích vai trò hormone tăng trưởng, hormone sinh dục, thyroxine trong điều hòa sinh trưởng.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức giải thích các hiện tượng sinh trưởng và phát triển bất thường."
        }
      }
    ],
    "Sinh sản": [
      {
        contentName: "Sinh sản ở thực vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Phân biệt sinh sản vô tính và hữu tính ở thực vật. Mô tả quá trình thụ phấn, thụ tinh, hình thành hạt và quả.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích ưu nhược điểm của sinh sản vô tính và hữu tính.",
          [CognitiveLevel.APPLICATION]: "Ứng dụng các phương pháp nhân giống vô tính (chiết, ghép, nuôi cấy mô) trong sản xuất nông nghiệp."
        }
      },
      {
        contentName: "Sinh sản ở động vật",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Phân biệt sinh sản vô tính và hữu tính ở động vật. Mô tả quá trình thụ tinh, phát triển phôi thai ở người.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích cơ chế điều hòa hormone trong sinh sản. So sánh thụ tinh ngoài và thụ tinh trong.",
          [CognitiveLevel.APPLICATION]: "Giải thích cơ sở khoa học của các biện pháp tránh thai; phòng tránh các bệnh lây truyền qua đường tình dục."
        }
      }
    ]
  },
  12: {
    "Di truyền học": [
      {
        contentName: "Cơ chế di truyền và biến dị cấp độ phân tử (ADN, Gen, Mã di truyền)",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả cấu trúc và chức năng của ADN, ARN, protein. Nêu đặc điểm của mã di truyền (bộ ba, thoái hóa, đặc hiệu, phổ biến).",
          [CognitiveLevel.COMPREHENSION]: "Phân tích cơ chế tự nhân đôi ADN, phiên mã (transcription), dịch mã (translation). Giải thích nguyên tắc bổ sung, nguyên tắc khuôn mẫu.",
          [CognitiveLevel.APPLICATION]: "Vận dụng giải bài tập ADN/ARN/Protein (tính số nu, tỉ lệ các loại, trình tự bổ sung). Giải thích các đột biến gen và hậu quả."
        }
      },
      {
        contentName: "Nhiễm sắc thể và cơ chế di truyền cấp độ tế bào",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả cấu trúc NST, bộ NST lưỡng bội, đơn bội. Nêu các giai đoạn nguyên phân và giảm phân.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích ý nghĩa của nguyên phân và giảm phân. Giải thích cơ sở tế bào học của các quy luật di truyền.",
          [CognitiveLevel.APPLICATION]: "Giải bài tập nguyên phân, giảm phân (số tế bào, số NST, số giao tử). Giải thích đột biến NST và hậu quả (thể lệch bội, đa bội)."
        }
      },
      {
        contentName: "Quy luật di truyền của Mendel",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Phát biểu quy luật phân ly và quy luật phân ly độc lập. Nêu điều kiện nghiệm đúng của quy luật Mendel.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích cơ sở tế bào học của quy luật Mendel. Phân tích tỉ lệ phân ly ở F2.",
          [CognitiveLevel.APPLICATION]: "Giải bài toán di truyền 1 và 2 cặp tính trạng (lập sơ đồ lai, xác định kiểu gen, kiểu hình, tỉ lệ phân ly)."
        }
      },
      {
        contentName: "Các quy luật di truyền khác (Liên kết gen, Hoán vị gen, Di truyền giới tính, Di truyền ngoài nhân)",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu đặc điểm liên kết gen hoàn toàn, hoán vị gen, di truyền liên kết với giới tính, di truyền ngoài nhân (qua tế bào chất).",
          [CognitiveLevel.COMPREHENSION]: "Giải thích tần số hoán vị gen và bản đồ gen. Phân biệt di truyền theo dòng mẹ và di truyền NST giới tính.",
          [CognitiveLevel.APPLICATION]: "Giải bài toán liên kết gen – hoán vị gen. Xác định tỉ lệ kiểu hình trong di truyền liên kết giới tính (gen trên NST X, Y)."
        }
      },
      {
        contentName: "Tương tác gen và tác động đa hiệu của gen",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu khái niệm tương tác gen bổ sung, cộng gộp, át chế. Nêu khái niệm gen đa hiệu.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích sự khác biệt về tỉ lệ phân ly F2 khi có tương tác gen so với Mendel.",
          [CognitiveLevel.APPLICATION]: "Giải bài tập tương tác gen (xác định tỉ lệ kiểu hình bất thường 9:3:3:1, 9:7, 9:6:1, 13:3...)."
        }
      },
      {
        contentName: "Di truyền học quần thể",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu khái niệm quần thể tự phối và giao phối ngẫu nhiên. Phát biểu định luật Hardy-Weinberg.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích điều kiện nghiệm đúng của định luật Hardy-Weinberg. Phân tích sự thay đổi tần số alen khi quần thể tự phối.",
          [CognitiveLevel.APPLICATION]: "Vận dụng định luật Hardy-Weinberg tính tần số alen, tần số kiểu gen trong quần thể ngẫu phối. Giải bài tập di truyền quần thể."
        }
      },
      {
        contentName: "Ứng dụng di truyền học: Chọn giống và Công nghệ gen",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu các phương pháp chọn giống thực vật và động vật (gây đột biến, lai giống, đa bội hóa). Mô tả các bước tạo ADN tái tổ hợp và ứng dụng.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích ưu nhược điểm của từng phương pháp chọn giống. Giải thích nguyên lý của PCR, liệu pháp gen.",
          [CognitiveLevel.APPLICATION]: "Đánh giá tác động của GMO, liệu pháp gen đối với y học và nông nghiệp; liên hệ đạo đức sinh học."
        }
      }
    ],
    "Tiến hóa": [
      {
        contentName: "Bằng chứng và cơ chế tiến hóa",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu các bằng chứng tiến hóa (giải phẫu so sánh, phôi sinh học, địa lí sinh vật, hóa thạch, sinh học phân tử). Nêu học thuyết Lamarck, Darwin, thuyết tiến hóa tổng hợp hiện đại.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích các nhân tố tiến hóa: đột biến, di nhập gen, chọn lọc tự nhiên, các yếu tố ngẫu nhiên, giao phối không ngẫu nhiên. Giải thích cơ chế hình thành loài mới.",
          [CognitiveLevel.APPLICATION]: "Vận dụng lý thuyết tiến hóa giải thích sự thích nghi của sinh vật và sự phân ly tính trạng trong quần thể."
        }
      },
      {
        contentName: "Sự phát sinh và phát triển của sự sống trên Trái Đất",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Trình bày được các giai đoạn hình thành sự sống: tiến hóa hóa học, tiền sinh học. Nêu sơ lược lịch sử phát triển sinh vật qua các đại địa chất.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích cơ sở hóa học của sự sống sơ khai (thí nghiệm Miller). Phân tích sự tiến hóa từ đơn bào đến đa bào.",
          [CognitiveLevel.APPLICATION]: "Liên hệ lịch sử tiến hóa với sự xuất hiện các nhóm sinh vật hiện nay."
        }
      }
    ],
    "Sinh thái học": [
      {
        contentName: "Sinh thái học cá thể và quần thể",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu khái niệm môi trường, nhân tố sinh thái, giới hạn sinh thái và ổ sinh thái. Nêu các đặc trưng cơ bản của quần thể (mật độ, tỉ lệ giới tính, tháp tuổi, tốc độ tăng trưởng).",
          [CognitiveLevel.COMPREHENSION]: "Phân tích các nhân tố ảnh hưởng đến kích thước quần thể. Giải thích tăng trưởng theo tiềm năng sinh học và theo nguồn sống. Phân tích các mối quan hệ trong quần thể.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức quần thể để giải bài tập dân số (tính tốc độ tăng trưởng, dự báo dân số). Liên hệ bảo vệ quần thể sinh vật quý hiếm."
        }
      },
      {
        contentName: "Quần xã sinh vật và Hệ sinh thái",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu khái niệm quần xã, hệ sinh thái, sinh quyển. Mô tả các thành phần của hệ sinh thái (sinh vật sản xuất, tiêu thụ, phân giải, môi trường vô sinh). Nêu các dạng hình tháp sinh thái.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích các mối quan hệ giữa các loài trong quần xã. Giải thích diễn thế sinh thái nguyên sinh và thứ sinh. Phân tích dòng năng lượng và chu trình vật chất trong hệ sinh thái.",
          [CognitiveLevel.APPLICATION]: "Tính hiệu suất sinh thái, năng suất sinh học tại các bậc dinh dưỡng. Đề xuất biện pháp bảo vệ đa dạng sinh học và quản lý hệ sinh thái bền vững."
        }
      },
      {
        contentName: "Môi trường và các nhân tố sinh thái",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu khái niệm ô nhiễm môi trường, các tác nhân gây ô nhiễm. Trình bày nguyên nhân suy giảm đa dạng sinh học.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích hậu quả của ô nhiễm môi trường (biến đổi khí hậu, thủng tầng ozone, mưa acid). Giải thích tầm quan trọng của đa dạng sinh học.",
          [CognitiveLevel.APPLICATION]: "Đề xuất các biện pháp bảo vệ môi trường và bảo tồn đa dạng sinh học. Liên hệ trách nhiệm cá nhân trong bảo vệ môi trường."
        }
      }
    ]
  }
};



export const SAMPLE_TOPICS_BY_GRADE_TECHNOLOGY: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  10: {
    "Công nghệ và đời sống": [
      { contentName: "Khái quát về công nghệ" },
      { contentName: "Hệ thống kỹ thuật" }
    ],
    "Vẽ kỹ thuật cơ bản": [
      { contentName: "Tiêu chuẩn trình bày bản vẽ kỹ thuật" },
      { contentName: "Hình chiếu vuông góc" }
    ]
  }
};

export const SAMPLE_TOPICS_BY_GRADE_GEOGRAPHY: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  11: {
    "Địa lí khu vực và quốc gia": [
      {
        contentName: "Liên minh châu Âu (EU)",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được quy mô, vị trí, mục tiêu và thể chế của EU.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được vị thế của EU trong nền kinh tế thế giới.",
          [CognitiveLevel.APPLICATION]: "(NL2) Tính toán tỉ trọng GDP, xuất nhập khẩu của EU so với thế giới."
        }
      },
      {
        contentName: "Khu vực Mỹ Latinh",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm tự nhiên, dân cư, xã hội của khu vực Mỹ Latinh.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được tình hình phát triển kinh tế và các vấn đề xã hội của khu vực.",
          [CognitiveLevel.APPLICATION]: "(NL2) Phân tích số liệu về nợ nước ngoài, tốc độ tăng GDP của các nước Mỹ Latinh."
        }
      },
      {
        contentName: "Khu vực Tây Nam Á",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm vị trí địa lí, điều kiện tự nhiên của Tây Nam Á.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được ảnh hưởng của tài nguyên dầu mỏ và vấn đề xung đột sắc tộc đến phát triển kinh tế.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ để xác định các quốc gia và các điểm nóng chính trị ở Tây Nam Á."
        }
      },
      {
        contentName: "Liên bang Nga",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm tự nhiên, tài nguyên thiên nhiên của Liên bang Nga.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được tình hình phát triển kinh tế và các ngành kinh tế trọng điểm.",
          [CognitiveLevel.APPLICATION]: "(NL2) Vẽ biểu đồ và nhận xét về sự thay đổi GDP của Nga qua các giai đoạn."
        }
      },
      {
        contentName: "Nhật Bản",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm dân cư và tình hình phát triển kinh tế Nhật Bản.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được các nhân tố tạo nên sự phát triển thần kì của kinh tế Nhật Bản.",
          [CognitiveLevel.APPLICATION]: "(NL2) Phân tích bảng số liệu về cơ cấu dân số già của Nhật Bản và tác động của nó."
        }
      },
      {
        contentName: "Trung Quốc",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm tự nhiên và dân cư Trung Quốc.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được kết quả của công cuộc hiện đại hóa kinh tế Trung Quốc.",
          [CognitiveLevel.APPLICATION]: "(NL2) Tính toán tỉ trọng sản lượng một số sản phẩm nông nghiệp, công nghiệp của Trung Quốc so với thế giới."
        }
      },
      {
        contentName: "Australia",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm tự nhiên, dân cư và kinh tế Australia.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được sự phân bố các ngành kinh tế của Australia.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ để phân tích sự phân bố dân cư và các thành phố lớn ở Australia."
        }
      },
      {
        contentName: "Khu vực Đông Nam Á",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm tự nhiên, dân cư, xã hội của Đông Nam Á.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được tình hình phát triển kinh tế và sự hợp tác trong ASEAN.",
          [CognitiveLevel.APPLICATION]: "(NL2) Tính toán mật độ dân số, tỉ lệ dân thành thị của các nước Đông Nam Á."
        }
      }
    ]
  },
  12: {
    "Địa lí tự nhiên": [
      {
        contentName: "Vị trí địa lí và phạm vi lãnh thổ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Xác định được đặc điểm vị trí địa lí; phạm vi lãnh thổ Việt Nam và các tỉnh, thành phố trên bản đồ.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được ảnh hưởng của vị trí địa lí, phạm vi lãnh thổ đến tự nhiên, kinh tế - xã hội và an ninh quốc phòng.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ, công cụ địa lí để giải quyết vấn đề chủ quyền, lãnh thổ."
        }
      },
      {
        contentName: "Thiên nhiên nhiệt đới ẩm gió mùa và ảnh hưởng đến sản xuất, đời sống",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được các biểu hiện của thiên nhiên nhiệt đới ẩm gió mùa thông qua khí hậu và các thành phần tự nhiên khác.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được ảnh hưởng của thiên nhiên nhiệt đới ẩm gió mùa đến sản xuất và đời sống.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng được bản đồ, số liệu thống kê để trình bày đặc điểm thiên nhiên nhiệt đới ẩm gió mùa."
        }
      },
      {
        contentName: "Sự phân hoá đa dạng của thiên nhiên",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Chứng minh được sự phân hoá đa dạng của thiên nhiên Việt Nam theo Bắc - Nam, Đông - Tây, độ cao. Trình bày được đặc điểm tự nhiên của ba miền.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được ảnh hưởng của sự phân hoá đa dạng thiên nhiên đến phát triển kinh tế - xã hội đất nước.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng được bản đồ, số liệu thống kê để chứng minh sự phân hoá đa dạng của thiên nhiên nước ta."
        }
      },
      {
        contentName: "Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày và giải thích được sự suy giảm các loại tài nguyên thiên nhiên ở nước ta. Nêu được một số giải pháp sử dụng hợp lí tài nguyên thiên nhiên.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Chứng minh và giải thích được hiện trạng ô nhiễm môi trường ở Việt Nam. Nêu được các giải pháp bảo vệ môi trường.",
          [CognitiveLevel.APPLICATION]: "(NL3) Viết được đoạn văn ngắn tuyên truyền mọi người trong cộng đồng tham gia vào việc sử dụng hợp lí tài nguyên thiên nhiên hoặc bảo vệ môi trường ở địa phương."
        }
      }
    ],
    "Địa lí dân cư": [
      {
        contentName: "Dân số, lao động và việc làm",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm dân số, phân tích các thế mạnh và hạn chế về dân số. Nêu được chiến lược và giải pháp phát triển dân số. Trình bày được đặc điểm nguồn lao động.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được tình hình sử dụng lao động theo ngành, theo thành phần kinh tế. Phân tích được vấn đề việc làm ở nước ta.",
          [CognitiveLevel.APPLICATION]: "(NL2) Vẽ biểu đồ về dân số. Phân tích các biểu đồ, bảng số liệu về lao động và việc làm."
        }
      },
      {
        contentName: "Đô thị hoá",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm đô thị hoá ở Việt Nam.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được ảnh hưởng của đô thị hoá đến phát triển kinh tế - xã hội.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng được bản đồ, số liệu thống kê để nhận xét và giải thích về đô thị hoá ở nước ta."
        }
      }
    ],
    "Địa lí các ngành kinh tế": [
      {
        contentName: "Chuyển dịch cơ cấu kinh tế",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Phân tích được ý nghĩa của sự chuyển dịch cơ cấu kinh tế ở nước ta.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Nêu và đánh giá vai trò của các thành phần đa dạng trong nền kinh tế xuất khẩu.",
          [CognitiveLevel.APPLICATION]: "(NL2) Phân tích biểu đồ và số liệu thống kê về cơ cấu nền kinh tế."
        }
      },
      {
        contentName: "Địa lí nông nghiệp, lâm nghiệp, thuỷ sản",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Phân tích được các thế mạnh, hạn chế đối với phát triển nông nghiệp, lâm nghiệp và thuỷ sản.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được sự phân bố các vùng nông nghiệp và hình thức tổ chức lãnh thổ.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ, số liệu, tư liệu để trình bày sự phân bố nông nghiệp."
        }
      },
      {
        contentName: "Địa lí công nghiệp",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được sự chuyển dịch cơ cấu công nghiệp theo ngành, lãnh thổ.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được hình thức tổ chức lãnh thổ công nghiệp: khu công nghiệp, khu công nghệ cao.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ, số liệu để phân tích, đánh giá."
        }
      },
      {
        contentName: "Địa lí dịch vụ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Khái quát được vai trò của thương mại, du lịch, giao thông vận tải và bưu chính viễn thông.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được sự đa dạng các ngành dịch vụ ở Việt Nam.",
          [CognitiveLevel.APPLICATION]: "(NL2) Vẽ biểu đồ nhận xét về dịch vụ, du lịch."
        }
      }
    ],
    "Địa lí các vùng kinh tế - xã hội (Chuẩn TT 17/2025)": [
      {
        contentName: "Vùng Trung du và miền núi phía Bắc",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày vị trí địa lí, phạm vi vùng. Phân tích các thế mạnh của vùng dựa trên điều kiện tài nguyên.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được những hạn chế của vùng trong phát triển khu vực, giao thông, hạ tầng.",
          [CognitiveLevel.APPLICATION]: "(NL2) Dùng biểu đồ, bản đồ phân tích xu hướng phát triển của Vùng Trung du và miền núi phía Bắc."
        }
      },
      {
        contentName: "Vùng Đồng bằng sông Hồng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Cập nhật TT17/2025: Trình bày vị trí và các tiềm năng phát triển của Đồng bằng sông Hồng theo vùng kinh tế.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích sức ép dân số đối với sự phát triển kinh tế-xã hội Đồng bằng sông Hồng.",
          [CognitiveLevel.APPLICATION]: "(NL2) Nhận diện định hướng phát triển, so sánh Đồng bằng sông Hồng với các vùng kinh tế lân cận."
        }
      },
      {
        contentName: "Vùng Bắc Trung Bộ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày khái quát vị trí địa lí và điều kiện tự nhiên của Vùng Bắc Trung Bộ.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) So sánh, phân tích các điểm mạnh kinh tế, phát triển du lịch, thủy hải sản của vùng Bắc Trung Bộ.",
          [CognitiveLevel.APPLICATION]: "(NL2) Chỉ ra các nguyên nhân ảnh hưởng bất lợi từ thiên tai bão lũ miền Trung và đề xuất ứng phó."
        }
      },
      {
        contentName: "Vùng Nam Trung Bộ (Duyên hải Nam Trung Bộ và Tây Nguyên)",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Cập nhật TT17/2025: Trình bày vị trí vành đai và nguồn lực tự nhiên của Vùng Nam Trung Bộ (từ duyên hải lên Tây Nguyên).",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Giải thích sự tương hỗ kinh tế và chiến lược giữa vùng biển Duyên hải Nam Trung Bộ và cao nguyên Tây Nguyên.",
          [CognitiveLevel.APPLICATION]: "(NL2) Phân tích mối quan hệ giữa khai thác tài nguyên biển, khoáng sản, rừng và bảo vệ môi trường liên kết vùng."
        }
      },
      {
        contentName: "Vùng Đông Nam Bộ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày các yếu tố thuận lợi giúp Đông Nam Bộ trở thành vùng kinh tế phát triển năng động nhất cả nước.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích vấn đề khai thác tài nguyên lãnh thổ theo chiều sâu trong kinh tế dịch vụ.",
          [CognitiveLevel.APPLICATION]: "(NL2) Đánh giá tình hình quy hoạch vùng và các thách thức với đô thị hóa, môi trường."
        }
      },
      {
        contentName: "Vùng Đồng bằng sông Cửu Long",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Nêu đặc điểm tự nhiên cấu thành Đồng bằng sông Cửu Long và lợi thế nông nghiệp.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày ảnh hưởng sâu sắc của tình trạng ngập mặn và biến đổi khí hậu đối với sự phát triển kinh tế.",
          [CognitiveLevel.APPLICATION]: "(NL2) Vận dụng lý thuyết sử dụng hợp lý nguồn tài nguyên để thích ứng biến đổi khí hậu của Đồng bằng sông Cửu Long."
        }
      },
      {
        contentName: "Phát triển kinh tế biển, đảo và đảm bảo an ninh quốc phòng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được các bộ phận của vùng biển nước ta theo Công ước luật biển. Trình bày thế mạnh kinh tế biển.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích chiến lược phát triển bền vững kinh tế biển kết hợp bảo vệ vững chắc an ninh quốc phòng.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ xác định quần đảo Hoàng Sa, Trường Sa và các hòn đảo mang ý nghĩa chiến lược của Việt Nam."
        }
      }
    ]
  },
  111: {
    "Một số vấn đề về kinh tế - xã hội thế giới": [
      {
        contentName: "Sự khác biệt về trình độ phát triển kinh tế - xã hội của các nhóm nước",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Phân biệt được các nước phát triển và đang phát triển theo chỉ tiêu GDP, GNI, HDI.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được sự khác biệt về kinh tế và xã hội của các nhóm nước.",
          [CognitiveLevel.APPLICATION]: "(NL2) Phân tích bảng số liệu về GDP, HDI của các nhóm nước để rút ra nhận xét."
        }
      },
      {
        contentName: "Toàn cầu hoá và khu vực hoá kinh tế",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được các biểu hiện của toàn cầu hoá và khu vực hoá kinh tế.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích ảnh hưởng của toàn cầu hoá đối với các nước đang phát triển.",
          [CognitiveLevel.APPLICATION]: "(NL3) Đánh giá được cơ hội và thách thức của toàn cầu hóa đối với Việt Nam."
        }
      },
      {
        contentName: "Một số vấn đề an ninh toàn cầu",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Nêu được một số vấn đề an ninh toàn cầu: an ninh lương thực, an ninh năng lượng, an ninh nguồn nước, an ninh mạng.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được sự cần thiết phải bảo vệ hòa bình thế giới.",
          [CognitiveLevel.APPLICATION]: "(NL3) Thu thập tư liệu và viết báo cáo ngắn về một vấn đề an ninh toàn cầu."
        }
      }
    ],
    "Địa lí khu vực và quốc gia": [
      {
        contentName: "Hoa Kỳ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được đặc điểm vị trí địa lí, điều kiện tự nhiên của Hoa Kỳ.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được đặc điểm dân cư và tình hình phát triển kinh tế của Hoa Kỳ.",
          [CognitiveLevel.APPLICATION]: "(NL2) Phân tích bảng số liệu và biểu đồ về kinh tế Hoa Kỳ."
        }
      },
      {
        contentName: "Liên minh châu Âu (EU)",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Xác định được quy mô, mục tiêu và thể chế hoạt động của EU.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được vị thế của EU trong nền kinh tế thế giới.",
          [CognitiveLevel.APPLICATION]: "(NL2) Tính toán tỉ trọng GDP, xuất nhập khẩu của EU so với thế giới."
        }
      }
    ],
    "Địa lí các vùng kinh tế - xã hội": [
      {
        contentName: "Khai thác thế mạnh ở Trung du và miền núi Bắc Bộ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được vị trí địa lí, phạm vi lãnh thổ và dân số của vùng. Chứng minh được các thế mạnh để phát triển kinh tế của vùng về khoáng sản và thuỷ điện, cây trồng cận nhiệt và ôn đới.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được việc khai thác các thế mạnh phát triển kinh tế của vùng và nêu được hướng phát triển. Nêu được ý nghĩa của phát triển kinh tế - xã hội với an ninh quốc phòng.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ và bảng số liệu để trình bày về thế mạnh và việc khai thác các thế mạnh phát triển kinh tế của vùng."
        }
      },
      {
        contentName: "Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được vị trí địa lí, phạm vi lãnh thổ và dân số của vùng. Phân tích được các thế mạnh, hạn chế đối với việc phát triển kinh tế - xã hội của Đồng bằng sông Hồng.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được một số vấn đề về phát triển kinh tế - xã hội của vùng: vấn đề phát triển công nghiệp, dịch vụ, kinh tế biển.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng được bản đồ và bảng số liệu để trình bày về các thế mạnh của vùng."
        }
      },
      {
        contentName: "Phát triển kinh tế - xã hội ở Bắc Trung Bộ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được vị trí địa lí, phạm vi lãnh thổ và dân số của vùng. Phân tích được các thế mạnh và hạn chế đối với việc hình thành và phát triển nông nghiệp, lâm nghiệp và thuỷ sản.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được một số đặc điểm nổi bật về nông nghiệp, lâm nghiệp và thuỷ sản của vùng. Trình bày được một số thế mạnh và tình hình phát triển du lịch của vùng.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng được bản đồ và bảng số liệu để trình bày thế mạnh và hạn chế của Bắc Trung Bộ."
        }
      },
      {
        contentName: "Phát triển kinh tế - xã hội ở Duyên hải Nam Trung Bộ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được vị trí địa lí, phạm vi lãnh thổ và dân số của vùng. Phân tích được các thế mạnh, hạn chế đối với phát triển kinh tế biển, du lịch và công nghiệp.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được tình hình phát triển các ngành kinh tế biển: nghề cá, du lịch biển, dịch vụ hàng hải. Phân tích được vai trò của việc phát triển cơ sở hạ tầng giao thông vận tải.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ để xác định các bãi tôm, bãi cá, các cảng biển và trung tâm du lịch của vùng."
        }
      },
      {
        contentName: "Khai thác thế mạnh ở Tây Nguyên",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được vị trí địa lí, phạm vi lãnh thổ và dân số của vùng. Phân tích được các thế mạnh, hạn chế đối với phát triển các ngành kinh tế.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được tình hình phát triển, phân bố và định hướng phát triển các ngành: thủy điện, khoáng sản (bôxit); cây công nghiệp lâu năm, lâm nghiệp và du lịch. Phân tích được ý nghĩa của phát triển kinh tế - xã hội với quốc phòng an ninh.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng được bản đồ, bảng số liệu để trình bày về thế mạnh phát triển các ngành kinh tế của vùng."
        }
      },
      {
        contentName: "Phát triển kinh tế - xã hội ở Đông Nam Bộ",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được vị trí địa lí, phạm vi lãnh thổ và dân số của vùng. Phân tích được các thế mạnh, hạn chế đối với phát triển kinh tế của vùng.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Trình bày được tình hình phát triển các ngành kinh tế: công nghiệp; dịch vụ; nông nghiệp, kinh tế biển của vùng. Trình bày được mối quan hệ giữa phát triển kinh tế - xã hội với bảo vệ môi trường.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng được bản đồ, số liệu thống kê để trình bày về các thế mạnh và hiện trạng phát triển các ngành kinh tế."
        }
      },
      {
        contentName: "Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được vị trí địa lí, phạm vi lãnh thổ và dân số của vùng. Chứng minh được các thế mạnh, hạn chế để phát triển kinh tế của vùng; trình bày được hướng sử dụng hợp lí tự nhiên của vùng.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Giải thích được tại sao phải sử dụng hợp lí tự nhiên ở Đồng bằng sông Cửu Long. Trình bày được vai trò, tình hình phát triển sản xuất lương thực và thực phẩm của vùng. Trình bày được tài nguyên du lịch và tình hình phát triển du lịch.",
          [CognitiveLevel.APPLICATION]: "(NL2) Vẽ được biểu đồ kinh tế - xã hội, nhận xét và giải thích."
        }
      },
      {
        contentName: "Phát triển kinh tế biển, đảo và đảm bảo an ninh quốc phòng",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Trình bày được các bộ phận của vùng biển nước ta. Trình bày được các thế mạnh và hiện trạng phát triển kinh tế biển.",
          [CognitiveLevel.COMPREHENSION]: "(NL1) Phân tích được ý nghĩa của việc phát triển kinh tế biển đối với an ninh quốc phòng.",
          [CognitiveLevel.APPLICATION]: "(NL2) Sử dụng bản đồ để xác định các đảo, quần đảo và các vùng kinh tế biển."
        }
      }
    ]
  }
};

export const SAMPLE_TOPICS_BY_GRADE_ECONOMICS_LAW: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  10: {
    "Giáo dục kinh tế - Lớp 10": [
      {
        contentName: "Nền kinh tế và các chủ thể của nền kinh tế",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được vai trò của các hoạt động kinh tế cơ bản; Nhận biết được vai trò của các chủ thể kinh tế.",
          [CognitiveLevel.COMPREHENSION]: "Trình bày được trách nhiệm của các chủ thể tham gia kinh tế.",
          [CognitiveLevel.APPLICATION]: "Đánh giá được việc thực hiện trách nhiệm của bản thân với tư cách là người tiêu dùng và công dân."
        }
      },
      {
        contentName: "Thị trường và cơ chế thị trường",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm thị trường, các loại thị trường và chức năng của thị trường.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được ưu điểm và nhược điểm của cơ chế thị trường.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được hiểu biết về thị trường để lý giải một số hiện tượng kinh tế thực tế."
        }
      },
      {
        contentName: "Ngân sách nhà nước và thuế",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm, đặc điểm, vai trò của ngân sách nhà nước và các loại thuế.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được quyền và nghĩa vụ của công dân trong việc thực hiện pháp luật về ngân sách và thuế.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được nghĩa vụ nộp thuế bằng các hành vi phù hợp theo lứa tuổi."
        }
      },
      {
        contentName: "Sản xuất kinh doanh và mô hình kinh doanh",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm sản xuất kinh doanh; Nhận diện được một số mô hình sản xuất.",
          [CognitiveLevel.COMPREHENSION]: "So sánh được ưu, nhược điểm của các mô hình sản xuất kinh doanh khác nhau.",
          [CognitiveLevel.APPLICATION]: "Lập được kế hoạch kinh doanh quy mô nhỏ gọn, phù hợp với năng lực bản thân."
        }
      },
      {
        contentName: "Tín dụng và tài chính cá nhân",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm tín dụng và các tổ chức tín dụng; Mô tả được nội dung kế hoạch tài chính cá nhân.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được vai trò của tín dụng và tầm quan trọng của việc lập kế hoạch tài chính.",
          [CognitiveLevel.APPLICATION]: "Xây dựng được bản lập kế hoạch tài chính thu chi cá nhân cho bản thân."
        }
      }
    ],
    "Giáo dục pháp luật - Lớp 10": [
      {
        contentName: "Pháp luật và Hiến pháp Việt Nam",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm, đặc điểm của pháp luật. Trình bày được bản chất của Hiến pháp.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được vai trò của pháp luật và Hiến pháp đối với đời sống và xã hội.",
          [CognitiveLevel.APPLICATION]: "Đánh giá được hành vi tuân thủ hoặc vi phạm Hiến pháp, pháp luật trong cộng đồng."
        }
      },
      {
        contentName: "Hệ thống chính trị và bộ máy nhà nước",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Trình bày được cơ cấu tổ chức và nguyên tắc hoạt động của hệ thống chính trị và bộ máy nhà nước.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được chức năng cụ thể của cơ quan lập pháp, hành pháp, tư pháp.",
          [CognitiveLevel.APPLICATION]: "Thể hiện được quyền làm chủ của công dân trong việc tham gia giám sát các cơ quan chính quyền địa phương."
        }
      }
    ]
  },
  11: {
    "Giáo dục kinh tế - Lớp 11": [
      {
        contentName: "Cạnh tranh, cung - cầu và lạm phát, thất nghiệp",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm cạnh tranh, cung cầu, lạm phát và thất nghiệp.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được tác động của cạnh tranh, cung cầu; Giải thích được nguyên nhân của lạm phát, thất nghiệp.",
          [CognitiveLevel.APPLICATION]: "Đề xuất được các biện pháp cá nhân hỗ trợ nhà nước kiềm chế lạm phát kinh tế."
        }
      },
      {
        contentName: "Thị trường lao động, việc làm và đạo đức kinh doanh",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Trình bày được khái niệm về thị trường lao động và văn hóa tiêu dùng, đạo đức kinh doanh.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được xu hướng của thị trường lao động hiện nay.",
          [CognitiveLevel.APPLICATION]: "Đánh giá được ý tưởng kinh doanh dựa trên năng lực cá nhân; Thực hiện được hành vi tiêu dùng thông minh, có văn hóa."
        }
      }
    ],
    "Giáo dục pháp luật - Lớp 11": [
      {
        contentName: "Quyền bình đẳng của công dân",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Trình bày được quy định của pháp luật về quyền bình đẳng của công dân (giới, dân tộc, tôn giáo).",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được cơ sở pháp lí và ý nghĩa của các quyền bình đẳng.",
          [CognitiveLevel.APPLICATION]: "Nhận diện và lên án được các hành vi vi phạm sự bình đẳng trong xã hội."
        }
      },
      {
        contentName: "Quyền dân chủ và tự do cơ bản",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được nội dung các quyền dân chủ cơ bản (bầu cử, khiếu nại, tố cáo) và tự do cơ bản của công dân.",
          [CognitiveLevel.COMPREHENSION]: "Phân biệt được hành vi thực hiện quyền dân chủ đúng pháp luật và vi phạm pháp luật.",
          [CognitiveLevel.APPLICATION]: "Vận dụng được quyền khiếu nại, tố cáo để bảo vệ quyền và lợi ích hợp pháp của bản thân."
        }
      }
    ]
  },
  12: {
    "Giáo dục kinh tế - Lớp 12": [
      {
        contentName: "Tăng trưởng, phát triển và hội nhập kinh tế",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được các chỉ tiêu đánh giá tăng trưởng kinh tế và các hình thức hội nhập kinh tế quốc tế.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được mối quan hệ giữa quá trình hội nhập và sự phát triển kinh tế quốc gia.",
          [CognitiveLevel.APPLICATION]: "Đánh giá được tác động của hội nhập đối với cuộc sống của bản thân học sinh."
        }
      },
      {
        contentName: "Bảo hiểm, an sinh xã hội và lập kế hoạch kinh doanh",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Trình bày được khái niệm bảo hiểm, an sinh xã hội; Liệt kê được các bước lập kế hoạch kinh doanh.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được trách nhiệm xã hội của doanh nghiệp đối với người lao động và cộng đồng.",
          [CognitiveLevel.APPLICATION]: "Xây dựng được kế hoạch thu, chi và sử dụng tài chính gia đình trong 1 tháng hợp lí."
        }
      }
    ],
    "Giáo dục pháp luật - Lớp 12": [
      {
        contentName: "Quyền, nghĩa vụ công dân về kinh tế và dân sự",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được nội dung quy định pháp luật về quyền sở hữu tài sản, quyền tự do kinh doanh và hôn nhân gia đình.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được quyền và nghĩa vụ công dân trong đóng góp công ích, bảo vệ môi trường, văn hoá xã hội.",
          [CognitiveLevel.APPLICATION]: "Xử lý được các tình huống vi phạm dân sự thường gặp (ví dụ: tranh chấp tài sản nhỏ, lỗi trong buôn bán)."
        }
      },
      {
        contentName: "Một số vấn đề cơ bản của luật quốc tế",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được các nguyên tắc chung của pháp luật quốc tế, WTO và Công pháp quốc tế về lãnh thổ.",
          [CognitiveLevel.COMPREHENSION]: "Trình bày được tính chất ràng buộc khi Việt Nam ký kết hợp đồng thương mại quốc tế.",
          [CognitiveLevel.APPLICATION]: "Chứng minh được chủ quyền biển đảo Việt Nam thông qua các Công pháp và hiệp định quốc tế."
        }
      }
    ]
  }
};

export const SAMPLE_TOPICS_BY_GRADE_HISTORY_GEOGRAPHY: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  6: {
    "Chương I: Tại sao cần học Lịch sử": [{ contentName: "Lịch sử and cuộc sống" }, { contentName: "Thời gian trong lịch sử" }],
    "Chương II: Thời kì nguyên thủy": [{ contentName: "Xã hội nguyên thủy" }],
    "Chương III: Xã hội cổ đại": [{ contentName: "Các quốc gia cổ đại phương Đông" }, { contentName: "Các quốc gia cổ đại phương Tây" }],
    "Chương IV: Đông Nam Á từ những thế kỉ tiếp giáp công nguyên đến thế kỉ X": [{ contentName: "Vương quốc Phù Nam" }, { contentName: "Vương quốc Chăm-pa" }],
    "Chương V: Việt Nam từ khoảng thế kỉ VII TCN đến đầu thế kỉ X": [{ contentName: "Nước Văn Lang, Âu Lạc" }, { contentName: "Thời kì Bắc thuộc and chống Bắc thuộc" }],
    "Chương VI: Trái Đất - Hành tinh của hệ Mặt Trời": [{ contentName: "Hệ Mặt Trời and Trái Đất" }, { contentName: "Chuyển động tự quay quanh trục của Trái Đất" }],
    "Chương VII: Bản đồ - Phương tiện thể hiện bề mặt Trái Đất": [{ contentName: "Khái niệm bản đồ" }, { contentName: "Kinh độ, vĩ độ and tọa độ địa lí" }],
  },
  10: {
    "Lịch sử thế giới thời nguyên thủy, cổ đại và trung đại": [
      { 
        contentName: "Các cuộc phát kiến địa lí",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "(NL1) Nhận diện các cuộc phát kiến địa lí tiêu biểu.",
          [CognitiveLevel.COMPREHENSION]: "(NL2) Giải thích mối quan hệ nhân quả giữa nhu cầu về vàng bạc, hương liệu và sự bùng nổ các cuộc phát kiến địa lí.",
          [CognitiveLevel.APPLICATION]: "(NL3) Đánh giá ý nghĩa lịch sử của các cuộc phát kiến địa lí đối với sự phát triển của nhân loại."
        }
      },
      { contentName: "Chủ nghĩa tư bản giữa hai cuộc chiến tranh thế giới (1918-1939)" }
    ],
        "Lịch sử thế giới hiện đại": [
            { 
                contentName: "Chiến tranh thế giới thứ hai (1939-1945)",
                learningOutcomes: {
                    [CognitiveLevel.KNOWLEDGE]: "(NL1) Nhận diện các giai đoạn và sự kiện chính của Chiến tranh thế giới thứ hai.",
                    [CognitiveLevel.COMPREHENSION]: "(NL2) Giải thích mối quan hệ nhân quả giữa chủ nghĩa phát xít và sự bùng nổ chiến tranh.",
                    [CognitiveLevel.APPLICATION]: "(NL3) Đánh giá ý nghĩa lịch sử của chiến thắng chống phát xít đối với hòa bình thế giới."
                }
            }, 
            { contentName: "Liên hợp quốc" }, 
            { contentName: "Trật tự thế giới sau Chiến tranh thế giới thứ hai" }, 
            { contentName: "Liên bang Nga từ năm 1991 đến nay" }, 
            { contentName: "Nhật Bản, Trung Quốc, Ấn Độ từ năm 1945 đến nay" }
        ],
        "Lịch sử Việt Nam từ thế kỉ X đến thế kỉ XIX": [
            { contentName: "Quá trình hình thành và phát triển của nhà nước phong kiến" }, 
            { 
                contentName: "Công cuộc kháng chiến chống ngoại xâm",
                learningOutcomes: {
                    [CognitiveLevel.KNOWLEDGE]: "(NL1) Nhận diện các sự kiện chính trong các cuộc kháng chiến chống ngoại xâm tiêu biểu.",
                    [CognitiveLevel.COMPREHENSION]: "(NL2) Phân tích các nguồn sử liệu để thấy được nghệ thuật quân sự của cha ông.",
                    [CognitiveLevel.APPLICATION]: "(NL3) Đánh giá ý nghĩa lịch sử của các cuộc kháng chiến đối với việc bảo vệ độc lập dân tộc."
                }
            }, 
            { contentName: "Sự phát triển kinh tế và văn hóa qua các triều đại" }
        ],
    },
    12: {
        "Lịch sử Việt Nam (1919-1945)": [
            { contentName: "Phong trào dân tộc dân chủ ở Việt Nam (1919-1930)" }, 
            { contentName: "Đảng Cộng sản Việt Nam ra đời" }, 
            { contentName: "Phong trào cách mạng 1930-1935" }, 
            { contentName: "Phong trào dân chủ 1936-1939" }, 
            { contentName: "Cuộc vận động giải phóng dân tộc (1939-1945)" }, 
            { 
                contentName: "Cách mạng tháng Tám năm 1945",
                learningOutcomes: {
                    [CognitiveLevel.KNOWLEDGE]: "(NL1) Nhận diện các sự kiện chính dẫn đến thắng lợi của Cách mạng tháng Tám.",
                    [CognitiveLevel.COMPREHENSION]: "(NL2) Giải thích mối quan hệ nhân quả giữa thời cơ chín muồi và sự lãnh đạo của Đảng.",
                    [CognitiveLevel.APPLICATION]: "(NL3) Đánh giá ý nghĩa lịch sử và bài học kinh nghiệm của Cách mạng tháng Tám."
                }
            }
        ],
        "Lịch sử Việt Nam (1945-1954)": [
            { contentName: "Cuộc đấu tranh bảo vệ và xây dựng chính quyền dân chủ nhân dân (1945-1946)" }, 
            { contentName: "Kháng chiến toàn quốc chống thực dân Pháp (1946-1954)" }, 
            { 
                contentName: "Chiến dịch Điện Biên Phủ năm 1954",
                learningOutcomes: {
                    [CognitiveLevel.KNOWLEDGE]: "(NL1) Nhận diện các diễn biến chính của chiến dịch Điện Biên Phủ.",
                    [CognitiveLevel.COMPREHENSION]: "(NL2) Phân tích các nguồn sử liệu để thấy được tầm vóc của chiến thắng Điện Biên Phủ.",
                    [CognitiveLevel.APPLICATION]: "(NL3) Đánh giá ý nghĩa lịch sử của chiến thắng Điện Biên Phủ đối với phong trào giải phóng dân tộc thế giới."
                }
            }
        ],
        "Lịch sử Việt Nam (1954-1975)": [
            { contentName: "Cách mạng xã hội chủ nghĩa ở miền Bắc" }, 
            { contentName: "Đấu tranh chống các chiến lược chiến tranh của Mỹ ở miền Nam" }, 
            { 
                contentName: "Cuộc Tổng tiến công và nổi dậy Xuân 1975",
                learningOutcomes: {
                    [CognitiveLevel.KNOWLEDGE]: "(NL1) Nhận diện các mốc thời gian và sự kiện chính của cuộc Tổng tiến công Xuân 1975.",
                    [CognitiveLevel.COMPREHENSION]: "(NL2) Giải thích mối quan hệ nhân quả giữa các chiến dịch và sự sụp đổ của chính quyền Sài Gòn.",
                    [CognitiveLevel.APPLICATION]: "(NL3) Đánh giá ý nghĩa lịch sử của đại thắng mùa Xuân 1975."
                }
            }
        ],
        "Lịch sử Việt Nam (1975-nay)": [
            { contentName: "Việt Nam trong những năm đầu sau thắng lợi của cuộc kháng chiến chống Mỹ" }, 
            { 
                contentName: "Công cuộc đổi mới đất nước (1986-nay)",
                learningOutcomes: {
                    [CognitiveLevel.KNOWLEDGE]: "(NL1) Nhận diện các chủ trương và sự kiện chính trong công cuộc đổi mới.",
                    [CognitiveLevel.COMPREHENSION]: "(NL2) Phân tích các nguồn sử liệu để thấy được thành tựu của công cuộc đổi mới.",
                    [CognitiveLevel.APPLICATION]: "(NL3) Đánh giá ý nghĩa lịch sử của công cuộc đổi mới đối với sự phát triển của đất nước."
                }
            }
        ]
    }
};

export const SAMPLE_TOPICS_BY_GRADE_HISTORY: { [grade: number]: { [chapter: string]: SampleContent[] } } = {};

export const initialMatrix: ExamMatrix = {
  header: {
    departmentOfEducation: "SỞ GD&ĐT ...",
    schoolName: "TRƯỜNG THCS ...",
    examName: "MA TRẬN ĐỀ KIỂM TRA GIỮA KỲ 1, NĂM HỌC 2025 - 2026",
    examPeriod: "Kiểm tra giữa kỳ",
    creator: "TỔ TOÁN",
    duration: 90,
    grade: 10,
    subject: "Toán",
    totalPoints: 10,
  },
  topics: [
    {
      id: 'topic-1',
      chapterName: "Mệnh đề và Tập hợp",
      contentName: "Mệnh đề toán học và Tập hợp",
      learningOutcomes: {
        [CognitiveLevel.KNOWLEDGE]: "Thiết lập và phát biểu được các mệnh đề toán học; Nhận biết được các khái niệm cơ bản về tập hợp.",
        [CognitiveLevel.COMPREHENSION]: "Xác định được tính đúng/sai của mệnh đề; Hiểu các phép toán trên tập hợp.",
        [CognitiveLevel.APPLICATION]: "Thực hiện được các phép toán trên tập hợp (hợp, giao, hiệu, phần bù); Vận dụng biểu đồ Ven để giải toán."
      },
      questions: {
        [QuestionType.MULTIPLE_CHOICE]: { 
          [CognitiveLevel.KNOWLEDGE]: 8,
          [CognitiveLevel.COMPREHENSION]: 4
        },
        [QuestionType.ESSAY]: { 
          [CognitiveLevel.COMPREHENSION]: { id: "1", isChart: false } 
        },
      },
    },
    {
        id: 'topic-2',
        chapterName: "Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn",
        contentName: "Bất phương trình bậc nhất hai ẩn",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được bất phương trình và hệ bất phương trình bậc nhất hai ẩn.",
          [CognitiveLevel.COMPREHENSION]: "Biểu diễn được miền nghiệm của bất phương trình và hệ bất phương trình bậc nhất hai ẩn trên mặt phẳng toạ độ.",
          [CognitiveLevel.APPLICATION]: "Vận dụng kiến thức về hệ bất phương trình bậc nhất hai ẩn vào giải quyết bài toán thực tiễn (tìm cực trị trên miền đa giác)."
        },
        questions: {
            [QuestionType.MULTIPLE_CHOICE]: { 
              [CognitiveLevel.KNOWLEDGE]: 8,
              [CognitiveLevel.COMPREHENSION]: 4,
              [CognitiveLevel.APPLICATION]: 4
            },
            [QuestionType.ESSAY]: { 
              [CognitiveLevel.APPLICATION]: { id: "2", isChart: false } 
            },
        },
    },
    {
        id: 'topic-3',
        chapterName: "Hàm số bậc hai và Đồ thị",
        contentName: "Hàm số và Đồ thị bậc hai",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Mô tả được các khái niệm cơ bản về hàm số; Nhận biết được các tính chất cơ bản của Parabola.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được định lí về dấu của tam thức bậc hai; Hiểu cách vẽ đồ thị hàm số bậc hai.",
          [CognitiveLevel.APPLICATION]: "Vẽ được Parabola; Giải được bất phương trình bậc hai một ẩn; Vận dụng hàm số bậc hai vào giải quyết bài toán thực tiễn."
        },
        questions: {
            [QuestionType.ESSAY]: { 
              [CognitiveLevel.HIGH_APPLICATION]: { id: "3", isChart: false } 
            },
        },
    },
  ],
  points: {
    [QuestionType.MULTIPLE_CHOICE]: {
      [CognitiveLevel.KNOWLEDGE]: 0.25,
      [CognitiveLevel.COMPREHENSION]: 0.25,
      [CognitiveLevel.APPLICATION]: 0.25,
    },
    [QuestionType.TRUE_FALSE]: {
      [CognitiveLevel.KNOWLEDGE]: 0.25,
      [CognitiveLevel.COMPREHENSION]: 0.25,
      [CognitiveLevel.APPLICATION]: 0.25,
    },
    [QuestionType.SHORT_ANSWER]: {
      [CognitiveLevel.KNOWLEDGE]: 0.5,
      [CognitiveLevel.COMPREHENSION]: 0.5,
      [CognitiveLevel.APPLICATION]: 0.5,
    },
    [QuestionType.ESSAY]: {
      [CognitiveLevel.KNOWLEDGE]: 1.0,
      [CognitiveLevel.COMPREHENSION]: 1.0,
      [CognitiveLevel.APPLICATION]: 1.0,
      [CognitiveLevel.HIGH_APPLICATION]: 1.0,
    },
  },
};


export const SAMPLE_TOPICS_BY_GRADE_CIVIC_EDUCATION: { [grade: number]: { [chapter: string]: SampleContent[] } } = {
  8: {
    "Đạo đức": [
      {
        contentName: "Bài 1: Tự hào về truyền thống dân tộc Việt Nam",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được một số truyền thống của dân tộc Việt Nam; Nhận biết được giá trị của các truyền thống; Kể được một số biểu hiện của lòng tự hào về truyền thống dân tộc.",
          [CognitiveLevel.APPLICATION]: "Đánh giá được hành vi, việc làm của bản thân và những người xung quanh; Thực hiện được những việc làm cụ thể để giữ gìn, phát huy truyền thống của dân tộc."
        }
      },
      {
        contentName: "Bài 2: Tôn trọng sự đa dạng của các dân tộc",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được một số biểu hiện của sự đa dạng của các dân tộc và các nền văn hoá trên thế giới.",
          [CognitiveLevel.COMPREHENSION]: "Hiểu được ý nghĩa của việc tôn trọng sự đa dạng của các dân tộc và các nền văn hoá trên thế giới.",
          [CognitiveLevel.APPLICATION]: "Thể hiện được bằng lời nói và việc làm thái độ tôn trọng sự đa dạng; Phê phán những hành vi kì thị, phân biệt chủng tộc và văn hoá."
        }
      },
      {
        contentName: "Bài 3: Lao động cần cù, sáng tạo",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được khái niệm cần cù, sáng tạo trong lao động và một số biểu hiện của cần cù, sáng tạo trong lao động.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được ý nghĩa của cần cù, sáng tạo trong lao động.",
          [CognitiveLevel.APPLICATION]: "Thể hiện được sự cần cù, sáng tạo trong lao động của bản thân; Trân trọng những thành quả lao động; Phê phán những biểu hiện chây lười, thụ động."
        }
      },
      {
        contentName: "Bài 4: Bảo vệ lẽ phải",
        learningOutcomes: {
          [CognitiveLevel.COMPREHENSION]: "Giải thích được một cách đơn giản về sự cần thiết phải bảo vệ lẽ phải.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được việc bảo vệ lẽ phải bằng lời nói và hành động cụ thể; Khích lệ, động viên bạn bè có thái độ, hành vi bảo vệ lẽ phải; Phê phán những thái độ, hành vi không bảo vệ lẽ phải."
        }
      }
    ],
    "Kỹ năng sống": [
      {
        contentName: "Bài 6: Xác định mục tiêu cá nhân",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được thế nào là mục tiêu cá nhân; các loại mục tiêu cá nhân; Nêu được cách xác định mục tiêu và lập kế hoạch thực hiện.",
          [CognitiveLevel.COMPREHENSION]: "Hiểu vì sao phải xác định mục tiêu cá nhân.",
          [CognitiveLevel.APPLICATION]: "Xây dựng được mục tiêu cá nhân của bản thân và kế hoạch hành động nhằm đạt mục tiêu đó."
        }
      },
      {
        contentName: "Bài 8: Lập kế hoạch chi tiêu",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nhận biết được sự cần thiết phải lập kế hoạch chi tiêu; Nêu được cách lập kế hoạch chi tiêu.",
          [CognitiveLevel.APPLICATION]: "Lập được kế hoạch chi tiêu và tạo thói quen chi tiêu hợp lí; Giúp đỡ bạn bè, người thân lập kế hoạch chi tiêu hợp lí."
        }
      }
    ],
    "Pháp luật": [
      {
        contentName: "Bài 5: Bảo vệ môi trường và tài nguyên thiên nhiên",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được một số quy định cơ bản của pháp luật về bảo vệ môi trường, tài nguyên thiên nhiên; Nêu được trách nhiệm của học sinh.",
          [CognitiveLevel.COMPREHENSION]: "Giải thích được sự cần thiết phải bảo vệ môi trường và tài nguyên thiên nhiên.",
          [CognitiveLevel.APPLICATION]: "Thực hiện được việc bảo vệ môi trường và tài nguyên thiên nhiên bằng những việc làm phù hợp; Phê phán, đấu tranh với những hành vi gây ô nhiễm."
        }
      },
      {
        contentName: "Bài 7: Phòng, chống bạo lực gia đình",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Kể được các hình thức bạo lực gia đình phổ biến; Nêu được một số quy định của pháp luật về phòng, chống bạo lực gia đình.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được tác hại của hành vi bạo lực gia đình đối với cá nhân, gia đình và xã hội.",
          [CognitiveLevel.APPLICATION]: "Biết cách phòng, chống bạo lực gia đình; Phê phán các hành vi bạo lực gia đình trong gia đình và cộng đồng."
        }
      },
      {
        contentName: "Bài 9: Phòng ngừa tai nạn vũ khí, cháy, nổ và các chất độc hại",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Kể được tên một số tai nạn vũ khí, cháy, nổ và chất độc hại; nhận diện được một số nguy cơ dẫn đến tai nạn; Nêu được quy định cơ bản của pháp luật.",
          [CognitiveLevel.COMPREHENSION]: "Trình bày được hậu quả của tai nạn vũ khí, cháy, nổ và chất độc hại.",
          [CognitiveLevel.APPLICATION]: "Nhận biết được trách nhiệm của công dân; Thực hiện được việc phòng ngừa tai nạn vũ khí, cháy, nổ và các chất độc hại."
        }
      },
      {
        contentName: "Bài 10: Quyền và nghĩa vụ lao động của công dân",
        learningOutcomes: {
          [CognitiveLevel.KNOWLEDGE]: "Nêu được một số quy định của pháp luật về quyền, nghĩa vụ lao động và lao động chưa thành niên; Nêu được một số quyền và nghĩa vụ cơ bản của các bên tham gia hợp đồng lao động.",
          [CognitiveLevel.COMPREHENSION]: "Phân tích được tầm quan trọng của lao động đối với đời sống con người.",
          [CognitiveLevel.APPLICATION]: "Lập được hợp đồng lao động có nội dung đơn giản; Tích cực, chủ động tham gia lao động ở gia đình, trường, lớp và cộng đồng."
        }
      }
    ]
  }
};

export const ALL_SAMPLE_TOPICS = {
  [SUBJECTS[0]]: SAMPLE_TOPICS_BY_GRADE_MATH,
  [SUBJECTS[1]]: SAMPLE_TOPICS_BY_GRADE_PHYSICS,
  [SUBJECTS[2]]: SAMPLE_TOPICS_BY_GRADE_CHEMISTRY,
  [SUBJECTS[3]]: SAMPLE_TOPICS_BY_GRADE_BIOLOGY,
  [SUBJECTS[4]]: SAMPLE_TOPICS_BY_GRADE_HISTORY,
  [SUBJECTS[5]]: SAMPLE_TOPICS_BY_GRADE_GEOGRAPHY,
  [SUBJECTS[6]]: SAMPLE_TOPICS_BY_GRADE_HISTORY_GEOGRAPHY,
  [SUBJECTS[7]]: SAMPLE_TOPICS_BY_GRADE_ECONOMICS_LAW,
  [SUBJECTS[8]]: SAMPLE_TOPICS_BY_GRADE_CIVIC_EDUCATION,
  [SUBJECTS[9]]: SAMPLE_TOPICS_BY_GRADE_TECHNOLOGY,
};



