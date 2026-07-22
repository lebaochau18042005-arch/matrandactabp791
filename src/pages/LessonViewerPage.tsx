import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AppLayout from '../layouts/AppLayout';
import { supabase } from '../lib/supabase';
import { useSubmissionStore } from '../store/submissionStore';
import { useAppContext } from '../contexts/AppContext';

export default function LessonViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { completeQuiz } = useAppContext();
  
  useEffect(() => {
    async function loadLesson() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setLesson(data);
      } catch (err: any) {
        console.error("Error loading lesson:", err);
        // Fallback or error
        toast.error("Không thể tải bài giảng. Có thể bài giảng không tồn tại hoặc chưa được công khai.");
        navigate('/student');
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [id, navigate]);

  const handleComplete = () => {
    if (assignmentId) {
      // In a real app, update submission store to set score/completed
      // For now, we just give XP
      completeQuiz(`lesson_${id}`, 100);
      toast.success("Chúc mừng! Bạn đã hoàn thành bài học và nhận được 100 XP!");
    }
    navigate('/student');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-400">Đang tải bài giảng...</p>
        </div>
      </AppLayout>
    );
  }

  if (!lesson) return null;

  return (
    <AppLayout title={lesson.title}>
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 pb-32">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <span className="px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-sm font-semibold border border-teal-500/20">
            {lesson.grade} • {lesson.subject}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{lesson.title}</h1>
        </div>

        {/* Content Blocks */}
        <div className="space-y-6">
          {(lesson.content || []).map((block: any, idx: number) => {
            if (block.type === 'title') {
              return <h2 key={idx} className="text-2xl font-bold text-teal-300 mt-8 mb-4 border-b border-white/10 pb-2">{block.content}</h2>;
            }
            if (block.type === 'objective') {
              return (
                <div key={idx} className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                  <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">🎯 Mục tiêu bài học</h3>
                  <p className="text-blue-100 whitespace-pre-wrap">{block.content}</p>
                </div>
              );
            }
            if (block.type === 'text') {
              return <p key={idx} className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">{block.content}</p>;
            }
            if (block.type === 'image') {
              return (
                <div key={idx} className="rounded-2xl overflow-hidden border border-white/10 bg-slate-800/50">
                  <img src={block.content} alt="Lesson illustration" className="w-full h-auto object-cover" />
                </div>
              );
            }
            if (block.type === 'question') {
              return (
                <div key={idx} className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 my-8">
                  <h3 className="text-rose-400 font-bold mb-2 flex items-center gap-2">❓ Câu hỏi thảo luận</h3>
                  <p className="text-rose-100 whitespace-pre-wrap italic">{block.content}</p>
                  <textarea 
                    className="w-full mt-4 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 transition-colors"
                    placeholder="Nhập câu trả lời của bạn vào đây..."
                    rows={3}
                  />
                </div>
              );
            }
            if (block.type === 'simulation') {
              return (
                <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-emerald-400 font-bold mb-1 flex items-center gap-2">▶️ Mô phỏng 3D</h3>
                    <p className="text-emerald-100/70 text-sm">Nhấn để mở mô phỏng tương tác</p>
                  </div>
                  <a 
                    href={`/simulations/${block.content}`}
                    target="_blank"
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                  >
                    Mở Mô Phỏng
                  </a>
                </div>
              );
            }
            
            // Fallback for other types
            return (
              <div key={idx} className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
                <p className="text-slate-300 whitespace-pre-wrap">{block.content}</p>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
          <button
            onClick={handleComplete}
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/25 transition-all hover:-translate-y-1 active:scale-95 text-lg"
          >
            ✅ Hoàn thành bài học
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
