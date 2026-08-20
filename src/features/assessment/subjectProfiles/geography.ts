import type { SubjectProfile } from './types';

export const GEOGRAPHY_SUBJECT_PROFILE: SubjectProfile = {
  id: 'geography',
  version: 1,
  code: 'GEO',
  name: 'Địa lí',
  displayName: 'Địa lí THPT',
  aliases: ['Địa lý', 'Geography', 'Địa lí THPT'],
  supportedGrades: ['10', '11', '12'],
  cognitiveLevels: [
    { id: 'know', label: 'Biết', shortLabel: 'B', aiCode: 'B' },
    { id: 'understand', label: 'Hiểu', shortLabel: 'H', aiCode: 'H' },
    { id: 'apply', label: 'Vận dụng', shortLabel: 'VD', aiCode: 'VD' }
  ],
  questionTypes: [
    { id: 'mc', label: 'Trắc nghiệm nhiều lựa chọn', shortLabel: 'Nhiều lựa chọn', category: 'objective', scoringMode: 'per-question', defaultPoints: 0.25 },
    { id: 'tf', label: 'Trắc nghiệm Đúng – Sai', shortLabel: 'Đúng - Sai', category: 'objective', scoringMode: 'per-question', defaultPoints: 1 },
    { id: 'short', label: 'Trắc nghiệm trả lời ngắn', shortLabel: 'Trả lời ngắn', category: 'objective', scoringMode: 'per-question', defaultPoints: 0.5 },
    { id: 'essay', label: 'Tự luận', shortLabel: 'Tự luận', category: 'constructed-response', scoringMode: 'per-level', defaultPoints: { know: 0, understand: 0, apply: 0 } }
  ],
  competencies: [
    { code: 'NL1', label: 'Nhận thức khoa học địa lí', description: 'Nhận thức thế giới theo quan điểm không gian và giải thích các hiện tượng, quá trình địa lí.' },
    { code: 'NL2', label: 'Tìm hiểu địa lí', description: 'Sử dụng công cụ địa lí, khai thác tài liệu, dữ liệu và tổ chức học tập thực địa.' },
    { code: 'NL3', label: 'Vận dụng kiến thức, kĩ năng địa lí', description: 'Vận dụng kiến thức và kĩ năng địa lí để giải quyết vấn đề thực tiễn.' }
  ],
  validation: {
    targetTotalPoints: 10,
    requireApplicationLevel: true
  },
  storage: {
    draftKey: 'geohub_matrix_7991_draft_v2',
    matrixHistoryKey: 'saved_geography_matrices',
    examHistoryKey: 'saved_geography_exams'
  },
  document: {
    defaultHeader: {
      department: 'SỞ GD&ĐT TÌNH BÌNH PHƯỚC',
      school: 'TRƯỜNG THPT CHUYÊN QUANG TRUNG',
      examName: 'KÌ THI KIỂM TRA ĐỊNH KÌ HỌC KÌ I',
      creator: 'Nguyễn Văn A'
    },
    titles: {
      matrix: 'MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ĐỊA LÍ',
      specification: 'BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ĐỊA LÍ',
      exam: 'ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ĐỊA LÍ',
      answerKey: 'ĐÁP ÁN ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ĐỊA LÍ',
      bundle: 'BỘ HỒ SƠ KIỂM TRA MÔN ĐỊA LÍ - CV 7991'
    },
    filenames: {
      matrix: 'ma-tran-7991',
      specification: 'bang-dac-ta-7991',
      exam: 'de-thi-dia-li-7991',
      answerKey: 'dap-an-dia-li-7991',
      bundle: 'bo-ho-so-kiem-tra-dia-li-7991'
    }
  },
  ai: {
    roles: {
      sourceAnalysis: 'trợ lý chuyên môn',
      specification: 'chuyên gia xây dựng bản đặc tả',
      examGeneration: 'trợ lý chuyên môn'
    },
    subjectLabel: 'môn Địa lí THPT',
    sourceGuardrail: 'Chỉ sử dụng kiến thức và YCCĐ có trong dữ liệu nguồn; không tự sáng tác YCCĐ khi nguồn không cung cấp.'
  }
};
