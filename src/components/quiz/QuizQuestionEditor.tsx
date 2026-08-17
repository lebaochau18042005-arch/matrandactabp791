import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Save, X } from 'lucide-react';
import type { ValidationIssue } from '../../utils/examValidation';
import { withNormalizedTableData } from '../../utils/stimulusTable';

interface QuizQuestionEditorProps {
  question: any;
  validationIssues?: ValidationIssue[];
  onSave: (updatedQuestion: any) => void;
  onCancel: () => void;
}

export default function QuizQuestionEditor({ question, validationIssues = [], onSave, onCancel }: QuizQuestionEditorProps) {
  const [q, setQ] = useState(JSON.parse(JSON.stringify(question))); // Deep copy
  const [inputDataText, setInputDataText] = useState(() => (
    Object.entries(question.shortAnswer?.inputData || {})
      .map(([key, value]) => `${key} = ${String(value)}`)
      .join('\n')
  ));

  const parseInputData = (value: string) => value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string | number>>((result, line) => {
      const separatorIndex = line.search(/[:=]/);
      if (separatorIndex < 1) return result;

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      if (!key || !rawValue) return result;

      const normalizedNumber = rawValue.replace(/\s/g, '').replace(',', '.');
      const numericValue = Number(normalizedNumber);
      result[key] = Number.isFinite(numericValue) ? numericValue : rawValue;
      return result;
    }, {});

  const saveQuestion = () => {
    if (q.type !== 'short_answer') {
      onSave(q);
      return;
    }

    onSave({
      ...q,
      shortAnswer: {
        ...q.shortAnswer,
        inputData: parseInputData(inputDataText),
      },
    });
  };

  const handleBaseChange = (field: string, value: any) => {
    setQ((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStimulusChange = (field: string, value: string) => {
    setQ((prev: any) => ({
      ...prev,
      stimulus: (() => {
        const nextStimulus = {
          ...(prev.stimulus || { type: 'text', content: '' }),
          [field]: value,
        };

        if (field === 'content' || field === 'type') {
          const stimulusWithoutTableData = { ...nextStimulus };
          delete stimulusWithoutTableData.tableData;
          return withNormalizedTableData(stimulusWithoutTableData);
        }

        return nextStimulus;
      })()
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
          <button onClick={saveQuestion} className="px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-sm text-white flex items-center gap-1 font-medium">
            <Save size={14} /> Lưu lại
          </button>
        </div>
      </div>

      {validationIssues.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-200">
            <AlertTriangle size={16} /> Lỗi cần sửa trong câu này
          </div>
          <div className="space-y-2">
            {validationIssues.map(issue => (
              <div key={issue.id} className="rounded-md bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
                <span className={issue.severity === 'blocking' ? 'font-bold text-red-300' : 'font-bold text-amber-300'}>
                  {issue.severity === 'blocking' ? 'Bắt buộc' : 'Cảnh báo'}:
                </span>{' '}
                {issue.message}
                <div className="mt-1 text-slate-400">Gợi ý: {issue.suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-white/10 bg-slate-900/70 p-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Mức độ nhận thức</label>
            <select
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              value={q.level || 'Nhận biết'}
              onChange={(e) => handleBaseChange('level', e.target.value)}
            >
              <option>Nhận biết</option>
              <option>Thông hiểu</option>
              <option>Vận dụng</option>
              <option>Vận dụng cao</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Năng lực đặc thù</label>
            <select
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              value={q.competency || ''}
              onChange={(e) => handleBaseChange('competency', e.target.value)}
            >
              <option value="">Chọn năng lực</option>
              <option>Nhận thức khoa học địa lí</option>
              <option>Tìm hiểu địa lí</option>
              <option>Vận dụng kiến thức, kĩ năng đã học</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1 font-medium">Yêu cầu cần đạt</label>
            <textarea
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 min-h-[52px]"
              value={q.learningOutcome || ''}
              onChange={(e) => handleBaseChange('learningOutcome', e.target.value)}
              placeholder="YCCĐ cụ thể của bài học..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1 font-medium">Nguồn tài liệu / vị trí tham chiếu</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              value={q.sourceReference || ''}
              onChange={(e) => handleBaseChange('sourceReference', e.target.value)}
              placeholder="Ví dụ: SGK Địa lí 12 - Kết nối tri thức, Bài 1, trang..."
            />
          </div>
        </div>

        {/* Stimulus Edit */}
        <div className="rounded-lg border border-white/10 bg-slate-900/70 p-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Loại ngữ liệu</label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                value={q.stimulus?.type || 'none'}
                onChange={(e) => handleStimulusChange('type', e.target.value)}
              >
                <option value="none">Không có</option>
                <option value="text">Đoạn thông tin</option>
                <option value="table">Bảng số liệu</option>
                <option value="chart">Biểu đồ</option>
                <option value="map">Bản đồ/lược đồ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Đơn vị</label>
              <input
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                value={q.stimulus?.unit || ''}
                onChange={(e) => handleStimulusChange('unit', e.target.value)}
                placeholder="%, km, triệu người..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Nguồn ngữ liệu</label>
              <input
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                value={q.stimulus?.source || ''}
                onChange={(e) => handleStimulusChange('source', e.target.value)}
                placeholder="VD: Niên giám thống kê Việt Nam năm 2025"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Đường dẫn nguồn chính thức</label>
              <input
                type="url"
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                value={q.stimulus?.sourceUrl || ''}
                onChange={(e) => handleStimulusChange('sourceUrl', e.target.value)}
                placeholder="https://www.gso.gov.vn/..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Tên/số bảng hoặc mã chỉ tiêu</label>
              <input
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                value={q.stimulus?.sourceDataset || ''}
                onChange={(e) => handleStimulusChange('sourceDataset', e.target.value)}
                placeholder="Tên bảng NGTK; mã chỉ tiêu WDI; miền dữ liệu FAOSTAT"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Năm/giai đoạn dữ liệu</label>
              <input
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                value={q.stimulus?.dataYear || ''}
                onChange={(e) => handleStimulusChange('dataYear', e.target.value)}
                placeholder="2020; 2024 hoặc 2015–2024"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Ngày truy cập (World Bank/FAOSTAT)</label>
              <input
                type="date"
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                value={q.stimulus?.accessedAt || ''}
                onChange={(e) => handleStimulusChange('accessedAt', e.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Tên ngữ liệu/bảng/biểu đồ</label>
              <input
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                value={q.stimulus?.title || ''}
                onChange={(e) => handleStimulusChange('title', e.target.value)}
                placeholder="Tên bảng, biểu đồ hoặc đoạn thông tin..."
              />
            </div>
            {q.stimulus?.type === 'chart' && (
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1 font-medium">Loại biểu đồ</label>
                <select
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  value={q.stimulus?.chartType || ''}
                  onChange={(e) => handleStimulusChange('chartType', e.target.value)}
                >
                  <option value="">Chọn loại biểu đồ</option>
                  <option value="column">Cột</option>
                  <option value="bar">Thanh ngang</option>
                  <option value="line">Đường</option>
                  <option value="area">Miền</option>
                  <option value="pie">Tròn</option>
                  <option value="combined">Kết hợp</option>
                </select>
              </div>
            )}
          </div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">Đoạn thông tin / dữ liệu hàng-cột để vẽ bảng, biểu đồ</label>
          <textarea
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 min-h-[60px]"
            value={q.stimulus?.content || ''}
            onChange={(e) => handleStimulusChange('content', e.target.value)}
            placeholder={'Ví dụ:\nNăm | Dân số | GDP\n2020 | 97,6 | 271\n2024 | 101,3 | 476'}
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
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Dữ liệu đầu vào để đối chiếu phép tính</label>
              <textarea
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-purple-500 min-h-[88px]"
                value={inputDataText}
                onChange={(e) => setInputDataText(e.target.value)}
                placeholder={'Mỗi dòng một dữ kiện, ví dụ:\nDân số = 101.3\nDiện tích = 331344'}
              />
              <div className="mt-1 text-[11px] text-slate-500">Dùng dấu = hoặc : giữa tên dữ kiện và giá trị.</div>
            </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Công thức</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={q.shortAnswer?.formula || ''}
                  onChange={(e) => handleShortAnswerChange('formula', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Sai số cho phép</label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={q.shortAnswer?.tolerance ?? 0}
                  onChange={(e) => handleShortAnswerChange('tolerance', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Số ô tối đa</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={q.shortAnswer?.maxCharacters ?? 4}
                  onChange={(e) => handleShortAnswerChange('maxCharacters', parseInt(e.target.value, 10))}
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
              <label className="block text-xs text-slate-400 mb-1 font-medium">Định dạng đáp án</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500"
                value={q.shortAnswer?.answerFormat || 'Phiếu trả lời 4 ô, nhập số, không nhập đơn vị'}
                onChange={(e) => handleShortAnswerChange('answerFormat', e.target.value)}
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
