
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ExamMatrix, ContentRow, PointsConfig, CognitiveLevel as CognitiveLevelType, EssayQuestion } from '../types';
import { GRADES, EXAM_PERIODS, SUBJECTS, ALL_SAMPLE_TOPICS, SampleContent } from '../constants';
import { 
  QuestionType, 
  CognitiveLevel, 
  QUESTION_TYPES, 
  COGNITIVE_LEVELS,
  TNKQ_QUESTION_TYPES,
  ESSAY_QUESTION_TYPES,
  getCompetencyCode,
} from '../types';
import { generateLearningOutcome, suggestTopicsFromDescription, suggestMatrixFromContent, parseMatrixFromText } from '../services/geminiService';
import { generateShareLink } from '../services/sharingService';
import { extractTextFromFile } from '../services/fileService';
import { Sparkles, FileUp, ClipboardList, Loader2, Trash2, Plus, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  WidthType, 
  AlignmentType, 
  VerticalAlign, 
  VerticalMergeType,
  TextRun, 
  BorderStyle, 
  HeadingLevel,
  TableLayoutType,
} from 'docx';
import { saveAs } from 'file-saver';


interface MatrixBuilderProps {
  initialMatrix: ExamMatrix;
  onMatrixUpdate: (matrix: ExamMatrix) => void;
}

// Helper function to trigger file downloads
const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement("a");
    // For CSV, add BOM to ensure UTF-8 compatibility with Excel
    const bom = mimeType.includes('csv') ? new Uint8Array([0xEF, 0xBB, 0xBF]) : '';
    const file = new Blob([bom, content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element);
};

const MatrixBuilder: React.FC<MatrixBuilderProps> = ({ initialMatrix, onMatrixUpdate }) => {
  const [matrix, setMatrix] = useState<ExamMatrix>(initialMatrix);
  const [showSpecification, setShowSpecification] = useState(false);
  const [showPointsInCells, setShowPointsInCells] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  
  // AI Import States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMode, setAiMode] = useState<'description' | 'document' | 'paste'>('description');
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [isParsingMatrix, setIsParsingMatrix] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const curriculumFileRef = useRef<HTMLInputElement>(null);
  const [isImportingCurriculum, setIsImportingCurriculum] = useState(false);

  // State for the new integrated topic adder
  const [customChapter, setCustomChapter] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [activeGradeTab, setActiveGradeTab] = useState<number>(initialMatrix.header.grade);
  const sampleTopics = useMemo(() => {
    const subjectTopics = ALL_SAMPLE_TOPICS[matrix.header.subject as keyof typeof ALL_SAMPLE_TOPICS] || {};
    return subjectTopics[activeGradeTab] || {};
  }, [matrix.header.subject, activeGradeTab]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(Object.keys(sampleTopics)[0] || null);

  // Sync grade tab with matrix header grade for better UX
  useEffect(() => {
    setActiveGradeTab(matrix.header.grade);
  }, [matrix.header.grade]);
  
  // When grade tab changes or subject changes, expand the first chapter
  useEffect(() => {
    setExpandedChapter(Object.keys(sampleTopics)[0] || null);
  }, [sampleTopics]);

  const handleShare = () => {
    const link = generateShareLink(matrix);
    navigator.clipboard.writeText(link).then(() => {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 3000);
    });
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Ma trận đề thi: ${matrix.header.examName}`);
    const body = encodeURIComponent(`Chào bạn,\n\nTôi muốn chia sẻ ma trận đề thi "${matrix.header.examName}" được tạo bằng AI.\n\nBạn có thể xem chi tiết tại đây: ${generateShareLink(matrix)}\n\nTrân trọng.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };


  // Effect for PDF printing cleanup
  useEffect(() => {
    const afterPrint = () => {
      document.body.classList.remove('printing-matrix', 'printing-spec');
    };
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);

  // Ensure totalPoints exists for older matrices
  useEffect(() => {
    if (matrix.header.totalPoints === undefined) {
      const newMatrix = {
        ...matrix,
        header: {
          ...matrix.header,
          totalPoints: 10
        }
      };
      setMatrix(newMatrix);
      onMatrixUpdate(newMatrix);
    }
  }, [matrix.header.totalPoints]);

  const updateHeader = (field: keyof ExamMatrix['header'], value: string | number) => {
    const newMatrix = { ...matrix, header: { ...matrix.header, [field]: value } };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
  };

  const handleUploadMatrix = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingMatrix(true);
    try {
      const text = await extractTextFromFile(file);
      const parsedMatrix = await parseMatrixFromText(text);
      if (parsedMatrix) {
        setMatrix(parsedMatrix);
        onMatrixUpdate(parsedMatrix);
        alert('Đã nạp ma trận thành công!');
      } else {
        alert('Không thể phân tích ma trận từ file này. Vui lòng kiểm tra lại định dạng.');
      }
    } catch (error) {
      console.error('Lỗi khi nạp ma trận:', error);
      alert('Đã có lỗi xảy ra khi nạp ma trận.');
    } finally {
      setIsParsingMatrix(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updatePoints = (qType: QuestionType, cLevel: CognitiveLevel, value: number) => {
    const newPoints = JSON.parse(JSON.stringify(matrix.points));
    if (!newPoints[qType]) newPoints[qType] = {};
    
    if (value > 0) {
        newPoints[qType][cLevel] = value;
    } else {
        delete newPoints[qType][cLevel];
        if (Object.keys(newPoints[qType]).length === 0) {
            delete newPoints[qType];
        }
    }
    
    const newMatrix = { ...matrix, points: newPoints };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
  };

  const updateQuestion = (topicId: string, qType: QuestionType, cLevel: CognitiveLevel, value: number | Partial<EssayQuestion>) => {
    const newTopics = matrix.topics.map(topic => {
      if (topic.id === topicId) {
        const newQuestions = JSON.parse(JSON.stringify(topic.questions));
        if (!newQuestions[qType]) newQuestions[qType] = {};
        
        const isEssay = ESSAY_QUESTION_TYPES.includes(qType);

        if (isEssay) {
            const currentEssay = (newQuestions[qType] as any)?.[cLevel] || { id: '', isChart: false };
            const partial = value as Partial<EssayQuestion>;
            
            // Enforce "only 1 drawing question" rule
            if (partial.isChart === true) {
                const hasOtherChart = matrix.topics.some(t => 
                    Object.entries(t.questions).some(([qt, levels]) => 
                        ESSAY_QUESTION_TYPES.includes(qt as QuestionType) &&
                        Object.entries(levels as any).some(([cl, details]: [any, any]) => 
                            details.isChart && (t.id !== topicId || cl !== cLevel)
                        )
                    )
                );
                if (hasOtherChart) {
                    alert("Trong một đề thi chỉ được phép có tối đa 1 câu hỏi vẽ biểu đồ. Vui lòng bỏ đánh dấu câu vẽ biểu đồ hiện tại trước khi chọn câu khác.");
                    return;
                }
            }

            const updatedEssay = { ...currentEssay, ...partial };

            if (updatedEssay.id.trim()) {
                (newQuestions[qType] as any)[cLevel] = updatedEssay;
            } else {
                delete (newQuestions[qType] as any)[cLevel];
            }
        } else { // TNKQ
            const count = value as number;
            if (count > 0) {
                const current = (newQuestions[qType] as any)[cLevel];
                if (typeof current === 'object') {
                    (newQuestions[qType] as any)[cLevel] = { ...current, count };
                } else {
                    (newQuestions[qType] as any)[cLevel] = count;
                }
            } else {
                delete (newQuestions[qType] as any)[cLevel];
            }
        }

        if (Object.keys(newQuestions[qType]!).length === 0) {
            delete newQuestions[qType];
        }
        return { ...topic, questions: newQuestions };
      }
      return topic;
    });
    const newMatrix = { ...matrix, topics: newTopics };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
  };

  const updateQuestionPoints = (topicId: string, qType: QuestionType, cLevel: CognitiveLevel, points: number) => {
    const newTopics = matrix.topics.map(topic => {
      if (topic.id === topicId) {
        const newQuestions = JSON.parse(JSON.stringify(topic.questions));
        if (!newQuestions[qType]) newQuestions[qType] = {};
        
        const current = (newQuestions[qType] as any)[cLevel];
        const count = typeof current === 'object' ? current.count : (current || 0);
        
        if (count > 0) {
            (newQuestions[qType] as any)[cLevel] = { count, pointsPerQuestion: points };
        }
        
        return { ...topic, questions: newQuestions };
      }
      return topic;
    });
    const newMatrix = { ...matrix, topics: newTopics };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
  };

  const addTopic = (chapterName: string, contentName: string, learningOutcomes?: ContentRow['learningOutcomes']) => {
    if (!chapterName.trim() || !contentName.trim()) return;
    const newTopic: ContentRow = {
      id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chapterName,
      contentName,
      questions: {},
      learningOutcomes: learningOutcomes || {},
    };
    return newTopic;
  };

  const handleAddTopic = (chapterName: string, contentName: string, learningOutcomes?: ContentRow['learningOutcomes']) => {
    const newTopic = addTopic(chapterName, contentName, learningOutcomes);
    if (newTopic) {
      const newMatrix = { ...matrix, topics: [...matrix.topics, newTopic] };
      setMatrix(newMatrix);
      onMatrixUpdate(newMatrix);
    }
  };

  const addAllTopicsFromChapter = (chapterName: string, contents: SampleContent[]) => {
    const newTopics = contents.map((content, idx) => ({
      id: `topic-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      chapterName,
      contentName: content.contentName,
      questions: {},
      learningOutcomes: content.learningOutcomes || {},
    }));
    const newMatrix = { ...matrix, topics: [...matrix.topics, ...newTopics] };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
  };

  const addAllTopicsFromGrade = () => {
    const allNewTopics: ContentRow[] = [];
    Object.entries(sampleTopics).forEach(([chapter, contents], cIdx) => {
      (contents as SampleContent[]).forEach((content, tIdx) => {
        allNewTopics.push({
          id: `topic-${Date.now()}-${cIdx}-${tIdx}-${Math.random().toString(36).substr(2, 9)}`,
          chapterName: chapter,
          contentName: content.contentName,
          questions: {},
          learningOutcomes: content.learningOutcomes || {},
        });
      });
    });
    const newMatrix = { ...matrix, topics: [...matrix.topics, ...allNewTopics] };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
  };

  const removeTopic = (topicId: string) => {
    const newTopics = matrix.topics.filter(t => t.id !== topicId);
    const newMatrix = { ...matrix, topics: newTopics };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
  };
  
  const updateLearningOutcome = (topicId: string, cLevel: CognitiveLevelType, outcome: string) => {
    const newTopics = matrix.topics.map(topic => {
      if (topic.id === topicId) {
        const newOutcomes = { ...(topic.learningOutcomes || {}), [cLevel]: outcome };
        if (!outcome.trim()) {
          delete newOutcomes[cLevel];
        }
        return { ...topic, learningOutcomes: newOutcomes };
      }
      return topic;
    });
    const newMatrix = { ...matrix, topics: newTopics };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
  };

  const handleAiDescriptionSubmit = async () => {
    if (!aiDescription.trim()) return;
    setIsAiLoading(true);
    try {
      const results = await suggestTopicsFromDescription(matrix.header.subject, matrix.header.grade, aiDescription);
      setAiResults(results);
    } catch (error) {
      alert("Lỗi khi gợi ý chủ đề từ AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAiLoading(true);
    try {
      const text = await extractTextFromFile(file);
      const results = await suggestMatrixFromContent(matrix.header.subject, matrix.header.grade, text);
      setAiResults(results);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Lỗi khi xử lý file.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) return;
    setIsAiLoading(true);
    try {
      const results = await suggestMatrixFromContent(matrix.header.subject, matrix.header.grade, pastedText);
      setAiResults(results);
    } catch (error) {
      alert("Lỗi khi phân tích nội dung dán vào.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addAiResultsToMatrix = () => {
    const newTopics = aiResults.map((res, idx) => ({
      id: `topic-ai-${Date.now()}-${idx}`,
      chapterName: res.chapterName,
      contentName: res.contentName,
      learningOutcomes: res.learningOutcomes || {},
      questions: {},
    }));
    
    const newMatrix = { ...matrix, topics: [...matrix.topics, ...newTopics] };
    setMatrix(newMatrix);
    onMatrixUpdate(newMatrix);
    setShowAiModal(false);
    setAiResults([]);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(customChapter.trim() && customContent.trim()){
        handleAddTopic(customChapter.trim(), customContent.trim());
        setCustomContent('');
    }
  };

  const handleImportCurriculumFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingCurriculum(true);
    try {
      const text = await file.text();
      const newTopics: ContentRow[] = [];

      // Detect format: JSON object {chapter: [lesson,...]} or array [{chapterName, contentName}]
      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          // [{chapterName, contentName, learningOutcomes?}]
          parsed.forEach((item: any, idx: number) => {
            if (item.chapterName && item.contentName) {
              newTopics.push({
                id: `import-${Date.now()}-${idx}`,
                chapterName: item.chapterName,
                contentName: item.contentName,
                questions: {},
                learningOutcomes: item.learningOutcomes || {},
              });
            }
          });
        } else if (typeof parsed === 'object') {
          // {"Chapter A": ["Lesson 1", "Lesson 2"], ...}
          Object.entries(parsed).forEach(([chapter, lessons], ci) => {
            const lessonList = Array.isArray(lessons) ? lessons : [lessons];
            (lessonList as string[]).forEach((lesson, li) => {
              newTopics.push({
                id: `import-${Date.now()}-${ci}-${li}`,
                chapterName: chapter,
                contentName: typeof lesson === 'string' ? lesson : (lesson as any).contentName || String(lesson),
                questions: {},
                learningOutcomes: typeof lesson === 'object' ? (lesson as any).learningOutcomes || {} : {},
              });
            });
          });
        }
      } else {
        // CSV / TXT: each line "Chapter | Lesson" or "Chapter\tLesson"
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        // If first line looks like a header, skip it
        const dataLines = lines[0]?.toLowerCase().includes('chương') || lines[0]?.toLowerCase().includes('chapter') ? lines.slice(1) : lines;
        dataLines.forEach((line, idx) => {
          const sep = line.includes('|') ? '|' : line.includes('\t') ? '\t' : ';';
          const parts = line.split(sep).map(p => p.trim());
          if (parts.length >= 2 && parts[0] && parts[1]) {
            newTopics.push({
              id: `import-${Date.now()}-${idx}`,
              chapterName: parts[0],
              contentName: parts[1],
              questions: {},
              learningOutcomes: {},
            });
          }
        });
      }

      if (newTopics.length === 0) {
        alert('Không đọc được nội dung từ file. Hãy kiểm tra lại định dạng file (JSON hoặc CSV với dấu |).');
        return;
      }

      const newMatrix = { ...matrix, topics: [...matrix.topics, ...newTopics] };
      setMatrix(newMatrix);
      onMatrixUpdate(newMatrix);
      alert(`✅ Đã nạp ${newTopics.length} nội dung từ file "${file.name}"!`);
    } catch (err) {
      alert(`Lỗi khi đọc file: ${err instanceof Error ? err.message : 'Không xác định'}`);
    } finally {
      setIsImportingCurriculum(false);
      if (curriculumFileRef.current) curriculumFileRef.current.value = '';
    }
  };

  const downloadCurriculumTemplate = () => {
    const json = JSON.stringify({
      'Chương 1: Tên chương': ['Tên bài 1', 'Tên bài 2', 'Tên bài 3'],
      'Chương 2: Tên chương': ['Tên bài 1', 'Tên bài 2']
    }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mau-chuong-trinh.json'; a.click();
    URL.revokeObjectURL(url);
  };

    const totals = useMemo(() => {
    const totalsByCogLevel: { [key in CognitiveLevel]: { count: number, points: number, tnkqCount: number, essayCount: number, essayParts: EssayQuestion[] } } = {
      [CognitiveLevel.KNOWLEDGE]: { count: 0, points: 0, tnkqCount: 0, essayCount: 0, essayParts: [] },
      [CognitiveLevel.COMPREHENSION]: { count: 0, points: 0, tnkqCount: 0, essayCount: 0, essayParts: [] },
      [CognitiveLevel.APPLICATION]: { count: 0, points: 0, tnkqCount: 0, essayCount: 0, essayParts: [] },
      [CognitiveLevel.HIGH_APPLICATION]: { count: 0, points: 0, tnkqCount: 0, essayCount: 0, essayParts: [] },
    };
    
    const totalsByQTypeAndCogLevel: { [key in QuestionType]?: { [key in CognitiveLevel]?: { count: number, points: number } } } = {};
    
    let grandTotalCount = 0;
    let grandTotalPoints = 0;
    let chartCount = 0;

    for (const topic of matrix.topics) {
      for (const qTypeStr of Object.values(QuestionType)) {
        const qType = qTypeStr as QuestionType;
        for (const cLevel of COGNITIVE_LEVELS) {
            const isEssay = ESSAY_QUESTION_TYPES.includes(qType);
            const questionCell = (topic.questions[qType] as any)?.[cLevel];
            const count = isEssay ? (questionCell?.id ? 1 : 0) : (typeof questionCell === 'object' ? questionCell.count : (questionCell || 0));

            if (count > 0) {
                const pointsPerQuestion = (typeof questionCell === 'object' && questionCell.pointsPerQuestion !== undefined) 
                    ? questionCell.pointsPerQuestion 
                    : (matrix.points[qType]?.[cLevel] || 0);
                const points = isEssay ? pointsPerQuestion : count * pointsPerQuestion;
                
                grandTotalCount += count;
                grandTotalPoints += points;
                
                totalsByCogLevel[cLevel].count += count;
                totalsByCogLevel[cLevel].points += points;
                
                if (isEssay) {
                  totalsByCogLevel[cLevel].essayCount += count;
                  totalsByCogLevel[cLevel].essayParts.push(questionCell);
                  if (questionCell.isChart) chartCount++;
                } else {
                  totalsByCogLevel[cLevel].tnkqCount += count;
                }

                if (!totalsByQTypeAndCogLevel[qType]) totalsByQTypeAndCogLevel[qType] = {};
                if (!(totalsByQTypeAndCogLevel[qType] as any)![cLevel]) (totalsByQTypeAndCogLevel[qType] as any)![cLevel] = { count: 0, points: 0 };
                (totalsByQTypeAndCogLevel[qType] as any)![cLevel]!.count += count;
                (totalsByQTypeAndCogLevel[qType] as any)![cLevel]!.points += points;
            }
        }
      }
    }
    return { totalsByCogLevel, grandTotalCount, grandTotalPoints, totalsByQTypeAndCogLevel, chartCount };
  }, [matrix]);

  // --- EXPORT HANDLERS ---
  const handleExportPdf = () => {
    document.body.classList.add('printing-matrix');
    window.print();
  };

  const handleExportExcel = () => {
      // This function needs to be updated to match the new specification table format if needed.
      // For now, it exports a simplified list.
    const headers = ["STT", "Chủ đề/Chương", "Nội dung/Đơn vị kiến thức", "Mức độ nhận thức", "Dạng câu hỏi", "Số câu", "Năng lực"];
    const csvRows = [headers.join(',')];
    let stt = 1;
     matrix.topics.forEach(topic => {
      QUESTION_TYPES.forEach(qType => {
        COGNITIVE_LEVELS.forEach(cLevel => {
          const isEssay = ESSAY_QUESTION_TYPES.includes(qType);
          const detail = (topic.questions[qType] as any)?.[cLevel];
          if (detail) {
            const row = [
              stt++,
              `"${topic.chapterName}"`,
              `"${topic.contentName}"`,
              cLevel,
              qType,
              isEssay ? `"${detail.id}"` : (typeof detail === 'object' ? detail.count : detail),
              getCompetencyCode(cLevel, matrix.header.subject)
            ];
            csvRows.push(row.join(','));
          }
        });
      });
    });
    downloadFile('ban-dac-ta.csv', csvRows.join('\n'), 'text/csv;charset=utf-8;');
  };

  const handleExportWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: matrix.header.departmentOfEducation.toUpperCase(), bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: matrix.header.schoolName.toUpperCase(), bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "--------------------------" }),
            ],
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `MA TRẬN ĐỀ KIỂM TRA ${matrix.header.examPeriod.toUpperCase()}, NĂM HỌC 2025 - 2026`, bold: true, size: 28 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `MÔN: ${matrix.header.subject.toUpperCase()} LỚP ${matrix.header.grade}`, bold: true, size: 24 }),
            ],
          }),
          new Paragraph({ spacing: { before: 400 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row 1
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "STT" })], alignment: AlignmentType.CENTER })], rowSpan: 3, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chương/Chủ đề" })], alignment: AlignmentType.CENTER })], rowSpan: 3, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nội dung/đơn vị kiến thức" })], alignment: AlignmentType.CENTER })], rowSpan: 3, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Mức độ nhận thức" })], alignment: AlignmentType.CENTER })], columnSpan: 16, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tổng" })], alignment: AlignmentType.CENTER })], columnSpan: 4, rowSpan: 2, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tỉ lệ (%)\nđiểm" })], alignment: AlignmentType.CENTER })], rowSpan: 3, verticalAlign: VerticalAlign.CENTER }),
                ],
              }),
              // Header Row 2
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nhiều lựa chọn" })], alignment: AlignmentType.CENTER })], columnSpan: 4, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Đúng - sai" })], alignment: AlignmentType.CENTER })], columnSpan: 4, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Trả lời ngắn" })], alignment: AlignmentType.CENTER })], columnSpan: 4, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tự luận" })], alignment: AlignmentType.CENTER })], columnSpan: 4, verticalAlign: VerticalAlign.CENTER }),
                ],
              }),
              // Header Row 3
              new TableRow({
                children: [
                  ...TNKQ_QUESTION_TYPES.flatMap(qType => 
                    COGNITIVE_LEVELS.map(cl => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cl })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }))
                  ),
                  ...COGNITIVE_LEVELS.map(cl => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cl })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })),
                  ...COGNITIVE_LEVELS.map(cl => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cl })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })),
                ],
              }),
              // Data Rows
              ...matrix.topics.map((topic, index) => {
                const rowTotals = (() => {
                  const totalsByCogLevel: { [key in CognitiveLevel]: { count: number, points: number } } = {
                    [CognitiveLevel.KNOWLEDGE]: { count: 0, points: 0 },
                    [CognitiveLevel.COMPREHENSION]: { count: 0, points: 0 },
                    [CognitiveLevel.APPLICATION]: { count: 0, points: 0 },
                    [CognitiveLevel.HIGH_APPLICATION]: { count: 0, points: 0 },
                  };
                  let totalRowPoints = 0;
                  for (const qType of QUESTION_TYPES) {
                    for (const cLevel of COGNITIVE_LEVELS) {
                      const detail = (topic.questions[qType] as any)?.[cLevel];
                      const isEssay = ESSAY_QUESTION_TYPES.includes(qType);
                      const count = isEssay ? (detail?.id ? 1 : 0) : (typeof detail === 'object' ? detail.count : (detail || 0));
                      if (count > 0) {
                        const pointsPerQuestion = (typeof detail === 'object' && detail.pointsPerQuestion !== undefined) 
                          ? detail.pointsPerQuestion 
                          : (matrix.points[qType]?.[cLevel] || 0);
                        const points = isEssay ? pointsPerQuestion : count * pointsPerQuestion;
                        totalsByCogLevel[cLevel].count += count;
                        totalsByCogLevel[cLevel].points += points;
                        totalRowPoints += points;
                      }
                    }
                  }
                  return { totalsByCogLevel, totalRowPoints };
                })();

                return new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (index + 1).toString() })], alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: topic.chapterName })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: topic.contentName })] })] }),
                    ...TNKQ_QUESTION_TYPES.flatMap(qType => 
                      COGNITIVE_LEVELS.map(cl => {
                        const detail = (topic.questions[qType] as any)?.[cl];
                        const count = typeof detail === 'object' ? detail.count : (detail || 0);
                        const points = typeof detail === 'object' ? detail.pointsPerQuestion : (matrix.points[qType]?.[cl] || 0);
                        const text = count > 0 ? (showPointsInCells ? `${count}\n(${points}đ)` : count.toString()) : "";
                        return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text })], alignment: AlignmentType.CENTER })] });
                      })
                    ),
                    ...COGNITIVE_LEVELS.map(cl => {
                      const detail = (topic.questions[QuestionType.ESSAY] as any)?.[cl];
                      const text = detail?.id ? `${detail.id}${detail.isChart ? '📈' : ''}` : "";
                      return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text })], alignment: AlignmentType.CENTER })] });
                    }),
                    ...COGNITIVE_LEVELS.map(cl => {
                      const count = rowTotals.totalsByCogLevel[cl].count;
                      return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: count > 0 ? count.toString() : "" })], alignment: AlignmentType.CENTER })] });
                    }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: matrix.header.totalPoints > 0 ? (rowTotals.totalRowPoints / matrix.header.totalPoints * 100).toFixed(1) + "%" : "0.0%" })], alignment: AlignmentType.CENTER })] }),
                  ],
                });
              }),
              // Footer Row 1: Tổng số câu
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tổng số câu/lệnh hỏi", bold: true })] })], columnSpan: 3 }),
                  ...QUESTION_TYPES.flatMap(qType => 
                    COGNITIVE_LEVELS.map(cl => {
                      const count = totals.totalsByQTypeAndCogLevel[qType]?.[cl]?.count || 0;
                      return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: count > 0 ? count.toString() : "", bold: true })], alignment: AlignmentType.CENTER })] });
                    })
                  ),
                  ...COGNITIVE_LEVELS.map(cl => {
                    const tnkq = totals.totalsByCogLevel[cl].tnkqCount;
                    const essayParts = totals.totalsByCogLevel[cl].essayParts;
                    const parts = [];
                    if (tnkq > 0) parts.push(`${tnkq}TN`);
                    if (essayParts.length > 0) parts.push(...essayParts.map((p: any) => `${p.id}${p.isChart ? '📈' : ''}TL`));
                    return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: parts.join(' '), bold: true, size: 16 })], alignment: AlignmentType.CENTER })] });
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: totals.grandTotalCount.toString(), bold: true })], alignment: AlignmentType.CENTER })] }),
                ],
              }),
              // Footer Row 2: Tổng số điểm
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tổng số điểm", bold: true })] })], columnSpan: 3 }),
                  ...QUESTION_TYPES.flatMap(qType => 
                    COGNITIVE_LEVELS.map(cl => {
                      const points = totals.totalsByQTypeAndCogLevel[qType]?.[cl]?.points || 0;
                      return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: points > 0 ? points.toFixed(1).replace(/\.0$/, '') : "", bold: true })], alignment: AlignmentType.CENTER })] });
                    })
                  ),
                  ...COGNITIVE_LEVELS.map(cl => {
                    const points = totals.totalsByCogLevel[cl].points;
                    return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: points > 0 ? points.toFixed(1).replace(/\.0$/, '') : "", bold: true })], alignment: AlignmentType.CENTER })] });
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: totals.grandTotalPoints.toFixed(1).replace(/\.0$/, ''), bold: true })], alignment: AlignmentType.CENTER })] }),
                ],
              }),
              // Footer Row 3: Tỉ lệ % (câu)
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tỉ lệ % (câu)", bold: true })] })], columnSpan: 3 }),
                  ...QUESTION_TYPES.flatMap(qType => 
                    COGNITIVE_LEVELS.map(cl => {
                      const count = totals.totalsByQTypeAndCogLevel[qType]?.[cl]?.count || 0;
                      const text = totals.grandTotalCount > 0 && count > 0 ? (count / totals.grandTotalCount * 100).toFixed(1) + "%" : "";
                      return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER });
                    })
                  ),
                  ...COGNITIVE_LEVELS.map(cl => {
                    const percent = totals.grandTotalCount > 0 ? (totals.totalsByCogLevel[cl].count / totals.grandTotalCount * 100).toFixed(1) : '0.0';
                    return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${percent}%`, bold: true })], alignment: AlignmentType.CENTER })] });
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "100%", bold: true })], alignment: AlignmentType.CENTER })] }),
                ],
              }),
              // Footer Row 4: Tỉ lệ % (điểm)
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tỉ lệ % (điểm)", bold: true })] })], columnSpan: 3 }),
                  ...QUESTION_TYPES.flatMap(qType => 
                    COGNITIVE_LEVELS.map(cl => {
                      const points = totals.totalsByQTypeAndCogLevel[qType]?.[cl]?.points || 0;
                      const text = matrix.header.totalPoints > 0 && points > 0 ? (points / matrix.header.totalPoints * 100).toFixed(1) + "%" : "";
                      return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER });
                    })
                  ),
                  ...COGNITIVE_LEVELS.map(cl => {
                    const percent = matrix.header.totalPoints > 0 ? (totals.totalsByCogLevel[cl].points / matrix.header.totalPoints * 100).toFixed(1) : '0.0';
                    return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${percent}%`, bold: true })], alignment: AlignmentType.CENTER })] });
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "100%", bold: true })], alignment: AlignmentType.CENTER })] }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `ma-tran-${matrix.header.examPeriod}.docx`);
  };
  
  const handleExportSpecificationWord = async () => {
    const yearMatch = matrix.header.examName.match(/NĂM HỌC (\d{4}\s*-\s*\d{4})/);
    const yearString = yearMatch ? yearMatch[1] : "2025 - 2026";

    // Replicate processedRows logic for export
    const rows: any[] = [];
    const topicsByChapter: Record<string, ContentRow[]> = matrix.topics.reduce((acc, topic) => {
      if (!acc[topic.chapterName]) acc[topic.chapterName] = [];
      acc[topic.chapterName].push(topic);
      return acc;
    }, {} as Record<string, ContentRow[]>);
    
    let sttCounter = 1;
    Object.values(topicsByChapter).forEach(contentTopicsInChapter => {
        const chapterRowSpan = contentTopicsInChapter.reduce((sum, topic) => {
            const levels = COGNITIVE_LEVELS.filter(c => QUESTION_TYPES.some(q => {
                const detail = (topic.questions[q] as any)?.[c];
                if (!detail) return false;
                if (q === QuestionType.ESSAY) return !!detail.id;
                return typeof detail === 'object' ? detail.count > 0 : detail > 0;
            }));
            return sum + (levels.length > 0 ? levels.length : 1);
        }, 0);

        contentTopicsInChapter.forEach((topic, contentIndex) => {
            const cognitiveLevelsInTopic = COGNITIVE_LEVELS.filter(c => QUESTION_TYPES.some(q => {
                const detail = (topic.questions[q] as any)?.[c];
                if (!detail) return false;
                if (q === QuestionType.ESSAY) return !!detail.id;
                return typeof detail === 'object' ? detail.count > 0 : detail > 0;
            }));
            const contentRowSpan = cognitiveLevelsInTopic.length || 1;
            
            if (cognitiveLevelsInTopic.length > 0) {
                 cognitiveLevelsInTopic.forEach((cLevel, levelIndex) => {
                    rows.push({
                        isFirstChapterRow: contentIndex === 0 && levelIndex === 0,
                        isFirstContentRow: levelIndex === 0,
                        stt: levelIndex === 0 ? sttCounter++ : null,
                        topicId: topic.id,
                        chapterName: topic.chapterName,
                        contentName: topic.contentName,
                        learningOutcomes: topic.learningOutcomes,
                        cognitiveLevel: cLevel,
                        questions: topic.questions,
                        chapterRowSpan,
                        contentRowSpan
                    });
                });
            } else {
                 rows.push({
                    isFirstChapterRow: contentIndex === 0,
                    isFirstContentRow: true,
                    stt: sttCounter++,
                    topicId: topic.id,
                    chapterName: topic.chapterName,
                    contentName: topic.contentName,
                    learningOutcomes: topic.learningOutcomes,
                    cognitiveLevel: null,
                    questions: {},
                    chapterRowSpan,
                    contentRowSpan: 1
                });
            }
        });
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: matrix.header.departmentOfEducation.toUpperCase(), bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: matrix.header.schoolName.toUpperCase(), bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "--------------------------" })],
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `BẢN ĐẶC TẢ ĐỀ KIỂM TRA ${matrix.header.examPeriod.toUpperCase()}, NĂM HỌC ${yearString}`, bold: true, size: 28 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `MÔN: ${matrix.header.subject.toUpperCase()} LỚP ${matrix.header.grade}`, bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "(Theo công văn 7991 của Bộ Giáo dục và Đào tạo)", italics: true, size: 20 }),
            ],
          }),
          new Paragraph({ spacing: { before: 400 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row 1
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "STT", bold: true })], alignment: AlignmentType.CENTER })], rowSpan: 2, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chương/Chủ đề", bold: true })], alignment: AlignmentType.CENTER })], rowSpan: 2, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nội dung/Đơn vị kiến thức", bold: true })], alignment: AlignmentType.CENTER })], rowSpan: 2, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Mức độ nhận thức", bold: true })], alignment: AlignmentType.CENTER })], rowSpan: 2, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Yêu cầu cần đạt", bold: true })], alignment: AlignmentType.CENTER })], rowSpan: 2, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Số câu hỏi theo mức độ nhận thức", bold: true })], alignment: AlignmentType.CENTER })], columnSpan: 16, verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tổng", bold: true })], alignment: AlignmentType.CENTER })], rowSpan: 2, verticalAlign: VerticalAlign.CENTER }),
                ],
              }),
              // Header Row 2
              new TableRow({
                children: [
                  ...TNKQ_QUESTION_TYPES.flatMap(qType => 
                    COGNITIVE_LEVELS.map(cl => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cl, size: 16 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }))
                  ),
                  ...COGNITIVE_LEVELS.map(cl => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cl, size: 16 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })),
                ],
              }),
              // Data Rows
              ...rows.map(row => {
                const cells = [];
                
                // STT
                cells.push(new TableCell({ 
                  children: [new Paragraph({ children: [new TextRun({ text: row.stt?.toString() || "" })], alignment: AlignmentType.CENTER })], 
                  verticalMerge: row.isFirstChapterRow ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                  verticalAlign: VerticalAlign.CENTER 
                }));

                // Chapter Name
                cells.push(new TableCell({ 
                  children: [new Paragraph({ children: [new TextRun({ text: row.chapterName, bold: true })] })], 
                  verticalMerge: row.isFirstChapterRow ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                  verticalAlign: VerticalAlign.CENTER 
                }));

                // Content Name
                cells.push(new TableCell({ 
                  children: [new Paragraph({ children: [new TextRun({ text: row.contentName })] })], 
                  verticalMerge: row.isFirstContentRow ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                  verticalAlign: VerticalAlign.CENTER 
                }));
                
                let outcomeText = (row.learningOutcomes as any)?.[row.cognitiveLevel!] || "";
                const saDetail = (row.questions[QuestionType.SHORT_ANSWER] as any)?.[row.cognitiveLevel!];
                const saCount = typeof saDetail === 'object' ? saDetail.count : (saDetail || 0);
                if (saCount > 0) {
                    outcomeText += outcomeText ? "\n(Dạng thức trả lời ngắn: Câu hỏi tính/toán với các công thức đặc thù)" : "(Dạng thức trả lời ngắn: Câu hỏi tính/toán với các công thức đặc thù)";
                }
                const outcomeParagraphs = outcomeText.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line })] }));
                
                cells.push(new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.cognitiveLevel || "" })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }));
                cells.push(new TableCell({ children: outcomeParagraphs, verticalAlign: VerticalAlign.CENTER }));
                
                // Question Grid
                QUESTION_TYPES.forEach(qType => {
                  COGNITIVE_LEVELS.forEach(cl => {
                    let text = "";
                    if (row.cognitiveLevel === cl) {
                      const detail = (row.questions[qType] as any)?.[cl];
                      if (detail) {
                        if (ESSAY_QUESTION_TYPES.includes(qType as QuestionType)) {
                          if (detail.id) text = `${detail.id}${detail.isChart ? ' (vẽ biểu đồ)' : ''}`;
                        } else {
                          const count = typeof detail === 'object' ? detail.count : detail;
                          const p = typeof detail === 'object' ? detail.pointsPerQuestion : (matrix.points[qType as QuestionType]?.[cl] || 0);
                          text = showPointsInCells ? `${count} câu (${p}đ/câu)` : `${count} câu`;
                        }
                      }
                    }
                    cells.push(new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, size: 16 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }));
                  });
                });

                // Row Total
                const rowTotalText = (() => {
                  if (!row.cognitiveLevel) return "";
                  const tnkq = TNKQ_QUESTION_TYPES.reduce((sum, qType) => {
                    const detail = (row.questions[qType] as any)?.[row.cognitiveLevel!];
                    return sum + (typeof detail === 'object' ? detail.count : (detail || 0));
                  }, 0);
                  const essayParts = ESSAY_QUESTION_TYPES.map(qType => (row.questions[qType] as any)?.[row.cognitiveLevel!]).filter(p => p && p.id);
                  const parts = [];
                  if (tnkq > 0) parts.push(`${tnkq}TN`);
                  if (essayParts.length > 0) parts.push(...essayParts.map((p: any) => `${p.id}${p.isChart ? '📈' : ''}TL`));
                  return parts.join('\n');
                })();
                cells.push(new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: rowTotalText, size: 16 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }));

                return new TableRow({ children: cells });
              }),
              // Footer Rows
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tổng cộng", bold: true })], alignment: AlignmentType.RIGHT })], columnSpan: 5 }),
                  ...QUESTION_TYPES.flatMap(qType => 
                    COGNITIVE_LEVELS.map(cl => {
                      const count = totals.totalsByQTypeAndCogLevel[qType]?.[cl]?.count || 0;
                      return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: count > 0 ? count.toString() : "", bold: true })], alignment: AlignmentType.CENTER })] });
                    })
                  ),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: totals.grandTotalCount.toString(), bold: true })], alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tỉ lệ % số câu", bold: true })], alignment: AlignmentType.RIGHT })], columnSpan: 5 }),
                  ...COGNITIVE_LEVELS.map(cl => {
                    const percent = totals.grandTotalCount > 0 ? (totals.totalsByCogLevel[cl].count / totals.grandTotalCount * 100).toFixed(1) : '0.0';
                    return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${cl}: ${percent}%`, bold: true })], alignment: AlignmentType.CENTER })], columnSpan: 4 });
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "100%", bold: true })], alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tỉ lệ % điểm", bold: true })], alignment: AlignmentType.RIGHT })], columnSpan: 5 }),
                  ...COGNITIVE_LEVELS.map(cl => {
                    const percent = matrix.header.totalPoints > 0 ? (totals.totalsByCogLevel[cl].points / matrix.header.totalPoints * 100).toFixed(1) : '0.0';
                    return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${cl}: ${percent}%`, bold: true })], alignment: AlignmentType.CENTER })], columnSpan: 4 });
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "100%", bold: true })], alignment: AlignmentType.CENTER })] }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `ban-dac-ta-${matrix.header.examPeriod}.docx`);
  };


  const handleExportSpecificationPdf = () => {
    if (!showSpecification) {
        alert('Vui lòng mở "Bản Đặc tả" trước khi xuất ra PDF.');
        return;
    }
    document.body.classList.add('printing-spec');
    window.print();
  };


  return (
    <div className="space-y-6">
      {/* --- Upload Banner --- */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <FileUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-blue-900 font-bold text-lg">Lối tắt: Bạn đã có file Ma trận?</h3>
            <p className="text-blue-700 text-sm">Tải lên file Ma trận (HTML, Word, PDF) để bỏ qua các bước cấu hình và sinh ngay Bản đặc tả.</p>
          </div>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isParsingMatrix}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait whitespace-nowrap shadow-sm"
        >
          {isParsingMatrix ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <FileUp className="w-5 h-5" />
              <span>Upload Ma trận & Đi tiếp</span>
            </>
          )}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUploadMatrix} 
          className="hidden" 
          accept=".pdf,.docx,.txt,.html"
        />
      </div>

      <HeaderForm header={matrix.header} updateHeader={updateHeader} />
      <PointsConfigForm 
        points={matrix.points} 
        updatePoints={updatePoints} 
        showPointsInCells={showPointsInCells}
        setShowPointsInCells={setShowPointsInCells}
      />
        <div id="matrix-print-area" className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">MA TRẬN ĐỀ THI CHI TIẾT</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa tất cả nội dung trong ma trận hiện tại?')) {
                  const newMatrix = { ...matrix, topics: [] };
                  setMatrix(newMatrix);
                  onMatrixUpdate(newMatrix);
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all text-sm font-semibold"
              title="Xóa tất cả nội dung để bắt đầu lại"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa tất cả</span>
            </button>
            <button 
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Trợ lý AI & Nhập liệu</span>
            </button>
          </div>
        </div>

        {/* Validation Warning */}
        {Math.abs(totals.grandTotalPoints - matrix.header.totalPoints) > 0.01 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 mx-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Tổng điểm chưa khớp!</p>
              <p className="text-sm opacity-90">
                Tổng điểm hiện tại của ma trận là <span className="font-bold">{totals.grandTotalPoints}</span>, 
                trong khi mục tiêu là <span className="font-bold">{matrix.header.totalPoints}</span>. 
                Vui lòng điều chỉnh số lượng câu hỏi hoặc điểm số để đảm bảo tính nhất quán (theo Công văn 7791/7991).
              </p>
            </div>
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <table id="matrix-table-for-export" className="min-w-full border-collapse text-sm">
            <MatrixTableHeader />
            <tbody>
              {matrix.topics.map((topic, index) => (
                <MatrixTopicRow
                  key={topic.id}
                  topic={topic}
                  index={index}
                  updateQuestion={updateQuestion}
                  updateQuestionPoints={updateQuestionPoints}
                  removeTopic={removeTopic}
                  matrix={matrix}
                  targetTotalPoints={matrix.header.totalPoints}
                  showPointsInCells={showPointsInCells}
                />
              ))}
            </tbody>
            <MatrixTableFooter totals={totals} targetTotalPoints={matrix.header.totalPoints} />
          </table>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* --- Column 1: Topic Adder --- */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Thêm Nội dung / Chương</h3>
              
              <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-600 text-sm">1. Chọn từ danh sách gợi ý cho môn <span className="text-blue-600 font-bold">{matrix.header.subject}</span></h4>
                    {Object.keys(sampleTopics).length > 0 && (
                      <button 
                        onClick={addAllTopicsFromGrade}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                      >
                        <Plus className="w-3 h-3" /> Thêm tất cả khối {activeGradeTab}
                      </button>
                    )}
                  </div>
                  <div className="flex border-b border-gray-200 mb-2">
                      {GRADES.map(grade => (
                          <button
                              key={grade}
                              onClick={() => setActiveGradeTab(grade)}
                              className={`px-3 py-2 text-sm font-medium transition-colors -mb-px ${
                                  activeGradeTab === grade
                                  ? 'border-b-2 border-blue-600 text-blue-600'
                                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-md'
                              }`}
                          >
                              Khối {grade}
                          </button>
                      ))}
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto p-1">
                      {Object.keys(sampleTopics).length > 0 ? Object.entries(sampleTopics).map(([chapter, contents]) => (
                          <div key={chapter}>
                            <div className="w-full flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-md pr-2">
                              <button onClick={() => setExpandedChapter(expandedChapter === chapter ? null : chapter)} className="flex-1 text-left p-2 font-semibold flex justify-between items-center">
                                {chapter}
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedChapter === chapter ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); addAllTopicsFromChapter(chapter, contents as SampleContent[]); }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                                title="Thêm tất cả nội dung trong chương này"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            {expandedChapter === chapter && (
                                <div className="p-2 flex flex-wrap gap-2 border-l-2 border-blue-200 ml-2">
                                     {(contents as SampleContent[]).map(contentItem => (
                                          <button key={contentItem.contentName} onClick={() => handleAddTopic(chapter, contentItem.contentName, contentItem.learningOutcomes)} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors text-left flex items-center gap-1.5">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                              {contentItem.contentName}
                                          </button>
                                     ))}
                                </div>
                            )}
                          </div>
                      )) : <p className="text-gray-500 text-sm p-2">Không có chủ đề mẫu cho môn học và khối lớp này.</p>}
                  </div>
              </div>
              
              <div>
                  <h4 className="font-semibold text-gray-600 mb-2 text-sm">2. Hoặc nhập nội dung tùy chỉnh</h4>
                  <form onSubmit={handleCustomSubmit} className="space-y-2">
                      <input 
                          type="text" 
                          placeholder="Tên Chủ đề / Chương" 
                          value={customChapter}
                          onChange={e => setCustomChapter(e.target.value)}
                          list="chapters-datalist"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                      <datalist id="chapters-datalist">
                          {Object.keys(sampleTopics).map(c => <option key={c} value={c} />)}
                          {[...new Set(matrix.topics.map(t => t.chapterName))].map(c => <option key={c} value={c} />)}
                      </datalist>

                      <input 
                          type="text" 
                          placeholder="Tên Nội dung / Đơn vị kiến thức" 
                          value={customContent}
                          onChange={e => setCustomContent(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                      <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition flex-shrink-0 disabled:bg-gray-400" disabled={!customChapter.trim() || !customContent.trim()}>
                          Thêm
                      </button>
                  </form>
              </div>

              {/* --- Section 3: Import from file --- */}
              <div className="border-t border-dashed border-gray-300 pt-4">
                <h4 className="font-semibold text-gray-600 mb-1 text-sm flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-emerald-600" />
                  3. Nạp chương trình từ File
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Hỗ trợ: <span className="font-mono bg-gray-100 px-1 rounded">.json</span>, <span className="font-mono bg-gray-100 px-1 rounded">.csv</span>, <span className="font-mono bg-gray-100 px-1 rounded">.txt</span> — mỗi dòng: <span className="font-mono bg-gray-100 px-1 rounded">Chương | Tên bài</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={curriculumFileRef}
                    type="file"
                    accept=".json,.csv,.txt"
                    className="hidden"
                    onChange={handleImportCurriculumFile}
                  />
                  <button
                    onClick={() => curriculumFileRef.current?.click()}
                    disabled={isImportingCurriculum}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {isImportingCurriculum ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileUp className="w-4 h-4" />
                    )}
                    {isImportingCurriculum ? 'Đang xử lý...' : 'Chọn file'}
                  </button>
                  <button
                    onClick={downloadCurriculumTemplate}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition border border-gray-300"
                    title="Tải file mẫu JSON để điền chương trình"
                  >
                    📥 Tải file mẫu
                  </button>
                </div>
              </div>
            </div>

            {/* --- Column 2: Specification and Export Tools --- */}
            <div className="space-y-6">
               <h3 className="text-lg font-bold text-gray-800">Công cụ khác</h3>
               <div>
                  <h4 className="font-semibold text-gray-600 mb-2 text-sm">Bản Đặc tả Ma trận</h4>
                   <p className="text-sm text-gray-600 mb-3">Tạo bản đặc tả chi tiết từ ma trận để làm rõ mục tiêu đánh giá và các năng lực cần đạt cho từng câu hỏi, tuân thủ theo CV 7791.</p>
                   <button 
                      onClick={() => setShowSpecification(prev => !prev)} 
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2 font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      {showSpecification ? 'Ẩn Bản Đặc tả' : 'Xem Bản Đặc tả'}
                  </button>
               </div>
               <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-600 mb-2 text-sm">Chia sẻ Ma trận</h4>
                  <p className="text-sm text-gray-600 mb-3">Chia sẻ ma trận này với đồng nghiệp qua link hoặc email.</p>
                  <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={handleShare} 
                        className={`px-3 py-2 text-sm font-semibold rounded-md transition flex items-center gap-1.5 ${
                          shareStatus === 'copied' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                         {shareStatus === 'copied' ? (
                           <>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                             Đã sao chép!
                           </>
                         ) : (
                           <>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                             Sao chép link
                           </>
                         )}
                      </button>
                      <button 
                        onClick={handleEmailShare} 
                        className="px-3 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition flex items-center gap-1.5"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                         Email
                      </button>
                  </div>
               </div>
               <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-600 mb-2 text-sm">Lưu / Tải Ma trận & Bản đặc tả</h4>
                  <p className="text-sm text-gray-600 mb-3">Xuất ma trận và bản đặc tả chi tiết ra các định dạng file phổ biến để lưu trữ hoặc chia sẻ.</p>
                  <div className="flex flex-wrap items-center gap-2">
                      <button onClick={handleExportWord} className="px-3 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v1h8V6H6z" clipRule="evenodd" /></svg>
                         Word (Ma trận)
                      </button>
                       <button onClick={handleExportSpecificationWord} className="px-3 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v1h8V6H6z" clipRule="evenodd" /></svg>
                         Word (Bản đặc tả)
                      </button>
                      <button onClick={handleExportPdf} className="px-3 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 00-1 1v1a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1H6zm1 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                         PDF (Ma trận)
                      </button>
                       <button onClick={handleExportSpecificationPdf} className="px-3 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 00-1 1v1a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1H6zm1 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                         PDF (Bản đặc tả)
                      </button>
                      <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2 1v2h12V6H4zm0 4v2h4v-2H4zm6 0v2h6v-2h-6zm-6 4v2h4v-2H4zm6 0v2h6v-2h-6z" /></svg>
                         Excel (Bản đặc tả)
                      </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
        
        {showSpecification && (
          <SpecificationTable 
            matrix={matrix} 
            totals={totals} 
            onClose={() => setShowSpecification(false)} 
            updateLearningOutcome={updateLearningOutcome} 
            showPointsInCells={showPointsInCells}
          />
        )}
      </div>

      {/* AI & Import Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">Trợ lý AI & Nhập liệu thông minh</h3>
                </div>
                <button onClick={() => setShowAiModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="flex border-b">
                <button 
                  onClick={() => { setAiMode('description'); setAiResults([]); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${aiMode === 'description' ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                  Gợi ý từ mô tả
                </button>
                <button 
                  onClick={() => { setAiMode('document'); setAiResults([]); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${aiMode === 'document' ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                  Tải file (Word/PDF)
                </button>
                <button 
                  onClick={() => { setAiMode('paste'); setAiResults([]); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${aiMode === 'paste' ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                  Dán nội dung
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {aiMode === 'description' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 italic">Mô tả các chủ đề bạn muốn ôn tập, AI sẽ đề xuất danh sách nội dung phù hợp.</p>
                    <textarea 
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      placeholder="Ví dụ: Ôn tập chương 1 Địa lí 12 về Vị trí địa lí, Thiên nhiên nhiệt đới ẩm gió mùa và các thành phần tự nhiên..."
                      className="w-full h-32 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                    <button 
                      onClick={handleAiDescriptionSubmit}
                      disabled={isAiLoading || !aiDescription.trim()}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition disabled:bg-gray-300 flex justify-center items-center gap-2"
                    >
                      {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      <span>Gợi ý chủ đề</span>
                    </button>
                  </div>
                )}

                {aiMode === 'document' && (
                  <div className="space-y-6 text-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <FileUp className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Tải lên tài liệu ôn tập</h4>
                        <p className="text-sm text-gray-500">Hỗ trợ định dạng .pdf, .docx, .txt</p>
                      </div>
                      <label className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95">
                        <span>Chọn file từ máy tính</span>
                        <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                      </label>
                    </div>
                    {isAiLoading && (
                      <div className="flex flex-col items-center gap-2 text-blue-600">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium">Đang phân tích tài liệu...</span>
                      </div>
                    )}
                  </div>
                )}

                {aiMode === 'paste' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 italic">Dán nội dung đề cương hoặc tài liệu ôn tập vào đây, AI sẽ tự động trích xuất ma trận.</p>
                    <textarea 
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Dán nội dung tài liệu tại đây..."
                      className="w-full h-48 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                    <button 
                      onClick={handlePasteSubmit}
                      disabled={isAiLoading || !pastedText.trim()}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition disabled:bg-gray-300 flex justify-center items-center gap-2"
                    >
                      {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
                      <span>Phân tích nội dung</span>
                    </button>
                  </div>
                )}

                {aiResults.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-800">Kết quả gợi ý ({aiResults.length})</h4>
                      <button 
                        onClick={addAiResultsToMatrix}
                        className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Thêm tất cả vào ma trận
                      </button>
                    </div>
                    <div className="space-y-2">
                      {aiResults.map((res, idx) => (
                        <div key={idx} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-start">
                          <div>
                            <div className="text-xs font-bold text-gray-400 uppercase">{res.chapterName}</div>
                            <div className="text-sm font-medium text-gray-800">{res.contentName}</div>
                          </div>
                          <button 
                            onClick={() => setAiResults(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HeaderForm: React.FC<{ header: ExamMatrix['header'], updateHeader: (field: keyof ExamMatrix['header'], value: any) => void }> = ({ header, updateHeader }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-bold mb-4 text-gray-700">Thông tin chung</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="sm:col-span-1 lg:col-span-1">
            <label htmlFor="departmentOfEducation" className="block text-sm font-medium text-gray-700 mb-1">Sở GD&ĐT</label>
            <input id="departmentOfEducation" type="text" value={header.departmentOfEducation} onChange={e => updateHeader('departmentOfEducation', e.target.value)} className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="sm:col-span-1 lg:col-span-2">
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">Tên đơn vị</label>
            <input id="schoolName" type="text" value={header.schoolName} onChange={e => updateHeader('schoolName', e.target.value)} className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
            <label htmlFor="examPeriod" className="block text-sm font-medium text-gray-700 mb-1">Kì kiểm tra</label>
            <select
              id="examPeriod"
              value={header.examPeriod}
              onChange={e => updateHeader('examPeriod', e.target.value)}
              className="p-2 w-full border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {EXAM_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="creator" className="block text-sm font-medium text-gray-700 mb-1">Người tạo</label>
            <input id="creator" type="text" value={header.creator} onChange={e => updateHeader('creator', e.target.value)} className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
            <input id="duration" type="number" value={header.duration} onChange={e => updateHeader('duration', parseInt(e.target.value) || 0)} className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Khối lớp</label>
            <select id="grade" value={header.grade} onChange={e => updateHeader('grade', parseInt(e.target.value))} className="p-2 w-full border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {GRADES.map(g => <option key={g} value={g}>Khối {g}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
            <select id="subject" value={header.subject} onChange={e => updateHeader('subject', e.target.value)} className="p-2 w-full border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700 mb-1">Tổng điểm bài thi</label>
            <input id="totalPoints" type="number" step="0.5" value={header.totalPoints} onChange={e => updateHeader('totalPoints', parseFloat(e.target.value) || 0)} className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">Tên bài kiểm tra / Tiêu đề</label>
            <input id="examName" type="text" value={header.examName} onChange={e => updateHeader('examName', e.target.value)} className="p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
    </div>
  </div>
);

const PointsConfigForm: React.FC<{ points: PointsConfig, updatePoints: (qType: QuestionType, cLevel: CognitiveLevel, value: number) => void, showPointsInCells: boolean, setShowPointsInCells: (val: boolean) => void }> = ({ points, updatePoints, showPointsInCells, setShowPointsInCells }) => (
    <details className="bg-white p-4 rounded-lg shadow-lg" open>
        <summary className="text-lg font-semibold cursor-pointer text-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <span>Cấu hình thang điểm chi tiết</span>
                <label className="flex items-center gap-2 text-sm font-normal cursor-pointer bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition">
                    <input 
                        type="checkbox" 
                        checked={showPointsInCells} 
                        onChange={e => setShowPointsInCells(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Hiển thị điểm trong ô ma trận</span>
                </label>
            </div>
            <span className="text-sm font-normal text-gray-500">
                (TNKQ tối đa 3.0đ, Tự luận tối đa 5.0đ)
            </span>
        </summary>
        <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2 text-left font-semibold text-gray-600">Mức độ nhận thức</th>
                        {QUESTION_TYPES.map(qType => (
                            <th key={qType} className="border p-2 font-semibold text-gray-600 text-center">{qType}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {COGNITIVE_LEVELS.map(cLevel => (
                        <tr key={cLevel} className="hover:bg-gray-50">
                            <td className="border p-2 font-medium text-gray-700">{cLevel}</td>
                            {QUESTION_TYPES.map(qType => {
                                const isEssay = ESSAY_QUESTION_TYPES.includes(qType);
                                const maxPoints = isEssay ? 5.0 : 3.0;
                                const step = isEssay ? 0.25 : 0.1;
                                return (
                                    <td key={`${cLevel}-${qType}`} className="border p-1 text-center">
                                        <input
                                            type="number"
                                            step={step}
                                            min="0"
                                            max={maxPoints}
                                            placeholder="0"
                                            value={points[qType]?.[cLevel] || ''}
                                            onChange={e => updatePoints(qType, cLevel, parseFloat(e.target.value) || 0)}
                                            className="p-1 border rounded-md w-24 text-center bg-transparent focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </details>
);

const MatrixTableHeader: React.FC = () => (
  <thead className="bg-gray-200 text-gray-600 text-xs text-center align-middle">
    <tr>
      <th rowSpan={4} className="border p-2 w-8">STT</th>
      <th rowSpan={4} className="border p-2 min-w-[150px] text-left">Chương/Chủ đề</th>
      <th rowSpan={4} className="border p-2 min-w-[200px] text-left">Nội dung/đơn vị kiến thức</th>
      <th colSpan={20} className="border p-2 text-sm">Mức độ đánh giá</th>
      <th rowSpan={4} className="border p-2">Tỉ lệ (%)<br/>điểm</th>
    </tr>
    <tr>
      <th colSpan={12} className="border p-2">TNKQ</th>
      <th colSpan={4} rowSpan={2} className="border p-2">Tự luận</th>
      <th colSpan={4} rowSpan={2} className="border p-2 text-sm">Tổng</th>
    </tr>
    <tr>
      <th colSpan={4} className="border p-1">Nhiều lựa chọn</th>
      <th colSpan={4} className="border p-1">Đúng - sai</th>
      <th colSpan={4} className="border p-1">Trả lời ngắn</th>
    </tr>
    <tr className="font-semibold">
      {TNKQ_QUESTION_TYPES.map(qType => 
        COGNITIVE_LEVELS.map(cl => <th key={`${qType}-${cl}`} className="border p-1">{cl}</th>)
      ).flat()}
      {COGNITIVE_LEVELS.map(cl => <th key={`essay-${cl}`} className="border p-1">{cl}</th>)}
      {COGNITIVE_LEVELS.map(cl => <th key={`total-${cl}`} className="border p-1">{cl}</th>)}
    </tr>
  </thead>
);

const MatrixTopicRow: React.FC<{ topic: ContentRow, index: number, updateQuestion: Function, updateQuestionPoints: Function, removeTopic: Function, matrix: ExamMatrix, targetTotalPoints: number, showPointsInCells: boolean }> = ({ topic, index, updateQuestion, updateQuestionPoints, removeTopic, matrix, targetTotalPoints, showPointsInCells }) => {
    const rowTotals = useMemo(() => {
        const totalsByCogLevel: { [key in CognitiveLevel]: { count: number, points: number, tnkqCount: number, essayCount: number, essayParts: EssayQuestion[] } } = {
          [CognitiveLevel.KNOWLEDGE]: { count: 0, points: 0, tnkqCount: 0, essayCount: 0, essayParts: [] },
          [CognitiveLevel.COMPREHENSION]: { count: 0, points: 0, tnkqCount: 0, essayCount: 0, essayParts: [] },
          [CognitiveLevel.APPLICATION]: { count: 0, points: 0, tnkqCount: 0, essayCount: 0, essayParts: [] },
          [CognitiveLevel.HIGH_APPLICATION]: { count: 0, points: 0, tnkqCount: 0, essayCount: 0, essayParts: [] },
        };
        let totalRowPoints = 0;

        for (const qTypeStr of Object.values(QuestionType)) {
            const qType = qTypeStr as QuestionType;
            for (const cLevel of COGNITIVE_LEVELS) {
                const isEssay = ESSAY_QUESTION_TYPES.includes(qType);
                const questionCell = (topic.questions[qType] as any)?.[cLevel];
                const count = isEssay ? (questionCell?.id ? 1 : 0) : (typeof questionCell === 'object' ? questionCell.count : (questionCell || 0));

                if (count > 0) {
                    const pointsPerQuestion = (typeof questionCell === 'object' && questionCell.pointsPerQuestion !== undefined) 
                        ? questionCell.pointsPerQuestion 
                        : (matrix.points[qType]?.[cLevel] || 0);
                    const points = isEssay ? pointsPerQuestion : count * pointsPerQuestion;
                    totalsByCogLevel[cLevel].count += count;
                    totalsByCogLevel[cLevel].points += points;
                    totalRowPoints += points;
                     if (isEssay) {
                        totalsByCogLevel[cLevel].essayCount += count;
                        totalsByCogLevel[cLevel].essayParts.push(questionCell);
                    } else {
                        totalsByCogLevel[cLevel].tnkqCount += count;
                    }
                }
            }
        }
        return { totalsByCogLevel, totalRowPoints };
    }, [topic, matrix.points]);
    
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="border p-1 text-center font-semibold">{index + 1}</td>
            <td className="border p-2 text-gray-800 font-medium">{topic.chapterName}</td>
            <td className="border p-2 text-gray-800 font-medium relative group">
                {topic.contentName}
                <button onClick={() => removeTopic(topic.id)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
            </td>
            {TNKQ_QUESTION_TYPES.map(qType => COGNITIVE_LEVELS.map(cLevel => {
                const detail = (topic.questions[qType] as any)?.[cLevel];
                const count = typeof detail === 'object' ? detail.count : (detail || 0);
                const points = typeof detail === 'object' ? detail.pointsPerQuestion : (matrix.points[qType]?.[cLevel] || 0);
                return (
                    <td key={`${qType}-${cLevel}`} className="border p-0">
                        <div className="flex flex-col items-center">
                            <input
                                type="number"
                                min="0"
                                className={`w-12 h-6 text-center bg-transparent focus:bg-blue-50 p-1 outline-none text-sm ${showPointsInCells ? 'rounded-t-md' : 'rounded-md'}`}
                                value={count || ''}
                                onChange={e => updateQuestion(topic.id, qType, cLevel, parseInt(e.target.value) || 0)}
                            />
                            {showPointsInCells && count > 0 && (
                                <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    className="w-12 h-5 text-[10px] text-center bg-blue-50 focus:bg-blue-100 rounded-b-md p-0 outline-none border-t border-blue-200 text-blue-700"
                                    value={points || 0}
                                    onChange={e => updateQuestionPoints(topic.id, qType, cLevel, parseFloat(e.target.value) || 0)}
                                    title="Điểm mỗi câu"
                                />
                            )}
                        </div>
                    </td>
                );
            })).flat()}
             {ESSAY_QUESTION_TYPES.map(qType => COGNITIVE_LEVELS.map(cLevel => {
                const essayDetails = (topic.questions[qType] as any)?.[cLevel];
                // "câu vận dụng và nhận biết không cần vẽ" -> Only Comprehension (Hiểu) can have chart
                const canHaveChart = cLevel === CognitiveLevel.COMPREHENSION;
                
                return (
                    <td key={`${qType}-${cLevel}`} className="border p-0 relative group/cell">
                        <div className="flex items-center w-full h-full">
                            <input
                                type="text"
                                placeholder="Câu..."
                                className="flex-1 h-full text-center bg-transparent focus:bg-blue-50 rounded-md p-1 outline-none text-sm"
                                value={essayDetails?.id || ''}
                                onChange={e => updateQuestion(topic.id, qType, cLevel, { id: e.target.value })}
                            />
                            {canHaveChart && (
                                <button
                                  onClick={() => updateQuestion(topic.id, qType, cLevel, { isChart: !essayDetails?.isChart })}
                                  title={essayDetails?.isChart ? "Bỏ đánh dấu vẽ biểu đồ" : "Đánh dấu là câu hỏi vẽ biểu đồ (Chỉ 1 câu/đề)"}
                                  className={`px-1 h-full text-gray-300 hover:text-blue-600 transition border-l border-transparent hover:border-gray-200 ${essayDetails?.isChart ? '!text-blue-600 !border-gray-200' : 'opacity-0 group-hover/cell:opacity-100'}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11h16v2H2v-2zm4-8h2v12H6V3zm8 0h2v12h-2V3zM4 3h2v12H4V3zm4 4h4v4H8V7z" /></svg>
                                </button>
                            )}
                        </div>
                    </td>
                );
            })).flat()}
            {/* Row Totals */}
            {COGNITIVE_LEVELS.map(cLevel => {
                const tnkq = rowTotals.totalsByCogLevel[cLevel].tnkqCount;
                const essayParts = rowTotals.totalsByCogLevel[cLevel].essayParts;
                const parts = [];
                if (tnkq > 0) parts.push(`${tnkq}TN`);
                if (essayParts.length > 0) {
                    parts.push(...essayParts.map(p => `${p.id}${p.isChart ? '📈' : ''}TL`));
                }
                const totalText = parts.join(' ');
                return (
                    <td key={`row-total-${cLevel}`} className="border p-2 text-center font-semibold text-blue-700 text-xs">
                        {totalText || ''}
                    </td>
                )
            })}
            <td className="border p-2 text-center font-bold text-red-600">
                {targetTotalPoints > 0 ? (rowTotals.totalRowPoints / targetTotalPoints * 100).toFixed(1) : '0.0'}%
            </td>
        </tr>
    );
};

const MatrixTableFooter: React.FC<{ totals: any, targetTotalPoints: number }> = ({ totals, targetTotalPoints }) => {
    const { totalsByCogLevel, grandTotalCount, grandTotalPoints, totalsByQTypeAndCogLevel, chartCount } = totals;
    
    // Check if current total matches target total
    const isTotalCorrect = Math.abs(grandTotalPoints - targetTotalPoints) < 0.01;

    return (
    <tfoot className="font-bold bg-gray-100 text-center">
        <tr>
            <td colSpan={3} className="border p-2 text-left">
                <div>Tổng số câu/lệnh hỏi</div>
                <div className="text-[10px] font-normal text-blue-600">Số câu vẽ biểu đồ: {chartCount}/1</div>
            </td>
            {QUESTION_TYPES.flatMap(qType => 
                COGNITIVE_LEVELS.map(cLevel => (
                    <td key={`count-${qType}-${cLevel}`} className="border p-2">
                        { (ESSAY_QUESTION_TYPES.includes(qType))
                          ? totalsByQTypeAndCogLevel[qType]?.[cLevel]?.count > 0 ? totalsByQTypeAndCogLevel[qType]?.[cLevel]?.count : ''
                          : totalsByQTypeAndCogLevel[qType]?.[cLevel]?.count || ''
                        }
                    </td>
                ))
            )}
            {COGNITIVE_LEVELS.map(cLevel => {
                const tnkq = totalsByCogLevel[cLevel].tnkqCount;
                const essayParts: EssayQuestion[] = totalsByCogLevel[cLevel].essayParts;
                const parts = [];
                if (tnkq > 0) parts.push(`${tnkq}TN`);
                if (essayParts.length > 0) {
                     parts.push(...essayParts.map(p => `${p.id}${p.isChart ? '📈' : ''}TL`));
                }
                return (
                    <td key={`total-count-${cLevel}`} className="border p-2 text-blue-800 text-xs">
                        {parts.join(' ')}
                    </td>
                );
            })}
            <td className="border p-2 text-red-700 bg-yellow-100">{grandTotalCount}</td>
        </tr>
        <tr>
            <td colSpan={3} className="border p-2">Tổng số điểm</td>
            {QUESTION_TYPES.flatMap(qType => 
                COGNITIVE_LEVELS.map(cLevel => (
                    <td key={`points-${qType}-${cLevel}`} className="border p-2">
                        {totalsByQTypeAndCogLevel[qType]?.[cLevel]?.points > 0 ? totalsByQTypeAndCogLevel[qType]?.[cLevel]?.points?.toFixed(2).replace(/\.00$|\.([1-9])0$/, '.$1') : ''}
                    </td>
                ))
            )}
            {COGNITIVE_LEVELS.map(cLevel => (
                 <td key={`total-points-${cLevel}`} className="border p-2 text-blue-800">{totalsByCogLevel[cLevel].points > 0 ? totalsByCogLevel[cLevel].points.toFixed(2).replace(/\.00$|\.([1-9])0$/, '.$1') : ''}</td>
            ))}
            <td className={`border p-2 text-red-700 ${isTotalCorrect ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {grandTotalPoints > 0 ? grandTotalPoints.toFixed(2).replace(/\.00$|\.([1-9])0$/, '.$1') : ''}
                {!isTotalCorrect && grandTotalPoints > 0 && (
                    <div className="text-[10px] font-normal text-red-500">Mục tiêu: {targetTotalPoints}đ</div>
                )}
            </td>
        </tr>
        <tr>
            <td colSpan={3} className="border p-2">Tỉ lệ % (câu)</td>
            {QUESTION_TYPES.flatMap(qType => 
                COGNITIVE_LEVELS.map(cLevel => {
                    const count = totalsByQTypeAndCogLevel[qType]?.[cLevel]?.count || 0;
                    return (
                        <td key={`percent-count-${qType}-${cLevel}`} className="border p-2 text-[10px] text-gray-500">
                            {grandTotalCount > 0 && count > 0 ? (count / grandTotalCount * 100).toFixed(1) + '%' : ''}
                        </td>
                    );
                })
            )}
            {COGNITIVE_LEVELS.map(cLevel => (
                 <td key={`percent-count-${cLevel}`} className="border p-2 text-blue-800">
                  {grandTotalCount > 0 ? (totalsByCogLevel[cLevel].count / grandTotalCount * 100).toFixed(1) : '0.0'}%
                 </td>
            ))}
            <td className="border p-2 text-red-700 bg-yellow-100">100.0%</td>
        </tr>
         <tr>
            <td colSpan={3} className="border p-2">Tỉ lệ % (điểm)</td>
            {QUESTION_TYPES.flatMap(qType => 
                COGNITIVE_LEVELS.map(cLevel => {
                    const points = totalsByQTypeAndCogLevel[qType]?.[cLevel]?.points || 0;
                    return (
                        <td key={`percent-points-${qType}-${cLevel}`} className="border p-2 text-[10px] text-gray-500">
                            {targetTotalPoints > 0 && points > 0 ? (points / targetTotalPoints * 100).toFixed(1) + '%' : ''}
                        </td>
                    );
                })
            )}
            {COGNITIVE_LEVELS.map(cLevel => (
                 <td key={`percent-points-${cLevel}`} className="border p-2 text-blue-800">
                  {targetTotalPoints > 0 ? (totalsByCogLevel[cLevel].points / targetTotalPoints * 100).toFixed(1) : '0.0'}%
                 </td>
            ))}
            <td className="border p-2 text-red-700 bg-yellow-100">
                {targetTotalPoints > 0 ? (grandTotalPoints / targetTotalPoints * 100).toFixed(1) : '0.0'}%
            </td>
        </tr>
    </tfoot>
    );
};

interface SpecificationTableProps {
  matrix: ExamMatrix;
  totals: any;
  onClose: () => void;
  updateLearningOutcome: (topicId: string, cLevel: CognitiveLevelType, outcome: string) => void;
  showPointsInCells: boolean;
}

const SpecificationTable: React.FC<SpecificationTableProps> = ({ matrix, totals, onClose, updateLearningOutcome, showPointsInCells }) => {
  const [generatingYCCD, setGeneratingYCCD] = useState<string | null>(null);

  const handleGenerateYCCD = async (topicId: string, contentName: string, cLevel: CognitiveLevelType) => {
    const key = `${topicId}-${cLevel}`;
    setGeneratingYCCD(key);
    try {
        const outcome = await generateLearningOutcome(
            matrix.header.subject,
            matrix.header.grade,
            contentName,
            cLevel
        );
        updateLearningOutcome(topicId, cLevel, outcome);
    } catch (error) {
        alert('Không thể tạo Yêu cầu cần đạt. Vui lòng thử lại.');
        console.error(error);
    } finally {
        setGeneratingYCCD(null);
    }
  };

  const processedRows = useMemo(() => {
    const rows: {
        isFirstChapterRow: boolean,
        isFirstContentRow: boolean,
        stt: number | null,
        topicId: string,
        chapterName: string,
        contentName: string,
        learningOutcomes?: ContentRow['learningOutcomes'],
        cognitiveLevel: CognitiveLevelType | null,
        questions: ContentRow['questions'],
        chapterRowSpan: number,
        contentRowSpan: number,
    }[] = [];
    
    const topicsByChapter: Record<string, ContentRow[]> = matrix.topics.reduce((acc, topic) => {
      if (!acc[topic.chapterName]) acc[topic.chapterName] = [];
      acc[topic.chapterName].push(topic);
      return acc;
    }, {} as Record<string, ContentRow[]>);
    
    let sttCounter = 1;
    
    Object.values(topicsByChapter).forEach(contentTopicsInChapter => {
        const chapterRowSpan = contentTopicsInChapter.reduce((sum, topic) => {
            const levels = COGNITIVE_LEVELS.filter(c => QUESTION_TYPES.some(q => {
                const detail = (topic.questions[q] as any)?.[c];
                if (!detail) return false;
                if (q === QuestionType.ESSAY) return !!detail.id;
                return typeof detail === 'object' ? detail.count > 0 : detail > 0;
            }));
            return sum + (levels.length > 0 ? levels.length : 1);
        }, 0);

        contentTopicsInChapter.forEach((topic, contentIndex) => {
            const cognitiveLevelsInTopic = COGNITIVE_LEVELS.filter(c => QUESTION_TYPES.some(q => {
                const detail = (topic.questions[q] as any)?.[c];
                if (!detail) return false;
                if (q === QuestionType.ESSAY) return !!detail.id;
                return typeof detail === 'object' ? detail.count > 0 : detail > 0;
            }));
            const contentRowSpan = cognitiveLevelsInTopic.length || 1;
            
            if (cognitiveLevelsInTopic.length > 0) {
                 cognitiveLevelsInTopic.forEach((cLevel, levelIndex) => {
                    rows.push({
                        isFirstChapterRow: contentIndex === 0 && levelIndex === 0,
                        isFirstContentRow: levelIndex === 0,
                        stt: levelIndex === 0 ? sttCounter++ : null,
                        topicId: topic.id,
                        chapterName: topic.chapterName,
                        contentName: topic.contentName,
                        learningOutcomes: topic.learningOutcomes,
                        cognitiveLevel: cLevel,
                        questions: topic.questions,
                        chapterRowSpan,
                        contentRowSpan
                    });
                });
            } else { // Handle topic with no questions
                 rows.push({
                    isFirstChapterRow: contentIndex === 0,
                    isFirstContentRow: true,
                    stt: sttCounter++,
                    topicId: topic.id,
                    chapterName: topic.chapterName,
                    contentName: topic.contentName,
                    learningOutcomes: topic.learningOutcomes,
                    cognitiveLevel: null,
                    questions: {},
                    chapterRowSpan,
                    contentRowSpan: 1
                });
            }
        });
    });

    return rows;
  }, [matrix.topics]);


  return (
    <div id="spec-print-area" className="bg-white p-6 rounded-lg shadow-inner mt-6 border border-green-300">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Bản Đặc tả Chi tiết Ma trận Đề thi</h2>
         <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 no-print">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
      </div>
      <div className="overflow-x-auto">
        <table id="specification-table-for-export" className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-200 text-gray-600 text-xs text-center align-middle">
            <tr>
              <th rowSpan={3} className="border p-1 w-8">TT</th>
              <th rowSpan={3} className="border p-1 min-w-[120px]">Chủ đề/Chương</th>
              <th rowSpan={3} className="border p-1 min-w-[200px]">Nội dung/đơn vị kiến thức</th>
              <th rowSpan={3} className="border p-1 min-w-[150px]">Mức độ nhận thức</th>
              <th rowSpan={3} className="border p-1 min-w-[250px]">Yêu cầu cần đạt</th>
              <th colSpan={17} className="border p-2 text-sm">Số câu/lệnh hỏi ở các mức độ đánh giá</th>
            </tr>
            <tr>
              <th colSpan={12} className="border p-1">TNKQ</th>
              <th colSpan={4} className="border p-1">Tự luận</th>
              <th rowSpan={2} className="border p-1">Tổng</th>
            </tr>
            <tr>
              {/* TNKQ Headers */}
              {TNKQ_QUESTION_TYPES.map(qType => (
                <React.Fragment key={qType}>
                  {COGNITIVE_LEVELS.map(cl => <th key={`${qType}-${cl}`} className="border p-1 font-semibold">{cl[0]}</th>)}
                </React.Fragment>
              ))}
              {/* Essay Headers */}
              {COGNITIVE_LEVELS.map(cl => <th key={`essay-cl-${cl}`} className="border p-1 font-semibold">{cl[0]}</th>)}
            </tr>
            <tr>
                <td colSpan={5} className="border p-1 bg-gray-100"></td>
                {/* Type names under cognitive levels */}
                {TNKQ_QUESTION_TYPES.map(qType => (
                     <td colSpan={COGNITIVE_LEVELS.length} key={qType} className="border p-1 text-center font-semibold">{qType}</td>
                ))}
                 <td colSpan={COGNITIVE_LEVELS.length} className="border p-1 text-center font-semibold">{QuestionType.ESSAY}</td>
                 <td className="border p-1 bg-gray-100"></td>
            </tr>
          </thead>
          <tbody>
            {processedRows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {row.isFirstContentRow && <td className="border p-2 text-center" rowSpan={row.contentRowSpan}>{row.stt}</td>}
                {row.isFirstChapterRow && <td className="border p-2" rowSpan={row.chapterRowSpan}>{row.chapterName}</td>}
                {row.isFirstContentRow && <td className="border p-2" rowSpan={row.contentRowSpan}>{row.contentName}</td>}
                <td className="border p-2 text-center font-medium">{row.cognitiveLevel}</td>
                <td className="border p-1 align-top">
                  {row.cognitiveLevel ? (
                    <div className="flex flex-col gap-1 w-full h-full">
                      <div className="flex items-start gap-1 w-full">
                        <textarea
                          value={row.learningOutcomes?.[row.cognitiveLevel] || ''}
                          onChange={(e) => updateLearningOutcome(row.topicId, row.cognitiveLevel!, e.target.value)}
                          className="w-full p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition text-sm resize-none bg-transparent"
                          rows={4}
                          placeholder={`* ${row.cognitiveLevel}\n(Nhập YCCĐ hoặc bấm ✨ để tạo tự động)`}
                        />
                        <button 
                          onClick={() => handleGenerateYCCD(row.topicId, row.contentName, row.cognitiveLevel!)}
                          disabled={generatingYCCD === `${row.topicId}-${row.cognitiveLevel}`}
                          className="p-1 text-blue-600 rounded-full hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-wait flex-shrink-0"
                          title="Tạo Yêu cầu cần đạt bằng AI"
                        >
                          {generatingYCCD === `${row.topicId}-${row.cognitiveLevel}` ? (
                            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 9.293a1 1 0 011.414 0l.001.001c.39.39.39 1.023 0 1.414l-2.293 2.293a1 1 0 01-1.414-1.414l1.586-1.586-1.586-1.586a1 1 0 010-1.414zM10 4a1 1 0 011 1v2a1 1 0 11-2 0V5a1 1 0 011-1zM4.707 9.293a1 1 0 00-1.414 0l-.001.001a1 1 0 000 1.414l2.293 2.293a1 1 0 001.414-1.414L5.414 10l1.586-1.586a1 1 0 00-1.414-1.414zM10 14a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM2.707 2.707a1 1 0 000 1.414l2.293 2.293a1 1 0 001.414-1.414L4.121 4.121A1 1 0 002.707 2.707zM12.293 12.293a1 1 0 000 1.414l2.293 2.293a1 1 0 001.414-1.414l-2.293-2.293a1 1 0 00-1.414 0zM7.707 2.707a1 1 0 010 1.414L5.414 6.414a1 1 0 11-1.414-1.414L6.293 2.707a1 1 0 011.414 0zM14.586 5a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.172 6.414l-1.586-1.586a1 1 0 011.414-1.414L14.586 5z" /></svg>
                          )}
                        </button>
                      </div>
                      {(() => {
                        const saDetail = (row.questions[QuestionType.SHORT_ANSWER] as any)?.[row.cognitiveLevel!];
                        const saCount = typeof saDetail === 'object' ? saDetail.count : (saDetail || 0);
                        if (saCount > 0) {
                          return <div className="text-[11.5px] italic text-blue-600 px-1 pb-1 font-medium bg-blue-50/50 rounded">* Bản đặc tả chi tiết khi xuất file sẽ tự gộp: "Dạng thức trả lời ngắn: Câu hỏi tính/toán..."</div>;
                        }
                        return null;
                      })()}
                    </div>
                  ) : (
                    <span className="text-gray-400">Chưa có câu hỏi</span>
                  )}
                </td>
                
                {/* --- Question Grid --- */}
                {QUESTION_TYPES.map(qType => (
                  COGNITIVE_LEVELS.map(cl => {
                    let displayValue = '';
                    if (row.cognitiveLevel === cl) {
                        const detail = (row.questions[qType] as any)?.[cl];
                        if (detail) { 
                            const code = getCompetencyCode(cl, matrix.header.subject);
                            const competencyCode = code ? `(${code})` : '';
                            let value = '';
                            if (ESSAY_QUESTION_TYPES.includes(qType as QuestionType)) {
                                if (detail.id) {
                                    value = `${detail.id}${detail.isChart ? ' (vẽ biểu đồ)' : ''}`;
                                }
                            } else {
                                const count = typeof detail === 'object' ? detail.count : detail;
                                const p = typeof detail === 'object' ? detail.pointsPerQuestion : (matrix.points[qType as QuestionType]?.[cl] || 0);
                                value = showPointsInCells ? `${count} câu (${p}đ/câu)` : `${count} câu`;
                            }
                            if (value) {
                                displayValue = `${value}\n${competencyCode}`;
                            }
                        }
                    }
                    return (
                        <td key={`${qType}-${cl}`} className="border p-2 text-center whitespace-pre-line">
                            {displayValue}
                        </td>
                    )
                  })
                )).flat()}
                {/* Row Total for the specific cognitive level of this row */}
                <td className="border p-2 text-center font-semibold text-blue-700 text-xs whitespace-pre-line">
                    {row.cognitiveLevel ? (() => {
                        const tnkq = TNKQ_QUESTION_TYPES.reduce((sum, qType) => {
                                const detail = (row.questions[qType] as any)?.[row.cognitiveLevel!];
                                return sum + (typeof detail === 'object' ? detail.count : (detail || 0));
                            }, 0);
                        const essayParts = ESSAY_QUESTION_TYPES.map(qType => (row.questions[qType] as any)?.[row.cognitiveLevel!])
                            .filter(p => p && p.id);
                        
                        const parts = [];
                        if (tnkq > 0) parts.push(`${tnkq}TN`);
                        if (essayParts.length > 0) {
                            parts.push(...essayParts.map(p => `${p.id}${p.isChart ? '📈' : ''}TL`));
                        }
                        return parts.join('\n');
                    })() : ''}
                </td>
              </tr>
            ))}
             {processedRows.length === 0 && (
                <tr>
                    <td colSpan={16} className="text-center p-4 text-gray-500">
                        Chưa có nội dung nào trong ma trận.
                    </td>
                </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-100 font-bold text-center">
            <tr>
              <td colSpan={4} className="border p-2 text-right">Tổng cộng</td>
              {QUESTION_TYPES.flatMap(qType => 
                COGNITIVE_LEVELS.map(cl => (
                  <td key={`spec-total-${qType}-${cl}`} className="border p-2">
                    {totals.totalsByQTypeAndCogLevel[qType]?.[cl]?.count || ''}
                  </td>
                ))
              )}
              <td className="border p-2 text-red-700 bg-yellow-100">{totals.grandTotalCount}</td>
            </tr>
            <tr>
              <td colSpan={4} className="border p-2 text-right">Tỉ lệ % số câu</td>
              {COGNITIVE_LEVELS.map(cl => (
                <td key={`spec-percent-count-${cl}`} colSpan={4} className="border p-2 text-blue-700">
                  {cl}: {totals.grandTotalCount > 0 ? (totals.totalsByCogLevel[cl].count / totals.grandTotalCount * 100).toFixed(1) : '0.0'}%
                </td>
              ))}
              <td className="border p-2 text-red-700 bg-yellow-100">100.0%</td>
            </tr>
            <tr>
              <td colSpan={4} className="border p-2 text-right">Tỉ lệ % điểm</td>
              {COGNITIVE_LEVELS.map(cl => (
                <td key={`spec-percent-points-${cl}`} colSpan={4} className="border p-2 text-blue-700">
                  {cl}: {matrix.header.totalPoints > 0 ? (totals.totalsByCogLevel[cl].points / matrix.header.totalPoints * 100).toFixed(1) : '0.0'}%
                </td>
              ))}
              <td className="border p-2 text-red-700 bg-yellow-100">
                {matrix.header.totalPoints > 0 ? (totals.grandTotalPoints / matrix.header.totalPoints * 100).toFixed(1) : '0.0'}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};


export default MatrixBuilder;
