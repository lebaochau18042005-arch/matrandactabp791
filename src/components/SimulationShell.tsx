import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ActivityQuestion {
  id: string;
  prefix?: string;      // text before blank, e.g. "Lớp "
  hint?: string;        // text after colon, e.g. ": Đông bán cầu, Tây bán cầu"
  answer: string;       // correct answer
  options: string[];    // clickable option buttons
}

export interface SimTab {
  id: string;
  label: string;
  color?: string;
}

// ─── SimActivity: Fill-in-the-blank panel with auto-scoring ──────────────────
interface SimActivityProps {
  title?: string;
  questions: ActivityQuestion[];
  visible: boolean;
  onToggle: () => void;
  themeColor?: string;
}

export const SimActivity: React.FC<SimActivityProps> = ({
  title = 'Điền vào chỗ trống',
  questions,
  visible,
  onToggle,
  themeColor = '#1e40af',
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const setAnswer = (id: string, val: string) => {
    if (checked) return; // lock after checking
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const handleCheck = () => {
    let correct = 0;
    questions.forEach(q => {
      if ((answers[q.id] || '').trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        correct++;
      }
    });
    setScore({ correct, total: questions.length });
    setChecked(true);
  };

  const handleReset = () => {
    setAnswers({});
    setChecked(false);
    setScore(null);
  };

  const getStatus = (q: ActivityQuestion): 'idle' | 'correct' | 'wrong' => {
    if (!checked) return 'idle';
    if (!answers[q.id]) return 'wrong';
    return answers[q.id].trim().toLowerCase() === q.answer.trim().toLowerCase()
      ? 'correct'
      : 'wrong';
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ background: themeColor }}
      >
        📝 Hoạt động
      </button>
    );
  }

  return (
    <div
      className="absolute top-2 left-2 z-30 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        width: '260px',
        background: 'rgba(15,23,54,0.92)',
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${themeColor}55`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: themeColor }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">✅</span>
          <span className="text-white font-black text-xs tracking-wide">{title}</span>
        </div>
        <button
          onClick={onToggle}
          className="text-white/70 hover:text-white text-base leading-none transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Score banner */}
      {score && (
        <div
          className="flex items-center justify-between px-4 py-1.5 text-xs font-black"
          style={{
            background: score.correct === score.total
              ? 'rgba(34,197,94,0.25)'
              : 'rgba(239,68,68,0.25)',
            color: score.correct === score.total ? '#4ade80' : '#f87171',
            borderBottom: `1px solid ${score.correct === score.total ? '#4ade8033' : '#f8717133'}`,
          }}
        >
          <span>
            {score.correct === score.total
              ? '🏆 Xuất sắc!'
              : `${score.correct}/${score.total} đúng`}
          </span>
          <button
            onClick={handleReset}
            className="underline opacity-70 hover:opacity-100 font-bold"
          >
            Làm lại
          </button>
        </div>
      )}

      {/* Questions */}
      <div className="px-4 py-3 space-y-4">
        {questions.map((q, idx) => {
          const status = getStatus(q);
          const selected = answers[q.id];

          return (
            <div key={q.id} className="space-y-1.5">
              {/* Blank line */}
              <div className="flex items-baseline gap-1 flex-wrap">
                {q.prefix && (
                  <span className="text-slate-300 text-xs font-medium">{q.prefix}</span>
                )}
                <span
                  className="font-black text-xs px-2 py-0.5 rounded-md min-w-[80px] text-center transition-all"
                  style={{
                    background:
                      status === 'correct' ? 'rgba(34,197,94,0.25)'
                      : status === 'wrong' ? 'rgba(239,68,68,0.2)'
                      : selected ? `${themeColor}33`
                      : 'rgba(255,255,255,0.08)',
                    color:
                      status === 'correct' ? '#4ade80'
                      : status === 'wrong' ? '#f87171'
                      : selected ? '#e2e8f0'
                      : 'rgba(148,163,184,0.6)',
                    border: `1px solid ${
                      status === 'correct' ? '#4ade8055'
                      : status === 'wrong' ? '#f8717155'
                      : selected ? `${themeColor}66`
                      : 'rgba(255,255,255,0.12)'
                    }`,
                  }}
                >
                  {selected
                    ? selected
                    : '· · · · · · · · ·'}
                </span>
                {q.hint && (
                  <span className="text-slate-400 text-xs">{q.hint}</span>
                )}
                {status === 'wrong' && checked && selected && (
                  <span className="text-green-400 text-[10px] font-bold ml-1">
                    → {q.answer}
                  </span>
                )}
              </div>

              {/* Option buttons */}
              <div className="flex flex-wrap gap-1">
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(q.id, opt)}
                    disabled={checked}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                    style={{
                      background:
                        answers[q.id] === opt
                          ? themeColor
                          : 'rgba(255,255,255,0.1)',
                      color: answers[q.id] === opt ? '#fff' : '#94a3b8',
                      border: `1px solid ${answers[q.id] === opt ? themeColor : 'rgba(255,255,255,0.15)'}`,
                      opacity: checked ? 0.6 : 1,
                      cursor: checked ? 'default' : 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Check button */}
      {!checked ? (
        <div className="px-4 pb-3 flex justify-end">
          <button
            onClick={handleCheck}
            disabled={Object.keys(answers).length < questions.length}
            className="w-10 h-10 rounded-full font-black text-xl flex items-center justify-center transition-all shadow-lg"
            style={{
              background: Object.keys(answers).length >= questions.length
                ? themeColor
                : 'rgba(255,255,255,0.1)',
              color: Object.keys(answers).length >= questions.length
                ? '#fff'
                : 'rgba(148,163,184,0.4)',
              cursor: Object.keys(answers).length >= questions.length ? 'pointer' : 'default',
            }}
          >
            ✓
          </button>
        </div>
      ) : (
        <div className="px-4 pb-3" />
      )}
    </div>
  );
};

// ─── SimTabs: Bottom tab bar ──────────────────────────────────────────────────
interface SimTabsProps {
  tabs: SimTab[];
  active?: string;
  onChange?: (id: string) => void;
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export const SimTabs: React.FC<SimTabsProps> = ({ tabs, active, onChange, activeTab, onTabChange }) => {
  const currentTab = active || activeTab || tabs[0]?.id;
  const handleChange = onChange || onTabChange || (() => {});
  return (
    <div className="flex border-t border-white/10 bg-[#0b0f22] shrink-0 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className="flex-1 min-w-max px-3 py-2.5 text-[11px] font-black transition-all border-t-2 whitespace-nowrap"
          style={{
            borderTopColor: currentTab === tab.id ? (tab.color ?? '#3b82f6') : 'transparent',
            color: currentTab === tab.id ? (tab.color ?? '#3b82f6') : '#475569',
            background: currentTab === tab.id ? `${tab.color ?? '#3b82f6'}18` : 'transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ─── SimTopBar: Shared top toolbar ───────────────────────────────────────────
interface SimTopBarProps {
  title: string;
  playing?: boolean;
  onPlayPause?: () => void;
  speed?: number;
  onSpeedChange?: (v: number) => void;
  extraControls?: React.ReactNode;
}

export const SimTopBar: React.FC<SimTopBarProps> = ({
  title,
  playing,
  onPlayPause,
  speed,
  onSpeedChange,
  extraControls,
}) => (
  <div className="flex items-center justify-between px-3 py-2 bg-[#0d1025] border-b border-white/10 shrink-0 gap-2 flex-wrap">
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
      <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      {onPlayPause && (
        <button
          onClick={onPlayPause}
          className="px-2.5 py-1 rounded-full text-[10px] font-black transition-all"
          style={{
            background: playing ? '#f59e0b22' : '#22c55e22',
            color: playing ? '#f59e0b' : '#22c55e',
            border: `1px solid ${playing ? '#f59e0b44' : '#22c55e44'}`,
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>
      )}
      {onSpeedChange && speed !== undefined && (
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-500 font-bold">×</span>
          <input
            type="range" min="0.3" max="3" step="0.1" value={speed}
            onChange={e => onSpeedChange(Number(e.target.value))}
            className="w-16 accent-violet-500 cursor-pointer"
          />
          <span className="text-[9px] text-violet-400 font-black w-5">{speed.toFixed(1)}</span>
        </div>
      )}
      {extraControls}
    </div>
  </div>
);
