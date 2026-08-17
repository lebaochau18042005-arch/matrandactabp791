import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { useQuizStore } from '../../store/quizStore';
import { toast } from 'sonner';
import { Clock, Send, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubmissionStore } from '../../store/submissionStore';
import { syncResultToGoogleSheet } from '../../lib/googleSheetSync';
import { GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT, GEOGRAPHY_GRADUATION_SCORE_CONFIG } from '../../data/examBlueprint';
import StimulusBlock from '../../components/quiz/StimulusBlock';
import { isShortAnswerCorrect, sanitizeShortAnswerInput } from '../../utils/shortAnswer';

export default function QuizAnswerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  const { user } = useAuth();
  
  const { generatedQuizzes, startAttempt, updateAnswer, submitAttempt, quizAttempts } = useQuizStore();
  const { updateScore } = useSubmissionStore();
  const quiz = id ? generatedQuizzes[id] : null;
  const blueprint = GEOGRAPHY_GRADUATION_EXAM_BLUEPRINT;
  const scoreConfig = GEOGRAPHY_GRADUATION_SCORE_CONFIG;
  
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const attempt = attemptId ? quizAttempts[attemptId] : null;
  const [speakingQuestionId, setSpeakingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (quiz && user && !attemptId) {
      const newAttemptId = startAttempt(quiz.id, user.id, user.name || 'Student');
      setAttemptId(newAttemptId);
    }
  }, [quiz, user, attemptId, startAttempt]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakQuestion = (qId: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Trình duyệt của bạn không hỗ trợ thuyết minh giọng nói.');
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

  if (!quiz) {
    return (
      <AppLayout title="Làm Quiz">
        <div className="flex h-[50vh] items-center justify-center text-slate-400">Không tìm thấy bài Quiz này.</div>
      </AppLayout>
    );
  }

  const handleSubmit = async () => {
    if (!attemptId || !attempt) return;
    
    // Auto grade the quiz
    let mcScore = 0;
    let tfScore = 0;
    let saScore = 0;
    
    const mcValue = scoreConfig.multipleChoicePerQuestion;
    const saValue = scoreConfig.shortAnswerPerQuestion;
    
    quiz.questions.forEach(q => {
      const ans = attempt.answers[q.id];
      if (ans === undefined || ans === null || ans === '') return;
      
      if (q.type === 'multiple_choice') {
        if (ans === q.correctAnswer) mcScore += mcValue;
      } 
      else if (q.type === 'true_false') {
        let correctStatements = 0;
        q.statements.forEach(st => {
          if (ans[st.label] === st.answer) correctStatements += 1;
        });
        tfScore += scoreConfig.trueFalseByCorrectStatements[correctStatements as keyof typeof scoreConfig.trueFalseByCorrectStatements] ?? 0;
      }
      else if (q.type === 'short_answer') {
        const targetAnswer = q.shortAnswer?.correctAnswer !== undefined ? q.shortAnswer.correctAnswer : (q as any).correctAnswer;
        const tolerance = q.shortAnswer?.tolerance !== undefined ? q.shortAnswer.tolerance : ((q as any).tolerance !== undefined ? (q as any).tolerance : 0);
        if (isShortAnswerCorrect(ans, targetAnswer, q.shortAnswer?.rounding, tolerance)) saScore += saValue;
      }
    });
    
    const totalScore = parseFloat((mcScore + tfScore + saScore).toFixed(2));
    submitAttempt(attemptId, { mcScore, tfScore, saScore, score: totalScore });
    const scorePercent = Math.round(totalScore * 10);
    const studentName = user?.name || 'Học sinh';

    try {
      if (assignmentId) {
        await updateScore(assignmentId, scorePercent, {
          class_name: '10A1',
          student_name: studentName,
          activity_type: 'quiz',
          activity_title: quiz.title,
          score_label: `${totalScore}/10`,
        });
      } else {
        await syncResultToGoogleSheet({
          event: 'student_completed',
          completed_at: new Date().toISOString(),
          class_name: '10A1',
          student_id: user?.id,
          student_name: studentName,
          activity_type: 'quiz',
          activity_title: quiz.title,
          score: totalScore,
          score_label: `${totalScore}/10`,
          source: 'GeoHub',
        });
      }
    } catch (error) {
      console.warn('Không đồng bộ được kết quả sang Google Sheet:', error);
    }
    
    toast.success(`Đã nộp bài! Điểm của bạn: ${totalScore}/10`);
    navigate(`/quiz/${quiz.id}/result?attemptId=${attemptId}`);
  };

  return (
    <AppLayout title={quiz.title}>
      <div className="max-w-5xl mx-auto space-y-8 pb-24">
        {/* Header */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 sticky top-4 z-20 shadow-2xl backdrop-blur-md bg-opacity-80">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
              <p className="text-slate-400 text-sm mt-1">
                {blueprint.multipleChoice} câu lựa chọn, {blueprint.trueFalse} câu đúng/sai, {blueprint.shortAnswer} câu trả lời ngắn. Thời gian {blueprint.durationMinutes} phút.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-4 py-2 rounded-xl font-bold">
                <Clock size={18} /> {blueprint.durationMinutes}:00
              </div>
              <button 
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn nộp bài? Sau khi nộp sẽ không thể sửa lại.")) {
                    handleSubmit();
                  }
                }}
                className="btn-primary py-2 px-6 rounded-xl font-bold bg-teal-500 hover:bg-teal-400 text-white flex items-center gap-2 shadow-lg shadow-teal-500/30"
              >
                <Send size={18} /> Nộp bài
              </button>
            </div>
          </div>
        </div>

        {/* CÂU HỎI */}
        {attemptId && attempt && (
          <div className="space-y-12">
            
            {/* Phần 1 */}
            <div>
              <h2 className="text-xl font-bold text-teal-400 mb-6 border-b border-teal-500/20 pb-2">PHẦN I. TRẮC NGHIỆM KHÁCH QUAN ({blueprint.multipleChoice} Câu)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quiz.questions.filter(q => q.type === 'multiple_choice').map((q, i) => (
                  <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-medium">Câu {i + 1}:</h3>
                      <button
                        onClick={() => {
                          const optA = (q as any).options[0]?.text || (q as any).options[0];
                          const optB = (q as any).options[1]?.text || (q as any).options[1];
                          const optC = (q as any).options[2]?.text || (q as any).options[2];
                          const optD = (q as any).options[3]?.text || (q as any).options[3];
                          const mcText = `Câu hỏi ${i + 1}: ${(q as any).question}. Các phương án lựa chọn: A: ${optA}. B: ${optB}. C: ${optC}. D: ${optD}.`;
                          speakQuestion(q.id, mcText);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${speakingQuestionId === q.id ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
                        title="Nghe đọc câu hỏi"
                      >
                        {speakingQuestionId === q.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                    <StimulusBlock stimulus={q.stimulus} />
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">{(q as any).question}</p>
                    <div className="space-y-2">
                      {['A','B','C','D'].map((letter, idx) => {
                        const isSelected = attempt.answers[q.id] === letter;
                        const optRaw = (q as any).options[idx];
                        const optText = typeof optRaw === 'object' ? optRaw.text : optRaw;
                        return (
                          <button 
                            key={letter}
                            onClick={() => updateAnswer(attemptId, q.id, letter)}
                            className={`w-full text-left text-sm p-3 rounded-lg border transition-all ${
                              isSelected 
                                ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold' 
                                : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <span className="inline-block w-6 font-bold">{letter}.</span> {optText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phần 2 */}
            <div>
              <h2 className="text-xl font-bold text-blue-400 mb-6 border-b border-blue-500/20 pb-2">PHẦN II. TRẮC NGHIỆM ĐÚNG / SAI ({blueprint.trueFalse} Câu)</h2>
              <div className="space-y-6">
                {quiz.questions.filter(q => q.type === 'true_false').map((q, i) => (
                  <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-medium">Câu {i + 1}:</h3>
                      <button
                        onClick={() => {
                          const contextVal = q.stimulus?.content || (q as any).context || '';
                          const tfText = `Câu hỏi ${i + 1}: ${contextVal ? 'Đọc ngữ liệu: ' + contextVal + '. ' : ''} Nhận định a: ${(q as any).statements[0].text}. Nhận định b: ${(q as any).statements[1].text}. Nhận định c: ${(q as any).statements[2].text}. Nhận định d: ${(q as any).statements[3].text}.`;
                          speakQuestion(q.id, tfText);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${speakingQuestionId === q.id ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
                        title="Nghe đọc câu hỏi"
                      >
                        {speakingQuestionId === q.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                    <StimulusBlock stimulus={q.stimulus} />
                    <p className="mb-4 text-sm font-medium leading-relaxed text-slate-300">{q.question}</p>
                    <div className="space-y-3">
                      {(q as any).statements.map((st: any) => {
                        const val = attempt.answers[q.id]?.[st.label]; // boolean or undefined
                        return (
                          <div key={st.label} className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm p-3 rounded-xl bg-slate-950 border border-white/5">
                            <div className="flex-1 flex gap-3">
                              <span className="font-bold text-slate-500">{st.label}.</span>
                              <span className="text-slate-300 leading-relaxed">{st.text}</span>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button 
                                onClick={() => updateAnswer(attemptId, q.id, { ...attempt.answers[q.id], [st.label]: true })}
                                className={`px-4 py-2 rounded-lg font-bold border transition-colors ${val === true ? 'bg-teal-500 text-white border-teal-500' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}
                              >ĐÚNG</button>
                              <button 
                                onClick={() => updateAnswer(attemptId, q.id, { ...attempt.answers[q.id], [st.label]: false })}
                                className={`px-4 py-2 rounded-lg font-bold border transition-colors ${val === false ? 'bg-red-500 text-white border-red-500' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}
                              >SAI</button>
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
              <h2 className="text-xl font-bold text-purple-400 mb-6 border-b border-purple-500/20 pb-2">PHẦN III. TRẢ LỜI NGẮN ({blueprint.shortAnswer} Câu)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quiz.questions.filter(q => q.type === 'short_answer').map((q, i) => (
                  <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-medium">Câu {i + 1}:</h3>
                      <button
                        onClick={() => {
                          const stimText = q.stimulus?.content || '';
                          const saText = `Câu hỏi ${i + 1}: ${stimText ? 'Số liệu đầu vào: ' + stimText + '. ' : ''} Yêu cầu tính: ${(q as any).question}.`;
                          speakQuestion(q.id, saText);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${speakingQuestionId === q.id ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
                        title="Nghe đọc câu hỏi"
                      >
                        {speakingQuestionId === q.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                    <StimulusBlock stimulus={q.stimulus} />
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">{(q as any).question}</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text"
                        inputMode="decimal"
                        placeholder="Nhập số..."
                        maxLength={q.shortAnswer?.maxCharacters || 4}
                        value={attempt.answers[q.id] ?? ''}
                        onChange={(e) => updateAnswer(attemptId, q.id, sanitizeShortAnswerInput(e.target.value, q.shortAnswer?.maxCharacters || 4))}
                        className="flex-1 bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 font-bold text-lg text-center"
                      />
                      <span className="text-slate-400 font-medium">{q.shortAnswer?.unit}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-500/70 bg-amber-500/10 p-2 rounded-lg">
                      <AlertTriangle size={14} /> {q.shortAnswer?.rounding}
                    </div>
                    {q.shortAnswer?.answerFormat && (
                      <div className="mt-2 text-[11px] text-slate-500">{q.shortAnswer.answerFormat}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </AppLayout>
  );
}
