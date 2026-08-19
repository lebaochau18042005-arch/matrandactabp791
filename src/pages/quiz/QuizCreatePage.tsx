import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { useQuizStore } from '../../store/quizStore';
import { GeneratedQuiz, QuizQuestion } from '../../utils/mockAIGenerator';
import { balanceMultipleChoiceAnswers, generateQuizWithGemini, QuizGenerationMode } from '../../utils/geminiGenerator';
import { GEOGRAPHY_BOOK_NAME, GEOGRAPHY_LESSON_COUNTS, GEOGRAPHY_LESSONS } from '../../data/geographyLessons';
import { GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT, GEOGRAPHY_GRADUATION_SCORE_CONFIG, QUESTION_TECHNICAL_CHECKLIST } from '../../data/examBlueprint';
import { getAllowedFormulaNames, getLessonAssessmentProfile } from '../../data/geographyLearningOutcomes';
import { EXPORT_BLOCK_MESSAGE, getReviewStatusLabel, validateGeneratedQuiz, ExamValidationReport, ValidationIssue } from '../../utils/quizQuality';
import { toast } from 'sonner';
import { AlertTriangle, BrainCircuit, Save, FileDown, Trash2, Edit2, CheckCircle2, FileText, X, Play, RotateCcw, ListChecks, ShieldCheck, History, Lock } from 'lucide-react';
import jsPDF from 'jspdf';
import mammoth from 'mammoth';
import QuizQuestionEditor from '../../components/quiz/QuizQuestionEditor';
import StimulusBlock from '../../components/quiz/StimulusBlock';
import { normalizeStimulusTable } from '../../utils/stimulusTable';
import { APPROVED_ASSESSMENT_SOURCES } from '../../data/assessmentSources';

export default function QuizCreatePage() {
  const navigate = useNavigate();
  const { addQuiz, addValidationReport, validationHistory } = useQuizStore();
  const initialLesson = GEOGRAPHY_LESSONS.find(l => l.id === '10_1') ?? GEOGRAPHY_LESSONS[0];
  const blueprint = GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT;
  const scoreConfig = GEOGRAPHY_GRADUATION_SCORE_CONFIG;
  
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [validationReport, setValidationReport] = useState<ExamValidationReport | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<QuizGenerationMode>('free');
  const [lastDeletedQuestion, setLastDeletedQuestion] = useState<{ question: QuizQuestion; index: number } | null>(null);
  
  const [form, setForm] = useState({
    grade: initialLesson.grade,
    lessonId: initialLesson.id,
    title: initialLesson.title,
    topic: initialLesson.topic,
    context: '',
  });

  const availableLessons = GEOGRAPHY_LESSONS.filter(l => l.grade === form.grade);
  const selectedLessonOrder = availableLessons.findIndex(l => l.id === form.lessonId) + 1;
  const expectedLessonCount = GEOGRAPHY_LESSON_COUNTS[form.grade] ?? availableLessons.length;
  const assessmentProfile = getLessonAssessmentProfile(form.lessonId, form.title, form.topic);
  const allowedFormulaNames = getAllowedFormulaNames(assessmentProfile);
  const questionCounts = React.useMemo(() => {
    const questions = quiz?.questions ?? [];
    return {
      multipleChoice: questions.filter(q => q.type === 'multiple_choice').length,
      trueFalse: questions.filter(q => q.type === 'true_false').length,
      shortAnswer: questions.filter(q => q.type === 'short_answer').length,
      total: questions.length,
    };
  }, [quiz]);
  const structureOk =
    questionCounts.multipleChoice === blueprint.multipleChoice &&
    questionCounts.trueFalse === blueprint.trueFalse &&
    questionCounts.shortAnswer === blueprint.shortAnswer;
  const currentValidationHistory = quiz ? (validationHistory[quiz.id] || []) : [];

  const recordValidation = (nextQuiz: GeneratedQuiz) => {
    const report = validateGeneratedQuiz(nextQuiz);
    setValidationReport(report);
    addValidationReport(nextQuiz.id, report);
    return report;
  };

  const getQuestionIssues = (questionId: string): ValidationIssue[] => (
    validationReport?.questionResults.find(result => result.questionId === questionId)?.issues || []
  );

  const getIssueBadgeClass = (issue: ValidationIssue) => (
    issue.severity === 'blocking'
      ? 'border-red-500/30 bg-red-500/10 text-red-200'
      : 'border-amber-500/30 bg-amber-500/10 text-amber-100'
  );

  const renderQuestionIssues = (question: QuizQuestion) => {
    const issues = getQuestionIssues(question.id);
    if (issues.length === 0) return null;

    return (
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
            <AlertTriangle size={16} /> Lỗi thẩm định của câu này
          </div>
          <button
            onClick={() => setEditingQuestionId(question.id)}
            className="rounded-md border border-white/10 bg-slate-950 px-2 py-1 text-xs text-teal-200 hover:border-teal-400/40"
          >
            Sửa ngay
          </button>
        </div>
        <div className="space-y-2">
          {issues.map(issue => (
            <div key={issue.id} className={`rounded-md border px-3 py-2 text-xs ${getIssueBadgeClass(issue)}`}>
              <span className="font-bold">{issue.severity === 'blocking' ? 'Bắt buộc' : 'Cảnh báo'} - {issue.criterion}:</span> {issue.message}
              <div className="mt-1 text-slate-300">Gợi ý: {issue.suggestion}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ensureCanPublish = (actionLabel: string) => {
    if (!quiz) return false;
    const report = recordValidation(quiz);
    if (!report.canExport) {
      toast.error(`${actionLabel} bị khóa: ${report.issues.find(issue => issue.severity === 'blocking')?.message || EXPORT_BLOCK_MESSAGE}`, { duration: 8000 });
      return false;
    }
    return true;
  };

  const rerunValidation = () => {
    if (!quiz) return;
    const report = recordValidation(quiz);
    if (report.status === 'passed') {
      toast.success('Đề đã đạt toàn bộ tiêu chí thẩm định.');
    } else if (report.canExport) {
      toast.warning('Đề không còn lỗi bắt buộc, nhưng vẫn còn cảnh báo cần rà soát.');
    } else {
      toast.error(`Đề còn ${report.mandatoryIssueCount} lỗi bắt buộc cần sửa.`);
    }
  };

  const handleGradeChange = (grade: number) => {
    const lessons = GEOGRAPHY_LESSONS.filter(l => l.grade === grade);
    if (lessons.length > 0) {
      setForm({ ...form, grade, lessonId: lessons[0].id, title: lessons[0].title, topic: lessons[0].topic });
    } else {
      setForm({ ...form, grade, lessonId: '', title: '', topic: '' });
    }
  };

  const handleLessonChange = (lessonId: string) => {
    const lesson = availableLessons.find(l => l.id === lessonId);
    if (lesson) {
      setForm({ ...form, lessonId, title: lesson.title, topic: lesson.topic });
    }
  };

  const extractReferenceExamContext = async (files: File[]) => {
    const extractedSections: string[] = [];
    const unsupportedFiles: string[] = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        unsupportedFiles.push(file.name);
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const examOnly = result.value
        .split(/\n\s*(?:ĐÁP\s+ÁN|HƯỚNG\s+DẪN\s+GIẢI|LỜI\s+GIẢI)\b/i)[0]
        .replace(/thuvienhoclieu\.com/gi, '')
        .trim()
        .slice(0, 22000);

      if (examOnly) {
        extractedSections.push(`[Tệp tham khảo: ${file.name}]\n${examOnly}`);
      }
    }

    if (unsupportedFiles.length > 0) {
      toast.warning(`Chưa thể đọc tự động: ${unsupportedFiles.join(', ')}. Hiện hệ thống chỉ trích văn bản trực tiếp từ DOCX.`, { duration: 6000 });
    }

    return extractedSections.join('\n\n');
  };

  const handleGenerate = async () => {
    if (!form.lessonId) {
      toast.error('Vui lòng chọn đúng một bài học trong SGK trước khi tạo quiz.');
      return;
    }

    const savedApiKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-3.5-flash';
    if (!savedApiKey.trim()) {
      toast.error('Chưa có Gemini API Key. Chế độ Mock AI đã được tắt để tránh tạo số liệu và nguồn không kiểm chứng.');
      return;
    }

    if (generationMode === 'free' && !form.context.trim()) {
      toast.error('Chế độ miễn phí cần dữ liệu nguồn chính thức để tạo phần trả lời ngắn. Hãy dán tên bảng/chỉ tiêu, đơn vị, năm, số liệu, nguồn và URL.');
      return;
    }

    setLoading(true);
    try {
      const referenceExamContext = await extractReferenceExamContext(uploadedFiles);
      toast.info(
        generationMode === 'free'
          ? `Đang kết nối tới ${savedModel} ở chế độ miễn phí và kiểm soát dữ liệu nguồn...`
          : `Đang kết nối tới ${savedModel} và đối chiếu nguồn trực tuyến...`,
        { duration: 3000 }
      );
      const q = await generateQuizWithGemini(
        savedApiKey.trim(),
        savedModel,
        form.title,
        form.grade,
        form.topic,
        form.lessonId,
        form.context.trim(),
        referenceExamContext,
        generationMode
      );

      setQuiz(q);
      setLastDeletedQuestion(null);
      const report = recordValidation(q);
      if (report.canExport && report.status === 'passed') {
        toast.success(`Đã tạo xong đề ${blueprint.totalMainQuestions} câu / ${blueprint.totalAnswerCommands} lệnh hỏi và đạt thẩm định.`);
      } else if (report.canExport) {
        toast.warning(`Đã tạo đề. Còn ${report.warningCount} cảnh báo cần rà soát trước khi dùng chính thức.`, { duration: 7000 });
      } else {
        toast.error(`Đã tạo bản nháp nhưng còn ${report.mandatoryIssueCount} lỗi bắt buộc. Vui lòng sửa trước khi xuất đề.`, { duration: 8000 });
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Có lỗi xảy ra khi sinh câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`Đã đính kèm ${newFiles.length} tệp.`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!quiz) return;

    const report = recordValidation(quiz);
    if (!report.canExport) {
      toast.error(`Chưa thể lưu/giao bài: ${report.issues.find(issue => issue.severity === 'blocking')?.message || EXPORT_BLOCK_MESSAGE}`, { duration: 8000 });
      return;
    }

    // Validate exact structure
    const mc = quiz.questions.filter(q => q.type === 'multiple_choice').length;
    const tf = quiz.questions.filter(q => q.type === 'true_false').length;
    const sa = quiz.questions.filter(q => q.type === 'short_answer').length;

    if (mc !== blueprint.multipleChoice || tf !== blueprint.trueFalse || sa !== blueprint.shortAnswer) {
      toast.error(`Cấu trúc chưa chuẩn: Cần ${blueprint.multipleChoice} TNKQ, ${blueprint.trueFalse} Đ/S, ${blueprint.shortAnswer} TLN. Hiện có ${mc} TNKQ, ${tf} Đ/S, ${sa} TLN.`);
      return; // Strictly block saving if counts are incorrect
    }

    const reviewedQuiz = {
      ...quiz,
      reviewStatus: report.status,
      reviewErrors: report.issues,
      reviewHistory: [report, ...(validationHistory[quiz.id] || [])].slice(0, 20),
    };

    addQuiz(reviewedQuiz);
    toast.success('Đã lưu Quiz thành công!');
    navigate(`/quiz/${quiz.id}`); // For demo, navigate to the answer page so teacher can preview
  };

  const exportPDF = () => {
    if (!quiz) return;
    if (!ensureCanPublish('Xuất đề')) return;
    const doc = new jsPDF();
    const marginX = 14;
    const pageBottom = 282;
    let y = 20;

    const ensureSpace = (height = 7) => {
      if (y + height > pageBottom) {
        doc.addPage();
        y = 18;
      }
    };

    const writeWrapped = (value: string, options?: { bold?: boolean; indent?: number; size?: number; gap?: number }) => {
      const text = value.trim();
      if (!text) return;
      const indent = options?.indent ?? 0;
      const fontSize = options?.size ?? 10;
      const lineHeight = Math.max(4.8, fontSize * 0.52);
      doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, 180 - indent) as string[];
      lines.forEach(line => {
        ensureSpace(lineHeight);
        doc.text(line, marginX + indent, y);
        y += lineHeight;
      });
      y += options?.gap ?? 1.5;
    };

    writeWrapped(quiz.title, { bold: true, size: 15, gap: 5 });
    let currentSection = '';
    quiz.questions.forEach((q, i) => {
      if (q.section !== currentSection) {
        currentSection = q.section;
        const sectionLabel = currentSection === 'I'
          ? 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn'
          : currentSection === 'II'
            ? 'PHẦN II. Câu trắc nghiệm đúng/sai'
            : 'PHẦN III. Câu trắc nghiệm trả lời ngắn';
        ensureSpace(14);
        writeWrapped(sectionLabel, { bold: true, size: 11, gap: 3 });
      }

      ensureSpace(12);
      const stimulus = q.stimulus;
      if (stimulus && stimulus.type !== 'none') {
        const table = normalizeStimulusTable(stimulus);
        if (stimulus.type === 'table') writeWrapped('Cho bảng số liệu sau:', { gap: 1 });
        else if (stimulus.type === 'chart') writeWrapped('Cho biểu đồ sau:', { gap: 1 });
        else if (q.type === 'true_false') writeWrapped('Cho thông tin sau:', { gap: 1 });

        if (stimulus.title) writeWrapped(stimulus.title, { bold: true, indent: 3, gap: 1 });
        if (stimulus.unit) writeWrapped(`(Đơn vị: ${stimulus.unit})`, { indent: 3, size: 9, gap: 1 });

        if (table) {
          writeWrapped(table.headers.join(' | '), { bold: true, indent: 3, size: 9, gap: 0.5 });
          table.rows.forEach(row => writeWrapped(row.join(' | '), { indent: 3, size: 9, gap: 0.5 }));
        } else if (stimulus.content) {
          writeWrapped(stimulus.content, { indent: 3, size: 9, gap: 1 });
        }

        const sourceDetails = [
          stimulus.source,
          stimulus.sourceDataset,
          stimulus.dataYear ? `năm dữ liệu: ${stimulus.dataYear}` : '',
          stimulus.sourceUrl,
          stimulus.accessedAt ? `truy cập: ${stimulus.accessedAt}` : '',
        ].filter(Boolean).join('; ');
        if (sourceDetails) writeWrapped(`(Nguồn: ${sourceDetails})`, { indent: 3, size: 8, gap: 2 });
      }

      writeWrapped(`Câu ${i + 1}. ${q.question || ''}`, { bold: true, gap: 1 });
      if (q.type === 'multiple_choice') {
        q.options.forEach(option => writeWrapped(`${option.key}. ${option.text}`, { indent: 5, gap: 0.5 }));
      } else if (q.type === 'true_false') {
        q.statements.forEach(statement => writeWrapped(`${statement.label}) ${statement.text}`, { indent: 5, gap: 0.5 }));
      }
      y += 3;
    });
    
    doc.save(`${quiz.title}.pdf`);
    toast.success('Đã xuất PDF!');
  };

  const handleDeleteQuestion = (id: string) => {
    if (!quiz) return;
    if (confirm('Bạn có chắc muốn xóa câu hỏi này khỏi bộ bài kiểm tra?')) {
      const deletedIndex = quiz.questions.findIndex(q => q.id === id);
      const deletedQuestion = quiz.questions[deletedIndex];
      if (deletedIndex < 0 || !deletedQuestion) return;
      const newQuestions = quiz.questions.filter(q => q.id !== id);
      const nextQuiz = { ...quiz, questions: newQuestions, totalQuestions: newQuestions.length };
      setLastDeletedQuestion({ question: deletedQuestion, index: deletedIndex });
      setQuiz(nextQuiz);
      recordValidation(nextQuiz);
      toast.success('Đã xóa câu hỏi.');
    }
  };

  const handleSaveEdit = (updatedQuestion: any) => {
    if (!quiz) return;
    let normalizedQuestion = updatedQuestion;
    if (updatedQuestion.type === 'true_false' && Array.isArray(updatedQuestion.statements)) {
      normalizedQuestion = {
        ...normalizedQuestion,
        statements: updatedQuestion.statements.map((statement: any, index: number) => ({
          ...statement,
          label: ['a', 'b', 'c', 'd'][index] || statement.label,
        })),
      };
    }
    if (
      updatedQuestion.type === 'short_answer' &&
      /^tốc độ tăng trưởng(?: dân số)?$/i.test(updatedQuestion.shortAnswer?.formula || '') &&
      allowedFormulaNames.includes('Tốc độ tăng dân số')
    ) {
      normalizedQuestion = {
        ...normalizedQuestion,
        shortAnswer: {
          ...normalizedQuestion.shortAnswer,
          formula: 'Tốc độ tăng dân số',
        },
      };
    }

    const newQuestions = quiz.questions.map(q => q.id === normalizedQuestion.id ? normalizedQuestion : q);
    const nextQuiz = { ...quiz, questions: newQuestions };
    setQuiz(nextQuiz);
    recordValidation(nextQuiz);
    setEditingQuestionId(null);
    toast.success('Đã lưu thay đổi.');
  };

  const resetGeneratedQuiz = () => {
    setQuiz(null);
    setValidationReport(null);
    setEditingQuestionId(null);
    setLastDeletedQuestion(null);
    toast.info('Đã làm mới bản nháp Quiz.');
  };

  const restoreLastDeletedQuestion = () => {
    if (!quiz || !lastDeletedQuestion) return;
    const newQuestions = [...quiz.questions];
    newQuestions.splice(Math.min(lastDeletedQuestion.index, newQuestions.length), 0, lastDeletedQuestion.question);
    const nextQuiz = { ...quiz, questions: newQuestions, totalQuestions: newQuestions.length };
    setQuiz(nextQuiz);
    recordValidation(nextQuiz);
    setLastDeletedQuestion(null);
    toast.success('Đã khôi phục câu hỏi vừa xóa.');
  };

  const handleBalanceAnswers = () => {
    if (!quiz) return;
    const nextQuiz = {
      ...quiz,
      questions: balanceMultipleChoiceAnswers(quiz.questions),
    };
    setQuiz(nextQuiz);
    recordValidation(nextQuiz);
    toast.success('Đã cân bằng vị trí đáp án đúng giữa A, B, C và D.');
  };

  const handleHostLiveQuiz = () => {
    if (!quiz) return;
    if (!ensureCanPublish('Giao quiz trực tiếp')) return;
    const mcQuestions = quiz.questions.filter(q => q.type === 'multiple_choice');
    if (mcQuestions.length === 0) {
      toast.error('Không có câu hỏi trắc nghiệm nào để tạo Live Quiz!');
      return;
    }
    useQuizStore.getState().setLiveQuizData(mcQuestions);
    toast.success('Đã tải câu hỏi vào phòng chơi trực tiếp!');
    navigate('/quiz-live');
  };

  return (
    <AppLayout title="Tạo bộ câu hỏi chuẩn THPT">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-teal-400" /> Tạo Quiz AI Tự Động
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {blueprint.label}: {blueprint.multipleChoice} TN, {blueprint.trueFalse} Đ/S, {blueprint.shortAnswer} trả lời ngắn ({blueprint.totalAnswerCommands} lệnh hỏi, {blueprint.durationMinutes} phút).
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Thang điểm: TNKQ {scoreConfig.multipleChoicePerQuestion} điểm/câu; Đ/S 1 ý đúng = 0,1, 2 ý = 0,25, 3 ý = 0,5, 4 ý = 1; trả lời ngắn {scoreConfig.shortAnswerPerQuestion} điểm/câu.
            </p>
          </div>
        </div>

        {/* Action Buttons for generated quiz */}
        {quiz && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-8 mt-4 bg-slate-900 border border-white/10 p-4 rounded-xl">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ListChecks size={18} className={structureOk ? 'text-teal-400' : 'text-amber-400'} />
                <h2 className="text-white font-bold">Kiểm tra cấu trúc đề</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  structureOk
                    ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {structureOk ? 'Đạt chuẩn' : 'Cần chỉnh'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Tổng câu', value: questionCounts.total, target: blueprint.totalMainQuestions },
                  { label: 'TNKQ', value: questionCounts.multipleChoice, target: blueprint.multipleChoice },
                  { label: 'Đúng/Sai', value: questionCounts.trueFalse, target: blueprint.trueFalse },
                  { label: 'Trả lời ngắn', value: questionCounts.shortAnswer, target: blueprint.shortAnswer },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                    <p className="text-slate-500 text-xs">{item.label}</p>
                    <p className={`text-lg font-black ${item.value === item.target ? 'text-teal-300' : 'text-amber-300'}`}>
                      {item.value}/{item.target}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 min-w-[220px]">
            <button
              onClick={exportPDF}
              disabled={validationReport ? !validationReport.canExport : false}
              title={validationReport && !validationReport.canExport ? EXPORT_BLOCK_MESSAGE : 'Xuất đề'}
              className={`text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10 ${
                validationReport && !validationReport.canExport
                  ? 'bg-slate-800/60 opacity-60 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {validationReport && !validationReport.canExport ? <Lock size={18} /> : <FileDown size={18} />} Xuất File PDF
            </button>
            <button
              onClick={handleSave}
              disabled={validationReport ? !validationReport.canExport : false}
              className={`text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg ${
                validationReport && !validationReport.canExport
                  ? 'bg-slate-800 opacity-60 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 shadow-blue-500/25'
              }`}
            >
              {validationReport && !validationReport.canExport ? <Lock size={18} /> : <Save size={18} />} Lưu Quiz & Giao bài
            </button>
            <button
              onClick={handleHostLiveQuiz}
              disabled={validationReport ? !validationReport.canExport : false}
              className={`text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg ${
                validationReport && !validationReport.canExport
                  ? 'bg-slate-800 opacity-60 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 shadow-rose-500/25'
              }`}
            >
              {validationReport && !validationReport.canExport ? <Lock size={18} /> : <Play size={18} fill="currentColor" />} Quiz Trực Tiếp
            </button>
            <button onClick={resetGeneratedQuiz} className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10">
              <RotateCcw size={18} /> Tạo lại
            </button>
            <button onClick={handleBalanceAnswers} className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10">
              <ListChecks size={18} /> Cân bằng đáp án A–D
            </button>
            {lastDeletedQuestion && (
              <button onClick={restoreLastDeletedQuestion} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors border border-amber-500/30">
                <RotateCcw size={18} /> Khôi phục câu vừa xóa
              </button>
            )}
            </div>
          </div>
        )}

        {quiz && validationReport && (
          <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldCheck size={18} className={validationReport.status === 'passed' ? 'text-teal-400' : validationReport.canExport ? 'text-amber-400' : 'text-red-400'} />
                  <h2 className="font-bold text-white">Kết quả thẩm định đề</h2>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    validationReport.status === 'passed'
                      ? 'border-teal-500/30 bg-teal-500/10 text-teal-200'
                      : validationReport.canExport
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                        : 'border-red-500/30 bg-red-500/10 text-red-200'
                  }`}>
                    {getReviewStatusLabel(validationReport.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Đã kiểm tra {validationReport.checkedCriteriaCount}/{validationReport.totalCriteriaCount} tiêu chí. Chỉ đánh dấu Đạt khi không còn lỗi/cảnh báo sau thẩm định.
                </p>
                {!validationReport.canExport && (
                  <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100">
                    {validationReport.exportBlockMessage}
                  </div>
                )}
              </div>
              <button
                onClick={rerunValidation}
                className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-bold text-teal-100 hover:bg-teal-500/20"
              >
                Thẩm định lại
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                { label: 'Lỗi bắt buộc', value: validationReport.mandatoryIssueCount, color: validationReport.mandatoryIssueCount > 0 ? 'text-red-300' : 'text-teal-300' },
                { label: 'Cảnh báo', value: validationReport.warningCount, color: validationReport.warningCount > 0 ? 'text-amber-300' : 'text-teal-300' },
                { label: 'Câu chưa đạt', value: validationReport.questionResults.filter(result => result.status === 'failed').length, color: 'text-red-300' },
                { label: 'Có thể xuất', value: validationReport.canExport ? 'Có' : 'Không', color: validationReport.canExport ? 'text-teal-300' : 'text-red-300' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className={`text-lg font-black ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {validationReport.issues.length > 0 && (
              <div className="mt-4 max-h-52 space-y-2 overflow-y-auto pr-1">
                {validationReport.issues.slice(0, 10).map(issue => (
                  <div key={issue.id} className={`rounded-lg border px-3 py-2 text-xs ${getIssueBadgeClass(issue)}`}>
                    <span className="font-bold">{issue.questionNumber ? `Câu ${issue.questionNumber}` : 'Toàn đề'} - {issue.criterion}:</span> {issue.message}
                  </div>
                ))}
              </div>
            )}

            {currentValidationHistory.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
                  <History size={14} /> Lịch sử thẩm định gần nhất
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  {currentValidationHistory.slice(0, 3).map(item => (
                    <div key={item.id} className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-400">
                      <div className="font-bold text-slate-200">{getReviewStatusLabel(item.status)}</div>
                      <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                      <div>{item.mandatoryIssueCount} lỗi bắt buộc, {item.warningCount} cảnh báo</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Lớp</label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                value={form.grade}
                onChange={e => handleGradeChange(Number(e.target.value))}
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-slate-400 mb-2">Bài học trong SGK Kết nối tri thức</label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                value={form.lessonId}
                onChange={e => handleLessonChange(e.target.value)}
              >
                {availableLessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm text-slate-400 mb-2">Mạch nội dung / chương</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-400 focus:outline-none opacity-80"
                value={form.topic}
                readOnly
              />
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-3 text-xs text-teal-100">
            <span className="font-semibold">{GEOGRAPHY_BOOK_NAME}</span>
            <span className="text-teal-300/60">|</span>
            <span>Lớp {form.grade}: {availableLessons.length}/{expectedLessonCount} bài</span>
            {selectedLessonOrder > 0 && (
              <>
                <span className="text-teal-300/60">|</span>
                <span>Đang chọn {form.lessonId.replace('_', '.')} - thứ tự {selectedLessonOrder}</span>
              </>
            )}
          </div>

          <div className="mb-6 rounded-xl border border-white/10 bg-slate-950/70 p-4">
            <div className="mb-3 text-sm font-bold text-white">Chế độ kiểm chứng nguồn</div>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setGenerationMode('free')}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  generationMode === 'free'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-100'
                    : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold">Miễn phí an toàn</div>
                <div className="mt-1 text-xs">Không tra cứu Google. Số liệu phải khớp hoàn toàn với nguồn chính thức giáo viên dán bên dưới.</div>
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('grounded')}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  generationMode === 'grounded'
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-100'
                    : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold">Đối chiếu trực tuyến</div>
                <div className="mt-1 text-xs">Dùng Google Search Grounding; yêu cầu dự án Gemini API thuộc Paid Tier.</div>
              </button>
            </div>
            {generationMode === 'free' && (
              <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                Để tạo đủ phần trả lời ngắn, cần cung cấp ít nhất một bảng/chỉ tiêu chính thức có tên, đơn vị, năm, số liệu và URL nguồn. Hệ thống sẽ chặn nếu AI tự thêm dữ liệu.
              </div>
            )}
          </div>

          <div className="mb-6 rounded-xl border border-white/10 bg-slate-950/70 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-blue-500/15 px-3 py-1 font-bold text-blue-200">YCCĐ bài học</span>
              <span className="rounded-full bg-purple-500/15 px-3 py-1 font-bold text-purple-200">Đủ 3 năng lực địa lí</span>
              <span className="rounded-full bg-rose-500/15 px-3 py-1 font-bold text-rose-200">Không dùng Atlat</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-300 md:grid-cols-3">
              <div><span className="font-bold text-teal-300">Biết:</span> {assessmentProfile.outcomes.know}</div>
              <div><span className="font-bold text-blue-300">Hiểu:</span> {assessmentProfile.outcomes.understand}</div>
              <div><span className="font-bold text-purple-300">Vận dụng:</span> {assessmentProfile.outcomes.apply}</div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Công thức phần III phù hợp: <span className="text-amber-200">{allowedFormulaNames.join(', ')}</span>.
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUESTION_TECHNICAL_CHECKLIST.slice(0, 4).map(item => (
              <div key={item} className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                {item}
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2 flex justify-between">
              <span>Nguồn nội dung chính thức / đề DOCX tham khảo kĩ thuật</span>
              <span className="text-xs text-teal-400 bg-teal-400/10 px-2 rounded-full py-0.5">Hai loại tài liệu được xử lí riêng</span>
            </label>
            <textarea 
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 min-h-[100px] mb-3"
              placeholder="Dán nội dung SGK hoặc số liệu chính thức; với số liệu, ghi đủ tên bảng/chỉ tiêu, đơn vị, năm, nguồn và URL..."
              value={form.context}
              onChange={e => setForm({...form, context: e.target.value})}
            />
            
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
                <FileText size={16} className="text-blue-400" />
                <span>Tải đề tham khảo DOCX</span>
                <input type="file" multiple accept=".docx" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-800/50 border border-white/5 rounded-full px-3 py-1.5 text-xs text-slate-300">
                    <FileText size={12} className="text-blue-400" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400 ml-1">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {APPROVED_ASSESSMENT_SOURCES.map(source => (
                <div key={source.id} className="rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-xs text-slate-400">
                  <div className="font-semibold text-slate-200">{source.label}</div>
                  <div>{source.description}</div>
                  {source.url && <a className="mt-1 block text-teal-400 hover:text-teal-300" href={source.url} target="_blank" rel="noreferrer">Mở nguồn chính thức</a>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/25 disabled:opacity-50"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang phân tích...</>
              ) : (
                <><BrainCircuit size={18} /> Tạo đề theo cấu trúc TN THPT</>
              )}
            </button>
          </div>
        </div>

        {/* Generated Quiz View */}
        {quiz && (
          <div className="space-y-6 pb-20">
            {/* Phần 1 */}
            <div>
              <h2 className="text-xl font-bold text-teal-400 mb-4 border-b border-white/10 pb-2">PHẦN I. TRẮC NGHIỆM KHÁCH QUAN ({blueprint.multipleChoice} Câu)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quiz.questions.filter(q => q.type === 'multiple_choice').map((q: any, i) => (
                  editingQuestionId === q.id ? (
                    <div key={q.id} className="md:col-span-2">
                      <QuizQuestionEditor question={q} validationIssues={getQuestionIssues(q.id)} onSave={handleSaveEdit} onCancel={() => setEditingQuestionId(null)} />
                    </div>
                  ) : (
                    <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-teal-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-medium">Câu {i + 1} <span className="text-xs text-slate-500 ml-2 border border-slate-700 px-2 rounded-full">{q.level}</span></h3>
                        <div className="flex gap-2 text-slate-400">
                          <button onClick={() => setEditingQuestionId(q.id)} className="hover:text-teal-400"><Edit2 size={14}/></button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="hover:text-red-400"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      {(q.competency || q.learningOutcome) && (
                        <div className="mb-3 rounded-lg border border-white/5 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
                          {q.competency && <div><span className="font-bold text-teal-300">Năng lực:</span> {q.competency}</div>}
                          {q.learningOutcome && <div><span className="font-bold text-blue-300">YCCĐ:</span> {q.learningOutcome}</div>}
                        </div>
                      )}
                      {renderQuestionIssues(q)}
                      <StimulusBlock stimulus={q.stimulus} />
                      <p className="text-slate-200 text-sm mb-4 font-medium">{q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt: any, idx: number) => {
                          const isCorrect = opt.key === q.correctAnswer;
                          return (
                            <div key={idx} className={`text-sm p-2 rounded-lg border ${isCorrect ? 'bg-teal-500/10 border-teal-500/50 text-teal-300' : 'bg-slate-950 border-white/5 text-slate-400'}`}>
                              <span className="font-bold mr-2">{opt.key}.</span> {opt.text}
                              {isCorrect && <CheckCircle2 size={14} className="inline ml-2 text-teal-500" />}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="mt-4 text-xs text-slate-400 bg-slate-800/50 p-2 rounded">
                          <span className="font-bold text-teal-400">Giải thích:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Phần 2 */}
            <div>
              <h2 className="text-xl font-bold text-blue-400 mb-4 border-b border-white/10 pb-2 mt-10">PHẦN II. ĐÚNG / SAI ({blueprint.trueFalse} Câu)</h2>
              <div className="grid grid-cols-1 gap-4">
                {quiz.questions.filter(q => q.type === 'true_false').map((q: any, i) => (
                  editingQuestionId === q.id ? (
                    <QuizQuestionEditor key={q.id} question={q} validationIssues={getQuestionIssues(q.id)} onSave={handleSaveEdit} onCancel={() => setEditingQuestionId(null)} />
                  ) : (
                    <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-medium">Câu {i + 1} <span className="text-xs text-slate-500 ml-2 border border-slate-700 px-2 rounded-full">{q.level}</span></h3>
                        <div className="flex gap-2 text-slate-400">
                          <button onClick={() => setEditingQuestionId(q.id)} className="hover:text-blue-400"><Edit2 size={14}/></button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="hover:text-red-400"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      {(q.competency || q.learningOutcome) && (
                        <div className="mb-3 rounded-lg border border-white/5 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
                          {q.competency && <div><span className="font-bold text-teal-300">Năng lực:</span> {q.competency}</div>}
                          {q.learningOutcome && <div><span className="font-bold text-blue-300">YCCĐ:</span> {q.learningOutcome}</div>}
                        </div>
                      )}
                      {renderQuestionIssues(q)}
                      <StimulusBlock stimulus={q.stimulus} />
                      <p className="text-slate-200 font-medium text-sm mb-4">{q.question}</p>
                      <div className="space-y-2 pl-4 border-l-2 border-slate-800">
                        {q.statements.map((st: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-2 text-sm p-3 rounded-lg bg-slate-950 border border-white/5">
                            <div className="flex items-start gap-3">
                              <span className="font-bold text-slate-500">{st.label}.</span>
                              <span className="flex-1 text-slate-300">{st.text}</span>
                              <span className={`font-bold px-2 rounded ${st.answer ? 'text-teal-400 bg-teal-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                {st.answer ? 'ĐÚNG' : 'SAI'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 pl-6">
                              <span className="text-blue-400">Giải thích:</span> {st.explanation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Phần 3 */}
            <div>
              <h2 className="text-xl font-bold text-purple-400 mb-4 border-b border-white/10 pb-2 mt-10">PHẦN III. TRẢ LỜI NGẮN ({blueprint.shortAnswer} Câu)</h2>
              <div className="grid grid-cols-1 gap-4">
                {quiz.questions.filter(q => q.type === 'short_answer').map((q: any, i) => (
                  editingQuestionId === q.id ? (
                    <QuizQuestionEditor key={q.id} question={q} validationIssues={getQuestionIssues(q.id)} onSave={handleSaveEdit} onCancel={() => setEditingQuestionId(null)} />
                  ) : (
                    <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-medium">Câu {i + 1} <span className="text-xs text-slate-500 ml-2 border border-slate-700 px-2 rounded-full">{q.level}</span></h3>
                        <div className="flex gap-2 text-slate-400">
                          <button onClick={() => setEditingQuestionId(q.id)} className="hover:text-purple-400"><Edit2 size={14}/></button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="hover:text-red-400"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      {(q.competency || q.learningOutcome) && (
                        <div className="mb-3 rounded-lg border border-white/5 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
                          {q.competency && <div><span className="font-bold text-teal-300">Năng lực:</span> {q.competency}</div>}
                          {q.learningOutcome && <div><span className="font-bold text-blue-300">YCCĐ:</span> {q.learningOutcome}</div>}
                        </div>
                      )}
                      {renderQuestionIssues(q)}

                      <StimulusBlock stimulus={q.stimulus} textClassName="" />

                      <p className="text-slate-200 font-medium text-sm mb-4 leading-relaxed">{q.question}</p>

                      <div className="flex flex-col sm:flex-row gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 mb-1">ĐÁP ÁN ({q.shortAnswer?.rounding}):</div>
                          <div className="text-2xl font-bold text-purple-400">{q.shortAnswer?.correctAnswer} <span className="text-sm font-normal text-slate-400">{q.shortAnswer?.unit}</span></div>
                        </div>
                        <div className="flex-[2] border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-4">
                          <div className="text-xs text-slate-500 mb-1">CÔNG THỨC / LỜI GIẢI:</div>
                          <div className="text-sm text-slate-300 font-mono bg-slate-900 p-3 rounded-lg whitespace-pre-line">{q.shortAnswer?.solution}</div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </AppLayout>
  );
}
