import React, { useState } from 'react';
import { CheckCircle2, Save, X } from 'lucide-react';

interface QuizQuestionEditorProps {
  question: any;
  onSave: (updatedQuestion: any) => void;
  onCancel: () => void;
}

export default function QuizQuestionEditor({ question, onSave, onCancel }: QuizQuestionEditorProps) {
  const [q, setQ] = useState(JSON.parse(JSON.stringify(question))); // Deep copy

  const handleStimulusChange = (field: string, value: string) => {
    setQ((prev: any) => ({
      ...prev,
      stimulus: {
        ...(prev.stimulus || { type: 'text', content: '' }),
        [field]: value,
      }
    }));
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...q.options];
    newOptions[index].text = text;
    setQ({ ...q, options: newOptions });
  };

  const handleStatementChange = (index: number, field: string, value: any) => {
    const newStatements = [...q.statements];
    newStatements[index][field] = value;
    setQ({ ...q, statements: newStatements });
  };

  const handleShortAnswerChange = (field: string, value: any) => {
    setQ((prev: any) => ({
      ...prev,
      shortAnswer: {
        ...prev.shortAnswer,
        [field]: value
      }
    }));
  };

  return (
    <div className="bg-slate-800 border border-teal-500/50 rounded-xl p-5 mb-4 shadow-xl">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="text-teal-400">✏️ Đang chỉnh sửa Câu hỏi</span>
        </h3>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-sm text-white flex items-center gap-1">
            <X size={14} /> Hủy
          </button>
          <button onClick={() => onSave(q)} className="px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-sm text-white flex items-center gap-1 font-medium">
            <Save size={14} /> Lưu lại
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Stimulus Edit */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">Đoạn thông tin / Ngữ liệu (Tuỳ chọn)</label>
          <textarea
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 min-h-[60px]"
            value={q.stimulus?.content || ''}
            onChange={(e) => handleStimulusChange('content', e.target.value)}
            placeholder="Nội dung ngữ liệu..."
          />
        </div>

        {/* Question Text Edit */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">Nội dung câu hỏi</label>
          <textarea
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 min-h-[60px]"
            value={q.question}
            onChange={(e) => setQ({ ...q, question: e.target.value })}
            placeholder="Nội dung câu hỏi..."
          />
        </div>

        {/* Multiple Choice Edit */}
        {q.type === 'multiple_choice' && (
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-medium">Các đáp án</label>
            <div className="space-y-2">
              {q.options?.map((opt: any, idx: number) => (
                <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${q.correctAnswer === opt.key ? 'border-teal-500 bg-teal-500/5' : 'border-white/10 bg-slate-900'}`}>
                  <button 
                    onClick={() => setQ({ ...q, correctAnswer: opt.key })}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${q.correctAnswer === opt.key ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                  >
                    {q.correctAnswer === opt.key ? <CheckCircle2 size={14} /> : opt.key}
                  </button>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Giải thích đáp án</label>
              <textarea
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
                value={q.explanation || ''}
                onChange={(e) => setQ({ ...q, explanation: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* True/False Edit */}
        {q.type === 'true_false' && (
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-medium">Các nhận định (Đúng/Sai)</label>
            <div className="space-y-3">
              {q.statements?.map((st: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg border border-white/10 bg-slate-900 space-y-2">
                  <div className="flex gap-2 items-start">
                    <span className="text-slate-500 font-bold mt-1">{st.label}.</span>
                    <textarea
                      className="flex-1 bg-transparent border-b border-white/10 hover:border-white/30 text-sm text-white focus:outline-none resize-none min-h-[40px]"
                      value={st.text}
                      onChange={(e) => handleStatementChange(idx, 'text', e.target.value)}
                    />
                    <button 
                      onClick={() => handleStatementChange(idx, 'answer', !st.answer)}
                      className={`px-3 py-1 rounded text-xs font-bold shrink-0 ${st.answer ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {st.answer ? 'ĐÚNG' : 'SAI'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-blue-400 mt-1">Giải thích:</span>
                    <input
                      className="flex-1 bg-transparent text-xs text-slate-400 focus:outline-none"
                      value={st.explanation || ''}
                      onChange={(e) => handleStatementChange(idx, 'explanation', e.target.value)}
                      placeholder="Giải thích vì sao đúng/sai..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Short Answer Edit */}
        {q.type === 'short_answer' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Đáp án chính xác</label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-purple-400 font-bold focus:outline-none focus:border-purple-500"
                  value={q.shortAnswer?.correctAnswer ?? ''}
                  onChange={(e) => handleShortAnswerChange('correctAnswer', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Đơn vị (ví dụ: %, km²)</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={q.shortAnswer?.unit || ''}
                  onChange={(e) => handleShortAnswerChange('unit', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Yêu cầu làm tròn</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500"
                value={q.shortAnswer?.rounding || ''}
                onChange={(e) => handleShortAnswerChange('rounding', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Lời giải / Công thức áp dụng</label>
              <textarea
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-purple-500 min-h-[80px]"
                value={q.shortAnswer?.solution || ''}
                onChange={(e) => handleShortAnswerChange('solution', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
