// ─── SimViewerPage – Individual simulation viewer ──────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { SIMULATIONS, SIM_BY_ID } from '../data/simulations';
import { useAppContext, XP_REWARDS } from '../contexts/AppContext';
import { useSubmissionStore } from '../store/submissionStore';
import { parseSimDataFromContent } from '../utils/simContentParser';

// ─── Simulation Components ────────────────────────────────────────────────────
import DayNightSim              from '../components/DayNightSim';
import SeasonsSim               from '../components/SeasonsSim';
import TimeZoneSim              from '../components/TimeZoneSim';
import CoordinateSim            from '../components/CoordinateSim';
import SunraySim                from '../components/SunraySim';
import AtmosphericCirculationSim from '../components/AtmosphericCirculationSim';
import WindPressureSim          from '../components/WindPressureSim';
import OrographicRainSim        from '../components/OrographicRainSim';
import TideSim                  from '../components/TideSim';
import OceanCurrentSim          from '../components/OceanCurrentSim';
import JapanGeographySim        from '../components/JapanGeographySim';
import EarthLayersSim           from '../components/EarthLayersSim';
import VolcanoSim               from '../components/VolcanoSim';
import SolarSystemSim          from '../components/SolarSystemSim';
import ZenithSunSim            from '../components/ZenithSunSim';
import AtmosphericStructureSim  from '../components/AtmosphericStructureSim';
import WaterCycleSim            from '../components/WaterCycleSim';
import SeaLandBreezeSim         from '../components/SeaLandBreezeSim';
import TyphoonSim               from '../components/TyphoonSim';
import MonsoonSim               from '../components/MonsoonSim';
import GlacierMeltSim           from '../components/GlacierMeltSim';
import ClimateChangeSim         from '../components/ClimateChangeSim';
import FloodSim                 from '../components/FloodSim';
import TsunamiSim               from '../components/TsunamiSim';
import EarthquakeSim            from '../components/EarthquakeSim';
import TectonicSim              from '../components/TectonicSim';
import KarstSim                 from '../components/KarstSim';

// ─── Quiz questions keyed by simId ────────────────────────────────────────────
const SIM_QUIZ: Record<string, Array<{
  q: string;
  opts: string[];
  correct: number;
}>> = {
  daynight: [
    { q: 'Trái Đất tự quay quanh trục theo hướng nào?', opts: ['Đông → Tây', 'Tây → Đông', 'Bắc → Nam', 'Nam → Bắc'], correct: 1 },
    { q: 'Một vòng tự quay của Trái Đất mất bao lâu?', opts: ['12 giờ', '24 giờ', '365 ngày', '30 ngày'], correct: 1 },
  ],
  seasons: [
    { q: 'Góc nghiêng trục Trái Đất so với mặt phẳng quỹ đạo là bao nhiêu?', opts: ['23°27\'', '45°', '66°33\'', '90°'], correct: 0 },
    { q: 'Khi Bắc bán cầu là mùa hè, Nam bán cầu là mùa gì?', opts: ['Xuân', 'Hạ', 'Thu', 'Đông'], correct: 3 },
  ],
  timezone: [
    { q: 'Toàn bộ Trái Đất được chia thành bao nhiêu múi giờ?', opts: ['12', '24', '36', '48'], correct: 1 },
    { q: 'Kinh tuyến gốc (0°) đi qua đài thiên văn nào?', opts: ['Paris', 'Berlin', 'Greenwich', 'Moscow'], correct: 2 },
  ],
  atmosphere: [
    { q: 'Gió mậu dịch thổi theo hướng nào ở Bắc bán cầu?', opts: ['Tây Bắc', 'Đông Bắc', 'Đông Nam', 'Tây Nam'], correct: 1 },
    { q: 'Lực nào làm lệch hướng gió?', opts: ['Lực hấp dẫn', 'Lực Coriolis', 'Lực ma sát', 'Lực ly tâm'], correct: 1 },
  ],
  windpressure: [
    { q: 'Gió thổi từ nơi có khí áp nào đến nơi có khí áp nào?', opts: ['Thấp → Cao', 'Cao → Thấp', 'Bằng nhau', 'Không theo quy luật'], correct: 1 },
    { q: 'Áp thấp nhiệt đới hình thành ở vùng nào?', opts: ['Cực Bắc', 'Xích đạo', 'Ôn đới', 'Cận cực'], correct: 1 },
  ],
  orographicrain: [
    { q: 'Hiệu ứng phơn xảy ra ở sườn nào của núi?', opts: ['Sườn đón gió', 'Sườn khuất gió', 'Cả hai', 'Đỉnh núi'], correct: 1 },
    { q: 'Gió Lào ở Việt Nam là loại gió gì?', opts: ['Gió biển', 'Gió phơn', 'Gió mậu dịch', 'Gió mùa'], correct: 1 },
  ],
  tide: [
    { q: 'Triều cường xảy ra khi nào?', opts: ['Trăng tròn và trăng non', 'Chỉ trăng tròn', 'Chỉ trăng non', 'Bất kỳ lúc nào'], correct: 0 },
    { q: 'Lực hấp dẫn của thiên thể nào gây thủy triều mạnh nhất?', opts: ['Mặt Trời', 'Mặt Trăng', 'Sao Mộc', 'Sao Hỏa'], correct: 1 },
  ],
  ocean: [
    { q: 'Dòng Kuroshio là dòng biển loại gì?', opts: ['Lạnh', 'Nóng', 'Hỗn hợp', 'Trung tính'], correct: 1 },
    { q: 'Dòng biển nóng thường chảy theo hướng nào?', opts: ['Từ cực về xích đạo', 'Từ xích đạo về cực', 'Từ đông sang tây', 'Ngẫu nhiên'], correct: 1 },
  ],
  earth: [
    { q: 'Lớp nào của Trái Đất dày nhất?', opts: ['Vỏ Trái Đất', 'Man-ti', 'Nhân ngoài', 'Nhân trong'], correct: 1 },
    { q: 'Vỏ Trái Đất đại dương dày khoảng bao nhiêu?', opts: ['5–10 km', '30–70 km', '100 km', '200 km'], correct: 0 },
  ],
  volcano: [
    { q: 'Núi lửa hoạt động phun trào vật chất từ đâu?', opts: ['Vỏ Trái Đất', 'Man-ti', 'Nhân Trái Đất', 'Tầng đối lưu'], correct: 1 },
    { q: 'Vành đai núi lửa Thái Bình Dương còn gọi là gì?', opts: ['Vành đai lửa', 'Vành đai băng', 'Vành đai đại dương', 'Vành đai nhiệt đới'], correct: 0 },
  ],
  japan: [
    { q: 'Dòng biển nóng chảy dọc bờ Thái Bình Dương của Nhật Bản là dòng nào?', opts: ['Oyashio', 'Kuroshio', 'El Niño', 'Gulf Stream'], correct: 1 },
    { q: 'Ngư trường phong phú Nhật Bản hình thành do gì?', opts: ['Chỉ do Kuroshio', 'Chỉ do Oyashio', 'Giao hội Kuroshio và Oyashio', 'Độ mặn cao'], correct: 2 },
  ],
  coordinate: [
    { q: 'Xích đạo là vĩ tuyến có vĩ độ bao nhiêu?', opts: ['0°', '23°27\'', '66°33\'', '90°'], correct: 0 },
    { q: 'Kinh tuyến gốc chia Trái Đất thành mấy nửa cầu Đông – Tây?', opts: ['1', '2', '4', '24'], correct: 1 },
  ],
  sunray: [
    { q: 'Vì sao xích đạo nhận được nhiều nhiệt hơn cực?', opts: ['Gần Mặt Trời hơn', 'Góc nhập xạ lớn hơn', 'Không có mây', 'Gió mạnh hơn'], correct: 1 },
    { q: 'Góc nhập xạ tại xích đạo vào ngày xuân phân là bao nhiêu?', opts: ['0°', '23°27\'', '66°33\'', '90°'], correct: 3 },
  ],
};

const DEFAULT_QUIZ = [
  { q: 'Mô phỏng này giúp bạn học về chủ đề gì trong địa lí?', opts: ['Khí hậu', 'Địa hình', 'Dân cư', 'Kinh tế'], correct: 0 },
  { q: 'Tần suất nên xem lại mô phỏng để ghi nhớ kiến thức?', opts: ['1 lần là đủ', 'Mỗi tuần', 'Trước kỳ thi', 'Mỗi ngày'], correct: 2 },
];

// ─── Sim canvas renderer ──────────────────────────────────────────────────────
function SimCanvas({ 
  previewType, 
  simId, 
  customParams, 
  customQuestions 
}: { 
  previewType: string; 
  simId: string; 
  customParams?: any; 
  customQuestions?: any; 
}) {
  switch (previewType) {
    case 'daynight':      return <DayNightSim />;
    case 'seasons':       return <SeasonsSim />;
    case 'timezone':      return <TimeZoneSim />;
    case 'coordinate':    return <CoordinateSim />;
    case 'sunray':        return <SunraySim customParams={customParams} />;
    case 'atmosphere':    return <AtmosphericCirculationSim />;
    case 'windpressure':  return <WindPressureSim />;
    case 'orographicrain':return <OrographicRainSim customParams={customParams} customQuestions={customQuestions} />;
    case 'tide':          return <TideSim />;
    case 'ocean':         return <OceanCurrentSim />;
    case 'japan':         return <JapanGeographySim />;
    case 'earth':         return <EarthLayersSim />;
    case 'volcano':       return <VolcanoSim />;
    case 'solar-system':  return <SolarSystemSim customParams={customParams} customQuestions={customQuestions} />;
    case 'zenith-sun':    return <ZenithSunSim customParams={customParams} customQuestions={customQuestions} />;
    case 'atm-structure': return <AtmosphericStructureSim customParams={customParams} customQuestions={customQuestions} />;
    case 'water-cycle':   return <WaterCycleSim customParams={customParams} customQuestions={customQuestions} />;
    case 'sea-land-breeze': return <SeaLandBreezeSim customParams={customParams} customQuestions={customQuestions} />;
    case 'typhoon':       return <TyphoonSim customParams={customParams} customQuestions={customQuestions} />;
    case 'monsoon':       return <MonsoonSim customParams={customParams} customQuestions={customQuestions} />;
    case 'glacier-melt':  return <GlacierMeltSim customParams={customParams} customQuestions={customQuestions} />;
    case 'climate-change':return <ClimateChangeSim customParams={customParams} customQuestions={customQuestions} />;
    case 'flood':         return <FloodSim customParams={customParams} customQuestions={customQuestions} />;
    case 'tsunami':       return <TsunamiSim customParams={customParams} customQuestions={customQuestions} />;
    case 'earthquake':    return <EarthquakeSim customParams={customParams} customQuestions={customQuestions} />;
    case 'tectonic':      return <TectonicSim customParams={customParams} customQuestions={customQuestions} />;
    case 'karst':         return <KarstSim customParams={customParams} customQuestions={customQuestions} />;
    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="text-8xl opacity-60">🔧</div>
          <p className="text-slate-400 font-semibold text-lg">Đang phát triển...</p>
          <p className="text-slate-600 text-sm max-w-sm">Mô phỏng này sắp được hoàn thiện. Hãy quay lại sớm!</p>
        </div>
      );
  }
}

// ─── Quiz Panel ───────────────────────────────────────────────────────────────
function QuizPanel({ 
  simId, 
  onComplete, 
  customQuestions 
}: { 
  simId: string; 
  onComplete: (score: number) => void; 
  customQuestions?: Array<{ q: string; opts: string[]; a: string }>;
}) {
  const questions = React.useMemo(() => {
    if (customQuestions && customQuestions.length > 0) {
      return customQuestions.map(q => {
        let correctIdx = q.opts.indexOf(q.a);
        if (correctIdx === -1) correctIdx = 0;
        return {
          q: q.q,
          opts: q.opts,
          correct: correctIdx
        };
      });
    }
    return SIM_QUIZ[simId] ?? DEFAULT_QUIZ;
  }, [simId, customQuestions]);

  const [currentQ, setCurrentQ]   = useState(0);
  const [selected,  setSelected]  = useState<number | null>(null);
  const [answered,  setAnswered]  = useState<boolean[]>(() => new Array(questions.length).fill(false));
  const [results,   setResults]   = useState<boolean[]>([]);
  const [done,      setDone]      = useState(false);
  
  // Reset index when questions change
  useEffect(() => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(new Array(questions.length).fill(false));
    setResults([]);
    setDone(false);
  }, [questions]);

  const q = questions[currentQ];

  const handleSelect = (idx: number) => {
    if (answered[currentQ]) return;
    setSelected(idx);
    const correct = idx === q.correct;
    const newAnswered = [...answered];
    newAnswered[currentQ] = true;
    setAnswered(newAnswered);
    const newResults = [...results, correct];
    setResults(newResults);

    if (currentQ + 1 >= questions.length) {
      setTimeout(() => {
        setDone(true);
        const score = Math.round((newResults.filter(Boolean).length / questions.length) * 100);
        onComplete(score);
      }, 800);
    } else {
      setTimeout(() => {
        setCurrentQ(q => q + 1);
        setSelected(null);
      }, 800);
    }
  };

  if (done) {
    const score = Math.round((results.filter(Boolean).length / questions.length) * 100);
    return (
      <div className="text-center py-4">
        <div className={`text-4xl mb-2 ${score >= 80 ? 'text-yellow-400' : 'text-slate-400'}`}>
          {score >= 80 ? '🏆' : score >= 50 ? '✅' : '📚'}
        </div>
        <p className="text-white font-black text-2xl">{score}%</p>
        <p className="text-slate-400 text-xs mt-1 mb-3">
          {results.filter(Boolean).length}/{questions.length} câu đúng
        </p>
        {score >= 80 && (
          <div className="px-3 py-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            🎉 Xuất sắc! +{score === 100 ? XP_REWARDS.PERFECT_SCORE : XP_REWARDS.COMPLETE_QUIZ} XP
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-500 text-xs">Câu {currentQ + 1}/{questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`w-4 h-1.5 rounded-full transition-all ${
              i < currentQ + 1 ? 'bg-teal-500' : 'bg-slate-700'
            }`} />
          ))}
        </div>
      </div>
      <p className="text-white text-sm font-semibold leading-snug">{q.q}</p>
      <div className="space-y-2">
        {q.opts.map((opt, i) => {
          const isAnswered = answered[currentQ];
          const isSelected = selected === i;
          const isCorrect  = i === q.correct;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                !isAnswered
                  ? 'bg-slate-700/60 text-slate-300 border-white/8 hover:border-teal-500/40 hover:bg-slate-700'
                  : isCorrect
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isSelected
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-slate-700/40 text-slate-600 border-white/4'
              }`}
            >
              <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
              {opt}
              {isAnswered && isCorrect && ' ✓'}
              {isAnswered && isSelected && !isCorrect && ' ✗'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Coming Soon placeholder ──────────────────────────────────────────────────
function ComingSoonView({ sim }: { sim: typeof SIMULATIONS[number] }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-10 gap-6">
      <div
        className="w-full max-w-sm rounded-3xl p-10 flex flex-col items-center gap-4"
        style={{ background: sim.gradient }}
      >
        <span className="text-8xl">{sim.groupEmoji}</span>
        <span className="px-4 py-1.5 rounded-full bg-orange-500/80 text-white text-sm font-black tracking-wider">
          Đang phát triển
        </span>
      </div>
      <div>
        <h2 className="text-white text-xl font-black mb-2">{sim.name}</h2>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          Mô phỏng này sắp được ra mắt. Hãy đăng ký để nhận thông báo khi mô phỏng được phát hành!
        </p>
      </div>
      <button
        onClick={() => alert('Tính năng đăng ký thông báo đang phát triển!')}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/30 hover:from-teal-500 hover:to-teal-400 active:scale-95 transition-all"
      >
        🔔 Đăng ký nhận thông báo
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SimViewerPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  const { markSimViewed, completeQuiz } = useAppContext();
  const { updateScore } = useSubmissionStore();

  const sim = id ? SIM_BY_ID[id] : undefined;

  // Load documents to look for customized params, quiz, and narration
  const parsedData = React.useMemo(() => {
    if (!sim) return { params: {}, quiz: [], narration: '' };
    try {
      const saved = localStorage.getItem('geohub_simulation_docs');
      if (saved) {
        const docs = JSON.parse(saved);
        if (Array.isArray(docs)) {
          const doc = docs.find(d => d.previewType === sim.previewType);
          if (doc && doc.content) {
            return parseSimDataFromContent(doc.content, sim.previewType);
          }
        }
      }
    } catch (e) {
      console.error("Error reading doc in SimViewerPage", e);
    }
    return { params: {}, quiz: [], narration: '' };
  }, [sim]);

  const [xpToast, setXPToast]       = useState(false);
  const [quizDone, setQuizDone]     = useState(false);
  const [quizScore, setQuizScore]   = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Mark viewed + award XP on mount
  useEffect(() => {
    if (!sim) return;
    markSimViewed(sim.id);
    setXPToast(true);
    const t = setTimeout(() => setXPToast(false), 2500);
    return () => clearTimeout(t);
  }, [sim?.id]);

  const handleQuizComplete = (score: number) => {
    if (!sim || quizDone) return;
    setQuizDone(true);
    setQuizScore(score);
    completeQuiz(sim.id, score);
    
    // Update Supabase if this is an assignment
    if (assignmentId) {
      updateScore(assignmentId, score);
    }
  };

  const toggleFullscreen = () => {
    if (!canvasRef.current) return;
    if (!document.fullscreenElement) {
      canvasRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Unknown sim
  if (!sim) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌍</div>
          <p className="text-white font-bold text-xl mb-2">Không tìm thấy mô phỏng</p>
          <p className="text-slate-500 text-sm mb-6">ID "{id}" không hợp lệ</p>
          <button
            onClick={() => navigate('/simulations')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-500 transition-all"
          >
            ← Về thư viện
          </button>
        </div>
      </div>
    );
  }

  const isComingSoon = sim.status === 'coming';
  const objectives   = sim.objectives ?? [
    'Quan sát và mô tả hiện tượng địa lí',
    'Giải thích nguyên nhân của hiện tượng',
    'Liên hệ thực tế với kiến thức đã học',
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080f1e',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── XP Toast ─────────────────────────────────────────────────────── */}
      {xpToast && (
        <div
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(90deg,#0f766e,#6366f1)',
            color: '#fff', padding: '10px 18px', borderRadius: 12,
            fontWeight: 700, fontSize: 14,
            boxShadow: '0 8px 32px rgba(20,184,166,.35)',
            animation: 'slideIn 0.3s ease',
          }}
        >
          ⚡ +{XP_REWARDS.VIEW_SIM} XP – Xem mô phỏng mới!
        </div>
      )}

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header
        style={{
          height: 56, background: 'rgba(8,15,30,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 12,
          backdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#94a3b8', borderRadius: 8,
            padding: '6px 12px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          ← Thư viện
        </button>

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h1 style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sim.name}
          </h1>
          <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: 700 }}>
              {sim.groupEmoji} {sim.groupLabel}
            </span>
            {sim.grades.map(g => (
              <span key={g} style={{ fontSize: 10, padding: '1px 8px', borderRadius: 4, background: 'rgba(20,184,166,0.12)', color: '#5eead4', fontWeight: 700 }}>
                Lớp {g}
              </span>
            ))}
            <span style={{
              fontSize: 10, padding: '1px 8px', borderRadius: 4, fontWeight: 700,
              background: isComingSoon ? 'rgba(249,115,22,0.15)' : 'rgba(20,184,166,0.15)',
              color: isComingSoon ? '#fb923c' : '#2dd4bf',
            }}>
              {isComingSoon ? '○ COMING SOON' : '● LIVE'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 8, padding: '5px 10px',
          }}>
            <span style={{ fontSize: 12 }}>⚡</span>
            <span style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 700 }}>
              +{XP_REWARDS.VIEW_SIM} XP khi xem
            </span>
          </div>
          {!isComingSoon && (
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#94a3b8', borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                fontSize: 14,
              }}
            >
              {isFullscreen ? '⤡' : '⤢'}
            </button>
          )}
        </div>
      </header>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Simulation canvas */}
        <div
          ref={canvasRef}
          style={{
            flex: 1, minWidth: 0,
            background: 'linear-gradient(135deg,#0b1120,#0f172a)',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {isComingSoon
            ? <ComingSoonView sim={sim} />
            : <SimCanvas 
                previewType={sim.previewType} 
                simId={sim.id} 
                customParams={parsedData.params} 
                customQuestions={parsedData.quiz} 
              />
          }
        </div>

        {/* Right info panel */}
        <aside
          style={{
            width: 320, flexShrink: 0,
            background: 'rgba(8,15,30,0.98)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Objectives */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>🎯</span>
                <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mục tiêu học tập
                </span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {objectives.map((obj, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: '#14b8a6', fontSize: 11, flexShrink: 0, marginTop: 1 }}>▸</span>
                    <span style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>📖</span>
                <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mô tả
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: 0, fontStyle: parsedData.narration ? 'italic' : 'normal' }}>
                {parsedData.narration ? `"${parsedData.narration}"` : sim.description}
              </p>
              {parsedData.narration && (
                <div style={{
                  marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)',
                  borderRadius: 6, padding: '3px 8px', color: '#2dd4bf', fontSize: 10, fontWeight: 700
                }}>
                  <span>✨ Kịch bản thuyết minh được cập nhật từ Soạn thảo văn bản</span>
                </div>
              )}
              {sim.lessonRef && (
                <div style={{
                  marginTop: 8, padding: '6px 10px',
                  background: 'rgba(99,102,241,0.08)', borderRadius: 8,
                  color: '#818cf8', fontSize: 11, fontWeight: 600,
                }}>
                  📚 {sim.lessonRef}
                </div>
              )}
            </div>

            {/* Quiz */}
            {!isComingSoon && (
              <div style={{
                padding: '14px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>⚡</span>
                  <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Kiểm tra nhanh
                  </span>
                  {quizDone && quizScore !== null && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 6,
                      background: quizScore >= 80 ? 'rgba(20,184,166,0.2)' : 'rgba(251,146,60,0.2)',
                      color: quizScore >= 80 ? '#5eead4' : '#fbbf24',
                    }}>
                      {quizScore}%
                    </span>
                  )}
                </div>
                <QuizPanel simId={sim.id} onComplete={handleQuizComplete} customQuestions={parsedData.quiz} />
                {parsedData.quiz.length > 0 && (
                  <div style={{
                    marginTop: 10, fontSize: 9.5, color: '#eab308', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4, opacity: 0.85
                  }}>
                    <span>📝 Câu hỏi trắc nghiệm đã tự động đồng bộ từ Soạn thảo văn bản</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Footer info */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 800 }}>⏱ {sim.durationMin}</div>
              <div style={{ color: '#475569', fontSize: 10 }}>phút</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 800 }}>
                {sim.difficulty === 'easy' ? '🟢' : sim.difficulty === 'medium' ? '🟡' : '🔴'}
              </div>
              <div style={{ color: '#475569', fontSize: 10 }}>
                {sim.difficulty === 'easy' ? 'Dễ' : sim.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 800 }}>⚡ +{XP_REWARDS.VIEW_SIM}</div>
              <div style={{ color: '#475569', fontSize: 10 }}>XP tích lũy</div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
