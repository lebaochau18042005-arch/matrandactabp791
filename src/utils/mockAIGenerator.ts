import { GEOGRAPHY_FORMULAS } from '../data/geographyFormulas';
import {
  getCompetencyForLevel,
  getLearningOutcomeForLevel,
  getLessonAssessmentProfile,
} from '../data/geographyLearningOutcomes';
import type { GeographyCompetency } from '../data/geographyLearningOutcomes';
import {
  MC_LEVEL_SEQUENCE,
  SA_LEVEL_SEQUENCE,
  TF_LEVEL_SEQUENCE,
} from '../data/examBlueprint';

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
  answerFormat?: string;
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
  learningOutcome?: string;
  competency?: GeographyCompetency;
  sourceReference?: string;
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
  
  // 1. Tạo phần trắc nghiệm khách quan theo ma trận chuẩn
  const mcLevels: QuestionLevel[] = [...MC_LEVEL_SEQUENCE];
  const answers: ('A'|'B'|'C'|'D')[] = ['A', 'B', 'C', 'D'];
  
  const cleanLessonTitle = lessonTitle.replace(/^Bài\s\d+:\s/, '');
  const assessmentProfile = getLessonAssessmentProfile(lessonId, lessonTitle, topic);
  const sourceReference = documentContext && documentContext.trim().length > 50
    ? 'Tài liệu do giáo viên cung cấp'
    : `SGK Địa lí ${grade} - ${cleanLessonTitle}`;
  const getQuestionMetadata = (
    level: QuestionLevel,
    type: 'multiple_choice' | 'true_false' | 'short_answer',
    index: number
  ) => ({
    learningOutcome: getLearningOutcomeForLevel(assessmentProfile, level),
    competency: getCompetencyForLevel(level, type, index),
    sourceReference,
  });
  const isNatural = /tự nhiên|khí quyển|gió|mưa|nhiệt|ngày đêm|múi giờ|mùa|địa hình|biển đông|thủy quyển/i.test(topic + lessonTitle);

  const isDayNight = lessonTitle.toLowerCase().includes('ngày đêm');
  const isSeasons = lessonTitle.toLowerCase().includes('mùa');
  
  for (let i = 0; i < mcLevels.length; i++) {
    let correctAnswer = answers[i % 4];
    let questionText = mcLevels[i] === 'Vận dụng' || mcLevels[i] === 'Vận dụng cao'
      ? `Nhận xét nào sau đây phù hợp nhất về ${cleanLessonTitle}?`
      : `Nhận định nào sau đây đúng nhất về ${cleanLessonTitle}?`;
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
        correctAnswer = qPool[i].c as 'A' | 'B' | 'C' | 'D';
      }
    } else if (isSeasons) {
      const qPool = [
        { q: 'Xác định khu vực có biểu hiện các mùa trong năm rõ rệt nhất?', o: ['Xích đạo', 'Vĩ độ trung bình (Ôn đới)', 'Hai cực', 'Nhiệt đới'], c: 'B' },
        { q: 'Nguyên nhân chủ yếu sinh ra các mùa trong năm là gì?', o: ['Trái Đất quay quanh trục', 'Trái Đất hình cầu', 'Trục Trái Đất nghiêng không đổi phương khi chuyển động quanh Mặt Trời', 'Khoảng cách từ Trái Đất tới Mặt Trời thay đổi'], c: 'C' }
      ];
      if (i < 2) {
        questionText = qPool[i].q;
        opts = qPool[i].o;
        correctAnswer = qPool[i].c as 'A' | 'B' | 'C' | 'D';
      }
    } 

    if (opts.length === 0) {
      if (documentContext && documentContext.length > 50) {
        const questionTemplates = [
          `Đặc điểm nào nổi bật nhất của ${cleanLessonTitle}?`,
          `Nhận định nào đúng về đặc điểm của ${cleanLessonTitle}?`,
          `Nguyên nhân chủ yếu dẫn đến ${cleanLessonTitle} là gì?`,
          `Tác động lớn nhất của ${cleanLessonTitle} thể hiện ở lĩnh vực nào?`,
          `Hệ quả quan trọng nhất của ${cleanLessonTitle} là gì?`,
          `Đặc điểm nào tiêu biểu cho ${cleanLessonTitle}?`,
          `Yếu tố nào chi phối mạnh nhất đến ${cleanLessonTitle}?`,
          `Nhận định nào phản ánh đúng quy luật của ${cleanLessonTitle}?`,
          `Nhận định nào mô tả đúng khái niệm ${cleanLessonTitle}?`,
          `Yếu tố nào chủ yếu hình thành ${cleanLessonTitle}?`,
          `Ý nghĩa nào thể hiện rõ nhất vai trò của ${cleanLessonTitle}?`,
          `Nhận xét nào thể hiện điểm khác biệt lớn nhất của ${cleanLessonTitle}?`,
        ];
        const applyTemplates = [
          `Nhận xét nào phản ánh đúng nhất ${cleanLessonTitle}?`,
          `Cách phân tích nào phù hợp nhất với ${cleanLessonTitle}?`,
          `Cách giải thích nào phù hợp nhất cho ${cleanLessonTitle}?`,
          `Đánh giá nào có căn cứ nhất về ${cleanLessonTitle}?`,
          `So sánh nào làm rõ nhất đặc điểm của ${cleanLessonTitle}?`,
          `Nhận xét nào thể hiện đúng tác động của ${cleanLessonTitle}?`,
        ];
        const isApplicationLevel = mcLevels[i] === 'Vận dụng' || mcLevels[i] === 'Vận dụng cao';
        questionText = `Dựa vào tài liệu cung cấp: ${isApplicationLevel ? applyTemplates[i % applyTemplates.length] : questionTemplates[i % questionTemplates.length]}`;
        
        const optionPool = [
           [ `${cleanLessonTitle} chịu ảnh hưởng sâu sắc từ vị trí địa lí và điều kiện tự nhiên.`, `Yếu tố kinh tế - xã hội đóng vai trò quyết định, tự nhiên chỉ là nền tảng.`, `Đây là kết quả của quá trình vận động kiến tạo hoặc thay đổi khí hậu.`, `Hệ quả này tác động trực tiếp đến phân bố dân cư và quy hoạch không gian.` ],
           [ `Khí hậu và địa hình là nhân tố quyết định trực tiếp.`, `Là kết quả của sự tác động tổng hợp giữa nhiều thành phần.`, `Sự thay đổi diễn ra liên tục theo không gian và thời gian.`, `Không chịu sự chi phối của các quy luật địa lí chung.` ],
           [ `Tác động mạnh mẽ đến cơ cấu sản xuất nông nghiệp.`, `Tạo điều kiện thuận lợi cho giao thông vận tải và giao thương.`, `Đẩy nhanh quá trình công nghiệp hóa, hiện đại hóa.`, `Làm suy thoái nghiêm trọng chất lượng môi trường sinh thái.` ],
           [ `Luôn luôn diễn ra theo một chu kỳ cố định không đổi.`, `Chỉ xuất hiện ở những vùng có khí hậu khắc nghiệt.`, `Bị chi phối mạnh mẽ bởi bàn tay con người.`, `Có tính phân hóa đa dạng và phức tạp trên Trái Đất.` ]
        ];
        
        const selectedPool = optionPool[i % optionPool.length];
        opts = [ selectedPool[i%4], selectedPool[(i+1)%4], selectedPool[(i+2)%4], selectedPool[(i+3)%4] ];
        correctAnswer = 'A';
        explanation = `Đối chiếu với tài liệu giáo viên cung cấp, phương án đúng phản ánh phù hợp đặc điểm địa lí của ${cleanLessonTitle}.`;
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
        correctAnswer = answers[(4 - (i % 4)) % 4];
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
      ...getQuestionMetadata(mcLevels[i], 'multiple_choice', i),
      stimulus: {
        type: 'none'
      }
    });
  }

  // 2. Tạo 4 câu Đúng/Sai
  const tfLevels: QuestionLevel[] = [...TF_LEVEL_SEQUENCE];
  for (let i = 0; i < tfLevels.length; i++) {
    let contextContent = `Cho thông tin về đặc điểm của ${cleanLessonTitle}.`;
    let stimulusType: 'text' | 'table' = 'text';
    let stimulusTitle = 'Thông tin tham khảo';
    let stimulusUnit: string | undefined;
    let stimulusSource = sourceReference;

    if (i === 1 && documentContext && documentContext.length > 50) {
      contextContent = `Đoạn thông tin trích xuất: "${documentContext.substring(0, 150)}..."`;
    } else if (i === 2) {
      stimulusType = 'table';
      stimulusTitle = `Bảng 1: Chỉ số tổng hợp về ${cleanLessonTitle} tại hai khu vực, năm 2024`;
      stimulusUnit = 'Điểm';
      stimulusSource = 'Số liệu giả định phục vụ kiểm tra';
      contextContent = 'Khu vực | Chỉ số\nA | 62\nB | 48';
    }

    const statements: TrueFalseStatement[] = i === 2
      ? [
          { label: 'a', text: 'Chỉ số của khu vực A cao hơn khu vực B 14 điểm.', answer: true, explanation: 'Đúng, vì 62 - 48 = 14 điểm.' },
          { label: 'b', text: 'Chỉ số của khu vực B bằng khoảng 77,4% chỉ số của khu vực A.', answer: true, explanation: 'Đúng, vì 48 / 62 × 100 ≈ 77,4%.' },
          { label: 'c', text: 'Chênh lệch chỉ số giữa hai khu vực là 10 điểm.', answer: false, explanation: 'Sai, chênh lệch đúng là 14 điểm.' },
          { label: 'd', text: 'Chỉ số trung bình của hai khu vực là 55 điểm.', answer: true, explanation: 'Đúng, vì (62 + 48) / 2 = 55 điểm.' },
        ]
      : [
          { label: 'a', text: `Việc nhận diện ${cleanLessonTitle} cần dựa vào các khái niệm, đặc điểm và biểu hiện địa lí liên quan.`, answer: true, explanation: `Đúng, đây là cơ sở để mô tả chính xác ${cleanLessonTitle}.` },
          { label: 'b', text: `${cleanLessonTitle} có biểu hiện giống nhau ở mọi lãnh thổ và không biến đổi theo thời gian.`, answer: false, explanation: 'Sai, hiện tượng địa lí thường có sự phân hóa theo không gian và biến đổi theo thời gian.' },
          { label: 'c', text: `Phân tích ${cleanLessonTitle} cần xem xét mối quan hệ giữa nguyên nhân, biểu hiện và tác động.`, answer: true, explanation: 'Đúng, cách tiếp cận tổng hợp giúp giải thích đầy đủ hiện tượng địa lí.' },
          { label: 'd', text: `Khi đánh giá ${cleanLessonTitle}, có thể bỏ qua sự khác biệt về không gian và thời gian.`, answer: false, explanation: 'Sai, không gian và thời gian là hai căn cứ quan trọng trong phân tích địa lí.' },
        ];

    questions.push({
      id: `tf_${i + 1}`,
      lessonId,
      section: 'II',
      topic,
      level: tfLevels[i],
      type: 'true_false',
      ...getQuestionMetadata(tfLevels[i], 'true_false', i),
      stimulus: {
        type: stimulusType,
        title: stimulusTitle,
        content: contextContent,
        unit: stimulusUnit,
        source: stimulusSource,
      },
      question: `Dựa vào ngữ liệu, hãy phân tích và xác định các nhận định sau đúng hay sai về ${cleanLessonTitle}.`,
      statements,
    });
  }

  // 3. Tạo 4 câu Trả lời ngắn (Tính toán)
  const saLevels: QuestionLevel[] = [...SA_LEVEL_SEQUENCE];
  
  const validFormulas = assessmentProfile.allowedFormulaIds
    .map(formulaId => GEOGRAPHY_FORMULAS.find(formula => formula.id === formulaId))
    .filter((formula): formula is (typeof GEOGRAPHY_FORMULAS)[number] => Boolean(formula));
  
  
  // Fallback nếu không có công thức nào khớp (mặc dù ít xảy ra)
  const availableFormulas = validFormulas.length > 0 ? validFormulas : GEOGRAPHY_FORMULAS;

  for (let i = 0; i < saLevels.length; i++) {
    const f = availableFormulas[(i + grade) % availableFormulas.length];
    
    // Tạo data giả cho input
    const inputs: Record<string, number> = {};
    const formulaParts = f.formula
      .replace(/×\s*(?:100|1\s*000)/g, '')
      .split(/\s*(?:\/|×|-|\+)\s*/)
      .map(part => part.trim())
      .filter(Boolean);
    let operation = f.operation;
    if (!operation) {
      if (f.formula.includes('/') && f.formula.includes('× 100')) operation = 'percent';
      else if (f.formula.includes('/')) operation = 'divide';
      else if (f.formula.includes('-')) operation = 'subtract';
      else if (f.formula.includes('+')) operation = 'add';
      else if (f.formula.includes('×')) operation = 'multiply';
      else operation = 'single_total';
    }

    let inputValues: number[];
    let ans: number;
    switch (operation) {
      case 'percent':
        inputValues = [350, 1000];
        ans = inputValues[0] / inputValues[1] * 100;
        break;
      case 'per_thousand':
        inputValues = [12000, 1000000];
        ans = inputValues[0] / inputValues[1] * 1000;
        break;
      case 'subtract':
        inputValues = [35, 18];
        ans = inputValues[0] - inputValues[1];
        break;
      case 'add':
        inputValues = [800, 650];
        ans = inputValues[0] + inputValues[1];
        break;
      case 'multiply':
        inputValues = [40, 50];
        ans = inputValues[0] * inputValues[1];
        break;
      case 'component_value':
        inputValues = [1200, 35];
        ans = inputValues[0] * inputValues[1] / 100;
        break;
      case 'nautical_to_km':
        inputValues = [120];
        ans = inputValues[0] * 1.852;
        break;
      case 'map_to_real_km':
        inputValues = [5, 2500000];
        ans = inputValues[0] * inputValues[1] / 100000;
        break;
      case 'real_to_map_cm':
        inputValues = [125, 2500000];
        ans = inputValues[0] * 100000 / inputValues[1];
        break;
      case 'coordinate_difference':
        inputValues = [108, 102];
        ans = Math.abs(inputValues[0] - inputValues[1]);
        break;
      case 'timezone_difference':
        inputValues = [105, 30];
        ans = Math.abs(inputValues[0] - inputValues[1]) / 15;
        break;
      case 'temperature_at_height':
        inputValues = [28, 1500];
        ans = inputValues[0] - inputValues[1] * 0.6 / 100;
        break;
      case 'mountain_height':
        inputValues = [25, 16];
        ans = Math.abs(inputValues[0] - inputValues[1]) * 100 / 0.6;
        break;
      case 'temperature_difference_by_height':
        inputValues = [1500];
        ans = inputValues[0] * 0.6 / 100;
        break;
      case 'leeward_temperature':
        inputValues = [16, 1500];
        ans = inputValues[0] + inputValues[1] / 100;
        break;
      case 'percent_change':
        inputValues = [1000, 1125];
        ans = (inputValues[1] - inputValues[0]) / inputValues[0] * 100;
        break;
      case 'natural_increase_percent':
        inputValues = [18, 7];
        ans = (inputValues[0] - inputValues[1]) / 10;
        break;
      case 'production_tonnes':
        inputValues = [2500, 62];
        ans = inputValues[0] * inputValues[1] / 10;
        break;
      case 'yield_ta_per_ha':
        inputValues = [15500, 2500];
        ans = inputValues[0] * 10 / inputValues[1];
        break;
      case 'per_capita_kg':
        inputValues = [42000, 10000];
        ans = inputValues[0] / inputValues[1] * 1000;
        break;
      case 'single_total':
        inputValues = [1200];
        ans = inputValues[0];
        break;
      case 'divide':
      default:
        inputValues = [1500000, 3000];
        ans = inputValues[0] / inputValues[1];
        break;
    }

    const fallbackInputs = inputValues.map((_, index) => ({
      key: `value${index + 1}`,
      name: formulaParts[index] || `Giá trị thứ ${index + 1}`,
    }));
    const inputDefinitions = f.inputs?.length === inputValues.length ? f.inputs : fallbackInputs;
    inputDefinitions.forEach((input, index) => {
      inputs[input.key] = inputValues[index];
    });

    const roundedAns = Number(ans.toFixed(1));
    const roundingText = 'Làm tròn kết quả đến 1 chữ số thập phân';
    
    const inputSummary = inputDefinitions.map((input, index) => `${input.name.toLowerCase()} là ${inputValues[index].toLocaleString('vi-VN')}`).join(', ');
    const contextStr = `Năm 2024, một địa phương có ${inputSummary}.`;

    questions.push({
      id: `sa_${i + 1}`,
      lessonId,
      section: 'III',
      topic,
      level: saLevels[i],
      type: 'short_answer',
      ...getQuestionMetadata(saLevels[i], 'short_answer', i),
      stimulus: {
        type: 'text',
        content: contextStr,
        source: sourceReference,
      },
      question: `Hãy tính ${f.name.toLowerCase()} của địa phương đó (${roundingText}).`,
      shortAnswer: {
        formula: f.name,
        inputData: inputs,
        correctAnswer: roundedAns,
        unit: f.unit,
        tolerance: 0.1,
        rounding: roundingText,
        answerFormat: 'Nhập số, không nhập đơn vị; ghi kết quả vào 4 ô trả lời.',
        solution: `Áp dụng công thức: ${f.name} = ${f.formula}.\nThay số theo dữ liệu đề bài, kết quả trước khi làm tròn là ${ans}.\nLàm tròn đến 1 chữ số thập phân, kết quả là: ${roundedAns} ${f.unit}`
      }
    });
  }

  return {
    id: `quiz_${crypto.randomUUID()}`,
    lessonId,
    title: `Quiz: ${lessonTitle}`,
    grade,
    totalQuestions: questions.length,
    questions,
    createdAt: new Date().toISOString(),
  };
};
