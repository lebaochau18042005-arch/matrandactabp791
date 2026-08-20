import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { useQuizStore } from '../../store/quizStore';
import { toast } from 'sonner';
import { Clock, Send, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function QuizAnswerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { generatedQuizzes, startAttempt, updateAnswer, submitAttempt, quizAttempts } = useQuizStore();
  const quiz = id ? generatedQuizzes[id] : null;
  
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const attempt = attemptId ? quizAttempts[attemptId] : null;

  useEffect(() => {
    if (quiz && user && !attemptId) {
      const newAttemptId = startAttempt(quiz.id, user.id, user.name || 'Student');
      setAttemptId(newAttemptId);
    }
  }, [quiz, user, attemptId, startAttempt]);

  if (!quiz) {
    return (
      <AppLayout title="Làm Quiz">
        <div className="flex h-[50vh] items-center justify-center text-slate-400">Không tìm thấy bài Quiz này.</div>
      </AppLayout>
    );
  }

  const handleSubmit = () => {
    if (!attemptId || !attempt) return;
    
    // Auto grade the quiz
    let mcScore = 0;
    let tfScore = 0;
    let saScore = 0;
    
    const mcValue = 3 / 12; // 0.25 points each
    const tfValue = 4 / 16; // 0.25 points each statement
    const saValue = 3 / 4;  // 0.75 points each
    
    quiz.questions.forEach(q => {
      const ans = attempt.answers[q.id];
      if (!ans) return;
      
      if (q.type === 'multiple_choice') {
        if (ans === q.correctAnswer) mcScore += mcValue;
      } 
      else if (q.type === 'true_false') {
        q.statements.forEach(st => {
          if (ans[st.label] === st.answer) tfScore += tfValue;
        });
      }
      else if (q.type === 'short_answer') {
        const numericAns = parseFloat(ans);
        if (!isNaN(numericAns) && Math.abs(numericAns - q.shortAnswer.correctAnswer) <= q.shortAnswer.tolerance) {
          saScore += saValue;
        }
      }
    });
    
    const totalScore = parseFloat((mcScore + tfScore + saScore).toFixed(2));
    submitAttempt(attemptId, { mcScore, tfScore, saScore, score: totalScore });
    
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
              <p className="text-slate-400 text-sm mt-1">Gồm 3 phần: Trắc nghiệm khách quan, Đúng/Sai, Trả lời ngắn.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-4 py-2 rounded-xl font-bold">
                <Clock size={18} /> 45:00
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
              <h2 className="text-xl font-bold text-teal-400 mb-6 border-b border-teal-500/20 pb-2">PHẦN I. TRẮC NGHIỆM KHÁCH QUAN (12 Câu)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quiz.questions.filter(q => q.type === 'multiple_choice').map((q, i) => (
                  <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                    <h3 className="text-white font-medium mb-3">Câu {i + 1}:</h3>
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
              <h2 className="text-xl font-bold text-blue-400 mb-6 border-b border-blue-500/20 pb-2">PHẦN II. TRẮC NGHIỆM ĐÚNG / SAI (4 Câu)</h2>
              <div className="space-y-6">
                {quiz.questions.filter(q => q.type === 'true_false').map((q, i) => (
                  <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                    <h3 className="text-white font-medium mb-3">Câu {i + 1}:</h3>
                    <p className="text-slate-300 text-sm mb-4 italic bg-slate-950 p-4 rounded-xl">{(q as any).context}</p>
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
              <h2 className="text-xl font-bold text-purple-400 mb-6 border-b border-purple-500/20 pb-2">PHẦN III. TRẢ LỜI NGẮN (4 Câu)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quiz.questions.filter(q => q.type === 'short_answer').map((q, i) => (
                  <div key={q.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                    <h3 className="text-white font-medium mb-3">Câu {i + 1}:</h3>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed h-16">{(q as any).question}</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        step="any"
                        placeholder="Nhập số..."
                        value={attempt.answers[q.id] || ''}
                        onChange={(e) => updateAnswer(attemptId, q.id, e.target.value)}
                        className="flex-1 bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 font-bold text-lg text-center"
                      />
                      <span className="text-slate-400 font-medium">{(q as any).unit}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-500/70 bg-amber-500/10 p-2 rounded-lg">
                      <AlertTriangle size={14} /> {(q as any).rounding}
                    </div>
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
