import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Phone, 
  Zap, 
  Trophy, 
  X, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import { GoogleGenAI } from "@google/genai";

interface Question {
  q: string;
  options: string[];
  correct: number; // Index 0-3
  explanation?: string;
}

const PRIZES = [
  "200.000", "400.000", "600.000", "1.000.000", "2.000.000",
  "3.000.000", "6.000.000", "10.000.000", "14.000.000", "22.000.000",
  "30.000.000", "40.000.000", "60.000.000", "85.000.000", "150.000.000"
];

const SAFE_LEVELS = [4, 9, 14]; // Indices of 5, 10, 15

import { generateContentWithFallback } from '../utils/geminiUtils';

export const MillionaireGame = ({ 
  onExit, 
  apiKey, 
  selectedModel 
}: { 
  onExit: () => void; 
  apiKey?: string; 
  selectedModel?: string; 
}) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'ended'>('start');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    audience: true,
    phone: true
  });
  const [removedOptions, setRemovedOptions] = useState<number[]>([]);
  const [audienceData, setAudienceData] = useState<number[] | null>(null);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const keyToUse = apiKey || process.env.GEMINI_API_KEY || '';
      if (!keyToUse) {
        throw new Error("Chưa cấu hình API Key. Vui lòng thiết lập API Key trong phần Cấu hình.");
      }
      const modelToUse = selectedModel || 'gemini-3.5-flash';

      const response = await generateContentWithFallback(
        keyToUse,
        modelToUse,
        {
          contents: `Hãy tạo 15 câu hỏi trắc nghiệm Địa lí cho trò chơi Ai Là Triệu Phú. 
          Độ khó tăng dần từ câu 1 đến câu 15.
          Trả về định dạng JSON:
          {
            "questions": [
              {
                "q": "Câu hỏi",
                "options": ["A", "B", "C", "D"],
                "correct": 0,
                "explanation": "Giải thích ngắn gọn"
              }
            ]
          }`,
          config: { responseMimeType: "application/json" }
        }
      );
      const data = JSON.parse(response.text || '{}');
      setQuestions(data.questions || []);
      setGameState('playing');
    } catch (error: any) {
      console.error(error);
      Swal.fire('Lỗi', `Không thể tải câu hỏi từ AI: ${error.message || error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (idx: number) => {
    if (isLocked || removedOptions.includes(idx)) return;
    setSelectedOption(idx);
    
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Đáp án ${String.fromCharCode(65 + idx)} là lựa chọn cuối cùng của bạn?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Chốt!',
      cancelButtonText: 'Để tôi nghĩ lại'
    }).then((result) => {
      if (result.isConfirmed) {
        checkAnswer(idx);
      } else {
        setSelectedOption(null);
      }
    });
  };

  const checkAnswer = (idx: number) => {
    setIsLocked(true);
    const isCorrect = idx === questions[currentLevel].correct;

    setTimeout(() => {
      if (isCorrect) {
        if (currentLevel === 14) {
          setGameState('ended');
          Swal.fire('THẮNG CUỘC!', 'Chúc mừng bạn đã trở thành Triệu phú Địa lí!', 'success');
        } else {
          Swal.fire({
            title: 'Chính xác!',
            text: `Bạn nhận được ${PRIZES[currentLevel]} VNĐ. Tiếp tục câu hỏi số ${currentLevel + 2}?`,
            icon: 'success',
            confirmButtonText: 'Tiếp tục'
          }).then(() => {
            setCurrentLevel(prev => prev + 1);
            setSelectedOption(null);
            setIsLocked(false);
            setRemovedOptions([]);
            setAudienceData(null);
            setPhoneMessage(null);
          });
        }
      } else {
        const safeLevel = SAFE_LEVELS.filter(l => l < currentLevel).pop();
        const prize = safeLevel !== undefined ? PRIZES[safeLevel] : "0";
        setGameState('ended');
        Swal.fire('Rất tiếc!', `Đáp án đúng là ${String.fromCharCode(65 + questions[currentLevel].correct)}. Bạn ra về với ${prize} VNĐ.`, 'error');
      }
    }, 1500);
  };

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || isLocked) return;
    const correct = questions[currentLevel].correct;
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== correct);
    const toRemove = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setRemovedOptions(toRemove);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
  };

  const useAudience = () => {
    if (!lifelines.audience || isLocked) return;
    const correct = questions[currentLevel].correct;
    const data = [0, 0, 0, 0];
    data[correct] = Math.floor(Math.random() * 40) + 40; // 40-80%
    let remaining = 100 - data[correct];
    [0, 1, 2, 3].filter(i => i !== correct).forEach((idx, i, arr) => {
      if (i === arr.length - 1) data[idx] = remaining;
      else {
        const val = Math.floor(Math.random() * remaining);
        data[idx] = val;
        remaining -= val;
      }
    });
    setAudienceData(data);
    setLifelines(prev => ({ ...prev, audience: false }));
  };

  const usePhone = async () => {
    if (!lifelines.phone || isLocked) return;
    setLoading(true);
    try {
      const keyToUse = apiKey || process.env.GEMINI_API_KEY || '';
      if (!keyToUse) {
        throw new Error("Chưa cấu hình API Key. Vui lòng thiết lập API Key trong phần Cấu hình.");
      }
      const modelToUse = selectedModel || 'gemini-3.5-flash';

      const response = await generateContentWithFallback(
        keyToUse,
        modelToUse,
        {
          contents: `Bạn là người thân trong trò chơi Ai Là Triệu Phú. Hãy gợi ý đáp án cho câu hỏi này: "${questions[currentLevel].q}". Các lựa chọn: ${questions[currentLevel].options.join(', ')}. Hãy trả lời theo phong cách đang gọi điện thoại và gợi ý đáp án đúng.`
        }
      );
      setPhoneMessage(response.text || "Tôi nghĩ đáp án là...");
      setLifelines(prev => ({ ...prev, phone: false }));
    } catch (error) {
      console.warn("Lỗi trợ giúp gọi điện thoại:", error);
      setPhoneMessage("Tôi không chắc lắm, có vẻ là đáp án A...");
    } finally {
      setLoading(false);
    }
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8"
        >
          <div className="w-48 h-48 bg-blue-600 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] border-4 border-blue-400">
            <Zap size={80} className="text-yellow-400" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter italic">AI LÀ TRIỆU PHÚ</h1>
          <p className="text-blue-300 text-xl max-w-md mx-auto">Thử thách kiến thức Địa lí của bạn với 15 câu hỏi kịch tính.</p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={fetchQuestions}
              disabled={loading}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-full text-2xl font-black shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'ĐANG TẢI CÂU HỎI...' : 'BẮT ĐẦU CHƠI'}
            </button>
            <button onClick={onExit} className="text-slate-400 font-bold hover:text-white transition-colors">Quay lại</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentLevel];

  return (
    <div className="min-h-screen bg-[#02021a] flex flex-col lg:flex-row text-white overflow-hidden">
      {/* Sidebar: Prize Ladder */}
      <div className="w-full lg:w-80 bg-[#04042d] border-b lg:border-b-0 lg:border-r border-blue-900/50 p-6 flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-blue-400 font-black text-sm uppercase tracking-widest mb-1">Mức tiền thưởng</h2>
          <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full" />
        </div>
        <div className="flex-1 flex flex-col-reverse justify-between gap-1">
          {PRIZES.map((prize, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                currentLevel === idx 
                  ? 'bg-yellow-500 text-slate-900 scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                  : SAFE_LEVELS.includes(idx) 
                    ? 'text-white' 
                    : 'text-orange-400/70'
              }`}
            >
              <span className="w-6">{idx + 1}</span>
              <span>{prize}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col p-8 relative">
        {/* Lifelines */}
        <div className="flex justify-end gap-4 mb-12">
          <button 
            onClick={useFiftyFifty}
            disabled={!lifelines.fiftyFifty || isLocked}
            className={`w-16 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              lifelines.fiftyFifty ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10' : 'border-slate-700 text-slate-700 opacity-50'
            }`}
          >
            <span className="font-black">50:50</span>
          </button>
          <button 
            onClick={useAudience}
            disabled={!lifelines.audience || isLocked}
            className={`w-16 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              lifelines.audience ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10' : 'border-slate-700 text-slate-700 opacity-50'
            }`}
          >
            <Users size={24} />
          </button>
          <button 
            onClick={usePhone}
            disabled={!lifelines.phone || isLocked}
            className={`w-16 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              lifelines.phone ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10' : 'border-slate-700 text-slate-700 opacity-50'
            }`}
          >
            <Phone size={24} />
          </button>
        </div>

        {/* Audience Chart Overlay */}
        <AnimatePresence>
          {audienceData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-24 right-8 w-64 bg-slate-800/90 backdrop-blur p-6 rounded-3xl border border-blue-500/30 z-50"
            >
              <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold">
                <BarChart3 size={20} />
                <span>Ý kiến khán giả</span>
              </div>
              <div className="flex items-end justify-between h-32 gap-2">
                {audienceData.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-blue-600 rounded-t-lg transition-all duration-1000" style={{ height: `${val}%` }} />
                    <span className="text-[10px] font-black">{String.fromCharCode(65 + i)}</span>
                    <span className="text-[10px] text-slate-400">{val}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phone Message Overlay */}
        <AnimatePresence>
          {phoneMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-md bg-blue-900/90 backdrop-blur p-8 rounded-[2.5rem] border-2 border-blue-400 z-50 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                  <Phone size={24} className="text-blue-900" />
                </div>
                <div>
                  <h4 className="font-black text-blue-200">Người thân đang trả lời...</h4>
                </div>
              </div>
              <p className="text-xl italic leading-relaxed">"{phoneMessage}"</p>
              <button onClick={() => setPhoneMessage(null)} className="mt-6 w-full py-2 bg-blue-400/20 rounded-xl text-sm font-bold">Đóng</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Display */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
          <motion.div 
            key={currentLevel}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <div className="relative p-12 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-[3rem] border-2 border-blue-500/30 text-center shadow-2xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-blue-600 rounded-full text-sm font-black tracking-widest shadow-lg">
                CÂU HỎI {currentLevel + 1}
              </div>
              <h3 className="text-3xl font-bold leading-tight">{currentQuestion.q}</h3>
            </div>
          </motion.div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isLocked || removedOptions.includes(idx)}
                className={`group relative p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 overflow-hidden ${
                  removedOptions.includes(idx) ? 'opacity-0 pointer-events-none' :
                  selectedOption === idx 
                    ? 'bg-yellow-500 border-yellow-400 text-slate-900' 
                    : 'bg-blue-900/20 border-blue-500/30 hover:border-blue-400 hover:bg-blue-800/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 transition-colors ${
                  selectedOption === idx ? 'bg-slate-900 text-yellow-500' : 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-400 group-hover:text-blue-900'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-xl font-bold">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-between text-slate-500 font-bold">
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span>Thời gian không giới hạn</span>
          </div>
          <button onClick={onExit} className="hover:text-white transition-colors">Dừng cuộc chơi</button>
        </div>
      </div>
    </div>
  );
};
