import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { normalizeStimulusChart, normalizeStimulusTable } from '../../utils/stimulusTable';

interface StimulusBlockProps {
  stimulus?: {
    type?: string;
    title?: string;
    content?: string;
    unit?: string;
    source?: string;
    sourceUrl?: string;
    sourceDataset?: string;
    dataYear?: string;
    accessedAt?: string;
    chartType?: string;
    chartConfig?: Record<string, any>;
    tableData?: any;
  };
  className?: string;
  textClassName?: string;
}

const CHART_COLORS = ['#2dd4bf', '#60a5fa', '#c084fc', '#fbbf24', '#fb7185', '#34d399'];

const renderChart = (stimulus: NonNullable<StimulusBlockProps['stimulus']>) => {
  const chart = normalizeStimulusChart(stimulus);
  if (!chart) return null;

  const data = chart.categories.map((category, index) => ({
    category,
    ...chart.series.reduce<Record<string, number>>((row, series) => {
      row[series.name] = series.values[index];
      return row;
    }, {}),
  }));
  const chartType = (stimulus.chartType || stimulus.chartConfig?.type || 'column').toLowerCase();
  const common = (
    <>
      <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
      <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} />
      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
    </>
  );

  if (/pie|tròn/.test(chartType)) {
    const firstSeries = chart.series[0];
    const pieData = chart.categories.map((name, index) => ({ name, value: firstSeries.values[index] }));
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>
            {pieData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (/line|đường/.test(chartType)) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          {common}
          {chart.series.map((series, index) => (
            <Line key={series.name} type="monotone" dataKey={series.name} stroke={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (/area|miền/.test(chartType)) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          {common}
          {chart.series.map((series, index) => (
            <Area key={series.name} type="monotone" dataKey={series.name} stackId="1" stroke={CHART_COLORS[index % CHART_COLORS.length]} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.35} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (/combined|kết\s*hợp/.test(chartType)) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          {common}
          <Bar dataKey={chart.series[0].name} fill={CHART_COLORS[0]} />
          {chart.series.slice(1).map((series, index) => (
            <Line key={series.name} type="monotone" dataKey={series.name} stroke={CHART_COLORS[(index + 1) % CHART_COLORS.length]} strokeWidth={2} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (/^bar$|thanh/.test(chartType)) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 20, bottom: 8 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={72} />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {chart.series.map((series, index) => (
            <Bar key={series.name} dataKey={series.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
        {common}
        {chart.series.map((series, index) => (
          <Bar key={series.name} dataKey={series.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default function StimulusBlock({ stimulus, className = '', textClassName = 'italic' }: StimulusBlockProps) {
  if (!stimulus || stimulus.type === 'none') return null;

  const table = normalizeStimulusTable(stimulus);
  const chart = stimulus.type === 'chart' ? renderChart(stimulus) : null;
  const metaItems = [
    stimulus.unit ? `Đơn vị: ${stimulus.unit}` : '',
    stimulus.source ? `Nguồn: ${stimulus.source}` : '',
    stimulus.sourceDataset ? `Bảng/chỉ tiêu: ${stimulus.sourceDataset}` : '',
    stimulus.dataYear ? `Năm dữ liệu: ${stimulus.dataYear}` : '',
    stimulus.accessedAt ? `Ngày truy cập: ${stimulus.accessedAt}` : '',
    stimulus.type === 'chart' && stimulus.chartType ? `Dạng biểu đồ: ${stimulus.chartType}` : '',
  ].filter(Boolean);

  return (
    <div className={`mb-4 bg-slate-950 p-3 rounded-lg border border-white/5 ${className}`}>
      {stimulus.title && (
        <div className="font-bold text-slate-400 text-xs mb-2">
          {stimulus.title}
        </div>
      )}

      {chart ? (
        <div className="h-[280px] w-full rounded-lg border border-white/10 bg-slate-900/30 p-2">
          {chart}
        </div>
      ) : table ? (
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
      {stimulus.sourceUrl && (
        <a
          href={stimulus.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block break-all text-[11px] text-teal-400 hover:text-teal-300"
        >
          Kiểm tra nguồn chính thức: {stimulus.sourceUrl}
        </a>
      )}
    </div>
  );
}
