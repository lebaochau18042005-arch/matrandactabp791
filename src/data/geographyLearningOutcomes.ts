import { GEOGRAPHY_FORMULAS } from './geographyFormulas';
import { GEOGRAPHY_LESSONS } from './geographyLessons';

export type GeographyCompetency =
  | 'Nhận thức khoa học địa lí'
  | 'Tìm hiểu địa lí'
  | 'Vận dụng kiến thức, kĩ năng đã học';

export type LearningOutcomeLevel = 'know' | 'understand' | 'apply';

export interface LessonAssessmentProfile {
  lessonId: string;
  lessonTitle: string;
  topic: string;
  outcomes: Record<LearningOutcomeLevel, string>;
  allowedFormulaIds: string[];
  shortAnswerGuidance: string;
  forbiddenTools: string[];
}

export const GEOGRAPHY_COMPETENCIES: GeographyCompetency[] = [
  'Nhận thức khoa học địa lí',
  'Tìm hiểu địa lí',
  'Vận dụng kiến thức, kĩ năng đã học',
];

export const FORBIDDEN_ASSESSMENT_TOOLS = ['Atlat Địa lí Việt Nam'] as const;

const terrainClimateFormulaIds = [
  'bien_do_nhiet',
  'nhiet_do_theo_do_cao',
  'do_cao_day_nui',
  'chenh_lech_nhiet_do_suon_nui',
  'nhiet_do_suon_don_gio',
  'nhiet_do_suon_khuat_gio',
  'luong_mua_nam',
  'luong_mua_tb',
  'tong_luong_nuoc_mua_lu',
  'tong_luong_nuoc_mua_can',
  'ti_le_luong_nuoc_mua_lu',
  'ti_le_luong_nuoc_mua_can',
] as const;

const populationFormulaIds = [
  'mat_do_dan_so',
  'ti_suat_sinh_tho',
  'ti_suat_tu_tho',
  'gia_tang_tu_nhien',
  'ti_suat_nhap_cu',
  'ti_suat_xuat_cu',
  'gia_tang_co_hoc',
  'ti_le_dan_thanh_thi',
  'ti_le_dan_nong_thon',
  'so_dan_thanh_thi',
  'so_dan_nong_thon',
  'ti_so_gioi_tinh',
  'ti_le_nam',
  'ti_le_nu',
  'toc_do_tang_dan_so',
  'ti_le_tang_dan_so',
  'tang_dan_so_tuyet_doi',
  'ti_trong',
  'muc_tang',
] as const;

const economicStructureFormulaIds = [
  'co_cau_kinh_te',
  'ti_trong',
  'gia_tri_thanh_phan',
  'toc_do_tang_truong',
  'muc_tang',
] as const;

const cleanLessonTitle = (lessonTitle: string) => lessonTitle.replace(/^Bài\s+\d+:\s*/i, '').trim();

const defaultOutcomes = (title: string): Record<LearningOutcomeLevel, string> => ({
  know: `Nhận biết được khái niệm, đặc điểm, phạm vi hoặc biểu hiện cơ bản của ${title}.`,
  understand: `Phân tích, giải thích được nguyên nhân, mối quan hệ và ý nghĩa địa lí của ${title}.`,
  apply: `Sử dụng dữ liệu, bảng số liệu, biểu đồ hoặc tình huống thực tiễn để nhận xét, tính toán, đề xuất giải pháp liên quan đến ${title}.`,
});

const LESSON_OVERRIDES: Record<string, Partial<LessonAssessmentProfile>> = {
  '10_1': {
    outcomes: {
      know: 'Trình bày được đặc điểm, vai trò của môn Địa lí và một số nhóm nghề nghiệp có liên quan.',
      understand: 'Phân tích được vai trò của kiến thức, kĩ năng địa lí đối với đời sống và các nhóm nghề nghiệp.',
      apply: 'Liên hệ được sở thích, năng lực cá nhân với một số nghề nghiệp liên quan đến môn Địa lí.',
    },
    allowedFormulaIds: ['ti_trong', 'ti_le_phan_tram'],
    shortAnswerGuidance: 'Chỉ dùng bảng khảo sát hoặc thống kê chính thức liên quan trực tiếp đến nhóm nghề, lựa chọn nghề nghiệp hoặc kĩ năng địa lí để tính tỉ trọng/tỉ lệ phần trăm; không dùng dữ liệu bản đồ, hải lí hoặc lãnh thổ.',
  },
  '12_1': {
    outcomes: {
      know: 'Trình bày được đặc điểm vị trí địa lí, phạm vi lãnh thổ gồm vùng đất, vùng biển, vùng trời của Việt Nam.',
      understand: 'Phân tích được ảnh hưởng của vị trí địa lí và phạm vi lãnh thổ đến tự nhiên, kinh tế - xã hội và quốc phòng an ninh.',
      apply: 'Vận dụng dữ liệu về lãnh thổ, tọa độ, hải lí, tỉ lệ bản đồ, khoảng cách hoặc tỉ lệ diện tích để nhận xét ý nghĩa vị trí địa lí của Việt Nam.',
    },
    allowedFormulaIds: [
      'doi_hai_li_sang_km',
      'chieu_rong_vung_bien_km',
      'khoang_cach_thuc_te_tu_ti_le_ban_do',
      'khoang_cach_ban_do_tu_ti_le',
      'ti_le_phan_tram',
      'ti_le_dien_tich',
      'chenh_lech_toa_do',
      'chenh_lech_mui_gio',
    ],
    shortAnswerGuidance: 'Câu trả lời ngắn chỉ dùng dữ liệu được cho ngay trong đề về hải lí, chiều rộng bộ phận vùng biển, tỉ lệ bản đồ, diện tích lãnh thổ, tọa độ địa lí hoặc chênh lệch kinh độ/múi giờ.',
  },
  '12_2': {
    outcomes: {
      know: 'Trình bày được biểu hiện của thiên nhiên nhiệt đới ẩm gió mùa qua khí hậu, địa hình, sông ngòi, đất và sinh vật.',
      understand: 'Giải thích được nguyên nhân hình thành tính chất nhiệt đới ẩm gió mùa và ảnh hưởng của nó đến sản xuất, đời sống.',
      apply: 'Xử lí số liệu nhiệt độ, lượng mưa hoặc tình huống thiên tai để nhận xét đặc điểm khí hậu và đề xuất cách thích ứng.',
    },
    allowedFormulaIds: [...terrainClimateFormulaIds],
    shortAnswerGuidance: 'Câu trả lời ngắn dùng bảng nhiệt độ, lượng mưa, lưu lượng nước, độ cao hoặc sườn đón gió/khuất gió do đề cung cấp; không yêu cầu tài liệu ngoài đề.',
  },
  '12_3': {
    allowedFormulaIds: [...terrainClimateFormulaIds, 'ti_le_che_phu_rung'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với số liệu phân hóa nhiệt, mưa, đai cao, sườn núi, mùa nước hoặc lớp phủ rừng giữa các lãnh thổ.',
  },
  '12_5': {
    allowedFormulaIds: ['ti_le_che_phu_rung', 'ti_trong', 'muc_tang', 'toc_do_tang_truong'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với tỉ lệ che phủ rừng, cơ cấu tài nguyên hoặc mức biến động tài nguyên - môi trường.',
  },
  '12_6': {
    allowedFormulaIds: [...populationFormulaIds],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với quy mô dân số, mật độ, sinh thô, tử thô, gia tăng tự nhiên, nhập cư, xuất cư, giới tính, thành thị - nông thôn hoặc mức tăng dân số.',
  },
  '12_7': {
    allowedFormulaIds: ['ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang', 'ti_le_tang_dan_so', 'tang_dan_so_tuyet_doi'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với cơ cấu lao động, giá trị từng nhóm lao động, mức tăng lao động hoặc tốc độ/tỉ lệ tăng theo số liệu được cho.',
  },
  '12_8': {
    allowedFormulaIds: ['ti_le_dan_thanh_thi', 'ti_le_dan_nong_thon', 'so_dan_thanh_thi', 'so_dan_nong_thon', 'toc_do_tang_dan_so', 'ti_le_tang_dan_so', 'tang_dan_so_tuyet_doi', 'muc_tang'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với tỉ lệ và số dân thành thị/nông thôn hoặc mức thay đổi quy mô dân đô thị.',
  },
  '12_10': {
    allowedFormulaIds: [...economicStructureFormulaIds],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với cơ cấu GDP, tỉ trọng ngành, giá trị từng ngành/thành phần hoặc mức chuyển dịch cơ cấu kinh tế.',
  },
  '12_11': {
    allowedFormulaIds: ['san_luong', 'nang_suat', 'binh_quan_luong_thuc', 'ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với sản lượng, năng suất, bình quân lương thực, tỉ trọng hoặc giá trị từng ngành nông nghiệp.',
  },
  '12_12': {
    allowedFormulaIds: ['ti_le_che_phu_rung', 'san_luong', 'ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với độ che phủ rừng, sản lượng thủy sản, cơ cấu hoặc giá trị lâm nghiệp - thủy sản.',
  },
  '12_14': {
    allowedFormulaIds: ['san_luong', 'nang_suat', 'binh_quan_luong_thuc', 'ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang'],
    shortAnswerGuidance: 'Câu trả lời ngắn dùng số liệu nông nghiệp, lâm nghiệp, thủy sản do đề cung cấp để tính sản lượng, năng suất, tỉ trọng, giá trị thành phần và nhận xét.',
  },
  '12_15': {
    allowedFormulaIds: [...economicStructureFormulaIds],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với cơ cấu ngành công nghiệp, giá trị từng ngành/thành phần, mức tăng hoặc tốc độ tăng trưởng giá trị công nghiệp.',
  },
  '12_16': {
    allowedFormulaIds: ['ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với sản lượng điện, than, dầu khí, tỉ trọng hoặc giá trị một số ngành công nghiệp theo số liệu cho sẵn.',
  },
  '12_18': {
    allowedFormulaIds: ['ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang'],
    shortAnswerGuidance: 'Câu trả lời ngắn dùng số liệu công nghiệp để tính mức tăng, tốc độ tăng trưởng, tỉ trọng hoặc giá trị thành phần trước khi nhận xét.',
  },
  '12_20': {
    allowedFormulaIds: ['cu_li_van_chuyen', 'muc_tang', 'toc_do_tang_truong', 'ti_trong', 'gia_tri_thanh_phan'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với khối lượng vận chuyển, luân chuyển, cự li vận chuyển, cơ cấu hoặc giá trị từng loại hình vận tải.',
  },
  '12_21': {
    allowedFormulaIds: ['can_can_xnk', 'tong_kim_ngach', 'toc_do_tang_truong', 'ti_trong', 'gia_tri_thanh_phan', 'muc_tang'],
    shortAnswerGuidance: 'Câu trả lời ngắn gắn với xuất nhập khẩu, tổng kim ngạch, cán cân thương mại, lượt khách, doanh thu hoặc giá trị từng thành phần dịch vụ.',
  },
};

const formulaRules: Array<{ pattern: RegExp; ids: string[]; guidance: string }> = [
  {
    pattern: /vị trí|phạm vi|lãnh thổ/i,
    ids: [
      'doi_hai_li_sang_km',
      'chieu_rong_vung_bien_km',
      'khoang_cach_thuc_te_tu_ti_le_ban_do',
      'khoang_cach_ban_do_tu_ti_le',
      'ti_le_phan_tram',
      'ti_le_dien_tich',
      'chenh_lech_toa_do',
      'chenh_lech_mui_gio',
    ],
    guidance: 'Dùng dữ liệu tọa độ, diện tích, hải lí, tỉ lệ bản đồ hoặc chênh lệch kinh độ/múi giờ được cung cấp ngay trong đề.',
  },
  {
    pattern: /bản đồ|gps|tọa độ|kinh tuyến|vĩ tuyến/i,
    ids: [
      'khoang_cach_thuc_te_tu_ti_le_ban_do',
      'khoang_cach_ban_do_tu_ti_le',
      'ti_le_phan_tram',
      'chenh_lech_toa_do',
      'chenh_lech_mui_gio',
    ],
    guidance: 'Chỉ dùng dữ liệu về tỉ lệ bản đồ, khoảng cách, tọa độ, kinh độ hoặc múi giờ có trong bài; không tự gán các công thức vùng biển/hải lí khi bài không đề cập.',
  },
  {
    pattern: /khí hậu|nhiệt|mưa|gió mùa|thời tiết|khí quyển|địa hình|núi|sông|thủy|lũ|cạn/i,
    ids: [...terrainClimateFormulaIds],
    guidance: 'Dùng bảng nhiệt độ, lượng mưa, lưu lượng nước, độ cao, sườn đón gió hoặc sườn khuất gió do đề cung cấp.',
  },
  {
    pattern: /dân số|dân cư|lao động|việc làm|đô thị/i,
    ids: [...populationFormulaIds],
    guidance: 'Dùng số liệu dân số, lao động, đô thị hóa, giới tính, sinh - tử hoặc di cư để tính mật độ, cơ cấu, tỉ suất, mức tăng hoặc tốc độ tăng.',
  },
  {
    pattern: /nông nghiệp|lương thực|cây trồng|chăn nuôi/i,
    ids: ['san_luong', 'nang_suat', 'binh_quan_luong_thuc', 'ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang'],
    guidance: 'Dùng số liệu diện tích, năng suất, sản lượng, dân số, tỉ trọng hoặc giá trị từng ngành nông nghiệp.',
  },
  {
    pattern: /lâm nghiệp|rừng|thủy sản|sinh vật|tài nguyên|môi trường/i,
    ids: ['ti_le_che_phu_rung', 'san_luong', 'ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang'],
    guidance: 'Dùng số liệu diện tích rừng, sản lượng thủy sản, tỉ trọng hoặc giá trị thành phần tài nguyên - môi trường.',
  },
  {
    pattern: /công nghiệp|cơ cấu kinh tế|gdp|kinh tế/i,
    ids: [...economicStructureFormulaIds, 'gdp_binh_quan'],
    guidance: 'Dùng số liệu cơ cấu GDP, giá trị sản xuất, tỉ trọng ngành, giá trị thành phần hoặc tốc độ tăng trưởng.',
  },
  {
    pattern: /giao thông|vận tải|bưu chính|viễn thông/i,
    ids: ['cu_li_van_chuyen', 'muc_tang', 'toc_do_tang_truong', 'ti_trong', 'gia_tri_thanh_phan'],
    guidance: 'Dùng số liệu vận chuyển, luân chuyển, cơ cấu hoặc giá trị từng loại hình vận tải.',
  },
  {
    pattern: /thương mại|du lịch|xuất khẩu|nhập khẩu|tài chính/i,
    ids: ['can_can_xnk', 'tong_kim_ngach', 'toc_do_tang_truong', 'ti_trong', 'gia_tri_thanh_phan', 'muc_tang'],
    guidance: 'Dùng số liệu xuất khẩu, nhập khẩu, lượt khách, doanh thu hoặc giá trị từng thành phần dịch vụ.',
  },
];

const inferFormulaProfile = (lessonTitle: string) => {
  // Tên bài là phạm vi kiến thức cụ thể. Không dùng từ khóa rộng của chương
  // để gán công thức, vì dễ làm lệch YCCĐ của bài đang chọn.
  const rule = formulaRules.find(item => item.pattern.test(lessonTitle));

  return rule ?? {
    ids: ['ti_trong', 'gia_tri_thanh_phan', 'toc_do_tang_truong', 'muc_tang', 'ti_le_phan_tram'],
    guidance: `Chỉ dùng số liệu có nội dung trực tiếp với ${lessonTitle} để tính tỉ trọng, giá trị thành phần, tỉ lệ phần trăm, tốc độ tăng trưởng hoặc mức tăng; không mượn dữ kiện từ bài khác trong cùng chương.`,
  };
};

export const getLessonAssessmentProfile = (
  lessonId: string,
  lessonTitle?: string,
  topic?: string
): LessonAssessmentProfile => {
  const lesson = GEOGRAPHY_LESSONS.find(item => item.id === lessonId);
  const resolvedTitle = cleanLessonTitle(lessonTitle || lesson?.title || 'bài học đã chọn');
  const resolvedTopic = topic || lesson?.topic || 'Môn Địa lí THPT';
  const inferred = inferFormulaProfile(resolvedTitle);
  const override = LESSON_OVERRIDES[lessonId] ?? {};

  return {
    lessonId,
    lessonTitle: resolvedTitle,
    topic: resolvedTopic,
    outcomes: override.outcomes ?? defaultOutcomes(resolvedTitle),
    allowedFormulaIds: override.allowedFormulaIds ?? inferred.ids,
    shortAnswerGuidance: override.shortAnswerGuidance ?? inferred.guidance,
    forbiddenTools: [...FORBIDDEN_ASSESSMENT_TOOLS],
  };
};

export const getLearningOutcomeForLevel = (
  profile: LessonAssessmentProfile,
  level: string
) => {
  if (level === 'Nhận biết') return profile.outcomes.know;
  if (level === 'Thông hiểu') return profile.outcomes.understand;
  return profile.outcomes.apply;
};

export const getCompetencyForLevel = (
  level: string,
  questionType: 'multiple_choice' | 'true_false' | 'short_answer',
  index = 0
): GeographyCompetency => {
  if (questionType === 'short_answer') return 'Tìm hiểu địa lí';
  if (level === 'Vận dụng' || level === 'Vận dụng cao') return 'Vận dụng kiến thức, kĩ năng đã học';
  if (index % 3 === 1 || questionType === 'true_false') return 'Tìm hiểu địa lí';
  return 'Nhận thức khoa học địa lí';
};

export const getAllowedFormulaNames = (profile: LessonAssessmentProfile) => (
  profile.allowedFormulaIds
    .map(id => GEOGRAPHY_FORMULAS.find(formula => formula.id === id)?.name)
    .filter((name): name is string => Boolean(name))
);
