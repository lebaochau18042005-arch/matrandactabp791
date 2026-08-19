import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { useQuizStore } from '../../store/quizStore';
import { CheckCircle2, XCircle, Award, ArrowLeft, BarChart3, Volume2, VolumeX } from 'lucide-react';
import { GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT, GEOGRAPHY_GRADUATION_SCORE_CONFIG } from '../../data/examBlueprint';
import StimulusBlock from '../../components/quiz/StimulusBlock';
import { isShortAnswerCorrect } from '../../utils/shortAnswer';

export default function QuizResultPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  
  const { generatedQuizzes, quizAttempts } = useQuizStore();
  const quiz = id ? generatedQuizzes[id] : null;
  const attempt = attemptId ? quizAttempts[attemptId] : null;
  const blueprint = GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT;
  const scoreConfig = GEOGRAPHY_GRADUATION_SCORE_CONFIG;
  const [speakingQuestionId, setSpeakingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakExplanation = (qId: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ thuyết minh giọng nói.');
      return;
    }

    if (speakingQuestionId === qId) {
      window.speechSynthesis.cancel();
      setSpeakingQuestionId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(voice => voice.lang.includes('vi') || voice.lang.includes('VI'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingQuestionId(null);
    };

    utterance.onerror = () => {
      setSpeakingQuestionId(null);
    };

    setSpeakingQuestionId(qId);
    window.speechSynthesis.speak(utterance);
  };

  if (!quiz || !attempt) {
    return (
      <AppLayout title="Kết quả Quiz">
        <div className="flex h-[50vh] items-center justify-center text-slate-400">Không tìm thấy dữ liệu kết quả.</div>
      </AppLayout>
    );
  }

  const score = attempt.score || 0;
  let feedback = '';
  let color = '';
  if (score >= 8) { feedback = 'Hoàn thành xuất sắc, nắm chắc kiến thức!'; color = 'text-teal-400'; }
  else if (score >= 6.5) { feedback = 'Đạt khá, cần rèn thêm kỹ năng vận dụng.'; color = 'text-blue-400'; }
  else if (score >= 5) { feedback = 'Đạt yêu cầu, cần ôn lại kiến thức trọng tâm.'; color = 'text-amber-400'; }
  else { feedback = 'Chưa đạt, cần học lại bài và làm lại quiz.'; color = 'text-red-400'; }

  return (
    <AppLayout title={`Kết quả: ${quiz.title}`}>
      <div className="max-w-5xl mx-auto space-y-8 pb-24">
        
        {/* Navigation & Summary */}
        <div className="flex items-center justify-between">
          <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Về trang chủ
          </Link>
          <div className="flex items-center gap-2 text-slate-300">
            <BarChart3 className="text-purple-400" size={20} /> Phân tích chi tiết kết quả
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 justify-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative w-48 h-48 rounded-full border-8 border-slate-800 flex items-center justify-center bg-slate-950 shadow-inner">
            <div className="text-center">
              <div className={`text-5xl font-black ${color}`}>{score.toFixed(2)}</div>
              <div className="text-slate-500 text-sm mt-1 font-medium">/ 10.00 ĐIỂM</div>
            </div>
            {/* SVG circle progress can be added here */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" 
                className={color} strokeDasharray={`${score * 28.9} 289`} strokeLinecap="round" />
            </svg>
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-2xl font-bold text-white mb-2">{attempt.studentName}</h2>
            <p className="text-slate-400 mb-6 flex items-center justify-center md:justify-start gap-2">
              <Award className={color} size={20} /> {feedback}
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-teal-400 text-xl font-bold">{attempt.mcScore?.toFixed(2)}</div>
                <div className="text-slate-500 text-xs mt-1">ĐIỂM TNKQ (Max: {scoreConfig.maxMultipleChoiceScore})</div>
              </div>
              <div className="bg-slate-950 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-blue-400 text-xl font-bold">{attempt.tfScore?.toFixed(2)}</div>
                <div className="text-slate-500 text-xs mt-1">ĐIỂM Đ/S (Max: {scoreConfig.maxTrueFalseScore})</div>
              </div>
              <div className="bg-slate-950 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-purple-400 text-xl font-bold">{attempt.saScore?.toFixed(2)}</div>
                <div className="text-slate-500 text-xs mt-1">ĐIỂM TLN (Max: {scoreConfig.maxShortAnswerScore})</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-12 mt-12">
          
          {/* Phần 1 */}
          <div>
            <h3 className="text-xl font-bold text-teal-400 mb-6 border-b border-white/10 pb-2">PHẦN I. TRẮC NGHIỆM KHÁCH QUAN ({blueprint.multipleChoice} Câu)</h3>
            <div className="space-y-4">
              {quiz.questions.filter(q => q.type === 'multiple_choice').map((q, i) => {
                const ans = attempt.answers[q.id];
                const isCorrect = ans === (q as any).correctAnswer;
                return (
                  <div key={q.id} className={`p-5 rounded-xl border ${isCorrect ? 'bg-teal-500/5 border-teal-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={20} /> : <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />}
                      <div className="flex-1">
                        <StimulusBlock stimulus={q.stimulus} />
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-white font-medium">Câu {i + 1}: <span className="text-slate-300 font-normal">{(q as any).question}</span></div>
                          <button
                            onClick={() => {
                              const mcText = `Câu hỏi ${i + 1}: ${(q as any).question}. Đáp án đúng là ${(q as any).correctAnswer}. Giải thích: ${(q as any).explanation}`;
                              speakExplanation(q.id, mcText);
                            }}
                            className={`p-1.5 rounded-lg border transition-all shrink-0 ml-2 ${speakingQuestionId === q.id ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
                            title="Nghe giải thích câu hỏi"
                          >
                            {speakingQuestionId === q.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                          {['A','B','C','D'].map((letter, idx) => {
                            const isMyAns = ans === letter;
                            const isTrueAns = (q as any).correctAnswer === letter;
                            let style = "bg-slate-900 border-white/5 text-slate-500";
                            if (isTrueAns) style = "bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold";
                            else if (isMyAns && !isTrueAns) style = "bg-red-500/20 border-red-500/50 text-red-300 line-through opacity-70";
                            
                            const optRaw = (q as any).options[idx];
                            const optText = typeof optRaw === 'object' ? optRaw.text : optRaw;
                            
                            return (
                              <div key={letter} className={`text-sm p-3 rounded-lg border ${style}`}>
                                <span className="inline-block w-6 font-bold">{letter}.</span> {optText}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-sm bg-slate-900/50 border border-white/5 rounded-lg p-3 text-slate-400 flex gap-2">
                          <span className="text-amber-500/80 font-bold shrink-0">Giải thích:</span>
                          <span>{(q as any).explanation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phần 2 */}
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-6 border-b border-white/10 pb-2">PHẦN II. TRẮC NGHIỆM ĐÚNG / SAI ({blueprint.trueFalse} Câu)</h3>
            <div className="space-y-4">
              {quiz.questions.filter(q => q.type === 'true_false').map((q, i) => (
                <div key={q.id} className="p-5 rounded-xl border bg-slate-900/30 border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-white font-medium">Câu {i + 1}:</div>
                    <button
                      onClick={() => {
                        const contextVal = q.stimulus?.content || (q as any).context || '';
                        const stText = (q as any).statements.map((s: any) => `Nhận định ${s.label}: ${s.text}. Đáp án: ${s.answer ? 'Đúng' : 'Sai'}. Giải thích: ${s.explanation}.`).join(' ');
                        const tfText = `Câu hỏi ${i + 1}: ${contextVal ? 'Ngữ liệu: ' + contextVal + '. ' : ''} Nhận định Đúng/Sai: ${stText}`;
                        speakExplanation(q.id, tfText);
                      }}
                      className={`p-1.5 rounded-lg border transition-all shrink-0 ml-2 ${speakingQuestionId === q.id ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
                      title="Nghe giải thích câu hỏi"
                    >
                      {speakingQuestionId === q.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                  </div>
                  <StimulusBlock stimulus={q.stimulus} />
                  <div className="mb-4 text-sm font-medium leading-relaxed text-slate-300">{q.question}</div>
                  <div className="space-y-3 pl-4">
                    {(q as any).statements.map((st: any) => {
                      const ans = attempt.answers[q.id]?.[st.label];
                      const isCorrect = ans === st.answer;
                      return (
                        <div key={st.label} className={`p-4 rounded-xl border ${isCorrect ? 'bg-teal-500/5 border-teal-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                          <div className="flex items-start gap-3">
                            {isCorrect ? <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={18} /> : <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
                            <div className="flex-1">
                              <div className="text-sm text-slate-300 mb-2 font-medium">
                                <span className="text-slate-500 mr-2">{st.label}.</span>
                                {st.text}
                              </div>
                              <div className="flex items-center gap-4 text-xs font-bold mb-2">
                                <span className="text-slate-500">Bạn chọn: <span className={ans === st.answer ? (ans ? 'text-teal-400' : 'text-red-400') : (ans ? 'text-red-400' : 'text-teal-400')}>{ans === undefined ? 'Trống' : (ans ? 'ĐÚNG' : 'SAI')}</span></span>
                                <span className="text-slate-500">Đáp án: <span className={st.answer ? 'text-teal-400' : 'text-red-400'}>{st.answer ? 'ĐÚNG' : 'SAI'}</span></span>
                              </div>
                              <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded border border-white/5">
                                <span className="text-amber-500/70 mr-1">Giải thích:</span> {st.explanation}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phần 3 */}
          <div>
            <h3 className="text-xl font-bold text-purple-400 mb-6 border-b border-white/10 pb-2">PHẦN III. TRẢ LỜI NGẮN ({blueprint.shortAnswer} Câu)</h3>
            <div className="space-y-4">
              {quiz.questions.filter(q => q.type === 'short_answer').map((q, i) => {
                const ans = attempt.answers[q.id];

                const targetAnswer = q.shortAnswer?.correctAnswer !== undefined ? q.shortAnswer.correctAnswer : (q as any).correctAnswer;
                const tolerance = q.shortAnswer?.tolerance !== undefined ? q.shortAnswer.tolerance : ((q as any).tolerance !== undefined ? (q as any).tolerance : 0.1);
                const unit = q.shortAnswer?.unit || (q as any).unit || '';
                const formula = q.shortAnswer?.formula || (q as any).formula || '';
                const solution = q.shortAnswer?.solution || (q as any).solution || '';

                const isCorrect = isShortAnswerCorrect(ans, targetAnswer, q.shortAnswer?.rounding, tolerance);
                
                return (
                  <div key={q.id} className={`p-5 rounded-xl border ${isCorrect ? 'bg-teal-500/5 border-teal-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={20} /> : <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-white font-medium">Câu {i + 1}: <span className="text-slate-300 font-normal leading-relaxed">{(q as any).question}</span></div>
                          <button
                            onClick={() => {
                              const stimText = q.stimulus?.content || '';
                              const saText = `Câu hỏi ${i + 1}: ${stimText ? 'Số liệu: ' + stimText + '. ' : ''} Yêu cầu tính: ${(q as any).question}. Đáp án đúng là ${targetAnswer} ${unit}. Lời giải: ${solution}`;
                              speakExplanation(q.id, saText);
                            }}
                            className={`p-1.5 rounded-lg border transition-all shrink-0 ml-2 ${speakingQuestionId === q.id ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
                            title="Nghe giải thích câu hỏi"
                          >
                            {speakingQuestionId === q.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>
                        </div>
                        
                        <StimulusBlock stimulus={q.stimulus} />

                        <div className="flex flex-col sm:flex-row gap-4 mb-3">
                          <div className="bg-slate-950 border border-white/5 p-3 rounded-lg flex-1">
                            <div className="text-xs text-slate-500 mb-1">TRẢ LỜI CỦA BẠN</div>
                            <div className={`text-lg font-bold ${isCorrect ? 'text-teal-400' : 'text-red-400'}`}>{ans || '--'} <span className="text-sm font-normal text-slate-500">{unit}</span></div>
                          </div>
                          <div className="bg-slate-950 border border-white/5 p-3 rounded-lg flex-1">
                            <div className="text-xs text-slate-500 mb-1">ĐÁP ÁN ĐÚNG</div>
                            <div className="text-lg font-bold text-teal-400">{targetAnswer} <span className="text-sm font-normal text-slate-500">{unit}</span></div>
                          </div>
                        </div>
                        
                        <div className="text-sm bg-slate-900/50 border border-white/5 rounded-lg p-3 text-slate-400 flex flex-col gap-2">
                          <div className="flex gap-2"><span className="text-amber-500/80 font-bold shrink-0">Công thức:</span> <span>{formula}</span></div>
                          <div className="flex gap-2"><span className="text-blue-400/80 font-bold shrink-0">Lời giải:</span> <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-300 whitespace-pre-line">{solution}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
