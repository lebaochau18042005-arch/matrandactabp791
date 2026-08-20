import React from 'react';
import { normalizeStimulusTable } from '../../utils/stimulusTable';

interface StimulusBlockProps {
  stimulus?: {
    type?: string;
    title?: string;
    content?: string;
    unit?: string;
    source?: string;
    chartType?: string;
    tableData?: any;
  };
  className?: string;
  textClassName?: string;
}

export default function StimulusBlock({ stimulus, className = '', textClassName = 'italic' }: StimulusBlockProps) {
  if (!stimulus || stimulus.type === 'none') return null;

  const table = normalizeStimulusTable(stimulus);
  const metaItems = [
    stimulus.unit ? `Đơn vị: ${stimulus.unit}` : '',
    stimulus.source ? `Nguồn: ${stimulus.source}` : '',
    stimulus.type === 'chart' && stimulus.chartType ? `Dạng biểu đồ: ${stimulus.chartType}` : '',
  ].filter(Boolean);

  return (
    <div className={`mb-4 bg-slate-950 p-3 rounded-lg border border-white/5 ${className}`}>
      {stimulus.title && (
        <div className="font-bold text-slate-400 text-xs mb-2">
          {stimulus.title}
        </div>
      )}

      {table ? (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full border-collapse text-left text-sm text-slate-200">
            <thead className="bg-slate-900/90 text-xs uppercase text-slate-400">
              <tr>
                {table.headers.map((header, index) => (
                  <th key={`${header}-${index}`} className="border-b border-white/10 px-3 py-2 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-slate-900/45 even:bg-slate-900/20">
                  {table.headers.map((header, colIndex) => (
                    <td key={`${header}-${rowIndex}-${colIndex}`} className="border-t border-white/5 px-3 py-2">
                      {row[colIndex]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={`whitespace-pre-line text-sm text-slate-300 ${textClassName}`}>
          {stimulus.content}
        </p>
      )}

      {metaItems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
          {metaItems.map(item => (
            <span key={item}>{item}</span>
          ))}
        </div>
      )}
    </div>
  );
}
