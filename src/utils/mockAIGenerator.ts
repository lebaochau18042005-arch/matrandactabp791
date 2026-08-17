import { GEOGRAPHY_FORMULAS, GeoFormula } from '../data/geographyFormulas';
import { GEOGRAPHY_BOOK_NAME } from '../data/geographyLessons';
import {
  GeographyCompetency,
  getCompetencyForLevel,
  getLearningOutcomeForLevel,
  getLessonAssessmentProfile,
} from '../data/geographyLearningOutcomes';
import {
  GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT,
  MC_CORRECT_ANSWER_SEQUENCE,
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
  sourceUrl?: string;
  sourceDataset?: string;
  dataYear?: string;
  accessedAt?: string;
  tableData?: Array<Record<string, string | number>>;
  chartType?: string;
  chartConfig?: Record<string, any>;
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
  maxCharacters?: number;
}

export interface BaseQuizQuestion {
  id: string;
  lessonId: string;
  section: 'I' | 'II' | 'III';
  level: QuestionLevel;
  competency?: GeographyCompetency;
  learningOutcome?: string;
  topic: string;
  stimulus?: Stimulus;
  question?: string;
  explanation?: string;
  contentKnowledge?: string;
  sourceReference?: string;
  reviewStatus?: 'pending' | 'passed' | 'warning' | 'failed';
  reviewErrors?: any[];
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
  reviewStatus?: 'pending' | 'passed' | 'warning' | 'failed';
  reviewErrors?: any[];
  reviewHistory?: any[];
}

type Scope = 'natural' | 'population' | 'economic' | 'regional' | 'world' | 'map';
type CorrectKey = 'A' | 'B' | 'C' | 'D';

interface LessonProfile {
  scope: Scope;
  focus: string;
  coreFocus: string;
  driver: string;
  manifestation: string;
  significance: string;
  commonError: string;
  dataSubject: string;
  indicator: string;
}

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

const getFormula = (id: string): GeoFormula => (
  GEOGRAPHY_FORMULAS.find(formula => formula.id === id) ?? GEOGRAPHY_FORMULAS[0]
);

const pickShortAnswerFormulaIds = (formulaIds: string[], count: number) => {
  const safeFormulaIds = formulaIds.length > 0 ? formulaIds : ['ti_trong', 'muc_tang', 'toc_do_tang_truong'];
  if (safeFormulaIds.length <= count) {
    return Array.from({ length: count }, (_, index) => safeFormulaIds[index % safeFormulaIds.length]);
  }

  const startOffset = Math.floor(Math.random() * safeFormulaIds.length);
  return Array.from({ length: count }, (_, index) => safeFormulaIds[(startOffset + index) % safeFormulaIds.length]);
};

const cleanTitle = (lessonTitle: string) => lessonTitle.replace(/^Bài\s+\d+:\s*/i, '').trim();

const detectScope = (lessonTitle: string, topic: string): Scope => {
  const text = `${lessonTitle} ${topic}`.toLowerCase();
  if (/bản đồ|gps|tọa độ|kinh tuyến|vĩ tuyến/i.test(text)) return 'map';
  if (/dân số|lao động|việc làm|đô thị|dân cư/i.test(text)) return 'population';
  if (/nông nghiệp|lâm nghiệp|thủy sản|công nghiệp|dịch vụ|giao thông|thương mại|du lịch|kinh tế/i.test(text)) return 'economic';
  if (/vùng|đồng bằng|trung du|duyên hải|tây nguyên|đông nam bộ|biển đông|đảo|địa phương/i.test(text)) return 'regional';
  if (/hoa kỳ|nga|nhật bản|trung quốc|nam phi|tây nam á|đông nam á|mỹ la-tinh|châu âu|asean|bra-xin|đức|ô-xtrây-li-a/i.test(text)) return 'world';
  return 'natural';
};

const buildLessonProfile = (lessonTitle: string, topic: string): LessonProfile => {
  const title = cleanTitle(lessonTitle);
  const scope = detectScope(lessonTitle, topic);

  const profiles: Record<Scope, Omit<LessonProfile, 'scope' | 'focus'>> = {
    map: {
      coreFocus: 'Xác định đúng đối tượng địa lí, phương pháp biểu hiện và cách khai thác thông tin từ bản đồ.',
      driver: 'Tỉ lệ bản đồ, kí hiệu, phương hướng và hệ tọa độ địa lí.',
      manifestation: 'Đối tượng địa lí được thể hiện bằng kí hiệu phù hợp, có vị trí và phạm vi rõ trên bản đồ.',
      significance: 'Giúp xác định vị trí, phân bố và mối quan hệ không gian của các đối tượng địa lí.',
      commonError: 'Chỉ đọc tên bản đồ mà không đối chiếu kí hiệu, tỉ lệ và chú giải.',
      dataSubject: 'một tuyến khảo sát địa lí',
      indicator: 'khoảng cách và hướng di chuyển',
    },
    natural: {
      coreFocus: `Làm rõ đặc điểm, nguyên nhân và hệ quả địa lí của ${title}.`,
      driver: 'Vị trí địa lí, địa hình, bức xạ, hoàn lưu khí quyển và tác động tổng hợp của các thành phần tự nhiên.',
      manifestation: 'Sự phân hóa theo không gian, theo mùa hoặc theo đai cao tùy nội dung bài học.',
      significance: 'Là cơ sở giải thích đặc điểm tự nhiên và định hướng khai thác, bảo vệ tài nguyên.',
      commonError: 'Quy một hiện tượng tự nhiên phức hợp về một nguyên nhân duy nhất.',
      dataSubject: 'một trạm khí tượng',
      indicator: 'nhiệt độ và lượng mưa',
    },
    population: {
      coreFocus: `Phân tích quy mô, cơ cấu, phân bố và tác động phát triển liên quan đến ${title}.`,
      driver: 'Mức sinh, mức tử, di cư, cơ cấu tuổi, trình độ lao động và quá trình đô thị hóa.',
      manifestation: 'Sự khác biệt về mật độ, cơ cấu lao động hoặc tỉ lệ dân thành thị giữa các lãnh thổ.',
      significance: 'Cung cấp căn cứ cho sử dụng lao động, tổ chức không gian cư trú và phát triển dịch vụ xã hội.',
      commonError: 'Đồng nhất tăng dân số tự nhiên với tăng dân số cơ học.',
      dataSubject: 'một tỉnh/thành phố',
      indicator: 'dân số và cơ cấu lao động',
    },
    economic: {
      coreFocus: `Nhận diện vai trò, nguồn lực, phân bố và xu hướng phát triển của ${title}.`,
      driver: 'Nguồn lực tự nhiên, lao động, thị trường, khoa học - công nghệ, hạ tầng và chính sách phát triển.',
      manifestation: 'Sự chuyển dịch cơ cấu, thay đổi sản lượng, mở rộng thị trường hoặc hình thành lãnh thổ sản xuất.',
      significance: 'Góp phần nâng cao hiệu quả sử dụng nguồn lực và thúc đẩy phát triển bền vững.',
      commonError: 'Chỉ dựa vào tài nguyên tự nhiên mà bỏ qua thị trường, công nghệ và tổ chức sản xuất.',
      dataSubject: 'một ngành kinh tế',
      indicator: 'giá trị sản xuất và cơ cấu ngành',
    },
    regional: {
      coreFocus: `Đánh giá thế mạnh, hạn chế và định hướng phát triển lãnh thổ gắn với ${title}.`,
      driver: 'Vị trí, tài nguyên, dân cư, hạ tầng, liên kết vùng và yêu cầu bảo vệ môi trường.',
      manifestation: 'Sự khác biệt trong khai thác thế mạnh giữa các tiểu vùng hoặc địa phương.',
      significance: 'Hỗ trợ lựa chọn hướng phát triển phù hợp và tăng cường liên kết lãnh thổ.',
      commonError: 'Tách rời phát triển kinh tế với bảo vệ môi trường và quốc phòng an ninh.',
      dataSubject: 'một vùng kinh tế',
      indicator: 'quy mô dân số, GDP và sản lượng',
    },
    world: {
      coreFocus: `Phân tích vị trí, điều kiện tự nhiên, dân cư, xã hội và hoạt động kinh tế của ${title}.`,
      driver: 'Vị trí địa lí, tài nguyên, dân cư, trình độ phát triển, liên kết khu vực và bối cảnh toàn cầu.',
      manifestation: 'Sự khác biệt về cơ cấu kinh tế, mức độ phát triển hoặc vai trò trong khu vực.',
      significance: 'Giúp so sánh lãnh thổ và giải thích vị thế kinh tế - xã hội của quốc gia/khu vực.',
      commonError: 'Đánh giá một quốc gia/khu vực chỉ bằng một chỉ tiêu riêng lẻ.',
      dataSubject: 'một số quốc gia/khu vực',
      indicator: 'dân số và GDP',
    },
  };

  if (/vị trí địa lí và phạm vi lãnh thổ/i.test(title)) {
    return {
      scope: 'regional',
      focus: title,
      coreFocus: 'Nước ta nằm ở rìa phía đông bán đảo Đông Dương, gần trung tâm Đông Nam Á, trong khu vực nhiệt đới gió mùa và tiếp giáp Biển Đông.',
      driver: 'Vị trí nội chí tuyến, giáp Biển Đông, nằm gần trung tâm Đông Nam Á và trên các tuyến giao lưu quốc tế.',
      manifestation: 'Lãnh thổ nước ta gồm vùng đất, vùng biển và vùng trời; thiên nhiên chịu ảnh hưởng sâu sắc của Biển Đông.',
      significance: 'Tạo thuận lợi phát triển kinh tế biển, giao lưu khu vực và hình thành thiên nhiên nhiệt đới ẩm gió mùa.',
      commonError: 'Đồng nhất phạm vi lãnh thổ chỉ với phần đất liền, bỏ qua vùng biển và vùng trời.',
      dataSubject: 'nước ta',
      indicator: 'diện tích lãnh thổ và vùng biển',
    };
  }

  return {
    scope,
    focus: title,
    ...profiles[scope],
  };
};

const createOptions = (correctKey: CorrectKey, correct: string, distractors: string[]): QuizOption[] => {
  const keys: CorrectKey[] = ['A', 'B', 'C', 'D'];
  const optionTexts = normalizeDistractors(distractors).slice(0, 3);
  optionTexts.splice(keys.indexOf(correctKey), 0, correct);

  return keys.map((key, index) => ({
    key,
    text: optionTexts[index],
  }));
};

const technicalDistractorPatterns = [
  /độ\s+dài/i,
  /từ\s+khóa/i,
  /cảm\s+tính/i,
  /truyền\s+miệng/i,
  /tên\s+chương|tên\s+bài/i,
  /cụm\s+từ/i,
  /sơ\s+đồ\s+tư\s+duy/i,
  /phủ\s+định\s+toàn\s+bộ/i,
  /mọi\s+trường\s+hợp/i,
  /xuất\s+hiện\s+nhiều\s+nhất/i,
];

const replacementDistractors = [
  'Chỉ xem xét một biểu hiện riêng lẻ, chưa đặt trong mối quan hệ địa lí.',
  'Bỏ qua sự khác biệt theo lãnh thổ và thời gian của đối tượng địa lí.',
  'Nhận xét thiếu căn cứ từ số liệu hoặc ngữ liệu được cung cấp.',
  'Đồng nhất nguyên nhân với biểu hiện, chưa làm rõ bản chất địa lí.',
  'Tách dữ kiện khỏi bối cảnh tự nhiên, dân cư hoặc kinh tế - xã hội liên quan.',
];

const normalizeDistractors = (distractors: string[]) => {
  let replacementIndex = 0;

  return distractors.map(distractor => {
    const shouldReplace = technicalDistractorPatterns.some(pattern => pattern.test(distractor));
    if (!shouldReplace) return distractor;

    const replacement = replacementDistractors[replacementIndex % replacementDistractors.length];
    replacementIndex += 1;
    return replacement;
  });
};

const contextStimulus = (documentContext?: string): Stimulus | undefined => {
  const context = documentContext?.trim() ?? '';
  if (context.length < 120 || /\[có đính kèm/i.test(context)) return undefined;

  return {
    type: 'text',
    title: 'Ngữ liệu giáo viên cung cấp',
    content: context.slice(0, 450),
    source: 'Tài liệu tham khảo của giáo viên',
  };
};

const getMockDataValues = (index: number) => {
  const base = 100 + index * 12;
  const next = base + 28 + index * 3;

  return {
    base,
    next,
    increase: next - base,
    growthRate: round((next / base) * 100, 1),
  };
};

const tableStimulus = (profile: LessonProfile, index: number): Stimulus => {
  const { base, next } = getMockDataValues(index);
  const indicator = profile.indicator;
  const tableData = [
    {
      'Chỉ tiêu': indicator,
      'Năm 2015': base.toFixed(1),
      'Năm 2024': next.toFixed(1),
    },
  ];

  return {
    type: 'table',
    title: `Số liệu về ${indicator} của ${profile.dataSubject}, năm 2015 và 2024`,
    content: `Chỉ tiêu | Năm 2015 | Năm 2024\n${indicator} | ${base.toFixed(1)} | ${next.toFixed(1)}`,
    unit: 'Chỉ số giả định',
    source: 'Số liệu giả định dùng để luyện tập kĩ năng đọc bảng',
    tableData,
  };
};

interface MultipleChoiceTemplate {
  stem: string;
  correct: string;
  distractors: string[];
  stimulus?: Stimulus;
  explanation: string;
}

const buildMultipleChoiceTemplates = (
  profile: LessonProfile,
  topic: string,
  documentContext?: string
): MultipleChoiceTemplate[] => {
  const suppliedStimulus = contextStimulus(documentContext);
  const title = profile.focus;
  const data2 = getMockDataValues(2);
  const data3 = getMockDataValues(3);
  const data5 = getMockDataValues(5);
  const driverDistractors = [
    'Sự thay đổi ngẫu nhiên của một chỉ tiêu riêng lẻ trong thời gian ngắn.',
    'Cách sắp xếp tên đối tượng trong bảng số liệu hoặc trên biểu đồ.',
    'Sự khác nhau về hình thức trình bày thông tin giữa các tài liệu.',
  ];
  const manifestationDistractors = [
    'Các đối tượng có biểu hiện đồng nhất giữa mọi lãnh thổ và thời kì.',
    'Đặc điểm lãnh thổ tách rời các điều kiện tự nhiên và kinh tế - xã hội.',
    'Sự thay đổi chỉ thể hiện ở tên gọi, không làm biến đổi đặc điểm địa lí.',
  ];
  const significanceDistractors = [
    'Làm giảm sự khác biệt lãnh thổ và khiến các nguồn lực có giá trị như nhau.',
    'Thu hẹp khả năng khai thác nguồn lực và hạn chế liên kết giữa các lãnh thổ.',
    'Chỉ làm thay đổi cách gọi đối tượng, không ảnh hưởng đến tổ chức lãnh thổ.',
  ];
  const relationDistractors = [
    `Hình thức trình bày dữ liệu quyết định trực tiếp đặc điểm và sự phân bố của ${title}.`,
    `Tên gọi của chỉ tiêu làm xuất hiện sự khác biệt tự nhiên và kinh tế - xã hội giữa các lãnh thổ.`,
    `Một giá trị riêng lẻ quyết định toàn bộ biểu hiện và ý nghĩa địa lí của ${title}.`,
  ];
  const featureMeaningDistractors = significanceDistractors.map((significance, index) => (
    `${manifestationDistractors[index]} ${significance}`
  ));

  return [
    {
      stem: `Phát biểu nào sau đây đúng về ${title}?`,
      correct: profile.coreFocus,
      distractors: manifestationDistractors,
      explanation: `Đáp án đúng nêu được bản chất địa lí của ${title}, gắn với đặc điểm, nguyên nhân và hệ quả.`,
    },
    {
      stem: `Nhân tố nào sau đây tác động trực tiếp đến ${profile.indicator} của ${profile.dataSubject}?`,
      correct: profile.driver,
      distractors: driverDistractors,
      explanation: `Các nhân tố trực tiếp giúp giải thích đúng bản chất của ${title} trong mạch nội dung ${topic}.`,
    },
    {
      stem: `Biểu hiện nào sau đây đúng với ${title}?`,
      correct: profile.manifestation,
      distractors: manifestationDistractors,
      explanation: `Biểu hiện đúng phải thể hiện được tính phân hóa và mối liên hệ địa lí của bài học.`,
    },
    {
      stem: `Ý nghĩa chủ yếu của ${title} đối với phát triển lãnh thổ là gì?`,
      correct: profile.significance,
      distractors: significanceDistractors,
      explanation: `Đáp án nêu đúng ý nghĩa chủ yếu của ${title} đối với tổ chức và phát triển lãnh thổ.`,
    },
    {
      stem: `Nguyên nhân nào sau đây có vai trò chủ yếu đối với ${title}?`,
      correct: profile.driver,
      distractors: driverDistractors,
      explanation: `Đặc điểm của ${title} hình thành và biến đổi dưới tác động tổng hợp của các nhân tố địa lí nêu trong đáp án.`,
    },
    {
      stem: `Tác động tổng hợp của các nhân tố đối với ${title} được biểu hiện rõ nhất ở nội dung nào sau đây?`,
      correct: profile.manifestation,
      distractors: manifestationDistractors,
      explanation: `Biểu hiện nêu trong đáp án phản ánh trực tiếp sự tác động của các nhân tố đến ${title}.`,
    },
    {
      stimulus: suppliedStimulus ?? {
        type: 'text',
        title: `Thông tin về ${title}`,
        content: `${profile.coreFocus} ${profile.manifestation} ${profile.significance}`,
        source: suppliedStimulus ? 'Tài liệu giáo viên cung cấp' : 'Ngữ liệu biên soạn',
      },
      stem: `Căn cứ vào ngữ liệu, nhận xét nào sau đây đúng về ${title}?`,
      correct: profile.coreFocus,
      distractors: manifestationDistractors,
      explanation: `Nội dung đáp án phù hợp trực tiếp với thông tin được nêu trong ngữ liệu về ${title}.`,
    },
    {
      stimulus: tableStimulus(profile, 1),
      stem: `Căn cứ vào bảng số liệu, nhận xét nào sau đây đúng về sự thay đổi ${profile.indicator} của ${profile.dataSubject}?`,
      correct: `${profile.indicator} năm 2024 cao hơn năm 2015.`,
      distractors: [
        `${profile.indicator} năm 2024 thấp hơn năm 2015.`,
        `${profile.indicator} không thay đổi trong cả giai đoạn.`,
        `${profile.indicator} giảm liên tục qua từng năm trong giai đoạn.`,
      ],
      explanation: 'So sánh trực tiếp hai mốc thời gian cho thấy giá trị năm 2024 lớn hơn năm 2015.',
    },
    {
      stimulus: tableStimulus(profile, 2),
      stem: `Căn cứ vào bảng số liệu, ${profile.indicator} của ${profile.dataSubject} tăng thêm bao nhiêu trong giai đoạn 2015 - 2024?`,
      correct: `${data2.increase.toFixed(1)} chỉ số.`,
      distractors: [
        `${data2.base.toFixed(1)} chỉ số.`,
        `${data2.next.toFixed(1)} chỉ số.`,
        `${(data2.increase + 10).toFixed(1)} chỉ số.`,
      ],
      explanation: `Mức tăng bằng giá trị năm 2024 trừ giá trị năm 2015: ${data2.next.toFixed(1)} - ${data2.base.toFixed(1)} = ${data2.increase.toFixed(1)} chỉ số.`,
    },
    {
      stem: `Nguyên nhân chủ yếu tạo nên đặc điểm của ${title} là gì?`,
      correct: profile.driver,
      distractors: driverDistractors,
      explanation: `Nhóm nhân tố trong đáp án trực tiếp chi phối sự hình thành và biến đổi của ${title}.`,
    },
    {
      stem: `Mối quan hệ địa lí nào sau đây thể hiện rõ trong ${title}?`,
      correct: `${profile.driver} tác động và làm xuất hiện ${profile.manifestation.toLowerCase()}`,
      distractors: relationDistractors,
      explanation: `Phân tích ${title} cần làm rõ quan hệ giữa đặc điểm và nhân tố tác động.`,
    },
    {
      stem: `Hệ quả chủ yếu của ${title} đối với tổ chức và phát triển lãnh thổ là gì?`,
      correct: profile.significance,
      distractors: significanceDistractors,
      explanation: `Đáp án nêu đúng ý nghĩa địa lí chủ yếu của ${title} đối với phát triển lãnh thổ.`,
    },
    {
      stimulus: tableStimulus(profile, 3),
      stem: `Căn cứ vào bảng số liệu, tốc độ tăng trưởng ${profile.indicator} của ${profile.dataSubject} năm 2024 so với năm 2015 là bao nhiêu?`,
      correct: `${data3.growthRate.toFixed(1)}%.`,
      distractors: [
        `${data3.increase.toFixed(1)}%.`,
        `${(data3.growthRate - 20).toFixed(1)}%.`,
        `${(data3.growthRate + 20).toFixed(1)}%.`,
      ],
      explanation: `Tốc độ tăng trưởng = ${data3.next.toFixed(1)} / ${data3.base.toFixed(1)} x 100 = ${data3.growthRate.toFixed(1)}%.`,
    },
    {
      stimulus: {
        type: 'text',
        title: `Đặc điểm và ý nghĩa của ${title}`,
        content: `${profile.manifestation} ${profile.significance}`,
        source: 'Ngữ liệu biên soạn',
      },
      stem: `Phát biểu nào sau đây thể hiện đúng quan hệ giữa đặc điểm và ý nghĩa của ${title}?`,
      correct: `${profile.manifestation} ${profile.significance}`,
      distractors: featureMeaningDistractors,
      explanation: `Đáp án liên kết đúng biểu hiện với ý nghĩa địa lí của ${title}.`,
    },
    {
      stimulus: {
        type: 'text',
        title: `Tình huống khai thác ${title}`,
        content: `Một địa phương có biểu hiện ${profile.manifestation.toLowerCase()} và muốn phát huy lợi thế này mà không làm suy giảm tài nguyên, môi trường.`,
        source: 'Tình huống giả định',
      },
      stem: `Giải pháp nào sau đây phù hợp để phát huy ý nghĩa của ${title} đối với phát triển bền vững?`,
      correct: `Khai thác các lợi thế gắn với đặc điểm lãnh thổ, sử dụng hợp lí nguồn lực và bảo vệ môi trường.`,
      distractors: [
        'Mở rộng khai thác nguồn lực theo cùng một cách ở nhiều lãnh thổ khác nhau.',
        'Ưu tiên tăng quy mô khai thác trước khi đánh giá sức chịu tải của môi trường.',
        'Tách hoạt động kinh tế khỏi yêu cầu liên kết vùng và bảo vệ tài nguyên.',
      ],
      explanation: `Phát triển bền vững cần đồng thời phát huy lợi thế của ${title}, sử dụng hợp lí nguồn lực và bảo vệ môi trường.`,
    },
    {
      stimulus: tableStimulus(profile, 4),
      stem: `Căn cứ vào bảng số liệu, dạng biểu đồ nào thích hợp nhất để thể hiện ${profile.indicator} qua hai năm?`,
      correct: 'Biểu đồ cột để so sánh giá trị giữa các năm.',
      distractors: [
        'Biểu đồ tròn để thể hiện cơ cấu của một tổng thể tại một thời điểm.',
        'Biểu đồ miền để thể hiện sự chuyển dịch cơ cấu qua nhiều năm.',
        'Biểu đồ kết hợp để thể hiện đồng thời hai chỉ tiêu khác đơn vị.',
      ],
      explanation: 'Với hai mốc năm và một chỉ tiêu, biểu đồ cột là lựa chọn rõ ràng để so sánh.',
    },
    {
      stimulus: tableStimulus(profile, 5),
      stem: `Căn cứ vào bảng số liệu, năm 2024 ${profile.indicator} của ${profile.dataSubject} cao gấp bao nhiêu lần năm 2015?`,
      correct: `${round(data5.next / data5.base, 2).toFixed(2)} lần.`,
      distractors: [
        `${round(data5.base / data5.next, 2).toFixed(2)} lần.`,
        `${round(data5.next / data5.increase, 2).toFixed(2)} lần.`,
        `${round(data5.growthRate / 10, 2).toFixed(2)} lần.`,
      ],
      explanation: `Số lần tăng = ${data5.next.toFixed(1)} / ${data5.base.toFixed(1)} = ${round(data5.next / data5.base, 2).toFixed(2)} lần.`,
    },
    {
      stimulus: {
        type: 'text',
        title: `Quan hệ địa lí của ${title}`,
        content: `${profile.driver} Từ đó hình thành ${profile.manifestation.toLowerCase()} ${profile.significance}`,
        source: 'Ngữ liệu biên soạn',
      },
      stem: `Căn cứ vào ngữ liệu, kết luận nào sau đây đúng về ${title}?`,
      correct: profile.significance,
      distractors: significanceDistractors,
      explanation: `Kết luận trong đáp án phù hợp với quan hệ nhân tố - biểu hiện - ý nghĩa được nêu trong ngữ liệu.`,
    },
  ];
};

const selectFormulaIds = (profile: LessonProfile): string[] => {
  const byScope: Record<Scope, string[]> = {
    map: [
      'doi_hai_li_sang_km',
      'khoang_cach_thuc_te_tu_ti_le_ban_do',
      'khoang_cach_ban_do_tu_ti_le',
      'ti_le_phan_tram',
      'ti_le_dien_tich',
      'chenh_lech_toa_do',
      'chenh_lech_mui_gio',
    ],
    natural: [
      'bien_do_nhiet',
      'nhiet_do_theo_do_cao',
      'do_cao_day_nui',
      'chenh_lech_nhiet_do_suon_nui',
      'nhiet_do_suon_don_gio',
      'nhiet_do_suon_khuat_gio',
      'luong_mua_nam',
      'tong_luong_nuoc_mua_lu',
      'ti_le_luong_nuoc_mua_lu',
      'tong_luong_nuoc_mua_can',
      'ti_le_luong_nuoc_mua_can',
    ],
    population: [
      'mat_do_dan_so',
      'ti_suat_sinh_tho',
      'ti_suat_tu_tho',
      'gia_tang_tu_nhien',
      'ti_suat_nhap_cu',
      'ti_suat_xuat_cu',
      'gia_tang_co_hoc',
      'so_dan_thanh_thi',
      'so_dan_nong_thon',
      'ti_so_gioi_tinh',
      'ti_le_nam',
      'ti_le_nu',
      'ti_le_tang_dan_so',
      'tang_dan_so_tuyet_doi',
    ],
    economic: ['ti_trong', 'gia_tri_thanh_phan', 'co_cau_kinh_te', 'toc_do_tang_truong', 'muc_tang', 'can_can_xnk', 'tong_kim_ngach', 'cu_li_van_chuyen'],
    regional: ['mat_do_dan_so', 'ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang', 'ti_le_che_phu_rung', 'cu_li_van_chuyen'],
    world: ['gdp_binh_quan', 'ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang', 'can_can_xnk', 'tong_kim_ngach', 'ti_so_gioi_tinh'],
  };

  return byScope[profile.scope];
};

const buildShortAnswerCase = (formulaId: string, formula: GeoFormula, profile: LessonProfile, index: number) => {
  const year = 2024;
  const baseYear = 2015;
  const rounding = 'Làm tròn kết quả đến 1 chữ số thập phân';

  switch (formulaId) {
    case 'mat_do_dan_so': {
      const population = 8718.6 + index * 185.4;
      const area = 3359.8 + index * 92.5;
      const answer = Math.round((population * 1000) / area);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có dân số ${population.toFixed(1)} nghìn người và diện tích ${area.toFixed(1)} km2.`,
        question: `Hãy tính mật độ dân số của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { populationThousand: population, areaKm2: area },
        correctAnswer: answer,
        unit: 'người/km2',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Mật độ dân số = Dân số / Diện tích = ${population.toFixed(1)} nghìn người x 1000 / ${area.toFixed(1)} km2 = ${answer} người/km2.`,
      };
    }
    case 'gia_tang_tu_nhien': {
      const birth = 15.2 + index * 0.2;
      const death = 6.1 + index * 0.1;
      const answer = round(birth - death, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có tỉ suất sinh thô ${birth.toFixed(1)}‰ và tỉ suất tử thô ${death.toFixed(1)}‰.`,
        question: `Hãy tính tỉ suất gia tăng dân số tự nhiên của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { crudeBirthRate: birth, crudeDeathRate: death },
        correctAnswer: answer,
        unit: '‰',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ suất gia tăng dân số tự nhiên = Tỉ suất sinh thô - Tỉ suất tử thô = ${birth.toFixed(1)} - ${death.toFixed(1)} = ${answer}‰.`,
      };
    }
    case 'ti_suat_sinh_tho': {
      const population = 10 + index;
      const births = 150 + index * 20;
      const answer = round(births / population, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có dân số trung bình ${population.toFixed(1)} triệu người và số trẻ sinh ra là ${births.toFixed(1)} nghìn người.`,
        question: `Hãy tính tỉ suất sinh thô của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { birthsThousand: births, populationMillion: population },
        correctAnswer: answer,
        unit: '‰',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ suất sinh thô = Số trẻ sinh ra / Dân số trung bình x 1000 = ${births.toFixed(1)} nghìn / ${population.toFixed(1)} triệu x 1000 = ${answer}‰.`,
      };
    }
    case 'ti_suat_tu_tho': {
      const population = 12 + index;
      const deaths = 72 + index * 8;
      const answer = round(deaths / population, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có dân số trung bình ${population.toFixed(1)} triệu người và số người chết là ${deaths.toFixed(1)} nghìn người.`,
        question: `Hãy tính tỉ suất tử thô của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { deathsThousand: deaths, populationMillion: population },
        correctAnswer: answer,
        unit: '‰',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ suất tử thô = Số người chết / Dân số trung bình x 1000 = ${deaths.toFixed(1)} nghìn / ${population.toFixed(1)} triệu x 1000 = ${answer}‰.`,
      };
    }
    case 'ti_suat_nhap_cu': {
      const population = 8 + index;
      const migrants = 40 + index * 8;
      const answer = round(migrants / population, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có dân số trung bình ${population.toFixed(1)} triệu người và số người nhập cư là ${migrants.toFixed(1)} nghìn người.`,
        question: `Hãy tính tỉ suất nhập cư của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { immigrantsThousand: migrants, populationMillion: population },
        correctAnswer: answer,
        unit: '‰',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ suất nhập cư = Số người nhập cư / Dân số trung bình x 1000 = ${migrants.toFixed(1)} nghìn / ${population.toFixed(1)} triệu x 1000 = ${answer}‰.`,
      };
    }
    case 'ti_suat_xuat_cu': {
      const population = 9 + index;
      const migrants = 27 + index * 6;
      const answer = round(migrants / population, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có dân số trung bình ${population.toFixed(1)} triệu người và số người xuất cư là ${migrants.toFixed(1)} nghìn người.`,
        question: `Hãy tính tỉ suất xuất cư của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { emigrantsThousand: migrants, populationMillion: population },
        correctAnswer: answer,
        unit: '‰',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ suất xuất cư = Số người xuất cư / Dân số trung bình x 1000 = ${migrants.toFixed(1)} nghìn / ${population.toFixed(1)} triệu x 1000 = ${answer}‰.`,
      };
    }
    case 'gia_tang_co_hoc': {
      const immigrationRate = 7.8 + index * 0.3;
      const emigrationRate = 4.5 + index * 0.2;
      const answer = round(immigrationRate - emigrationRate, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có tỉ suất nhập cư ${immigrationRate.toFixed(1)}‰ và tỉ suất xuất cư ${emigrationRate.toFixed(1)}‰.`,
        question: `Hãy tính tỉ suất gia tăng cơ học của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { immigrationRate, emigrationRate },
        correctAnswer: answer,
        unit: '‰',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ suất gia tăng cơ học = Tỉ suất nhập cư - Tỉ suất xuất cư = ${immigrationRate.toFixed(1)} - ${emigrationRate.toFixed(1)} = ${answer}‰.`,
      };
    }
    case 'san_luong': {
      const area = 742.5 + index * 18.6;
      const yieldValue = 63.2 + index * 1.4;
      const answer = Math.round((area * yieldValue) / 10);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có diện tích gieo trồng ${area.toFixed(1)} nghìn ha và năng suất ${yieldValue.toFixed(1)} tạ/ha.`,
        question: `Hãy tính sản lượng cây trồng của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { areaThousandHa: area, yieldQuintalPerHa: yieldValue },
        correctAnswer: answer,
        unit: 'nghìn tấn',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Sản lượng = Diện tích x Năng suất = ${area.toFixed(1)} nghìn ha x ${yieldValue.toFixed(1)} tạ/ha / 10 = ${answer} nghìn tấn.`,
      };
    }
    case 'nang_suat': {
      const output = 4689.0 + index * 155.5;
      const area = 742.5 + index * 18.6;
      const answer = round((output / area) * 10, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có sản lượng cây trồng ${output.toFixed(1)} nghìn tấn và diện tích gieo trồng ${area.toFixed(1)} nghìn ha.`,
        question: `Hãy tính năng suất cây trồng của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { outputThousandTon: output, areaThousandHa: area },
        correctAnswer: answer,
        unit: 'tạ/ha',
        tolerance: 0.1,
        rounding,
        solution: `Năng suất = Sản lượng / Diện tích = ${output.toFixed(1)} nghìn tấn / ${area.toFixed(1)} nghìn ha x 10 = ${answer} tạ/ha.`,
      };
    }
    case 'binh_quan_luong_thuc': {
      const output = 43.5 + index * 1.2;
      const population = 101.3 + index * 0.9;
      const answer = Math.round((output * 1000) / population);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có sản lượng lương thực ${output.toFixed(1)} triệu tấn và dân số ${population.toFixed(1)} triệu người.`,
        question: `Hãy tính bình quân lương thực theo đầu người của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { outputMillionTon: output, populationMillion: population },
        correctAnswer: answer,
        unit: 'kg/người',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Bình quân lương thực = Sản lượng lương thực / Dân số = ${output.toFixed(1)} triệu tấn x 1000 / ${population.toFixed(1)} triệu người = ${answer} kg/người.`,
      };
    }
    case 'ti_le_dan_thanh_thi':
    case 'ti_le_dan_nong_thon':
    case 'ti_le_nam':
    case 'ti_le_nu':
    case 'ti_trong':
    case 'ti_le_phan_tram':
    case 'co_cau_kinh_te': {
      const total = 11510.3 + index * 340.5;
      const part = 4318.2 + index * 126.4;
      const answer = round((part / total) * 100, 1);
      const label = formulaId === 'ti_le_dan_thanh_thi'
        ? 'dân thành thị'
        : formulaId === 'ti_le_dan_nong_thon'
          ? 'dân nông thôn'
          : formulaId === 'ti_le_nam'
            ? 'dân số nam'
            : formulaId === 'ti_le_nu'
              ? 'dân số nữ'
              : formulaId === 'ti_le_phan_tram'
                ? 'diện tích vùng biển'
                : 'khu vực công nghiệp và xây dựng';
      const totalLabel = formulaId.includes('dan') || formulaId === 'ti_le_nam' || formulaId === 'ti_le_nu'
        ? 'tổng dân số'
        : formulaId === 'ti_le_phan_tram'
          ? 'tổng diện tích lãnh thổ mở rộng được cho'
          : 'GDP theo giá hiện hành';
      const question = formulaId === 'co_cau_kinh_te'
        ? `Hãy xác định cơ cấu của ${label} trong ${totalLabel} của ${profile.dataSubject} năm ${year}.`
        : `Hãy tính tỉ trọng ${label} trong ${totalLabel} của ${profile.dataSubject} năm ${year}.`;
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có ${totalLabel} là ${total.toFixed(1)}, trong đó ${label} đạt ${part.toFixed(1)}.`,
        question,
        formulaName: formula.name,
        inputData: { componentValue: part, totalValue: total },
        correctAnswer: answer,
        unit: '%',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ trọng = Giá trị thành phần / Tổng giá trị x 100 = ${part.toFixed(1)} / ${total.toFixed(1)} x 100 = ${answer}%.`,
      };
    }
    case 'so_dan_thanh_thi':
    case 'so_dan_nong_thon': {
      const totalPopulation = 9.6 + index * 0.4;
      const rate = formulaId === 'so_dan_thanh_thi' ? 37.5 + index * 0.5 : 62.5 - index * 0.5;
      const answer = round((totalPopulation * rate) / 100, 1);
      const groupLabel = formulaId === 'so_dan_thanh_thi' ? 'thành thị' : 'nông thôn';
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có tổng dân số ${totalPopulation.toFixed(1)} triệu người, tỉ lệ dân ${groupLabel} là ${rate.toFixed(1)}%.`,
        question: `Hãy tính số dân ${groupLabel} của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { totalPopulationMillion: totalPopulation, rate },
        correctAnswer: answer,
        unit: 'triệu người',
        tolerance: 0.1,
        rounding,
        solution: `Số dân ${groupLabel} = Tổng dân số x Tỉ lệ dân ${groupLabel} / 100 = ${totalPopulation.toFixed(1)} x ${rate.toFixed(1)} / 100 = ${answer} triệu người.`,
      };
    }
    case 'ti_so_gioi_tinh': {
      const male = 4.9 + index * 0.2;
      const female = 5.1 + index * 0.2;
      const answer = round((male / female) * 100, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có dân số nam ${male.toFixed(1)} triệu người và dân số nữ ${female.toFixed(1)} triệu người.`,
        question: `Hãy tính tỉ số giới tính của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { malePopulationMillion: male, femalePopulationMillion: female },
        correctAnswer: answer,
        unit: 'nam/100 nữ',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ số giới tính = Số nam / Số nữ x 100 = ${male.toFixed(1)} / ${female.toFixed(1)} x 100 = ${answer} nam/100 nữ.`,
      };
    }
    case 'doi_hai_li_sang_km': {
      const nauticalMileOptions = [12, 24, 200, 188];
      const nauticalMiles = nauticalMileOptions[index % nauticalMileOptions.length];
      const answer = Math.round(nauticalMiles * 1.852);
      return {
        stimulus: `Theo quy ước, 1 hải lí bằng 1,852 km. Một bộ phận vùng biển được xác định rộng ${nauticalMiles} hải lí.`,
        question: `Hãy đổi chiều rộng ${nauticalMiles} hải lí ra ki-lô-mét.`,
        formulaName: formula.name,
        inputData: { nauticalMiles, kilometersPerNauticalMile: 1.852 },
        correctAnswer: answer,
        unit: 'km',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Đổi hải lí sang ki-lô-mét = Số hải lí x 1,852 = ${nauticalMiles} x 1,852 = ${answer} km.`,
      };
    }
    case 'chieu_rong_vung_bien_km': {
      const parts = [
        { name: 'lãnh hải', width: 12 },
        { name: 'vùng tiếp giáp lãnh hải tính từ đường cơ sở', width: 24 },
        { name: 'vùng đặc quyền kinh tế tính từ đường cơ sở', width: 200 },
      ];
      const selectedPart = parts[index % parts.length];
      const answer = Math.round(selectedPart.width * 1.852);
      return {
        stimulus: `Theo quy ước, 1 hải lí bằng 1,852 km. ${selectedPart.name} của nước ta được xác định rộng ${selectedPart.width} hải lí.`,
        question: `Hãy tính chiều rộng theo km của ${selectedPart.name}.`,
        formulaName: formula.name,
        inputData: { seaPart: selectedPart.name, nauticalMiles: selectedPart.width, kilometersPerNauticalMile: 1.852 },
        correctAnswer: answer,
        unit: 'km',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Chiều rộng bộ phận vùng biển = Số hải lí x 1,852 = ${selectedPart.width} x 1,852 = ${answer} km.`,
      };
    }
    case 'khoang_cach_thuc_te_tu_ti_le_ban_do': {
      const mapDistanceCm = 2.4 + index * 0.2;
      const scaleDenominator = 2500000;
      const answer = round((mapDistanceCm * scaleDenominator) / 100000, 1);
      return {
        stimulus: `Trên một lược đồ có tỉ lệ 1:${scaleDenominator.toLocaleString('vi-VN')}, khoảng cách giữa hai điểm đo được là ${mapDistanceCm.toFixed(1)} cm.`,
        question: `Hãy tính khoảng cách thực tế giữa hai điểm đó.`,
        formulaName: formula.name,
        inputData: { mapDistanceCm, scaleDenominator },
        correctAnswer: answer,
        unit: 'km',
        tolerance: 0.1,
        rounding,
        solution: `Khoảng cách thực tế = Khoảng cách trên bản đồ x mẫu số tỉ lệ / 100 000 = ${mapDistanceCm.toFixed(1)} x ${scaleDenominator} / 100 000 = ${answer} km.`,
      };
    }
    case 'khoang_cach_ban_do_tu_ti_le': {
      const realDistanceKm = 120 + index * 10;
      const scaleDenominator = 5000000;
      const answer = round((realDistanceKm * 100000) / scaleDenominator, 1);
      return {
        stimulus: `Khoảng cách thực tế giữa hai địa điểm là ${realDistanceKm} km. Lược đồ sử dụng tỉ lệ 1:${scaleDenominator.toLocaleString('vi-VN')}.`,
        question: `Hãy tính khoảng cách giữa hai địa điểm đó trên lược đồ.`,
        formulaName: formula.name,
        inputData: { realDistanceKm, scaleDenominator },
        correctAnswer: answer,
        unit: 'cm',
        tolerance: 0.1,
        rounding,
        solution: `Khoảng cách trên bản đồ = Khoảng cách thực tế x 100 000 / mẫu số tỉ lệ = ${realDistanceKm} x 100 000 / ${scaleDenominator} = ${answer} cm.`,
      };
    }
    case 'ti_le_dien_tich': {
      const landArea = 331.3;
      const seaArea = 1000 + index * 20;
      const totalArea = landArea + seaArea;
      const answer = round((landArea / totalArea) * 100, 1);
      return {
        stimulus: `${profile.dataSubject === 'nước ta' ? 'Việt Nam' : profile.dataSubject} có diện tích đất liền khoảng ${landArea.toFixed(1)} nghìn km2 và diện tích vùng biển khoảng ${seaArea.toFixed(1)} nghìn km2.`,
        question: `Hãy tính tỉ lệ diện tích đất liền trong tổng diện tích đất liền và vùng biển đã cho.`,
        formulaName: formula.name,
        inputData: { landAreaThousandKm2: landArea, seaAreaThousandKm2: seaArea, totalAreaThousandKm2: totalArea },
        correctAnswer: answer,
        unit: '%',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ lệ diện tích = Diện tích thành phần / Tổng diện tích x 100 = ${landArea.toFixed(1)} / (${landArea.toFixed(1)} + ${seaArea.toFixed(1)}) x 100 = ${answer}%.`,
      };
    }
    case 'toc_do_tang_truong':
    case 'toc_do_tang_dan_so': {
      const base = 157.9 + index * 18.3;
      const current = 293.1 + index * 24.7;
      const answer = Math.round((current / base) * 100);
      return {
        stimulus: `${profile.indicator} của ${profile.dataSubject} năm ${baseYear} là ${base.toFixed(1)} và năm ${year} là ${current.toFixed(1)}.`,
        question: `Hãy tính tốc độ tăng trưởng ${profile.indicator} năm ${year} so với năm ${baseYear}, lấy năm ${baseYear} = 100%.`,
        formulaName: formula.name,
        inputData: { baseYearValue: base, currentYearValue: current },
        correctAnswer: answer,
        unit: '%',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Tốc độ tăng trưởng = Giá trị năm sau / Giá trị năm gốc x 100 = ${current.toFixed(1)} / ${base.toFixed(1)} x 100 = ${answer}%.`,
      };
    }
    case 'ti_le_tang_dan_so': {
      const base = 96.5 + index * 0.6;
      const current = 98.2 + index * 0.7;
      const answer = round(((current - base) / base) * 100, 1);
      return {
        stimulus: `Dân số của ${profile.dataSubject} năm ${baseYear} là ${base.toFixed(1)} triệu người và năm ${year} là ${current.toFixed(1)} triệu người.`,
        question: `Hãy tính tỉ lệ tăng dân số của ${profile.dataSubject} năm ${year} so với năm ${baseYear}.`,
        formulaName: formula.name,
        inputData: { basePopulationMillion: base, currentPopulationMillion: current },
        correctAnswer: answer,
        unit: '%',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ lệ tăng dân số = (Dân số năm sau - Dân số năm trước) / Dân số năm trước x 100 = (${current.toFixed(1)} - ${base.toFixed(1)}) / ${base.toFixed(1)} x 100 = ${answer}%.`,
      };
    }
    case 'tang_dan_so_tuyet_doi': {
      const base = 96.5 + index * 0.6;
      const current = 98.2 + index * 0.7;
      const answer = round(current - base, 1);
      return {
        stimulus: `Dân số của ${profile.dataSubject} năm ${baseYear} là ${base.toFixed(1)} triệu người và năm ${year} là ${current.toFixed(1)} triệu người.`,
        question: `Hãy tính số dân tăng thêm của ${profile.dataSubject} trong giai đoạn ${baseYear} - ${year}.`,
        formulaName: formula.name,
        inputData: { basePopulationMillion: base, currentPopulationMillion: current },
        correctAnswer: answer,
        unit: 'triệu người',
        tolerance: 0.1,
        rounding,
        solution: `Số dân tăng thêm = Dân số năm sau - Dân số năm trước = ${current.toFixed(1)} - ${base.toFixed(1)} = ${answer} triệu người.`,
      };
    }
    case 'muc_tang': {
      const base = 3104.7 + index * 84.2;
      const current = 4877.3 + index * 96.5;
      const answer = Math.round(current - base);
      return {
        stimulus: `Số lượt vận chuyển của ${profile.dataSubject} năm ${baseYear} là ${base.toFixed(1)} triệu lượt và năm ${year} là ${current.toFixed(1)} triệu lượt.`,
        question: `Hãy tính mức tăng số lượt vận chuyển của ${profile.dataSubject} năm ${year} so với năm ${baseYear}.`,
        formulaName: formula.name,
        inputData: { baseYearValue: base, currentYearValue: current },
        correctAnswer: answer,
        unit: 'triệu lượt',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Mức tăng = Giá trị năm sau - Giá trị năm trước = ${current.toFixed(1)} - ${base.toFixed(1)} = ${answer} triệu lượt.`,
      };
    }
    case 'gia_tri_thanh_phan': {
      const totalValue = 100 + index * 5;
      const share = 32 + index;
      const answer = round((totalValue * share) / 100, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có tổng giá trị là ${totalValue.toFixed(1)} nghìn tỉ đồng; một ngành/thành phần/vùng chiếm ${share.toFixed(1)}%.`,
        question: `Hãy tính giá trị của ngành/thành phần/vùng đó trong tổng giá trị của ${profile.dataSubject}.`,
        formulaName: formula.name,
        inputData: { totalValue, share },
        correctAnswer: answer,
        unit: 'nghìn tỉ đồng',
        tolerance: 0.1,
        rounding,
        solution: `Giá trị của thành phần = Tổng giá trị x Tỉ trọng / 100 = ${totalValue.toFixed(1)} x ${share.toFixed(1)} / 100 = ${answer} nghìn tỉ đồng.`,
      };
    }
    case 'can_can_xnk': {
      const exportValue = 322.7 + index * 11.4;
      const importValue = 299.5 + index * 9.6;
      const answer = round(exportValue - importValue, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có trị giá xuất khẩu ${exportValue.toFixed(1)} tỉ USD và trị giá nhập khẩu ${importValue.toFixed(1)} tỉ USD.`,
        question: `Hãy tính cán cân xuất nhập khẩu của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { exportValue, importValue },
        correctAnswer: answer,
        unit: 'tỉ USD',
        tolerance: 0.1,
        rounding,
        solution: `Cán cân xuất nhập khẩu = Xuất khẩu - Nhập khẩu = ${exportValue.toFixed(1)} - ${importValue.toFixed(1)} = ${answer} tỉ USD.`,
      };
    }
    case 'tong_kim_ngach': {
      const exportValue = 322.7 + index * 10.5;
      const importValue = 299.5 + index * 8.8;
      const answer = Math.round(exportValue + importValue);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có trị giá xuất khẩu ${exportValue.toFixed(1)} tỉ USD và trị giá nhập khẩu ${importValue.toFixed(1)} tỉ USD.`,
        question: `Hãy tính tổng kim ngạch xuất nhập khẩu của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { exportValue, importValue },
        correctAnswer: answer,
        unit: 'tỉ USD',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Tổng kim ngạch xuất nhập khẩu = Xuất khẩu + Nhập khẩu = ${exportValue.toFixed(1)} + ${importValue.toFixed(1)} = ${answer} tỉ USD.`,
      };
    }
    case 'gdp_binh_quan': {
      const gdp = 106.7 + index * 3.5;
      const population = 36.9 + index * 1.2;
      const answer = Math.round((gdp * 1000) / population);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có GDP ${gdp.toFixed(1)} tỉ USD và dân số ${population.toFixed(1)} triệu người.`,
        question: `Hãy tính GDP bình quân đầu người của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { gdpBillionUsd: gdp, populationMillion: population },
        correctAnswer: answer,
        unit: 'USD/người',
        tolerance: 1,
        rounding: 'Làm tròn đến đơn vị',
        solution: `GDP bình quân đầu người = GDP / Dân số = ${gdp.toFixed(1)} tỉ USD / ${population.toFixed(1)} triệu người = ${answer} USD/người.`,
      };
    }
    case 'bien_do_nhiet': {
      const highest = 28.7 + index * 0.3;
      const lowest = 18.9 - index * 0.1;
      const answer = round(highest - lowest, 1);
      return {
        stimulus: `Tại ${profile.dataSubject}, nhiệt độ tháng cao nhất là ${highest.toFixed(1)}°C và nhiệt độ tháng thấp nhất là ${lowest.toFixed(1)}°C.`,
        question: `Hãy tính biên độ nhiệt năm của ${profile.dataSubject}.`,
        formulaName: formula.name,
        inputData: { highestTemperature: highest, lowestTemperature: lowest },
        correctAnswer: answer,
        unit: '°C',
        tolerance: 0.1,
        rounding,
        solution: `Biên độ nhiệt năm = Nhiệt độ tháng cao nhất - Nhiệt độ tháng thấp nhất = ${highest.toFixed(1)} - ${lowest.toFixed(1)} = ${answer}°C.`,
      };
    }
    case 'nhiet_do_theo_do_cao': {
      const baseTemperature = 27.2 + index * 0.2;
      const altitudeDifference = 900 + index * 150;
      const answer = round(baseTemperature - (altitudeDifference / 100) * 0.6, 1);
      return {
        stimulus: `Ở ${profile.dataSubject}, nhiệt độ tại chân núi là ${baseTemperature.toFixed(1)}°C. Một điểm quan trắc cao hơn chân núi ${altitudeDifference} m.`,
        question: `Hãy tính nhiệt độ tại điểm quan trắc theo quy luật cứ lên cao 100 m nhiệt độ giảm 0,6°C.`,
        formulaName: formula.name,
        inputData: { baseTemperature, altitudeDifference },
        correctAnswer: answer,
        unit: '°C',
        tolerance: 0.1,
        rounding,
        solution: `Nhiệt độ theo độ cao = ${baseTemperature.toFixed(1)} - (${altitudeDifference} / 100 x 0,6) = ${answer}°C.`,
      };
    }
    case 'do_cao_day_nui': {
      const footTemperature = 27.0;
      const summitTemperature = 18.0 - index * 0.6;
      const temperatureDifference = footTemperature - summitTemperature;
      const answer = Math.round((temperatureDifference / 0.6) * 100);
      return {
        stimulus: `Ở chân một dãy núi, nhiệt độ là ${footTemperature.toFixed(1)}°C; tại đỉnh núi, nhiệt độ là ${summitTemperature.toFixed(1)}°C. Cứ lên cao 100 m, nhiệt độ giảm 0,6°C.`,
        question: `Hãy tính độ cao tương đối của dãy núi đó.`,
        formulaName: formula.name,
        inputData: { footTemperature, summitTemperature, temperatureLapseRate: 0.6 },
        correctAnswer: answer,
        unit: 'm',
        tolerance: 1,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Độ cao dãy núi = Chênh lệch nhiệt độ / 0,6 x 100 = (${footTemperature.toFixed(1)} - ${summitTemperature.toFixed(1)}) / 0,6 x 100 = ${answer} m.`,
      };
    }
    case 'chenh_lech_nhiet_do_suon_nui': {
      const windwardTemperature = 20.6 + index * 0.2;
      const leewardTemperature = 27.1 + index * 0.2;
      const answer = round(Math.abs(leewardTemperature - windwardTemperature), 1);
      return {
        stimulus: `Tại cùng độ cao quan sát, nhiệt độ sườn đón gió là ${windwardTemperature.toFixed(1)}°C, nhiệt độ sườn khuất gió là ${leewardTemperature.toFixed(1)}°C.`,
        question: `Hãy tính chênh lệch nhiệt độ giữa hai sườn núi.`,
        formulaName: formula.name,
        inputData: { windwardTemperature, leewardTemperature },
        correctAnswer: answer,
        unit: '°C',
        tolerance: 0.1,
        rounding,
        solution: `Chênh lệch nhiệt độ hai sườn núi = |${leewardTemperature.toFixed(1)} - ${windwardTemperature.toFixed(1)}| = ${answer}°C.`,
      };
    }
    case 'nhiet_do_suon_don_gio': {
      const footTemperature = 26.4 + index * 0.2;
      const altitude = 800 + index * 100;
      const answer = round(footTemperature - (altitude / 100) * 0.6, 1);
      return {
        stimulus: `Ở chân núi sườn đón gió, nhiệt độ là ${footTemperature.toFixed(1)}°C. Một điểm trên sườn đón gió cao hơn chân núi ${altitude} m. Cứ lên cao 100 m, nhiệt độ giảm 0,6°C.`,
        question: `Hãy tính nhiệt độ tại điểm đó trên sườn đón gió.`,
        formulaName: formula.name,
        inputData: { footTemperature, altitude, temperatureLapseRate: 0.6 },
        correctAnswer: answer,
        unit: '°C',
        tolerance: 0.1,
        rounding,
        solution: `Nhiệt độ sườn đón gió = Nhiệt độ chân núi - Độ cao / 100 x 0,6 = ${footTemperature.toFixed(1)} - ${altitude} / 100 x 0,6 = ${answer}°C.`,
      };
    }
    case 'nhiet_do_suon_khuat_gio': {
      const summitTemperature = 18.0 + index * 0.2;
      const descentAltitude = 900 + index * 100;
      const answer = round(summitTemperature + (descentAltitude / 100) * 1.0, 1);
      return {
        stimulus: `Tại đỉnh núi, nhiệt độ là ${summitTemperature.toFixed(1)}°C. Một điểm bên sườn khuất gió thấp hơn đỉnh núi ${descentAltitude} m. Khi xuống thấp 100 m, nhiệt độ tăng 1,0°C.`,
        question: `Hãy tính nhiệt độ tại điểm đó trên sườn khuất gió.`,
        formulaName: formula.name,
        inputData: { summitTemperature, descentAltitude, warmingRate: 1.0 },
        correctAnswer: answer,
        unit: '°C',
        tolerance: 0.1,
        rounding,
        solution: `Nhiệt độ sườn khuất gió = Nhiệt độ đỉnh núi + Độ cao hạ xuống / 100 x 1,0 = ${summitTemperature.toFixed(1)} + ${descentAltitude} / 100 x 1,0 = ${answer}°C.`,
      };
    }
    case 'chenh_lech_toa_do': {
      const northernLatitude = 23.4;
      const southernLatitude = 8.6;
      const answer = round(northernLatitude - southernLatitude, 1);
      return {
        stimulus: `Điểm cực Bắc của nước ta ở khoảng ${northernLatitude.toFixed(1)}°B, điểm cực Nam ở khoảng ${southernLatitude.toFixed(1)}°B.`,
        question: `Hãy tính chênh lệch vĩ độ giữa điểm cực Bắc và điểm cực Nam của nước ta.`,
        formulaName: formula.name,
        inputData: { northernLatitude, southernLatitude },
        correctAnswer: answer,
        unit: 'độ',
        tolerance: 0.1,
        rounding,
        solution: `Chênh lệch tọa độ = Tọa độ lớn nhất - Tọa độ nhỏ nhất = ${northernLatitude.toFixed(1)} - ${southernLatitude.toFixed(1)} = ${answer} độ.`,
      };
    }
    case 'chenh_lech_mui_gio': {
      const longitudeA = 105 + index * 5;
      const longitudeB = 135 + index * 5;
      const answer = round(Math.abs(longitudeB - longitudeA) / 15, 1);
      return {
        stimulus: `Một địa điểm A ở kinh tuyến ${longitudeA}°Đ và địa điểm B ở kinh tuyến ${longitudeB}°Đ.`,
        question: `Hãy tính chênh lệch múi giờ giữa hai địa điểm A và B.`,
        formulaName: formula.name,
        inputData: { longitudeA, longitudeB },
        correctAnswer: answer,
        unit: 'giờ',
        tolerance: 0.1,
        rounding,
        solution: `Chênh lệch múi giờ = Chênh lệch kinh độ / 15 = |${longitudeB} - ${longitudeA}| / 15 = ${answer} giờ.`,
      };
    }
    case 'luong_mua_nam': {
      const months = [18, 24, 38, 76, 152, 218, 286, 312, 258, 169, 82, 35].map(value => value + index * 2);
      const answer = months.reduce((sum, value) => sum + value, 0);
      return {
        stimulus: `Lượng mưa các tháng của ${profile.dataSubject} lần lượt là: ${months.join(', ')} mm.`,
        question: `Hãy tính tổng lượng mưa năm của ${profile.dataSubject}.`,
        formulaName: formula.name,
        inputData: { monthlyRainfall: months },
        correctAnswer: answer,
        unit: 'mm',
        tolerance: 0,
        rounding: 'Kết quả lấy đến hàng đơn vị',
        solution: `Lượng mưa năm = Tổng lượng mưa 12 tháng = ${months.join(' + ')} = ${answer} mm.`,
      };
    }
    case 'luong_mua_tb': {
      const totalRainfall = 960 + index * 12;
      const answer = round(totalRainfall / 12, 1);
      return {
        stimulus: `Tổng lượng mưa năm của ${profile.dataSubject} là ${totalRainfall} mm.`,
        question: `Hãy tính lượng mưa trung bình tháng của ${profile.dataSubject}.`,
        formulaName: formula.name,
        inputData: { totalRainfall, months: 12 },
        correctAnswer: answer,
        unit: 'mm',
        tolerance: 0.1,
        rounding,
        solution: `Lượng mưa trung bình tháng = Tổng lượng mưa năm / 12 = ${totalRainfall} / 12 = ${answer} mm.`,
      };
    }
    case 'tong_luong_nuoc_mua_lu': {
      const floodSeasonFlows = [620, 710, 830, 760, 680].map(value => value + index * 5);
      const answer = floodSeasonFlows.reduce((sum, value) => sum + value, 0);
      return {
        stimulus: `Lưu lượng nước trung bình các tháng mùa lũ của một sông lần lượt là: ${floodSeasonFlows.join(', ')} m3/s.`,
        question: `Hãy tính tổng lượng nước các tháng mùa lũ của sông đó.`,
        formulaName: formula.name,
        inputData: { floodSeasonFlows },
        correctAnswer: answer,
        unit: 'm3/s',
        tolerance: 0,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Tổng lượng nước mùa lũ = Tổng lưu lượng các tháng mùa lũ = ${floodSeasonFlows.join(' + ')} = ${answer} m3/s.`,
      };
    }
    case 'tong_luong_nuoc_mua_can': {
      const drySeasonFlows = [210, 180, 160, 190, 220, 260, 280].map(value => value + index * 3);
      const answer = drySeasonFlows.reduce((sum, value) => sum + value, 0);
      return {
        stimulus: `Lưu lượng nước trung bình các tháng mùa cạn của một sông lần lượt là: ${drySeasonFlows.join(', ')} m3/s.`,
        question: `Hãy tính tổng lượng nước các tháng mùa cạn của sông đó.`,
        formulaName: formula.name,
        inputData: { drySeasonFlows },
        correctAnswer: answer,
        unit: 'm3/s',
        tolerance: 0,
        rounding: 'Làm tròn kết quả đến hàng đơn vị',
        solution: `Tổng lượng nước mùa cạn = Tổng lưu lượng các tháng mùa cạn = ${drySeasonFlows.join(' + ')} = ${answer} m3/s.`,
      };
    }
    case 'ti_le_luong_nuoc_mua_lu': {
      const floodSeasonTotal = 3600 + index * 40;
      const drySeasonTotal = 1200 + index * 20;
      const annualTotal = floodSeasonTotal + drySeasonTotal;
      const answer = round((floodSeasonTotal / annualTotal) * 100, 1);
      return {
        stimulus: `Một sông có tổng lượng nước mùa lũ là ${floodSeasonTotal} m3/s và tổng lượng nước mùa cạn là ${drySeasonTotal} m3/s.`,
        question: `Hãy tính tỉ lệ lượng nước mùa lũ trong tổng lượng nước năm của sông đó.`,
        formulaName: formula.name,
        inputData: { floodSeasonTotal, drySeasonTotal, annualTotal },
        correctAnswer: answer,
        unit: '%',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ lệ lượng nước mùa lũ = Tổng lượng nước mùa lũ / Tổng lượng nước năm x 100 = ${floodSeasonTotal} / (${floodSeasonTotal} + ${drySeasonTotal}) x 100 = ${answer}%.`,
      };
    }
    case 'ti_le_luong_nuoc_mua_can': {
      const floodSeasonTotal = 3600 + index * 40;
      const drySeasonTotal = 1200 + index * 20;
      const annualTotal = floodSeasonTotal + drySeasonTotal;
      const answer = round((drySeasonTotal / annualTotal) * 100, 1);
      return {
        stimulus: `Một sông có tổng lượng nước mùa lũ là ${floodSeasonTotal} m3/s và tổng lượng nước mùa cạn là ${drySeasonTotal} m3/s.`,
        question: `Hãy tính tỉ lệ lượng nước mùa cạn trong tổng lượng nước năm của sông đó.`,
        formulaName: formula.name,
        inputData: { floodSeasonTotal, drySeasonTotal, annualTotal },
        correctAnswer: answer,
        unit: '%',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ lệ lượng nước mùa cạn = Tổng lượng nước mùa cạn / Tổng lượng nước năm x 100 = ${drySeasonTotal} / (${floodSeasonTotal} + ${drySeasonTotal}) x 100 = ${answer}%.`,
      };
    }
    case 'ti_le_che_phu_rung': {
      const forestArea = 14.9 + index * 0.4;
      const naturalArea = 33.1 + index * 0.6;
      const answer = round((forestArea / naturalArea) * 100, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có diện tích rừng ${forestArea.toFixed(1)} triệu ha và diện tích tự nhiên ${naturalArea.toFixed(1)} triệu ha.`,
        question: `Hãy tính tỉ lệ che phủ rừng của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { forestArea, naturalArea },
        correctAnswer: answer,
        unit: '%',
        tolerance: 0.1,
        rounding,
        solution: `Tỉ lệ che phủ rừng = Diện tích rừng / Diện tích tự nhiên x 100 = ${forestArea.toFixed(1)} / ${naturalArea.toFixed(1)} x 100 = ${answer}%.`,
      };
    }
    case 'cu_li_van_chuyen': {
      const turnover = 126000 + index * 3600;
      const volume = 3500 + index * 120;
      const answer = round(turnover / volume, 1);
      return {
        stimulus: `Năm ${year}, ${profile.dataSubject} có khối lượng luân chuyển ${turnover.toLocaleString('vi-VN')} triệu tấn.km và khối lượng vận chuyển ${volume.toLocaleString('vi-VN')} triệu tấn.`,
        question: `Hãy tính cự li vận chuyển trung bình của ${profile.dataSubject} năm ${year}.`,
        formulaName: formula.name,
        inputData: { turnover, volume },
        correctAnswer: answer,
        unit: 'km',
        tolerance: 0.1,
        rounding,
        solution: `Cự li vận chuyển trung bình = Khối lượng luân chuyển / Khối lượng vận chuyển = ${turnover} / ${volume} = ${answer} km.`,
      };
    }
    default:
      return buildShortAnswerCase('ti_trong', getFormula('ti_trong'), profile, index);
  }
};

export const generateQuestionsByMockAI = async (
  lessonTitle: string,
  grade: number,
  topic: string,
  lessonId: string,
  documentContext?: string
): Promise<GeneratedQuiz> => {
  await new Promise(resolve => setTimeout(resolve, 900));

  const blueprint = GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT;
  const profile = buildLessonProfile(lessonTitle, topic);
  const assessmentProfile = getLessonAssessmentProfile(lessonId, lessonTitle, topic);
  const templates = buildMultipleChoiceTemplates(profile, topic, documentContext);
  const questions: QuizQuestion[] = [];
  const sourceReference = `${GEOGRAPHY_BOOK_NAME}; bài học: ${lessonTitle}`;

  for (let i = 0; i < blueprint.multipleChoice; i++) {
    const template = templates[i % templates.length];
    const correctAnswer = MC_CORRECT_ANSWER_SEQUENCE[i] as CorrectKey;
    const level = MC_LEVEL_SEQUENCE[i] as QuestionLevel;

    questions.push({
      id: `mc_${i + 1}`,
      lessonId,
      section: 'I',
      topic,
      level,
      competency: getCompetencyForLevel(level, 'multiple_choice', i),
      learningOutcome: getLearningOutcomeForLevel(assessmentProfile, level),
      sourceReference,
      reviewStatus: 'pending',
      type: 'multiple_choice',
      stimulus: template.stimulus ?? { type: 'none' },
      question: template.stem,
      options: createOptions(correctAnswer, template.correct, template.distractors),
      correctAnswer,
      explanation: template.explanation,
    });
  }

  const tfAnswerPatterns = [
    [true, false, true, false],
    [false, true, true, false],
    [true, true, false, false],
    [false, true, false, true],
  ];

  for (let i = 0; i < blueprint.trueFalse; i++) {
    const answers = tfAnswerPatterns[i % tfAnswerPatterns.length];
    const level = TF_LEVEL_SEQUENCE[i] as QuestionLevel;
    const statementVariants = [
      {
        trueText: profile.coreFocus,
        falseText: `${profile.focus} có đặc điểm đồng nhất giữa các lãnh thổ và ổn định qua mọi thời kì.`,
        trueExplanation: `Nhận định nêu đúng đặc điểm cốt lõi của ${profile.focus}.`,
        falseExplanation: `Nhận định sai vì ${profile.focus} có sự khác biệt theo lãnh thổ hoặc biến đổi theo thời gian.`,
      },
      {
        trueText: profile.manifestation,
        falseText: `Biểu hiện của ${profile.focus} tách rời điều kiện tự nhiên và kinh tế - xã hội của lãnh thổ.`,
        trueExplanation: `Nhận định phù hợp với biểu hiện địa lí của ${profile.focus}.`,
        falseExplanation: 'Nhận định sai vì các hiện tượng địa lí luôn chịu tác động của bối cảnh lãnh thổ.',
      },
      {
        trueText: `${profile.driver} là nhóm nhân tố có tác động quan trọng đến ${profile.focus}.`,
        falseText: `Sự biến đổi của ${profile.focus} chủ yếu do cách đặt tên chỉ tiêu và hình thức trình bày dữ liệu.`,
        trueExplanation: `Nhận định xác định đúng nhóm nhân tố tác động đến ${profile.focus}.`,
        falseExplanation: 'Nhận định sai vì hình thức trình bày dữ liệu không phải nguyên nhân làm biến đổi hiện tượng địa lí.',
      },
      {
        trueText: profile.significance,
        falseText: `${profile.focus} làm thu hẹp khả năng sử dụng nguồn lực và cản trở liên kết giữa các lãnh thổ.`,
        trueExplanation: `Nhận định nêu đúng ý nghĩa địa lí của ${profile.focus}.`,
        falseExplanation: `Nhận định đảo ngược ý nghĩa chủ yếu của ${profile.focus} đối với phát triển lãnh thổ.`,
      },
    ];
    const statements = statementVariants.map((variant, index) => ({
      label: (['a', 'b', 'c', 'd'] as const)[index],
      text: answers[index] ? variant.trueText : variant.falseText,
      answer: answers[index],
      explanation: answers[index] ? variant.trueExplanation : variant.falseExplanation,
    }));

    questions.push({
      id: `tf_${i + 1}`,
      lessonId,
      section: 'II',
      topic,
      level,
      competency: getCompetencyForLevel(level, 'true_false', i),
      learningOutcome: getLearningOutcomeForLevel(assessmentProfile, level),
      sourceReference,
      reviewStatus: 'pending',
      type: 'true_false',
      stimulus: {
        type: 'text',
        title: `Thông tin về ${profile.focus}`,
        content: `${profile.coreFocus} ${profile.driver} ${profile.manifestation} ${profile.significance}`,
        source: 'Ngữ liệu biên soạn',
      },
      question: 'Căn cứ vào ngữ liệu, trong mỗi ý a), b), c), d), hãy chọn đúng hoặc sai.',
      statements,
    });
  }

  const formulaIds = assessmentProfile.allowedFormulaIds.length > 0
    ? assessmentProfile.allowedFormulaIds
    : selectFormulaIds(profile);
  const selectedShortAnswerFormulaIds = pickShortAnswerFormulaIds(formulaIds, blueprint.shortAnswer);
  for (let i = 0; i < blueprint.shortAnswer; i++) {
    const formulaId = selectedShortAnswerFormulaIds[i];
    const formula = getFormula(formulaId);
    const shortCase = buildShortAnswerCase(formulaId, formula, profile, i);
    const level = SA_LEVEL_SEQUENCE[i] as QuestionLevel;
    const shortStem = shortCase.question.trim().replace(/[.?!]+$/, '');
    const roundingInstruction = shortCase.rounding.trim().replace(/^Làm/, 'làm');

    questions.push({
      id: `sa_${i + 1}`,
      lessonId,
      section: 'III',
      topic,
      level,
      competency: getCompetencyForLevel(level, 'short_answer', i),
      learningOutcome: getLearningOutcomeForLevel(assessmentProfile, level),
      sourceReference,
      reviewStatus: 'pending',
      type: 'short_answer',
      stimulus: {
        type: 'text',
        title: `Số liệu phục vụ tính toán về ${profile.focus}`,
        content: shortCase.stimulus,
        source: 'Số liệu giả định theo phong cách đề tốt nghiệp THPT',
      },
      question: `${shortStem} (${roundingInstruction}).`,
      shortAnswer: {
        formula: shortCase.formulaName,
        inputData: shortCase.inputData,
        correctAnswer: shortCase.correctAnswer,
        unit: shortCase.unit,
        tolerance: shortCase.tolerance,
        rounding: shortCase.rounding,
        solution: shortCase.solution,
        answerFormat: 'Phiếu trả lời 4 ô, nhập số, không nhập đơn vị',
        maxCharacters: 4,
      },
    });
  }

  return {
    id: `quiz_${crypto.randomUUID()}`,
    lessonId,
    title: `Đề luyện tập: ${lessonTitle}`,
    grade,
    totalQuestions: questions.length,
    questions,
    createdAt: new Date().toISOString(),
  };
};
