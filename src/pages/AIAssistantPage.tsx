import React, { useState, useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { Sparkles, Save, FileText, Copy, Trash2, Clock, Bot, Play, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { aiService } from "../services/aiService";
import { useLessonStore } from "../store/lessonStore";
import { useNavigate } from "react-router-dom";
import { SIMULATIONS } from "../data/simulations";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIHistoryItem {
  id: string;
  grade: string;
  lessonTitle: string;
  topic: string;
  contentType: string;
  resultTitle: string;
  resultContent: string;
  createdAt: string;
}

const CONTENT_TYPES = [
  { id: "lesson_objectives", label: "🎯 1. Tạo mục tiêu bài học" },
  { id: "warmup_activity", label: "🏃 2. Tạo hoạt động khởi động" },
  { id: "knowledge_activity", label: "📖 3. Tạo hoạt động hình thành kiến thức" },
  { id: "worksheet", label: "📋 4. Tạo phiếu học tập" },
  { id: "simulation_script", label: "🎞️ 5. Tạo lời thuyết minh mô phỏng 3D" },
  { id: "discussion_questions", label: "❓ 6. Tạo câu hỏi thảo luận" },
  { id: "group_tasks", label: "👥 7. Tạo nhiệm vụ nhóm" },
  { id: "rubric", label: "⭐ 8. Tạo rubric đánh giá" },
  { id: "common_mistakes", label: "⚠️ 9. Tạo sai lầm thường gặp của học sinh" },
  { id: "scientific_check", label: "🔬 10. Kiểm định khoa học nội dung" },
];

export default function AIAssistantPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addLesson, lessons, updateLesson } = useLessonStore();
  
  // Form State
  const [grade, setGrade] = useState("Lớp 10");
  const [lessonTitle, setLessonTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [simulationId, setSimulationId] = useState("");
  const [contentType, setContentType] = useState("");
  
  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [textbook, setTextbook] = useState("Kết nối tri thức");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [classProfile, setClassProfile] = useState("");
  const [localContext, setLocalContext] = useState("");
  const [digitalTools, setDigitalTools] = useState("");
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AIHistoryItem | null>(null);
  
  // History State
  const [history, setHistory] = useState<AIHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("geohub_ai_history");
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch(e){}
    }
  }, []);

  const saveHistory = (newItem: AIHistoryItem) => {
    const newHistory = [newItem, ...history].slice(0, 5); // Keep last 5
    setHistory(newHistory);
    localStorage.setItem("geohub_ai_history", JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem("geohub_ai_history", JSON.stringify(newHistory));
    if (result?.id === id) setResult(null);
  };

  const handleGenerate = async () => {
    if (!lessonTitle.trim()) {
      toast.error("Vui lòng nhập tên bài học trước khi tạo nội dung AI.");
      return;
    }
    if (!contentType) {
      toast.error("Vui lòng chọn loại nội dung cần tạo.");
      return;
    }

    setIsGenerating(true);
    toast.info("AI đang tạo nội dung...");
    
    try {
      const output = await aiService.generateAIContent({
        grade,
        lessonTitle,
        topic,
        objectives,
        simulationId,
        contentType,
        textbook,
        durationMinutes,
        learningOutcomes,
        classProfile,
        localContext,
        digitalTools
      });

      const newItem: AIHistoryItem = {
        id: Date.now().toString(),
        grade,
        lessonTitle,
        topic,
        contentType,
        resultTitle: output.title,
        resultContent: output.content,
        createdAt: output.createdAt
      };

      setResult(newItem);
      saveHistory(newItem);
      toast.success("AI đã tạo nội dung thành công!");
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo nội dung AI. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.resultContent).then(
      () => toast.success("Đã sao chép nội dung"),
      () => toast.error("Không thể sao chép. Vui lòng bôi đen và copy thủ công.")
    );
  };

  const handleDownloadTXT = () => {
    if (!result) return;
    const element = document.createElement("a");
    const file = new Blob([`${result.resultTitle}\nNgày tạo: ${new Date(result.createdAt).toLocaleString('vi-VN')}\n\n${result.resultContent}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    const safeTitle = result.lessonTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    element.download = `ai-${safeTitle}-${result.contentType}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
    toast.success("Đã tải file TXT");
  };

  const handleInsertToLesson = async () => {
    if (!result) return;
    
    // Find if there's a recent lesson, or create a new one
    let targetLessonId = "";
    if (lessons.length > 0) {
      // Just take the latest one for MVP
      targetLessonId = lessons[lessons.length - 1].id;
    }

    const blockTypeMap: Record<string, string> = {
      lesson_objectives: "objective",
      worksheet: "worksheet",
      simulation_script: "text",
      group_tasks: "group-task",
      knowledge_activity: "text",
      warmup_activity: "text"
    };

    const mappedType = blockTypeMap[result.contentType] || "text";

    if (targetLessonId) {
      const target = lessons.find(l => l.id === targetLessonId);
      if (target) {
        const newBlocks = [...target.blocks, { id: `b${Date.now()}`, type: mappedType as any, content: result.resultContent }];
        updateLesson(targetLessonId, { blocks: newBlocks });
        toast.success(`Đã chèn nội dung AI vào bài giảng: ${target.title}`);
      }
    } else {
      const newId = Date.now().toString();
      addLesson({
        id: newId,
        title: result.lessonTitle || "Bài giảng AI",
        grade: result.grade,
        topic: result.topic || "Địa lí",
        authorId: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: [
          { id: `b${Date.now()}`, type: "title" as any, content: result.lessonTitle },
          { id: `b${Date.now()+1}`, type: mappedType as any, content: result.resultContent }
        ]
      });
      toast.success("Đã tạo bài giảng mới và chèn nội dung AI!");
    }
  };

  return (
    <AppLayout title="AI Trợ Giảng (MVP)">
      <style>{`
        .ai-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .ai-history-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(94, 234, 212, 0.3); }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
        
        {/* Left Panel - Input Form */}
        <div className="w-[450px] flex-shrink-0 bg-slate-900 border-r border-white/10 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2 mb-2">
              <Sparkles size={20} /> GeoHub AI Assistant
            </h2>
            <p className="text-slate-400 text-sm">Nhập thông tin bài học để AI tạo nội dung sư phạm chuyên nghiệp.</p>
          </div>

          <div className="p-6 space-y-5 flex-1">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-sm text-slate-400 mb-1.5">Lớp</label>
                <select className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-200 text-sm outline-none" value={grade} onChange={e => setGrade(e.target.value)}>
                  <option>Lớp 10</option>
                  <option>Lớp 11</option>
                  <option>Lớp 12</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-1.5">Tên bài học <span className="text-red-400">*</span></label>
                <input type="text" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-200 text-sm outline-none" placeholder="VD: Hoàn lưu khí quyển..." value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Chủ đề (Tùy chọn)</label>
              <input type="text" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-200 text-sm outline-none" placeholder="VD: Khí quyển" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Mục tiêu hiện tại (Tùy chọn)</label>
              <input type="text" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-200 text-sm outline-none focus:border-teal-500 transition-colors" placeholder="VD: Giúp HS hiểu về..." value={objectives} onChange={e => setObjectives(e.target.value)} />
            </div>

            {/* Advanced Settings Toggle */}
            <div className="pt-2">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                <Settings2 size={16} /> 
                Thiết lập nâng cao (Bối cảnh, Bộ sách...)
                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Advanced Settings Panel */}
            {showAdvanced && (
              <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Bộ sách</label>
                    <select className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 text-sm outline-none" value={textbook} onChange={e => setTextbook(e.target.value)}>
                      <option>Kết nối tri thức</option>
                      <option>Chân trời sáng tạo</option>
                      <option>Cánh diều</option>
                      <option>Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Thời lượng (phút)</label>
                    <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 text-sm outline-none" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Yêu cầu cần đạt (Công văn 5512)</label>
                  <textarea className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 text-sm outline-none resize-none" rows={2} placeholder="Nhập chuẩn yêu cầu cần đạt..." value={learningOutcomes} onChange={e => setLearningOutcomes(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Đặc điểm lớp học</label>
                  <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 text-sm outline-none" placeholder="VD: HS khá giỏi, hiếu động..." value={classProfile} onChange={e => setClassProfile(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Bối cảnh địa phương</label>
                  <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 text-sm outline-none" placeholder="VD: Gần biển, hay ngập lụt..." value={localContext} onChange={e => setLocalContext(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Công cụ số dự kiến</label>
                  <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-200 text-sm outline-none" placeholder="VD: Kahoot, Padlet, Google Earth..." value={digitalTools} onChange={e => setDigitalTools(e.target.value)} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Loại nội dung cần tạo <span className="text-red-400">*</span></label>
              <div className="bg-slate-950 border border-white/10 rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                {CONTENT_TYPES.map(type => (
                  <label key={type.id} className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-white/5 last:border-0 hover:bg-slate-800 ${contentType === type.id ? 'bg-teal-900/30 text-teal-300' : 'text-slate-300'}`}>
                    <input type="radio" name="content_type" className="accent-teal-500" value={type.id} checked={contentType === type.id} onChange={e => setContentType(e.target.value)} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="ai-btn w-full mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spinner" /> : <Sparkles size={18} />}
              {isGenerating ? "Đang xử lý..." : "Tạo Nội Dung Ngay"}
            </button>
          </div>
        </div>

        {/* Right Panel - Result & History */}
        <div className="flex-1 flex flex-col bg-slate-950 relative">
          {/* Header Actions */}
          <div className="h-[72px] border-b border-white/10 px-8 flex items-center justify-between bg-slate-900/50">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <FileText className="text-blue-400" size={20} /> Kết Quả Sinh Thành
            </h3>
            
            {result && (
              <div className="flex gap-2">
                <button onClick={handleGenerate} className="ai-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg flex items-center gap-2 border border-white/10">
                  <Sparkles size={15} /> Tạo lại
                </button>
                <button onClick={handleCopy} className="ai-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg flex items-center gap-2 border border-white/10">
                  <Copy size={15} /> Sao chép
                </button>
                <button onClick={handleDownloadTXT} className="ai-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg flex items-center gap-2 border border-white/10">
                  <Save size={15} /> Tải TXT
                </button>
                <button onClick={handleInsertToLesson} className="ai-btn px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20">
                  <Play size={15} fill="currentColor" /> Chèn vào Bài Giảng
                </button>
              </div>
            )}
          </div>

          {/* Result Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 spinner" />
                  <Sparkles className="absolute inset-0 m-auto text-teal-400" size={24} />
                </div>
                <p className="animate-pulse">AI đang phân tích kiến thức môn Địa lí...</p>
              </div>
            ) : result ? (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-white/10">
                  {result.resultTitle}
                </h1>
                <div className="prose prose-invert prose-teal max-w-none">
                  {/* Extremely basic markdown rendering for MVP */}
                  {result.resultContent.split('\n\n').map((para, i) => {
                    if (para.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-teal-300 mt-6 mb-2">{para.replace('### ', '')}</h3>;
                    if (para.startsWith('**') && para.includes('**', 2)) {
                      const endIdx = para.indexOf('**', 2);
                      const title = para.substring(2, endIdx);
                      const rest = para.substring(endIdx + 2);
                      return <p key={i} className="text-slate-300 mb-4 leading-relaxed"><strong className="text-white">{title}</strong>{rest}</p>;
                    }
                    if (para.startsWith('- ')) {
                      return <ul key={i} className="list-disc pl-5 text-slate-300 mb-4 space-y-1">
                        {para.split('\n').map((li, j) => <li key={j}>{li.replace('- ', '')}</li>)}
                      </ul>
                    }
                    if (para.startsWith('|')) {
                       return <div key={i} className="bg-slate-900 p-4 rounded-xl border border-white/10 overflow-x-auto text-sm text-slate-300 font-mono whitespace-pre-wrap">{para}</div>
                    }
                    return <p key={i} className="text-slate-300 mb-4 leading-relaxed">{para}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <Bot size={48} className="opacity-20" />
                <p>Hãy chọn loại nội dung và bấm Tạo bên trái.</p>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        <div className="w-[300px] flex-shrink-0 bg-slate-900 border-l border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium text-slate-300 flex items-center gap-2">
              <Clock size={16} /> Lịch sử AI (5)
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center mt-4">Chưa có lịch sử</p>
            ) : (
              history.map(item => (
                <div key={item.id} className={`ai-history-item relative group p-3 rounded-xl border cursor-pointer transition-all ${result?.id === item.id ? 'bg-teal-900/20 border-teal-500/50' : 'bg-slate-950 border-white/5'}`} onClick={() => setResult(item)}>
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-bold text-teal-400 truncate pr-4">{CONTENT_TYPES.find(c => c.id === item.contentType)?.label.substring(3) || "Nội dung"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 absolute right-2 top-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-white font-medium truncate mb-1">{item.lessonTitle}</p>
                  <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleTimeString('vi-VN')} - {item.grade}</p>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </AppLayout>
  );
}
