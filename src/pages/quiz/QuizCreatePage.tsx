import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { useQuizStore } from '../../store/quizStore';
import { generateQuestionsByMockAI, GeneratedQuiz, QuizQuestion } from '../../utils/mockAIGenerator';
import { generateQuizWithGemini } from '../../utils/geminiGenerator';
import { GEOGRAPHY_LESSONS } from '../../data/geographyLessons';
import { toast } from 'sonner';
import { BrainCircuit, Save, FileDown, Plus, Trash2, Edit2, CheckCircle2, Upload, FileText, Image as ImageIcon, X, Key, Play } from 'lucide-react';
import jsPDF from 'jspdf';
import QuizQuestionEditor from '../../components/quiz/QuizQuestionEditor';

export default function QuizCreatePage() {
  const navigate = useNavigate();
  const { addQuiz } = useQuizStore();
  
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    grade: 10,
    title: 'Bài 1: Môn Địa lí với định hướng nghề nghiệp',
    topic: 'Trái Đất và Vũ Trụ',
    context: '',
  });

  const availableLessons = GEOGRAPHY_LESSONS.filter(l => l.grade === form.grade);

  const handleGradeChange = (grade: number) => {
    const lessons = GEOGRAPHY_LESSONS.filter(l => l.grade === grade);
    if (lessons.length > 0) {
      setForm({ ...form, grade, title: lessons[0].title, topic: lessons[0].topic });
    } else {
      setForm({ ...form, grade, title: '', topic: '' });
    }
  };

  const handleLessonChange = (title: string) => {
    const lesson = availableLessons.find(l => l.title === title);
    if (lesson) {
      setForm({ ...form, title, topic: lesson.topic });
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Simulate reading context from both textarea and uploaded files
      let combinedContext = form.context;
      if (uploadedFiles.length > 0) {
        combinedContext += `\n[Có đính kèm ${uploadedFiles.length} tệp tài liệu: ${uploadedFiles.map(f => f.name).join(', ')}]`;
      }
      
      let q: GeneratedQuiz;
      const savedApiKey = localStorage.getItem('gemini_api_key') || '';
      const savedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
      
      if (savedApiKey.trim()) {
        toast.info(`Đang kết nối tới ${savedModel}, vui lòng chờ...`, { duration: 3000 });
        q = await generateQuizWithGemini(savedApiKey.trim(), savedModel, form.title, form.grade, form.topic, 'lesson_x', combinedContext);
      } else {
        toast.info('Đang sử dụng AI giả lập (Mock AI) vì chưa có API Key.');
        q = await generateQuestionsByMockAI(form.title, form.grade, form.topic, 'lesson_x', combinedContext);
      }
      
      setQuiz(q);
      toast.success('Đã tạo xong bộ 20 câu hỏi chuẩn cấu trúc!');
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
    
    // Validate exact structure
    const mc = quiz.questions.filter(q => q.type === 'multiple_choice').length;
    const tf = quiz.questions.filter(q => q.type === 'true_false').length;
    const sa = quiz.questions.filter(q => q.type === 'short_answer').length;
    
    if (mc !== 12 || tf !== 4 || sa !== 4) {
      toast.error(`Cấu trúc chưa chuẩn: Cần 12 TNKQ, 4 Đ/S, 4 TLN. Hiện có ${mc} TNKQ, ${tf} Đ/S, ${sa} TLN.`);
      // return; // Allow save anyway for prototype flexibility, but show error
    }
    
    addQuiz(quiz);
    toast.success('Đã lưu Quiz thành công!');
    navigate(`/quiz/${quiz.id}`); // For demo, navigate to the answer page so teacher can preview
  };

  const exportPDF = () => {
    if (!quiz) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(quiz.title, 14, 20);
    doc.setFont("helvetica", "normal");
    
    let y = 30;
    quiz.questions.forEach((q, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const txt = doc.splitTextToSize(`Cau ${i+1}: ${q.type === 'short_answer' ? q.question : (q as any).question || (q as any).context}`, 180);
      doc.text(txt, 14, y);
      y += txt.length * 7 + 5;
    });
    
    doc.save(`${quiz.title}.pdf`);
    toast.success('Đã xuất PDF!');
  };

  const handleDeleteQuestion = (id: string) => {
    if (!quiz) return;
    if (confirm('Bạn có chắc muốn xóa câu hỏi này khỏi bộ bài kiểm tra?')) {
      const newQuestions = quiz.questions.filter(q => q.id !== id);
      setQuiz({ ...quiz, questions: newQuestions });
      toast.success('Đã xóa câu hỏi.');
    }
  };

  const handleSaveEdit = (updatedQuestion: any) => {
    if (!quiz) return;
    const newQuestions = quiz.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q);
    setQuiz({ ...quiz, questions: newQuestions });
    setEditingQuestionId(null);
    toast.success('Đã lưu thay đổi.');
  };

  const handleHostLiveQuiz = () => {
    if (!quiz) return;
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
            <p className="text-slate-400 text-sm mt-1">Cấu trúc 20 câu: 12 TN, 4 Đ/S, 4 Trả lời ngắn tính toán.</p>
          </div>
        </div>

        {/* Action Buttons for generated quiz */}
        {quiz && (
          <div className="flex gap-4 justify-end mb-8 mt-4 bg-slate-900 border border-white/10 p-4 rounded-xl">
            <button onClick={exportPDF} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10">
              <FileDown size={18} /> Xuất File PDF
            </button>
            <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
              <Save size={18} /> Lưu Quiz & Giao bài (Về nhà)
            </button>
            <button onClick={handleHostLiveQuiz} className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25">
              <Play size={18} fill="currentColor" /> Bắt đầu Quiz Trực Tiếp
            </button>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            <div>
              <label className="block text-sm text-slate-400 mb-2">Chủ đề (Tự động)</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-400 focus:outline-none opacity-80"
                value={form.topic}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tên bài học (Sách Kết nối tri thức)</label>
              <select 
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                value={form.title}
                onChange={e => handleLessonChange(e.target.value)}
              >
                {availableLessons.map(l => (
                  <option key={l.id} value={l.title}>{l.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2 flex justify-between">
              <span>Tài liệu tham khảo / SGK (Dán văn bản hoặc Tải tệp lên)</span>
              <span className="text-xs text-teal-400 bg-teal-400/10 px-2 rounded-full py-0.5">Giúp AI sinh câu hỏi chính xác hơn</span>
            </label>
            <textarea 
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 min-h-[100px] mb-3"
              placeholder="Dán nội dung sách giáo khoa hoặc tài liệu tham khảo vào đây..."
              value={form.context}
              onChange={e => setForm({...form, context: e.target.value})}
            />
            
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
                <FileText size={16} className="text-blue-400" />
                <span>Tải lên PDF/Word</span>
                <input type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
              </label>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
                <ImageIcon size={16} className="text-emerald-400" />
                <span>Tải lên Ảnh (PNG/JPG)</span>
                <input type="file" multiple accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-800/50 border border-white/5 rounded-full px-3 py-1.5 text-xs text-slate-300">
                    {file.type.includes('image') ? <ImageIcon size={12} className="text-emerald-400" /> : <FileText size={12} className="text-blue-400" />}
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400 ml-1">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                <><BrainCircuit size={18} /> Tạo 20 câu hỏi tự động</>
              )}
            </button>
          </div>
        </div>

        {/* Generated Quiz View */}
        {quiz && (
          <div className="space-y-6 pb-20">
            {/* Phần 1 */}
            <div>
              <h2 className="text-xl font-bold text-teal-400 mb-4 border-b border-white/10 pb-2">PHẦN I. TRẮC NGHIỆM KHÁCH QUAN (12 Câu)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quiz.questions.filter(q => q.type === 'multiple_choice').map((q: any, i) => (
                  editingQuestionId === q.id ? (
                    <div key={q.id} className="md:col-span-2">
                      <QuizQuestionEditor question={q} onSave={handleSaveEdit} onCancel={() => setEditingQuestionId(null)} />
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
                      {q.stimulus && q.stimulus.type !== 'none' && (
                        <div className="mb-4 bg-slate-950 p-3 rounded-lg border border-white/5">
                          {q.stimulus.title && <div className="font-bold text-slate-400 text-xs mb-1">{q.stimulus.title}</div>}
                          <p className="text-slate-300 text-sm italic">{q.stimulus.content}</p>
                        </div>
                      )}
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
              <h2 className="text-xl font-bold text-blue-400 mb-4 border-b border-white/10 pb-2 mt-10">PHẦN II. ĐÚNG / SAI (4 Câu)</h2>
              <div className="grid grid-cols-1 gap-4">
                {quiz.questions.filter(q => q.type === 'true_false').map((q: any, i) => (
                  editingQuestionId === q.id ? (
                    <QuizQuestionEditor key={q.id} question={q} onSave={handleSaveEdit} onCancel={() => setEditingQuestionId(null)} />
                  ) : (
                    <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-medium">Câu {i + 1} <span className="text-xs text-slate-500 ml-2 border border-slate-700 px-2 rounded-full">{q.level}</span></h3>
                        <div className="flex gap-2 text-slate-400">
                          <button onClick={() => setEditingQuestionId(q.id)} className="hover:text-blue-400"><Edit2 size={14}/></button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="hover:text-red-400"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      {q.stimulus && q.stimulus.type !== 'none' && (
                        <div className="mb-4 bg-slate-950 p-4 rounded-lg border border-white/5">
                          {q.stimulus.title && <div className="font-bold text-slate-400 text-sm mb-2">{q.stimulus.title}</div>}
                          <p className="text-slate-300 text-sm italic">{q.stimulus.content}</p>
                        </div>
                      )}
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
              <h2 className="text-xl font-bold text-purple-400 mb-4 border-b border-white/10 pb-2 mt-10">PHẦN III. TRẢ LỜI NGẮN (4 Câu Tính Toán)</h2>
              <div className="grid grid-cols-1 gap-4">
                {quiz.questions.filter(q => q.type === 'short_answer').map((q: any, i) => (
                  editingQuestionId === q.id ? (
                    <QuizQuestionEditor key={q.id} question={q} onSave={handleSaveEdit} onCancel={() => setEditingQuestionId(null)} />
                  ) : (
                    <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-medium">Câu {i + 1} <span className="text-xs text-slate-500 ml-2 border border-slate-700 px-2 rounded-full">{q.level}</span></h3>
                        <div className="flex gap-2 text-slate-400">
                          <button onClick={() => setEditingQuestionId(q.id)} className="hover:text-purple-400"><Edit2 size={14}/></button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="hover:text-red-400"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      
                      {q.stimulus && q.stimulus.type !== 'none' && (
                        <div className="mb-4 bg-slate-950 p-3 rounded-lg border border-white/5">
                          <p className="text-slate-300 text-sm">{q.stimulus.content}</p>
                        </div>
                      )}
                      
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
