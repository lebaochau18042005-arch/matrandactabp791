import React, { useState, useEffect, useRef } from 'react';
import type { ExamMatrix } from '../types';
import { generateExam } from '../services/geminiService';
import { generateShareLink } from '../services/sharingService';
import { extractTextFromFile } from '../services/fileService';
import { saveExamToCloud } from '../services/libraryService';
import { FileText, Upload, Settings, ListOrdered, Download, FileSpreadsheet, Eye, Trash2, Plus, Sparkles, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  const handleExportWord = () => {
    /**
     * Converts plain exam text into a structured HTML string for Word export.
     * This function parses headers, sections, questions, and simple markdown tables.
     */
    const formatExamTextToHtml = (examText: string): string => {
        const processPart = (partText: string): string => {
            if (!partText || !partText.trim()) return '';

            let html = '<div>';
            const lines = partText.trim().split('\n');
            let inTable = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (!line) {
                    if (inTable) {
                        html += '</table>';
                        inTable = false;
                    }
                    continue; // Skip empty lines, margins will handle spacing
                }

                // Simple markdown table detection
                if (line.startsWith('|') && line.endsWith('|') && line.split('|').length > 2) {
                    const cells = line.split('|').slice(1, -1).map(c => c.trim());
                    const isSeparator = cells.every(c => /^-+$/.test(c));
                    if (isSeparator) continue;

                    if (!inTable) {
                        html += '<table border="1" style="border-collapse: collapse; width: 100%; margin-top: 1em; margin-bottom: 1em;">';
                        inTable = true;
                    }

                    const isHeaderRow = !inTable || (lines[i-1] && !lines[i-1].includes('|'));
                    const tag = isHeaderRow ? 'th' : 'td';
                    
                    html += '<tr>';
                    cells.forEach(cell => {
                        html += `<${tag} style="padding: 8px; border: 1px solid #333; text-align: left;">${cell}</${tag}>`;
                    });
                    html += '</tr>';
                    
                    continue; 
                }
                
                if (inTable) {
                    html += '</table>';
                    inTable = false;
                }

                // Regular text processing with styling
                if (/^(SỞ GD&ĐT|TRƯỜNG THPT)/.test(line)) {
                    html += `<p style="text-align:center; font-weight:bold; margin:0;">${line}</p>`;
                } else if (/^(ĐỀ KIỂM TRA|MÔN:)/.test(line)) {
                    html += `<h2 style="text-align:center; margin-top: 0.5em;">${line}</h2>`;
                } else if (/^I\. ĐỀ BÀI|II\. ĐÁP ÁN|III\. LỜI GIẢI CHI TIẾT/.test(line)) {
                    html += `<h3 style="font-weight:bold; margin-top: 2em; margin-bottom: 1em; border-bottom: 1px solid #333; padding-bottom: 0.25em;">${line}</h3>`;
                } else if (/^PHẦN I|PHẦN II/.test(line)) {
                    html += `<h4 style="font-weight:bold; margin-top: 1.5em; margin-bottom: 0.5em; font-style: italic;">${line}</h4>`;
                } else if (/^Câu \d+[:.]/.test(line)) {
                    html += `<p style="font-weight:bold; margin-top:1.2em;">${line}</p>`;
                } else if (/^[A-D]\./.test(line)) {
                    html += `<p style="margin-left:2em;">${line}</p>`;
                } else {
                    html += `<p style="margin: 0.5em 0;">${line}</p>`;
                }
            }
            
            if (inTable) {
                html += '</table>';
            }

            html += '</div>';
            return html;
        };

        const parts = examText.split(/^(?=II\. ĐÁP ÁN|III\. LỜI GIẢI CHI TIẾT)/m);
        return parts.map(part => processPart(part)).join('');
    };

    const header = `
        <html 
            xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Đề thi</title>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
                    p { margin: 0.5em 0; }
                    table { border-collapse: collapse; width: 100%; }
                    td, th { padding: 5px; border: 1px solid black; text-align: left; }
                </style>
            </head>
            <body>
    `;
    const footer = "</body></html>";
    
    const contentHtml = formatExamTextToHtml(generatedExam);
    
    const sourceHTML = header + contentHtml + footer;
    downloadFile('de-thi.doc', sourceHTML, 'application/msword');
};
  
  const handleExportExcel = () => {
     // For Excel (CSV), wrap the entire content in quotes to keep it in a single cell.
     // This handles commas and quotes within the text.
    const csvContent = `"${generatedExam.replace(/"/g, '""')}"`;
    downloadFile(`de-thi-${currentExamIndex + 1}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleExportAnswerKeyExcel = () => {
    const answerSection = generatedExam.split(/II\. ĐÁP ÁN/i)[1]?.split(/III\. LỜI GIẢI CHI TIẾT/i)[0];
    if (!answerSection) {
        alert("Không tìm thấy phần đáp án trong nội dung đề thi.");
        return;
    }

    const answers: string[][] = [["Câu", "Đáp án"]];
    const lines = answerSection.trim().split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        // Match patterns like "1. A", "Câu 1: B", "1: Đúng", etc.
        const match = trimmed.match(/^(?:Câu\s+)?(\d+)[\.\:]\s*(.*)$/i);
        if (match) {
            answers.push([match[1], match[2]]);
        }
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
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTable: string[][] = [];

    const flushTable = (key: number) => {
      if (currentTable.length > 0) {
        elements.push(
          <div key={`table-${key}`} className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-gray-800">
              <tbody>
                {currentTable.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-gray-800 p-2 text-sm">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        currentTable = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length > 2) {
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
        const isSeparator = cells.every(c => /^-+$/.test(c));
        if (!isSeparator) {
          currentTable.push(cells);
        }
        return;
      } else {
        flushTable(idx);
      }

      if (/^(SỞ GD&ĐT|TRƯỜNG THPT)/.test(trimmed)) {
        elements.push(<p key={idx} className="text-center font-bold uppercase mb-0 text-sm sm:text-base">{trimmed}</p>);
      } else if (/^(ĐỀ KIỂM TRA|MÔN:)/.test(trimmed)) {
        elements.push(<h2 key={idx} className="text-center text-lg sm:text-xl font-bold mt-4 mb-6 uppercase">{trimmed}</h2>);
      } else if (/^I\. ĐỀ BÀI|II\. ĐÁP ÁN|III\. LỜI GIẢI CHI TIẾT/.test(trimmed)) {
        elements.push(<h3 key={idx} className="font-bold text-base sm:text-lg mt-10 mb-4 border-b-2 border-black pb-1 uppercase">{trimmed}</h3>);
      } else if (/^PHẦN I|PHẦN II/.test(trimmed)) {
        elements.push(<h4 key={idx} className="font-bold italic mt-6 mb-2 text-sm sm:text-base">{trimmed}</h4>);
      } else if (/^Câu \d+[:.]/.test(trimmed)) {
        elements.push(<p key={idx} className="font-bold mt-4 mb-2 text-sm sm:text-base">{trimmed}</p>);
      } else if (/^[A-D]\./.test(trimmed)) {
        elements.push(<p key={idx} className="ml-6 sm:ml-10 mb-1 text-sm sm:text-base">{trimmed}</p>);
      } else if (!trimmed) {
        elements.push(<div key={idx} className="h-4" />);
      } else {
        elements.push(<p key={idx} className="mb-2 text-sm sm:text-base">{trimmed}</p>);
      }
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