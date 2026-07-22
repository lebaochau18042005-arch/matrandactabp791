import { GEOGRAPHY_FORMULAS } from '../data/geographyFormulas';

export type QuestionLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export interface Stimulus {
  type: 'none' | 'text' | 'table' | 'chart' | 'map' | 'simulation';
  title?: string;
  content?: string;
  unit?: string;
  source?: string;
}

export interface QuizOption {
  key: string;
  text: string;
}

export interface TrueFalseStatement {
  label: 'a' | 'b' | 'c' | 'd';
  text: string;
  answer: boolean;
  explanation: string;
}

export interface ShortAnswerData {
  formula: string;
  inputData: any;
  correctAnswer: number;
  unit: string;
  tolerance: number;
  rounding: string;
  solution: string;
}

export interface BaseQuizQuestion {
  id: string;
  lessonId: string;
  section: 'I' | 'II' | 'III';
  level: QuestionLevel;
  topic: string;
  stimulus?: Stimulus;
  question?: string;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuizQuestion {
  type: 'multiple_choice';
  options: QuizOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface TrueFalseQuestion extends BaseQuizQuestion {
  type: 'true_false';
  statements: TrueFalseStatement[];
}

export interface ShortAnswerQuestion extends BaseQuizQuestion {
  type: 'short_answer';
  shortAnswer: ShortAnswerData;
}

export type QuizQuestion = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;

export interface GeneratedQuiz {
  id: string;
  lessonId: string;
  title: string;
  grade: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export const generateQuestionsByMockAI = async (
  lessonTitle: string,
  grade: number,
  topic: string,
  lessonId: string,
  documentContext?: string
): Promise<GeneratedQuiz> => {
  // Giả lập độ trễ mạng để giống gọi API AI thật
  await new Promise(resolve => setTimeout(resolve, 1500));

  const questions: QuizQuestion[] = [];
  
  // 1. Tạo 12 câu trắc nghiệm khách quan
  const mcLevels: QuestionLevel[] = ['Nhận biết', 'Nhận biết', 'Nhận biết', 'Nhận biết', 'Thông hiểu', 'Thông hiểu', 'Thông hiểu', 'Thông hiểu', 'Vận dụng', 'Vận dụng', 'Vận dụng', 'Vận dụng cao'];
  const answers: ('A'|'B'|'C'|'D')[] = ['A', 'B', 'C', 'D'];
  
  const cleanLessonTitle = lessonTitle.replace(/^Bài\s\d+:\s/, '');
  const isNatural = /tự nhiên|khí quyển|gió|mưa|nhiệt|ngày đêm|múi giờ|mùa|địa hình|biển đông|thủy quyển/i.test(topic + lessonTitle);

  const isDayNight = lessonTitle.toLowerCase().includes('ngày đêm');
  const isSeasons = lessonTitle.toLowerCase().includes('mùa');
  
  for (let i = 0; i < 12; i++) {
    const correctAnswer = answers[i % 4];
    let questionText = `Nội dung nào sau đây ĐÚNG NHẤT khi nói về ${cleanLessonTitle}?`;
    let opts = [];
    let explanation = `Căn cứ vào SGK Địa lí ${grade} (Kết nối tri thức), đây là kiến thức cơ bản thuộc chủ đề ${topic}.`;

    if (isDayNight) {
      const qPool = [
        { q: 'Nguyên nhân chủ yếu sinh ra hiện tượng ngày đêm luân phiên trên Trái Đất là gì?', o: ['Trái Đất có dạng hình cầu và tự quay quanh trục', 'Trái Đất chuyển động quanh Mặt Trời', 'Mặt Trăng chuyển động quanh Trái Đất', 'Trục Trái Đất nghiêng so với mặt phẳng quỹ đạo'], c: 'A' },
        { q: 'Trong quá trình tự quay quanh trục, Trái Đất quay theo hướng nào?', o: ['Từ Đông sang Tây', 'Từ Tây sang Đông', 'Từ Bắc xuống Nam', 'Từ Nam lên Bắc'], c: 'B' },
        { q: 'Nhờ có sự luân phiên ngày đêm, trên Trái Đất đã nảy sinh hiện tượng gì?', o: ['Sự sống có thể tồn tại và phát triển đều đặn', 'Sự chênh lệch nhiệt độ giữa các mùa', 'Thủy triều lên xuống', 'Băng tan ở hai cực'], c: 'A' }
      ];
      if (i < 3) {
        questionText = qPool[i].q;
        opts = qPool[i].o;
      }
    } else if (isSeasons) {
      const qPool = [
        { q: 'Hiện tượng các mùa trong năm biểu hiện rõ rệt nhất ở khu vực nào?', o: ['Xích đạo', 'Vĩ độ trung bình (Ôn đới)', 'Hai cực', 'Nhiệt đới'], c: 'B' },
        { q: 'Nguyên nhân chính sinh ra các mùa là do:', o: ['Trái Đất quay quanh trục', 'Trái Đất hình cầu', 'Trục Trái Đất nghiêng không đổi phương khi chuyển động quanh Mặt Trời', 'Khoảng cách từ Trái Đất tới Mặt Trời thay đổi'], c: 'C' }
      ];
      if (i < 2) {
        questionText = qPool[i].q;
        opts = qPool[i].o;
      }
    } 

    if (opts.length === 0) {
      if (documentContext && documentContext.length > 50) {
        const questionTemplates = [
          `Đặc điểm nổi bật nhất của ${cleanLessonTitle} là gì?`,
          `Nội dung nào sau đây ĐÚNG khi nói về đặc điểm của ${cleanLessonTitle}?`,
          `Theo thông tin cung cấp, nguyên nhân chính dẫn đến ${cleanLessonTitle} là gì?`,
          `${cleanLessonTitle} có tác động lớn nhất đến lĩnh vực nào?`,
          `Hệ quả quan trọng nhất của ${cleanLessonTitle} là gì?`,
          `Một trong những đặc trưng tiêu biểu của ${cleanLessonTitle} là:`,
          `Theo tài liệu cung cấp, yếu tố nào chi phối mạnh nhất đến ${cleanLessonTitle}?`,
          `Nhận định nào sau đây phản ánh ĐÚNG về quy luật của ${cleanLessonTitle}?`,
          `Khái niệm cơ bản nhất về ${cleanLessonTitle} được mô tả là gì?`,
          `${cleanLessonTitle} được hình thành chủ yếu do tác động của yếu tố nào?`,
          `Vai trò quan trọng nhất của ${cleanLessonTitle} là gì?`,
          `Theo tài liệu, điểm khác biệt lớn nhất của ${cleanLessonTitle} so với các khu vực khác là:`
        ];
        questionText = `Dựa vào tài liệu cung cấp: ${questionTemplates[i % 12]}`;
        
        const optionPool = [
           [ `Đặc điểm này chịu ảnh hưởng sâu sắc từ vị trí địa lí và điều kiện tự nhiên.`, `Yếu tố kinh tế - xã hội đóng vai trò quyết định, tự nhiên chỉ là nền tảng.`, `Đây là kết quả của quá trình vận động kiến tạo hoặc thay đổi khí hậu.`, `Hệ quả này tác động trực tiếp đến phân bố dân cư và quy hoạch không gian.` ],
           [ `Khí hậu và địa hình là nhân tố quyết định trực tiếp.`, `Là kết quả của sự tác động tổng hợp giữa nhiều thành phần.`, `Sự thay đổi diễn ra liên tục theo không gian và thời gian.`, `Không chịu sự chi phối của các quy luật địa lí chung.` ],
           [ `Tác động mạnh mẽ đến cơ cấu sản xuất nông nghiệp.`, `Tạo điều kiện thuận lợi cho giao thông vận tải và giao thương.`, `Đẩy nhanh quá trình công nghiệp hóa, hiện đại hóa.`, `Làm suy thoái nghiêm trọng chất lượng môi trường sinh thái.` ],
           [ `Luôn luôn diễn ra theo một chu kỳ cố định không đổi.`, `Chỉ xuất hiện ở những vùng có khí hậu khắc nghiệt.`, `Bị chi phối mạnh mẽ bởi bàn tay con người.`, `Có tính phân hóa đa dạng và phức tạp trên Trái Đất.` ]
        ];
        
        const selectedPool = optionPool[i % optionPool.length];
        opts = [ selectedPool[i%4], selectedPool[(i+1)%4], selectedPool[(i+2)%4], selectedPool[(i+3)%4] ];
        explanation = `Dựa vào đoạn tài liệu được cung cấp (Trích dẫn: "...${documentContext.substring(0, 30)}..."), ta có thể suy luận ra đáp án này vì nó phản ánh đúng tính chất địa lí cơ bản.`;
      } else {
        if (isNatural) {
           opts = [
             `Là hiện tượng có tính quy luật và diễn ra liên tục trong môi trường tự nhiên.`,
             `Phân bố đồng đều trên khắp bề mặt Trái Đất mà không có sự phân hóa.`,
             `Chỉ xảy ra ở các khu vực vĩ độ cực cao hoặc sâu dưới đáy đại dương.`,
             `Hoàn toàn không chịu tác động của các nhân tố ngoại lực và nội lực.`
           ];
        } else {
           opts = [
             `Gắn liền với trình độ phát triển khoa học kĩ thuật và lực lượng sản xuất.`,
             `Chỉ phụ thuộc duy nhất vào điều kiện tài nguyên thiên nhiên sẵn có.`,
             `Không có sự thay đổi theo thời gian và không gian.`,
             `Phân bố đồng đều giữa các quốc gia đang phát triển và phát triển.`
           ];
        }
        const rotate = (arr: string[], times: number) => [...arr.slice(times % 4), ...arr.slice(0, times % 4)];
        opts = rotate(opts, i);
      }
    }

    questions.push({
      id: `mc_${i + 1}`,
      lessonId,
      section: 'I',
      topic,
      level: mcLevels[i],
      type: 'multiple_choice',
      question: questionText,
      options: [
        { key: 'A', text: opts[0] },
        { key: 'B', text: opts[1] },
        { key: 'C', text: opts[2] },
        { key: 'D', text: opts[3] }
      ],
      correctAnswer: correctAnswer as 'A'|'B'|'C'|'D',
      explanation,
      stimulus: {
        type: 'none'
      }
    });
  }

  // 2. Tạo 4 câu Đúng/Sai
  const tfLevels: QuestionLevel[] = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
  for (let i = 0; i < 4; i++) {
    let contextContent = `Cho thông tin về đặc điểm của ${cleanLessonTitle}.`;
    let stimulusType: 'text' | 'table' = 'text';

    if (i === 1 && documentContext && documentContext.length > 50) {
      contextContent = `Đoạn thông tin trích xuất: "${documentContext.substring(0, 150)}..."`;
    } else if (i === 2) {
      stimulusType = 'table';
      contextContent = `Bảng số liệu giả định về hiện trạng phát triển của ${cleanLessonTitle} qua các năm.`;
    }

    questions.push({
      id: `tf_${i + 1}`,
      lessonId,
      section: 'II',
      topic,
      level: tfLevels[i],
      type: 'true_false',
      stimulus: {
        type: stimulusType,
        title: stimulusType === 'table' ? `Bảng 1: Số liệu minh hoạ` : `Thông tin tham khảo`,
        content: contextContent
      },
      question: `Nhận định nào sau đây đúng, nhận định nào sau đây sai về ${cleanLessonTitle}?`,
      statements: [
        {
          label: 'a',
          text: `Nhận định thứ nhất về đặc điểm cơ bản của ${cleanLessonTitle}.`,
          answer: true,
          explanation: `Đúng. Vì đây là một đặc điểm chính xác được ghi nhận trong SGK.`
        },
        {
          label: 'b',
          text: `Nhận định thứ hai mô tả sai lệch một thông số hoặc tính chất.`,
          answer: false,
          explanation: `Sai. Thông số/tính chất này không đúng với thực tế.`
        },
        {
          label: 'c',
          text: `Nhận định thứ ba liên hệ với yếu tố không gian/thời gian.`,
          answer: true,
          explanation: `Đúng. Sự phân bố và diễn biến này khớp với quy luật.`
        },
        {
          label: 'd',
          text: `Nhận định thứ tư suy luận một hệ quả không có cơ sở.`,
          answer: false,
          explanation: `Sai. Hệ quả này không được chứng minh trong thực tế khoa học.`
        }
      ]
    });
  }

  // 3. Tạo 4 câu Trả lời ngắn (Tính toán)
  const saLevels: QuestionLevel[] = ['Vận dụng', 'Vận dụng', 'Vận dụng cao', 'Vận dụng cao'];
  
  // Xác định xem bài học thuộc Tự nhiên hay Kinh tế xã hội
  const naturalFormulas = ['bien_do_nhiet', 'luong_mua_tb', 'luong_mua_nam'];
  
  const validFormulas = GEOGRAPHY_FORMULAS.filter(f => 
    isNatural ? naturalFormulas.includes(f.id) : !naturalFormulas.includes(f.id)
  );
  
  // Fallback nếu không có công thức nào khớp (mặc dù ít xảy ra)
  const availableFormulas = validFormulas.length > 0 ? validFormulas : GEOGRAPHY_FORMULAS;

  for (let i = 0; i < 4; i++) {
    const f = availableFormulas[(i + grade) % availableFormulas.length];
    
    // Tạo data giả cho input
    let inputs: any = {};
    let val1 = 0, val2 = 0, ans = 0;
    let val1Str = '', val2Str = '';

    if (f.formula === 'A / B') {
      val1 = 1500000 + Math.floor(Math.random() * 500000); // vd: Dân số
      val2 = 3000 + Math.floor(Math.random() * 2000);      // vd: Diện tích
      ans = val1 / val2;
      val1Str = val1.toString();
      val2Str = val2.toString();
    } else if (f.formula === 'A / B * 100') {
      val2 = 1000 + Math.floor(Math.random() * 500); // Tổng
      val1 = Math.floor(val2 * (0.3 + Math.random() * 0.4)); // Thành phần
      ans = (val1 / val2) * 100;
      val1Str = val1.toString();
      val2Str = val2.toString();
    } else if (f.formula === 'A - B') {
      val1 = 30 + Math.floor(Math.random() * 10);
      val2 = 15 + Math.floor(Math.random() * 10);
      ans = val1 - val2;
      val1Str = val1.toString();
      val2Str = val2.toString();
    } else {
      val1 = 100; val2 = 50; ans = 50;
      val1Str = '100'; val2Str = '50';
    }

    if (f.inputs && f.inputs.length >= 2) {
      inputs[f.inputs[0].key] = val1;
      inputs[f.inputs[1].key] = val2;
    }

    const roundedAns = Number(ans.toFixed(1));
    const roundingText = 'Làm tròn kết quả đến 1 chữ số thập phân';
    
    const contextStr = `Năm 2024, một địa phương có giá trị ${f.inputs && f.inputs[0] ? f.inputs[0].name.toLowerCase() : 'thành phần 1'} là ${val1Str} và ${f.inputs && f.inputs[1] ? f.inputs[1].name.toLowerCase() : 'thành phần 2'} là ${val2Str}.`;

    questions.push({
      id: `sa_${i + 1}`,
      lessonId,
      section: 'III',
      topic,
      level: saLevels[i],
      type: 'short_answer',
      stimulus: {
        type: 'text',
        content: contextStr
      },
      question: `Hãy tính ${f.name.toLowerCase()} của địa phương đó (${roundingText}).`,
      shortAnswer: {
        formula: f.name,
        inputData: inputs,
        correctAnswer: roundedAns,
        unit: f.unit,
        tolerance: 0.1,
        rounding: roundingText,
        solution: `Áp dụng công thức: ${f.name} = ${f.inputs ? f.inputs.map(ip => ip.name).join(' ' + f.formula.replace(/[AB]/g, '').trim() + ' ') : ''}\nTa có: ${val1Str} ${f.formula.replace(/[AB]/g, '').trim()} ${val2Str} = ${ans}\nLàm tròn đến 1 chữ số thập phân, kết quả là: ${roundedAns} ${f.unit}`
      }
    });
  }

  return {
    id: `quiz_${crypto.randomUUID()}`,
    lessonId,
    title: `Quiz: ${lessonTitle}`,
    grade,
    totalQuestions: 20,
    questions,
    createdAt: new Date().toISOString(),
  };
};
