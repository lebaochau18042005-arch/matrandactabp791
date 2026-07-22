import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'overview',  label: '🌐 Tổng quan',      color: '#0ea5e9' },
  { id: 'crust',     label: '🟤 Vỏ Trái Đất',    color: '#84cc16' },
  { id: 'mantle',    label: '🔴 Lớp Man-ti',      color: '#f97316' },
  { id: 'outer',     label: '🟡 Nhân ngoài',      color: '#eab308' },
  { id: 'inner',     label: '⚪ Nhân trong',      color: '#e2e8f0' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'chiếm ~84% thể tích Trái Đất',
    answer: 'Man-ti',
    options: ['Man-ti', 'Vỏ Trái Đất', 'Nhân trong', 'Nhân ngoài'],
  },
  {
    id: 'q2',
    hint: 'tạo ra từ trường bảo vệ Trái Đất',
    answer: 'Nhân ngoài',
    options: ['Man-ti', 'Nhân ngoài', 'Nhân trong', 'Vỏ Trái Đất'],
  },
  {
    id: 'q3',
    hint: 'ở thể lỏng, nhiệt độ ~4 000 – 5 000°C',
    answer: 'Nhân ngoài',
    options: ['Man-ti', 'Nhân trong', 'Nhân ngoài', 'Lõi'],
  },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  overview: ALL_QUESTIONS,
  crust: [
    { id: 'c1', hint: 'độ dày trung bình của vỏ lục địa', answer: '35 km', options: ['35 km', '70 km', '5 km', '100 km'] },
    { id: 'c2', hint: 'loại đá chủ yếu trong vỏ lục địa', answer: 'Granit', options: ['Granit', 'Bazan', 'Đá vôi', 'Đá phiến'] },
  ],
  mantle: [
    { id: 'm1', hint: 'trạng thái của Man-ti trên', answer: 'Quánh dẻo', options: ['Quánh dẻo', 'Lỏng', 'Rắn', 'Khí'] },
    { id: 'm2', hint: 'dòng đối lưu Man-ti là nguyên nhân gây ra', answer: 'Kiến tạo mảng', options: ['Kiến tạo mảng', 'Sóng thần', 'Bão', 'Động đất sóng'] },
  ],
  outer: [
    { id: 'o1', hint: 'thể vật chất của nhân ngoài', answer: 'Lỏng', options: ['Lỏng', 'Rắn', 'Khí', 'Plasma'] },
    { id: 'o2', hint: 'chuyển động của nhân ngoài tạo ra', answer: 'Từ trường', options: ['Từ trường', 'Trọng lực', 'Nhiệt', 'Ánh sáng'] },
  ],
  inner: [
    { id: 'i1', hint: 'thể vật chất của nhân trong', answer: 'Rắn', options: ['Rắn', 'Lỏng', 'Khí', 'Quánh dẻo'] },
    { id: 'i2', hint: 'nhiệt độ ở nhân trong', answer: '~5 000°C', options: ['~5 000°C', '~1 000°C', '~500°C', '~10 000°C'] },
  ],
};

// ─── Layer info panels ────────────────────────────────────────────────────────
const LAYER_INFO: Record<string, { name: string; thick: string; temp: string; state: string; color: string; note: string }> = {
  crust: {
    name: 'Vỏ Trái Đất',
    thick: '5 – 70 km',
    temp: '0 – 1 200°C',
    state: 'Rắn',
    color: '#22c55e',
    note: 'Lục địa: Granit | Đại dương: Bazan',
  },
  mantle: {
    name: 'Lớp Man-ti',
    thick: '2 900 km',
    temp: '1 200 – 3 700°C',
    state: 'Quánh dẻo (trên) / Rắn (dưới)',
    color: '#f97316',
    note: 'Nguồn gốc magma, kiến tạo mảng',
  },
  outer: {
    name: 'Nhân ngoài',
    thick: '2 200 km',
    temp: '4 000 – 5 000°C',
    state: 'Lỏng',
    color: '#eab308',
    note: 'Tạo ra từ trường bảo vệ Trái Đất',
  },
  inner: {
    name: 'Nhân trong',
    thick: '1 200 km',
    temp: '~5 000°C',
    state: 'Rắn',
    color: '#f8fafc',
    note: 'Chủ yếu là sắt và niken, áp suất cực lớn',
  },
};

// ─── Canvas drawing function ───────────────────────────────────────────────────
function drawEarth(
  canvas: HTMLCanvasElement,
  tab: string,
  activeLayer: string | null,
  frame: number,
  sliceAngle: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) * 0.4;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#06090f';
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.3 * Math.abs(Math.sin(i * 7.3 + frame * 0.005))})`;
    ctx.beginPath();
    ctx.arc(
      (Math.sin(i * 4723) * 0.5 + 0.5) * W,
      (Math.cos(i * 9182) * 0.5 + 0.5) * H,
      0.7, 0, Math.PI * 2
    );
    ctx.fill();
  }

  // Determine slice
  const sliceRad = (sliceAngle * Math.PI) / 180;
  const doSlice = tab !== 'overview' || sliceAngle > 5;
  const startAngle = -Math.PI / 2 - sliceRad / 2;
  const endAngle = -Math.PI / 2 + sliceRad / 2;

  const highlight = (layer: string) =>
    activeLayer === layer ||
    (tab === layer) ||
    (tab === 'overview' && activeLayer === layer);

  // Draw full sphere then cut slice
  const drawLayer = (r: number, color: string | CanvasGradient, layerKey: string) => {
    const isHL = highlight(layerKey);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (isHL) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  };

  // Mantle glow
  const mantleGrad = ctx.createRadialGradient(cx, cy, R * 0.45, cx, cy, R * 0.88);
  mantleGrad.addColorStop(0, '#f97316');
  mantleGrad.addColorStop(0.6, '#dc2626');
  mantleGrad.addColorStop(1, '#7f1d1d');

  // Outer core
  const outerGrad = ctx.createRadialGradient(cx, cy, R * 0.22, cx, cy, R * 0.45);
  outerGrad.addColorStop(0, '#fde047');
  outerGrad.addColorStop(1, '#f59e0b');

  // Inner core
  const innerGrad = ctx.createRadialGradient(cx - R * 0.05, cy - R * 0.05, 0, cx, cy, R * 0.22);
  innerGrad.addColorStop(0, '#ffffff');
  innerGrad.addColorStop(0.4, '#fef9c3');
  innerGrad.addColorStop(1, '#fde047');

  // Draw all layers (back to front)
  drawLayer(R, mantleGrad, 'mantle');
  drawLayer(R * 0.45, outerGrad, 'outer');
  drawLayer(R * 0.22, innerGrad, 'inner');

  // Animated magma flow lines in mantle
  if (tab === 'mantle' || tab === 'overview') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.87, 0, Math.PI * 2);
    ctx.arc(cx, cy, R * 0.46, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.strokeStyle = 'rgba(254,215,170,0.2)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + frame * 0.003;
      const r = R * (0.55 + 0.15 * Math.sin(frame * 0.02 + i));
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle, angle + 0.6);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Crust (surface globe)
  // Ocean
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  const oceanGrad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
  oceanGrad.addColorStop(0, '#1e4d7a');
  oceanGrad.addColorStop(0.6, '#0c2f5a');
  oceanGrad.addColorStop(1, '#071a35');
  ctx.fillStyle = oceanGrad;
  ctx.fill();

  // Continents
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  const earthRot = frame * 0.004;
  const drawContinent = (pts: [number, number][], col: string) => {
    ctx.beginPath();
    pts.forEach(([la, lo], i) => {
      const lat = (la * Math.PI) / 180;
      const lon = (lo * Math.PI) / 180 + earthRot;
      const x = cx + R * Math.cos(lat) * Math.sin(lon);
      const y = cy - R * Math.sin(lat);
      const z = R * Math.cos(lat) * Math.cos(lon);
      if (z > 0) {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  };

  drawContinent(
    [[37,-5],[45,7],[55,18],[65,30],[55,45],[45,40],[35,30],[22,15],[10,15],[-5,12],[-20,18],[-34,26],[-25,37],[-10,42],[5,45],[15,42],[25,35],[37,-5]],
    'rgba(34,197,94,0.75)'
  );
  drawContinent(
    [[50,-125],[60,-100],[55,-80],[45,-75],[35,-80],[20,-90],[10,-80],[-5,-75],[-15,-70],[-35,-60],[-55,-70],[-40,-70],[-20,-45],[5,-55],[20,-80],[35,-90],[50,-125]],
    'rgba(22,163,74,0.7)'
  );
  ctx.restore();

  // Crust highlight ring
  if (highlight('crust') || tab === 'crust') {
    ctx.save();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── Slice cross-section ──
  if (doSlice && sliceAngle > 8) {
    ctx.save();

    // Clip to slice wedge
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R * 1.05, startAngle, endAngle);
    ctx.closePath();
    ctx.clip();

    // Redraw layers in slice
    const sliceLayers = [
      { r: R, grad: mantleGrad, key: 'mantle' },
      { r: R * 0.45, grad: outerGrad, key: 'outer' },
      { r: R * 0.22, grad: innerGrad, key: 'inner' },
    ];

    sliceLayers.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, l.r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = l.grad;
      ctx.fill();
      if (highlight(l.key)) {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    ctx.restore();

    // Slice edge lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    [startAngle, endAngle].forEach(a => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.restore();

    // Layer labels in slice
    const midA = (startAngle + endAngle) / 2;
    const labels = [
      { r: R * 0.95, name: 'Vỏ', color: '#86efac', fontSize: 9 },
      { r: R * 0.65, name: 'Man-ti', color: '#fb923c', fontSize: 9 },
      { r: R * 0.33, name: 'Nhân ngoài', color: '#fde047', fontSize: 8 },
      { r: R * 0.1, name: 'Nhân trong', color: '#f8fafc', fontSize: 7 },
    ];
    labels.forEach(lb => {
      const lx = cx + lb.r * Math.cos(midA);
      const ly = cy + lb.r * Math.sin(midA);
      ctx.fillStyle = lb.color;
      ctx.font = `bold ${lb.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lb.name, lx, ly);
    });
  }

  // Atmosphere glow
  const atmosGlow = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.15);
  atmosGlow.addColorStop(0, 'rgba(56,189,248,0.3)');
  atmosGlow.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = atmosGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Main Component ────────────────────────────────────────────────────────────
const EarthLayersSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const stateRef = useRef({ frame: 0, active: true });

  const [tab, setTab] = useState('overview');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [sliceAngle, setSliceAngle] = useState(60);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(true);

  const tabRef = useRef(tab);
  const activeLayerRef = useRef(activeLayer);
  const sliceRef = useRef(sliceAngle);
  const playRef = useRef(playing);
  const speedRef = useRef(speed);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { activeLayerRef.current = activeLayer; }, [activeLayer]);
  useEffect(() => { sliceRef.current = sliceAngle; }, [sliceAngle]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Click handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width / dpr);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height / dpr);
      const cx = canvas.width / dpr / 2;
      const cy = canvas.height / dpr / 2;
      const R = Math.min(canvas.width / dpr, canvas.height / dpr) * 0.4;
      const dx = mx - cx, dy = my - cy;
      const r = Math.sqrt(dx * dx + dy * dy) / R;

      if (r > 1.05) { setActiveLayer(null); return; }
      if (r < 0.22) setActiveLayer('inner');
      else if (r < 0.45) setActiveLayer('outer');
      else if (r < 0.88) setActiveLayer('mantle');
      else setActiveLayer('crust');
    };

    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    s.active = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth || canvas.parentElement?.clientWidth || 600;
      const h = canvas.offsetHeight || canvas.parentElement?.clientHeight || 400;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const retryTimer = setTimeout(resize, 80);

    const loop = () => {
      if (!s.active) return;
      if (playRef.current) s.frame += 0.5 * speedRef.current;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      if (W > 0 && H > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const off = document.createElement('canvas');
          off.width = W; off.height = H;
          drawEarth(off, tabRef.current, activeLayerRef.current, s.frame, sliceRef.current);
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      s.active = false;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(retryTimer);
      ro.disconnect();
    };
  }, []);

  const currentLayer = activeLayer || (tab !== 'overview' ? tab : null);
  const info = currentLayer ? LAYER_INFO[currentLayer] : null;
  const questions = TAB_QUESTIONS[tab] || ALL_QUESTIONS;

  return (
    <div className="flex flex-col h-full bg-[#07091a] rounded-2xl overflow-hidden select-none" style={{ fontFamily: "'Inter',sans-serif" }}>
      <SimTopBar
        title="Cấu trúc bên trong Trái Đất"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
        extraControls={
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-500 font-bold">Lát cắt</span>
            <input type="range" min="0" max="180" value={sliceAngle}
              onChange={e => setSliceAngle(Number(e.target.value))}
              className="w-16 accent-orange-500 cursor-pointer" />
          </div>
        }
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" style={{ cursor: 'pointer' }} />

        <SimActivity
          title="Điền vào chỗ trống"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor="#ea580c"
        />

        {/* Layer info card */}
        {info && (
          <div className="absolute top-2 right-2 z-20 rounded-xl p-3 text-[10px] font-bold space-y-1"
            style={{ background: 'rgba(10,14,30,0.88)', border: `1px solid ${info.color}44`, backdropFilter: 'blur(8px)', minWidth: '150px' }}>
            <div className="font-black text-xs" style={{ color: info.color }}>{info.name}</div>
            <div className="text-slate-400">Độ dày: <span className="text-slate-200">{info.thick}</span></div>
            <div className="text-slate-400">Nhiệt độ: <span className="text-slate-200">{info.temp}</span></div>
            <div className="text-slate-400">Trạng thái: <span className="text-slate-200">{info.state}</span></div>
            <div className="text-slate-500 italic text-[9px] pt-1 border-t border-white/10">{info.note}</div>
          </div>
        )}

        {/* Click hint */}
        <div className="absolute bottom-2 right-2 text-[9px] text-slate-600 font-bold pointer-events-none">
          💡 Click vào lớp để xem thông số
        </div>
      </div>

      <SimTabs tabs={TABS} active={tab} onChange={t => { setTab(t); setActiveLayer(null); }} />
    </div>
  );
};

export default EarthLayersSim;
