import React, { useEffect, useState, useRef } from 'react';
import { levelName } from '../contexts/AppContext';
import { Trophy, Star, Sparkles, X } from 'lucide-react';

export default function LevelUpModal({ currentLevel }: { currentLevel: number }) {
  const [show, setShow] = useState(false);
  const prevLevelRef = useRef(currentLevel);

  useEffect(() => {
    if (currentLevel > prevLevelRef.current) {
      // Level increased!
      setShow(true);
      // Auto hide after 5 seconds
      const t = setTimeout(() => setShow(false), 5000);
      prevLevelRef.current = currentLevel;
      return () => clearTimeout(t);
    }
  }, [currentLevel]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setShow(false)} />
      
      {/* Modal */}
      <div 
        className="relative bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center max-w-sm w-full pointer-events-auto transform transition-all animate-in fade-in zoom-in duration-300"
      >
        <button 
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 rounded-full" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl">
            <Trophy className="w-12 h-12 text-white" />
            <Sparkles className="absolute -top-2 -right-2 text-yellow-300 w-8 h-8 animate-pulse" />
            <Star className="absolute -bottom-2 -left-2 text-yellow-300 w-6 h-6 animate-pulse" style={{ animationDelay: '200ms' }} />
          </div>
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
          LÊN CẤP!
        </h2>
        
        <p className="text-slate-300 mb-6 text-lg">
          Chúc mừng! Bạn đã đạt Cấp {currentLevel}: <br />
          <span className="font-bold text-white text-xl mt-2 block">{levelName(currentLevel)}</span>
        </p>

        <button
          onClick={() => setShow(false)}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all active:scale-95"
        >
          Tiếp tục học
        </button>
      </div>
    </div>
  );
}
