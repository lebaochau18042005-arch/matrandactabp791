import React, { useState, useEffect, useRef } from 'react';
import type { ExamMatrix } from '../types';
import { generateExam } from '../services/geminiService';
import { generateShareLink } from '../services/sharingService';
import { extractTextFromFile } from '../services/fileService';
import { saveExamToCloud } from '../services/libraryService';
import { FileText, Upload, Settings, ListOrdered, Download, FileSpreadsheet, Eye, Trash2, Plus, Sparkles, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  convertInchesToTwip, PageOrientation
} from 'docx';
import { saveAs } from 'file-saver';

interface ExamGeneratorProps {
  matrixData: ExamMatrix;
  initialExam?: string;
}

// Helper function to trigger file downloads
const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element);
};


const ExamGenerator: React.FC<ExamGeneratorProps> = ({ matrixData, initialExam }) => {
  const [exams, setExams] = useState<string[]>(initialExam ? [initialExam] : []);
  const [currentExamIndex, setCurrentExamIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedExam, setEditedExam] = useState<string>('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // New features state
  const [numExams, setNumExams] = useState<number>(1);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus feature: Matrix source state
  const [matrixSource, setMatrixSource] = useState<'web' | 'file'>('web');
  const [customMatrixText, setCustomMatrixText] = useState<string>('');
  const [isParsingMatrixDoc, setIsParsingMatrixDoc] = useState<boolean>(false);
  const matrixFileInputRef = useRef<HTMLInputElement>(null);

  const generatedExam = exams[currentExamIndex] || '';

  useEffect(() => {
    if (initialExam && exams.length === 0) {
      setExams([initialExam]);
    }
  }, [initialExam]);

  useEffect(() => {
    const afterPrint = () => {
      document.body.classList.remove('printing-exam');
    };
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    try {
      const text = await extractTextFromFile(file);
      setDocumentContent(text);
      alert('Đã tải tài liệu thành công! AI sẽ sử dụng nội dung này để ra đề.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi đọc file');
    } finally {
      setIsParsingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMatrixFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingMatrixDoc(true);
    try {
      const text = await extractTextFromFile(file);
      setCustomMatrixText(text);
      alert('Đã tải và trích xuất File Ma trận/Đặc tả thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi đọc text file');
    } finally {
      setIsParsingMatrixDoc(false);
      if (matrixFileInputRef.current) matrixFileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (matrixSource === 'file' && !customMatrixText) {
      setError('Vui lòng tải lên file Ma trận/Đặc tả trước khi bắt đầu tạo đề!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsEditing(false);

    try {
      // Generate all exams in PARALLEL for maximum speed
      const promises = Array.from({ length: numExams }, () =>
        generateExam(matrixData, documentContent, matrixSource === 'file' ? customMatrixText : undefined)
      );
      const newExams = await Promise.all(promises);
      setExams(prev => [...prev, ...newExams]);
      setCurrentExamIndex(exams.length);
    } catch (err: any) {
      setError(`Lỗi tạo đề: ${err.message || 'Không rõ nguyên nhân'}. Vui lòng thử lại.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleRemoveExam = (index: number) => {
    const newExams = exams.filter((_, i) => i !== index);
    setExams(newExams);
    if (currentExamIndex >= newExams.length) {
      setCurrentExamIndex(Math.max(0, newExams.length - 1));
    }
  };

  const handleSave = () => {
    const newExams = [...exams];
    newExams[currentExamIndex] = editedExam;
    setExams(newExams);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleShare = () => {
    const link = generateShareLink(matrixData, generatedExam);
    navigator.clipboard.writeText(link).then(() => {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 3000);
    });
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Đề thi: ${matrixData.header.examName}`);
    const body = encodeURIComponent(`Chào bạn,\n\nTôi muốn chia sẻ đề thi "${matrixData.header.examName}" được tạo bằng AI.\n\nBạn có thể xem chi tiết tại đây: ${generateShareLink(matrixData, generatedExam)}\n\nTrân trọng.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleEdit = () => {
    setEditedExam(generatedExam);
    setIsEditing(true);
  };
  
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      await saveExamToCloud(matrixData, generatedExam);
      alert('Đã lưu đề thi lên Thư viện Đám mây thành công!');
    } catch (e) {
      alert('Không thể lưu đề thi. Vui lòng kiểm tra lại cấu hình Firebase trong .env.local.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportWord = async () => {
    // Vietnamese standard A4 margins: left 3cm, right 2cm, top/bottom 2cm
    // 1 inch = 1440 twips; 1 cm ~ 567 twips
    const MARGIN = { top: 1134, bottom: 1134, left: 1701, right: 1134 }; // ~2cm top/bottom, 3cm left, 2cm right
    const FONT = 'Times New Roman';
    const SIZE = 26; // 13pt = 26 half-points
    const SIZE_SMALL = 24; // 12pt for options

    // Helper: make a standard body paragraph
    const bodyPara = (text: string, opts: { bold?: boolean; center?: boolean; indent?: number; italic?: boolean } = {}) =>
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : opts.indent ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
        indent: opts.indent ? { left: opts.indent * 720 } : undefined,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({
          text,
          font: FONT,
          size: opts.indent ? SIZE_SMALL : SIZE,
          bold: opts.bold,
          italics: opts.italic,
        })],
      });

    // Helper: section heading
    const sectionPara = (text: string) =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 280, after: 140 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '222222' } },
        children: [new TextRun({ text, font: FONT, size: SIZE, bold: true, allCaps: true })],
      });

    // Helper: centered bold header
    const centerBold = (text: string, size = SIZE) =>
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text, font: FONT, size, bold: true })],
      });

    // Helper: build a real DOCX table from markdown table lines
    const buildTable = (mdLines: string[]): Table => {
      const rows = mdLines
        .filter(l => !l.trim().match(/^\|[-:| ]+\|$/))
        .map((l, ri) => {
          const cells = l.split('|').slice(1, -1).map(c => c.trim());
          return new TableRow({
            children: cells.map(cellText =>
              new TableCell({
                width: { size: Math.floor(9072 / cells.length), type: WidthType.DXA },
                shading: ri === 0 ? { type: ShadingType.CLEAR, fill: 'D0D0D0' } : undefined,
                children: [new Paragraph({
                  children: [new TextRun({ text: cellText, font: FONT, size: SIZE_SMALL, bold: ri === 0 })],
                })],
              })
            ),
          });
        });
      return new Table({ rows, width: { size: 9072, type: WidthType.DXA } });
    };

    // Parse exam text into DOCX children
    const children: (Paragraph | Table)[] = [];
    const lines = generatedExam.split('\n');
    let tableBuffer: string[] = [];

    const flushTable = () => {
      if (tableBuffer.length > 1) children.push(buildTable(tableBuffer));
      tableBuffer = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Markdown table row
      if (line.startsWith('|') && line.endsWith('|') && line.split('|').length > 2) {
        tableBuffer.push(line);
        continue;
      } else { flushTable(); }

      if (!line) { children.push(new Paragraph({ spacing: { before: 40, after: 40 } })); continue; }

      if (/^(SỞ GD|TRƯỜNG THPT|SỞ GIÁO DỤC)/i.test(line)) {
        children.push(centerBold(line));
      } else if (/^(ĐỀ KIỂM TRA|ĐỀ THI|MÔN:)/i.test(line)) {
        children.push(centerBold(line, 28));
      } else if (/^(I|II|III)\. /i.test(line)) {
        children.push(sectionPara(line));
      } else if (/^PHẦN (I|II|III)/i.test(line)) {
        children.push(bodyPara(line, { bold: true, italic: true }));
      } else if (/^Câu \d+[:.]/.test(line)) {
        children.push(bodyPara(line, { bold: true }));
      } else if (/^[A-D][\.\)]/.test(line)) {
        children.push(bodyPara(line, { indent: 1 }));
      } else if (/^[a-d]\)/.test(line)) {
        // BGD Đúng/Sai options
        children.push(bodyPara(line, { indent: 1 }));
      } else if (/^\*+.+\*+$/.test(line)) {
        // Bold markdown **text**
        children.push(bodyPara(line.replace(/\*+/g, ''), { bold: true }));
      } else {
        children.push(bodyPara(line));
      }
    }
    flushTable();

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: MARGIN,
            size: { width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) }, // A4
          },
        },
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `de-thi-${currentExamIndex + 1}.docx`);
  };
  
  const handleExportExcel = () => {
    const csvContent = `"${generatedExam.replace(/"/g, '""')}"`;
    downloadFile(`de-thi-${currentExamIndex + 1}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleExportAnswerKeyExcel = () => {
    const answerSection =
      generatedExam.split(/II\.?\s*ĐÁP ÁN/i)[1]?.split(/III\.?\s*LỜI GIẢI/i)[0] ||
      generatedExam.split(/ĐÁP ÁN/i)[1]?.split(/LỜI GIẢI/i)[0];

    if (!answerSection) {
        alert("Không tìm thấy phần đáp án trong nội dung đề thi.");
        return;
    }

    const answers: string[][] = [["Câu", "Đáp án"]];
    const lines2 = answerSection.trim().split('\n');
    lines2.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const bgdMatch = trimmed.match(/^(?:Câu\s+)?(\w+)[.:]\s*((?:[a-d]\)\s*(?:Đúng|Sai)[,;\s]*)+)/i);
        if (bgdMatch) { answers.push([`Câu ${bgdMatch[1]}`, bgdMatch[2].trim()]); return; }
        const oldMatch = trimmed.match(/^(?:Câu\s+)?(\d+)[.:]\s*(.+)$/i);
        if (oldMatch) { answers.push([oldMatch[1], oldMatch[2].trim()]); }
    });

    if (answers.length <= 1) {
        alert("Không thể trích xuất danh sách đáp án. Vui lòng kiểm tra lại định dạng đề thi.");
        return;
    }

    const csvContent = answers.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadFile(`dap-an-de-${currentExamIndex + 1}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };
  
  const handleExportPdf = () => {
    // Uses the browser's print functionality with custom print styles
    document.body.classList.add('printing-exam');
    window.print();
  };

  const renderExamContent = (text: string) => {
    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    let tableRows: string[][] = [];
    let tableIsFirstRow = true;

    // Inline markdown parser: bold, italic, latex, code, backtick-wrapped latex
    const renderInline = (raw: string, key: string): React.ReactNode => {
      // Normalise: strip outer markdown bold `**text**` wrapping entire string (handled at line level)
      const parts: React.ReactNode[] = [];
      // Regex: match $...$ (latex), `$...$` (backtick-wrapped latex), **...**, *...*, `...`
      const regex = /`\$([^`]+)\$`|\$\$([^$]+)\$\$|\$([^$\n]+)\$|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
      let last = 0;
      let m: RegExpExecArray | null;
      let pi = 0;
      while ((m = regex.exec(raw)) !== null) {
        if (m.index > last) parts.push(<span key={`${key}-t${pi++}`}>{raw.slice(last, m.index)}</span>);
        if (m[1] !== undefined || m[2] !== undefined || m[3] !== undefined) {
          // Math
          const mathContent = m[1] ?? m[2] ?? m[3];
          parts.push(
            <span key={`${key}-m${pi++}`} className="font-mono text-blue-900 bg-blue-50 px-0.5 rounded text-[0.92em]" title="LaTeX">
              {mathContent}
            </span>
          );
        } else if (m[4] !== undefined) {
          parts.push(<code key={`${key}-c${pi++}`} className="bg-gray-100 px-1 rounded font-mono text-sm">{m[4]}</code>);
        } else if (m[5] !== undefined) {
          parts.push(<strong key={`${key}-b${pi++}`}>{m[5]}</strong>);
        } else if (m[6] !== undefined) {
          parts.push(<em key={`${key}-i${pi++}`}>{m[6]}</em>);
        }
        last = m.index + m[0].length;
      }
      if (last < raw.length) parts.push(<span key={`${key}-te${pi++}`}>{raw.slice(last)}</span>);
      return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
    };

    const flushTable = (key: number) => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${key}`} className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-gray-400 text-sm">
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx === 0 ? 'bg-gray-100 font-semibold' : 'even:bg-gray-50'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-gray-400 px-3 py-1.5">{renderInline(cell, `tr${key}-${rIdx}-${cIdx}`)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        tableIsFirstRow = true;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // --- Markdown table ---
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length > 2) {
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
        if (cells.every(c => /^[-:]+$/.test(c))) return; // separator row
        tableRows.push(cells);
        return;
      } else {
        flushTable(idx);
      }

      // --- Horizontal rule ---
      if (/^---+$/.test(trimmed)) {
        elements.push(<hr key={idx} className="my-4 border-gray-300" />);
        return;
      }

      // --- Empty line ---
      if (!trimmed) {
        elements.push(<div key={idx} className="h-3" />);
        return;
      }

      // --- Markdown headings ---
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2].replace(/\*\*/g, ''); // strip bold markers
        const cls = [
          'font-bold uppercase mt-8 mb-3 pb-1 border-b border-gray-300',
          level === 1 ? 'text-xl text-center' : level === 2 ? 'text-lg' : level === 3 ? 'text-base' : 'text-base italic'
        ].join(' ');
        elements.push(<p key={idx} className={cls}>{renderInline(content, `h${idx}`)}</p>);
        return;
      }

      // --- School header lines ---
      if (/^(SỞ GD|TRƯỜNG THPT|SỞ GIÁO DỤC)/i.test(trimmed)) {
        elements.push(<p key={idx} className="text-center font-bold uppercase text-sm mb-0">{trimmed}</p>);
        return;
      }
      if (/^(ĐỀ KIỂM TRA|ĐỀ THI|MÔN:)/i.test(trimmed)) {
        elements.push(<h2 key={idx} className="text-center text-lg font-bold mt-3 mb-5 uppercase">{renderInline(trimmed, `h2-${idx}`)}</h2>);
        return;
      }

      // --- Roman numeral section headers "I. ĐỀ BÀI" etc ---
      if (/^(I|II|III|IV)\.\s+/i.test(trimmed)) {
        elements.push(<h3 key={idx} className="font-bold text-base mt-8 mb-3 border-b-2 border-black pb-1 uppercase">{renderInline(trimmed, `sec${idx}`)}</h3>);
        return;
      }

      // --- PHẦN I / PHẦN II ---
      if (/^PHẦN (I|II|III)/i.test(trimmed)) {
        elements.push(<h4 key={idx} className="font-bold italic mt-5 mb-2">{renderInline(trimmed, `ph${idx}`)}</h4>);
        return;
      }

      // --- Question stem "Câu X:" bold ---
      if (/^(Câu \d+[:.])/.test(trimmed) || /^\*\*Câu \d+/.test(trimmed)) {
        const clean = trimmed.replace(/^\*\*/,'').replace(/\*\*$/,'');
        elements.push(<p key={idx} className="font-bold mt-5 mb-1.5">{renderInline(clean, `q${idx}`)}</p>);
        return;
      }

      // --- Options A/B/C/D ---
      if (/^[A-D][.)]\s/.test(trimmed)) {
        elements.push(<p key={idx} className="ml-8 mb-1">{renderInline(trimmed, `opt${idx}`)}</p>);
        return;
      }

      // --- BGD Đúng/Sai options a/b/c/d ---
      if (/^[a-d][)]\s/.test(trimmed)) {
        elements.push(<p key={idx} className="ml-8 mb-1">{renderInline(trimmed, `bgd${idx}`)}</p>);
        return;
      }

      // --- Default paragraph ---
      elements.push(<p key={idx} className="mb-1.5 leading-relaxed">{renderInline(trimmed, `p${idx}`)}</p>);
    });

    flushTable(lines.length);
    return elements;
  };

  
  const formattedMatrix = JSON.stringify(matrixData, null, 2);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-green-500">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">Tạo Đề thi Thông minh</h2>
                <p className="text-sm text-gray-500">Sử dụng AI để tạo đề thi bám sát ma trận và tài liệu của bạn.</p>
            </div>
        </div>

        {/* Matrix Source Options */}
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 mb-6">
            <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <ListOrdered className="w-4 h-4" />
                Nguồn Ma trận & Đặc tả
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg border flex-1 hover:bg-orange-50 transition border-orange-200">
                    <input 
                        type="radio" 
                        name="matrixSource" 
                        checked={matrixSource === 'web'} 
                        onChange={() => setMatrixSource('web')} 
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500" 
                    />
                    <span className="text-sm font-medium text-gray-800">Từ ứng dụng (Cấu hình Web)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg border flex-1 hover:bg-orange-50 transition border-orange-200">
                    <input 
                        type="radio" 
                        name="matrixSource" 
                        checked={matrixSource === 'file'} 
                        onChange={() => setMatrixSource('file')} 
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500" 
                    />
                    <span className="text-sm font-medium text-gray-800">Tải file định hướng riêng lên</span>
                </label>
            </div>

            <AnimatePresence>
                {matrixSource === 'file' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                    >
                        <input
                            type="file"
                            ref={matrixFileInputRef}
                            onChange={handleMatrixFileUpload}
                            className="hidden"
                            accept=".pdf,.docx,.doc,.txt"
                        />
                        <button
                            onClick={() => matrixFileInputRef.current?.click()}
                            disabled={isParsingMatrixDoc}
                            className="w-full py-4 px-4 bg-white border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:bg-orange-100 transition flex flex-col items-center justify-center gap-2 text-sm font-medium"
                        >
                            {isParsingMatrixDoc ? 'Đang phân tích file...' : (
                                <>
                                    <Upload className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                                    {customMatrixText ? 'Đã nạp Ma trận thành công (Nhấn nếu muốn tải lại thay thế)' : 'Tải lên Ma trận & Đặc tả (Docx, PDF...)'}
                                </>
                            )}
                        </button>
                        {customMatrixText && (
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-green-600 font-medium italic">✓ Đã lấy thành công nội dung chữ của file ({customMatrixText.length} kí tự)</span>
                                <button onClick={() => setCustomMatrixText('')} className="text-[10px] text-red-500 hover:underline">Xóa file</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Document Upload */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    AI: Đề từ tài liệu
                </h4>
                <p className="text-xs text-blue-600 mb-4">Tải lên file (PDF, Word, HTML, TXT) để AI lấy làm ngữ cảnh ra đề.</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.html,.htm,.txt"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsingDoc}
                    className="w-full py-2 px-4 bg-white border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 text-sm font-medium"
                >
                    {isParsingDoc ? 'Đang đọc file...' : (
                        <>
                            <Upload className="w-4 h-4" />
                            {documentContent ? 'Đã tải tài liệu (Nhấn để thay đổi)' : 'Tải tài liệu lên'}
                        </>
                    )}
                </button>
                {documentContent && (
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-green-600 font-medium italic">✓ Đã nạp tài liệu ngữ cảnh</span>
                        <button onClick={() => setDocumentContent('')} className="text-[10px] text-red-500 hover:underline">Xóa</button>
                    </div>
                )}
            </div>

            {/* Generation Settings */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Cấu hình tạo đề
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-purple-700 mb-1">Số lượng đề cần tạo</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={numExams}
                                onChange={(e) => setNumExams(parseInt(e.target.value))}
                                className="flex-grow h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <span className="w-8 text-center font-bold text-purple-700">{numExams}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-purple-600 italic">
                        <ListOrdered className="w-3 h-3" />
                        Mỗi đề sẽ được tạo riêng biệt dựa trên ma trận.
                    </div>
                </div>
            </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tạo {numExams} đề thi với Gemini AI...
            </>
          ) : (
             <>
                <Sparkles className="w-5 h-5" />
                Tạo Đề thi ngay
             </>
          )}
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md no-print" role="alert">{error}</div>}

      {exams.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Danh sách Đề thi ({exams.length})
            </h3>
            
            {/* Exam Selector Tabs */}
            <div className="flex flex-wrap gap-2">
                {exams.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setCurrentExamIndex(idx);
                            setIsEditing(false);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            currentExamIndex === idx 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Đề {idx + 1}
                    </button>
                ))}
            </div>
          </div>
          
          {/* --- Action Bar (only when not editing) --- */}
          {!isEditing && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl flex flex-wrap items-center justify-between gap-4 no-print border border-gray-100">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Settings className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">Thao tác cho Đề {currentExamIndex + 1}</h4>
                        <p className="text-xs text-gray-500">Chỉnh sửa, chia sẻ hoặc xuất file.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm">
                        <button onClick={handleEdit} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition title='Chỉnh sửa'">
                            <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={handleShare} className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition title='Chia sẻ link'">
                            <Upload className="w-4 h-4" />
                        </button>
                        <button onClick={handleSaveToCloud} disabled={isSaving} className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition title='Lưu lên Thư viện Cloud'">
                            <CloudUpload className={`w-4 h-4 ${isSaving ? 'animate-pulse text-purple-600' : ''}`} />
                        </button>
                        <button onClick={() => handleRemoveExam(currentExamIndex)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition title='Xóa đề này'">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="h-8 w-[1px] bg-gray-200 mx-1" />

                    <button onClick={handleExportWord} className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
                       <Download className="w-3.5 h-3.5" />
                       Word
                    </button>
                    <button onClick={handleExportExcel} className="px-3 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm">
                       <FileSpreadsheet className="w-3.5 h-3.5" />
                       Excel
                    </button>
                    <button onClick={handleExportAnswerKeyExcel} className="px-3 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2 shadow-sm">
                       <FileSpreadsheet className="w-3.5 h-3.5" />
                       Đáp án (Excel)
                    </button>
                    <button onClick={handleExportPdf} className="px-3 py-2 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 shadow-sm">
                       <Download className="w-3.5 h-3.5" />
                       PDF
                    </button>
                </div>
            </div>
          )}

          {/* --- Content Area --- */}
           <div>
            {isEditing ? (
                <>
                    <textarea
                        value={editedExam}
                        onChange={(e) => setEditedExam(e.target.value)}
                        className="w-full min-h-[60vh] p-4 border rounded-md bg-white font-mono text-sm focus:ring-2 focus:ring-blue-500 transition"
                        aria-label="Trình chỉnh sửa đề thi"
                    />
                    <div className="mt-4 flex justify-end gap-3 no-print">
                        <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition">Hủy</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">Lưu Thay đổi</button>
                    </div>
                </>
            ) : (
                <div 
                  id="print-area" 
                  className="bg-white p-8 sm:p-12 shadow-inner border rounded-md font-serif text-gray-900 leading-relaxed print:p-0 print:shadow-none print:border-none max-w-4xl mx-auto"
                >
                    {renderExamContent(generatedExam)}
                </div>
            )}
        </div>
        </div>
      )}
    </div>
  );
};

export default ExamGenerator;
