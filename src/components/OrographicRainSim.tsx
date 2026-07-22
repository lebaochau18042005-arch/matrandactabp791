import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'overview',  label: '🖼️ Tổng quan',      color: '#0ea5e9' },
  { id: 'windward',  label: '🌧️ Sườn đón gió',   color: '#6366f1' },
  { id: 'leeward',   label: '☀️ Sườn khuất gió', color: '#f59e0b' },
];

// ─── Quiz questions ───────────────────────────────────────────────────────────
const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  overview: [
    { id: 'or1', hint: 'Mưa địa hình hình thành khi không khí ẩm bị buộc dâng lên do', answer: 'Núi chắn gió', options: ['Núi chắn gió', 'Biển sâu', 'Rừng rậm', 'Nhiệt độ cao'] },
    { id: 'or2', hint: 'Không khí khi dâng lên cao sẽ', answer: 'Lạnh đi và ngưng tụ thành mây mưa', options: ['Lạnh đi và ngưng tụ thành mây mưa', 'Nóng lên và khô đi', 'Giữ nguyên nhiệt độ', 'Bay thẳng ra ngoài khí quyển'] },
  ],
  windward: [
    { id: 'or3', hint: 'Sườn đón gió mưa nhiều vì không khí dâng lên và', answer: 'Ngưng tụ hơi nước thành mưa', options: ['Ngưng tụ hơi nước thành mưa', 'Gió mạnh hơn', 'Biển gần hơn', 'Nhiệt độ thấp hơn'] },
  ],
  leeward: [
    { id: 'or4', hint: 'Sườn khuất gió khô hạn vì không khí xuống dốc bị', answer: 'Nóng lên và mất hơi ẩm', options: ['Nóng lên và mất hơi ẩm', 'Lạnh đi và mưa nhiều', 'Bay hơi nhanh', 'Ngưng tụ lại'] },
    { id: 'or5', hint: 'Hiện tượng sườn khuất gió khô hạn còn gọi là hiệu ứng', answer: 'Foehn', options: ['Foehn', 'El Niño', 'La Niña', 'Coriolis'] },
  ],
};

const ALL_QUESTIONS = Object.values(TAB_QUESTIONS).flat();

// ─── Rain drop particles ──────────────────────────────────────────────────────
const RAIN_DROPS = Array.from({ length: 48 }, (_, i) => ({
  x: 0.28 + (i % 8) * 0.028,
  y: (i * 0.073 + 0.15) % 0.85,
  speed: 0.005 + (i % 4) * 0.002,
  len: 0.012 + (i % 3) * 0.006,
}));

// ─── Moisture particles ───────────────────────────────────────────────────────
const MOISTURE = Array.from({ length: 30 }, (_, i) => ({
  px: 0.18 + (i % 6) * 0.022,
  py: (i * 0.09 + 0.5) % 0.9,
  speed: 0.003 + (i % 3) * 0.001,
  size: 2 + (i % 3),
}));

// ─── Draw scene ──────────────────────────────────────────────────────────────
function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  frame: number,
  tab: string,
  playing: boolean,
  params: {
    tempBaseWindward?: number;
    tempPeak?: number;
    tempBaseLeeward?: number;
    mountainName?: string;
  } = {}
) {
  const tempBaseWindward = params.tempBaseWindward !== undefined ? params.tempBaseWindward : 28;
  const tempPeak = params.tempPeak !== undefined ? params.tempPeak : 16;
  const tempBaseLeeward = params.tempBaseLeeward !== undefined ? params.tempBaseLeeward : 36;
  const mountainName = params.mountainName || 'Trường Sơn';

  const ground = H * 0.72;   // ground level y
  const peakX  = W * 0.52;   // mountain peak x
  const peakY  = H * 0.16;   // mountain peak y
  const mBase  = H * 0.72;   // mountain base y
  const mLeft  = W * 0.28;   // mountain left base
  const mRight = W * 0.76;   // mountain right base
  const oceanEdge = W * 0.18;

  // ── Sky gradient ──────────────────────────────────────────────────────────
  const skyGrad = ctx.createLinearGradient(0, 0, 0, ground);
  if (tab === 'leeward') {
    skyGrad.addColorStop(0, '#1a4a6b');
    skyGrad.addColorStop(1, '#87ceeb');
  } else {
    skyGrad.addColorStop(0, '#0369a1');
    skyGrad.addColorStop(0.5, '#38bdf8');
    skyGrad.addColorStop(1, '#bae6fd');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Ocean ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(0, ground, oceanEdge + 10, H - ground);
  const waveGrad = ctx.createLinearGradient(0, 0, 0, H);
  waveGrad.addColorStop(0, '#0369a1');
  waveGrad.addColorStop(1, '#082f49');
  ctx.fillStyle = waveGrad;
  ctx.beginPath();
  ctx.moveTo(0, ground);
  for (let wx = 0; wx <= oceanEdge + 10; wx += 8) {
    const woff = Math.sin((wx * 0.1) + frame * 0.05) * 3;
    ctx.lineTo(wx, ground + woff);
  }
  ctx.lineTo(oceanEdge + 10, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Wave lines
  ctx.strokeStyle = 'rgba(147,210,235,0.6)';
  ctx.lineWidth = 1.5;
  for (let wy = 1; wy <= 3; wy++) {
    ctx.beginPath();
    for (let wx = 0; wx <= oceanEdge; wx += 6) {
      const woy = ground - wy * 18 + Math.sin((wx * 0.15) + frame * 0.06 + wy) * 4;
      if (wx === 0) ctx.moveTo(wx, woy); else ctx.lineTo(wx, woy);
    }
    ctx.stroke();
  }

  // ── Coastal plain ─────────────────────────────────────────────────────────
  ctx.fillStyle = tab === 'windward' ? '#4ade80' : '#22c55e';
  ctx.beginPath();
  ctx.moveTo(oceanEdge, ground);
  ctx.lineTo(mLeft, ground);
  ctx.lineTo(mLeft, H);
  ctx.lineTo(oceanEdge, H);
  ctx.closePath();
  ctx.fill();

  // ── Mountain shape ────────────────────────────────────────────────────────
  // Windward (left) slope — green
  const wSlope = ctx.createLinearGradient(mLeft, mBase, peakX, peakY);
  wSlope.addColorStop(0, tab === 'windward' ? '#16a34a' : '#15803d');
  wSlope.addColorStop(1, '#6b7280');
  ctx.fillStyle = wSlope;
  ctx.beginPath();
  ctx.moveTo(mLeft, mBase);
  ctx.lineTo(peakX, peakY);
  ctx.lineTo(peakX, mBase);
  ctx.closePath();
  ctx.fill();

  // Leeward (right) slope — brown/tan
  const lSlope = ctx.createLinearGradient(peakX, peakY, mRight, mBase);
  lSlope.addColorStop(0, '#78716c');
  lSlope.addColorStop(1, tab === 'leeward' ? '#d97706' : '#92400e');
  ctx.fillStyle = lSlope;
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(mRight, mBase);
  ctx.lineTo(peakX, mBase);
  ctx.closePath();
  ctx.fill();

  // Snow cap
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(peakX - W * 0.035, peakY + H * 0.06);
  ctx.lineTo(peakX + W * 0.025, peakY + H * 0.055);
  ctx.closePath();
  ctx.fill();

  // ── Ground plains ─────────────────────────────────────────────────────────
  // Right plain (leeward) — dry/desert
  const rPlain = ctx.createLinearGradient(mRight, 0, W, 0);
  rPlain.addColorStop(0, tab === 'leeward' ? '#d97706' : '#b45309');
  rPlain.addColorStop(1, tab === 'leeward' ? '#f59e0b' : '#d97706');
  ctx.fillStyle = rPlain;
  ctx.fillRect(mRight, ground, W - mRight, H - ground);

  // Desert cracks/texture
  if (tab === 'leeward' || tab === 'overview') {
    ctx.strokeStyle = 'rgba(180,100,20,0.4)';
    ctx.lineWidth = 1;
    for (let ci = 0; ci < 6; ci++) {
      const cx2 = mRight + (W - mRight) * ((ci * 0.17 + 0.05) % 1);
      const cy2 = ground + (H - ground) * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx2, cy2);
      ctx.lineTo(cx2 + 12, cy2 + 15);
      ctx.lineTo(cx2 + 5, cy2 + 30);
      ctx.stroke();
    }
  }

  // ── Wind arrows (horizontal, approaching mountain) ─────────────────────────
  if (tab === 'overview' || tab === 'windward') {
    const arrowCount = 4;
    for (let ai = 0; ai < arrowCount; ai++) {
      const arrowY = H * (0.25 + ai * 0.1);
      const progress = ((frame * 0.012 + ai * 0.25) % 1);
      const maxX = mLeft - W * 0.02;
      const arrowX = oceanEdge + (maxX - oceanEdge) * progress;

      ctx.strokeStyle = 'rgba(186,230,253,0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(Math.min(arrowX + W * 0.07, maxX), arrowY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head
      if (arrowX + W * 0.07 < maxX) {
        const hx = arrowX + W * 0.07;
        ctx.fillStyle = 'rgba(186,230,253,0.9)';
        ctx.beginPath();
        ctx.moveTo(hx, arrowY);
        ctx.lineTo(hx - 8, arrowY - 5);
        ctx.lineTo(hx - 8, arrowY + 5);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // ── Moisture particles (rising up windward slope) ─────────────────────────
  if (tab === 'overview' || tab === 'windward') {
    MOISTURE.forEach(m => {
      const prog = (m.py - frame * m.speed * 0.5 + 10) % 1;
      // Map to windward slope
      const slopeT = 1 - prog;
      const px = mLeft + (peakX - mLeft) * slopeT * 0.9 + W * m.px * 0.05;
      const py = mBase - (mBase - peakY) * slopeT * 0.85;
      if (py > peakY && px > mLeft && px < peakX + 20) {
        const alpha = 0.4 + slopeT * 0.5;
        ctx.fillStyle = `rgba(147,210,235,${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, m.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // ── Clouds near peak (windward side) ─────────────────────────────────────
  if (tab === 'overview' || tab === 'windward') {
    const cloudX = peakX - W * 0.1;
    const cloudY = peakY + H * 0.08 + Math.sin(frame * 0.02) * 4;
    const cloudScale = tab === 'windward' ? 1.4 : 1;
    drawCloud(ctx, cloudX, cloudY, W * 0.065 * cloudScale, H * 0.045 * cloudScale, 0.92);
    drawCloud(ctx, cloudX - W * 0.07, cloudY + H * 0.04, W * 0.05 * cloudScale, H * 0.035 * cloudScale, 0.75);
    drawCloud(ctx, cloudX + W * 0.04, cloudY + H * 0.055, W * 0.04 * cloudScale, H * 0.03 * cloudScale, 0.65);
  }

  // ── Rain drops (windward slope) ───────────────────────────────────────────
  if (tab === 'overview' || tab === 'windward') {
    RAIN_DROPS.forEach(d => {
      const progY = (d.y + frame * d.speed) % 0.95;
      const dropX = d.x * W;
      const dropY = peakY + H * 0.12 + progY * (mBase - peakY - H * 0.12);
      if (dropX > mLeft - 10 && dropX < peakX + 10 && dropY < mBase) {
        ctx.strokeStyle = tab === 'windward' ? 'rgba(56,189,248,0.9)' : 'rgba(56,189,248,0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dropX, dropY);
        ctx.lineTo(dropX - 2, dropY + d.len * H);
        ctx.stroke();
      }
    });
  }

  // ── Dry descending air arrows (leeward side) ──────────────────────────────
  if (tab === 'overview' || tab === 'leeward') {
    const descCount = 4;
    for (let di = 0; di < descCount; di++) {
      const prog = ((frame * 0.01 + di * 0.25) % 1);
      const startX = peakX + W * 0.04 + di * W * 0.04;
      const arrowY = peakY + H * 0.06 + prog * (mBase - peakY - H * 0.12);
      const arrowX = startX + (mRight - peakX) * prog * 0.6;
      if (arrowX < mRight && arrowY < mBase) {
        ctx.strokeStyle = tab === 'leeward' ? 'rgba(251,146,60,0.95)' : 'rgba(251,146,60,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + 6, arrowY + 14);
        ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(arrowX + 6, arrowY + 14);
        ctx.lineTo(arrowX + 1, arrowY + 9);
        ctx.lineTo(arrowX + 11, arrowY + 9);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // ── Labels ────────────────────────────────────────────────────────────────
  ctx.font = `bold ${Math.max(10, W * 0.018)}px 'Inter', sans-serif`;

  // Ocean label
  drawLabel(ctx, 'Biển', oceanEdge * 0.5, ground - H * 0.08, '#93c5fd', 'rgba(7,89,133,0.7)');

  // Windward label
  if (tab === 'overview' || tab === 'windward') {
    drawLabel(ctx, `Sườn đón gió (${tempBaseWindward}°C)`, (mLeft + peakX) * 0.48, ground + H * 0.03, '#86efac', 'rgba(20,83,45,0.75)');
    drawLabel(ctx, 'Mây & Mưa 🌧️', peakX - W * 0.13, peakY + H * 0.18, '#bae6fd', 'rgba(7,89,133,0.7)');
  }

  // Gió label
  if (tab === 'overview' || tab === 'windward') {
    drawLabel(ctx, '💨 Gió ẩm từ biển', oceanEdge + W * 0.02, H * 0.3, '#e0f2fe', 'rgba(7,89,133,0.6)');
  }

  // Leeward label
  if (tab === 'overview' || tab === 'leeward') {
    drawLabel(ctx, `Sườn khuất gió (${tempBaseLeeward}°C)`, (peakX + mRight + W) * 0.38, ground + H * 0.03, '#fde68a', 'rgba(120,53,15,0.75)');
    drawLabel(ctx, '🔥 Không khí khô', (mRight + W) * 0.47, H * 0.35, '#fed7aa', 'rgba(120,53,15,0.65)');
    drawLabel(ctx, 'Vùng bóng mưa', (mRight + W) * 0.47, ground - H * 0.08, '#fbbf24', 'rgba(120,53,15,0.7)');
  }

  // Mountain peak label
  drawLabel(ctx, `⛰️ Đỉnh ${mountainName} (${tempPeak}°C)`, peakX + W * 0.02, peakY - H * 0.04, '#f1f5f9', 'rgba(30,41,59,0.6)');
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#e2e8f0';
  for (let ci = -1; ci <= 1; ci++) {
    ctx.beginPath();
    ctx.ellipse(cx + ci * rx * 0.55, cy + Math.abs(ci) * ry * 0.2, rx * (1 - Math.abs(ci) * 0.25), ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(cx, cy - ry * 0.3, rx * 0.7, ry * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, bg: string) {
  ctx.save();
  const metrics = ctx.measureText(text);
  const pw = metrics.width + 12, ph = 20;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x - pw / 2, y - ph / 2, pw, ph, 5);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ─── Main Component ───────────────────────────────────────────────────────────
// ─── Main Component ───────────────────────────────────────────────────────────
interface OrographicRainSimProps {
  customParams?: {
    tempBaseWindward?: number;
    tempPeak?: number;
    tempBaseLeeward?: number;
    mountainName?: string;
  };
  customQuestions?: Array<{ id: string; hint: string; answer: string; options: string[] }>;
}

const OrographicRainSim: React.FC<OrographicRainSimProps> = ({ customParams = {}, customQuestions }) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const activeRef  = useRef(true);
  const playRef    = useRef(true);
  const speedRef   = useRef(1);
  const tabRef     = useRef('overview');
  const frameRef   = useRef(0);
  const paramsRef  = useRef(customParams);

  const [playing, setPlaying]       = useState(true);
  const [speed, setSpeed]           = useState(1);
  const [tab, setTab]               = useState('overview');
  const [activityOpen, setActivityOpen] = useState(false);

  useEffect(() => { playRef.current  = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed;   }, [speed]);
  useEffect(() => { tabRef.current   = tab;     }, [tab]);
  useEffect(() => { paramsRef.current = customParams; }, [customParams]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth  || canvas.parentElement?.clientWidth  || 700;
      const h = canvas.offsetHeight || canvas.parentElement?.clientHeight || 420;
      if (w === 0 || h === 0) return;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      const c = canvas.getContext('2d');
      if (c) c.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const retryTimer = setTimeout(resize, 80);

    const loop = () => {
      if (!activeRef.current) return;
      if (playRef.current) frameRef.current += speedRef.current;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width  / dpr;
      const H = canvas.height / dpr;
      if (W > 0 && H > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
          drawScene(ctx, W, H, frameRef.current, tabRef.current, playRef.current, paramsRef.current);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(retryTimer);
      ro.disconnect();
    };
  }, []);

  const questions = customQuestions && customQuestions.length > 0
    ? customQuestions
    : (TAB_QUESTIONS[tab] || ALL_QUESTIONS);

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden select-none"
         style={{ background: '#0c1a2e', fontFamily: "'Inter', sans-serif" }}>
      <SimTopBar
        title="Mưa địa hình"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        <SimActivity
          title="Câu hỏi mưa địa hình"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor="#0ea5e9"
        />

        {/* Legend */}
        <div className="absolute top-2 right-2 z-10 rounded-xl p-2.5 text-[9px] font-bold space-y-1.5"
             style={{ background: 'rgba(7,15,30,0.82)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
          <div className="text-slate-300 font-black text-[10px] mb-1">Chú giải</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-2 rounded" style={{ background: '#38bdf8' }} /><span className="text-slate-300">Mưa</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-2 rounded" style={{ background: '#93c5fd' }} /><span className="text-slate-300">Hơi ẩm</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-2 rounded" style={{ background: '#fb923c' }} /><span className="text-slate-300">Khí khô</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-2 rounded" style={{ background: '#86efac' }} /><span className="text-slate-300">Đón gió (ẩm)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-2 rounded" style={{ background: '#d97706' }} /><span className="text-slate-300">Khuất gió (khô)</span></div>
        </div>
      </div>

      <SimTabs tabs={TABS} active={tab} onChange={t => setTab(t)} />
    </div>
  );
};

export default OrographicRainSim;
