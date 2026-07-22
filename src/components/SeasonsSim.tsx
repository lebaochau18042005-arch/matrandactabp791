import React, { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'overview' | 'northern' | 'southern' | 'compare';

interface QuizQuestion {
  id: string;
  hint: string;
  answer: string;
  options: string[];
}

interface QuizState {
  selected: string | null;
  submitted: boolean;
  correct: boolean;
}

// ─── Quiz data ────────────────────────────────────────────────────────────────
const QUIZ: Record<TabId, QuizQuestion[]> = {
  overview: [
    {
      id: 's1',
      hint: 'Nguyên nhân chính tạo ra các mùa trong năm là do Trái Đất có',
      answer: 'Trục nghiêng',
      options: ['Trục nghiêng', 'Vòng quay quanh trục', 'Núi cao', 'Mặt Trăng'],
    },
    {
      id: 's2',
      hint: 'Thời gian Trái Đất chuyển động quanh Mặt Trời là',
      answer: '365 ngày 6 giờ',
      options: ['365 ngày 6 giờ', '24 giờ', '30 ngày', '360 ngày'],
    },
  ],
  northern: [
    {
      id: 's3',
      hint: 'Bán cầu Bắc có mùa hè khi nằm ở vị trí',
      answer: 'Gần Mặt Trời nhất (Hạ chí)',
      options: ['Gần Mặt Trời nhất (Hạ chí)', 'Xa Mặt Trời nhất (Đông chí)', 'Xuân phân', 'Thu phân'],
    },
  ],
  southern: [
    {
      id: 's4',
      hint: 'Khi bán cầu Bắc là mùa đông thì bán cầu Nam là mùa',
      answer: 'Hè',
      options: ['Hè', 'Đông', 'Xuân', 'Thu'],
    },
  ],
  compare: [
    {
      id: 's5',
      hint: 'Hai bán cầu có mùa trái ngược nhau vì',
      answer: 'Trục Trái Đất nghiêng cố định',
      options: ['Trục Trái Đất nghiêng cố định', 'Trái Đất quay nhanh', 'Mặt Trời di chuyển', 'Mặt Trăng kéo'],
    },
  ],
};

// ─── Season markers ───────────────────────────────────────────────────────────
// angle 0=right (Xuân phân), π/2=bottom (Hạ chí), π=left (Thu phân), 3π/2=top (Đông chí)
// Earth moves counterclockwise — we flip so top=Hạ chí by negating angle in render
const SEASON_MARKERS = [
  { angle: 0,                label: 'Xuân phân',  date: '~20/3',  color: '#86efac' },
  { angle: -Math.PI / 2,    label: 'Hạ chí',     date: '~21/6',  color: '#fde68a' },
  { angle: Math.PI,         label: 'Thu phân',   date: '~23/9',  color: '#fb923c' },
  { angle: Math.PI / 2,     label: 'Đông chí',   date: '~22/12', color: '#93c5fd' },
];

// ─── Canvas helpers ───────────────────────────────────────────────────────────
function drawStars(ctx: CanvasRenderingContext2D, W: number, H: number) {
  let s = 42;
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  ctx.save();
  for (let i = 0; i < 200; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const r = rng() * 1.5 + 0.2;
    const opacity = rng() * 0.7 + 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(2)})`;
    ctx.fill();
  }
  ctx.restore();
}

function drawSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, t: number) {
  // Glow halo
  const halo = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 2.4);
  halo.addColorStop(0, 'rgba(255,220,60,0.28)');
  halo.addColorStop(0.5, 'rgba(255,140,0,0.10)');
  halo.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, R * 2.4, 0, Math.PI * 2);
  ctx.fillStyle = halo;
  ctx.fill();

  // Corona rays (8 animated)
  const numRays = 8;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.25);
  for (let i = 0; i < numRays; i++) {
    const a = (i / numRays) * Math.PI * 2;
    const inner = R * 1.15;
    const outer = R * 1.6 + Math.sin(t * 1.8 + i * 0.9) * R * 0.1;
    const halfW = 0.13;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - halfW) * inner, Math.sin(a - halfW) * inner);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    ctx.lineTo(Math.cos(a + halfW) * inner, Math.sin(a + halfW) * inner);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,210,50,0.38)';
    ctx.fill();
  }
  ctx.restore();

  // Sun body
  const grad = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, R * 0.08, cx, cy, R);
  grad.addColorStop(0, '#fffde0');
  grad.addColorStop(0.25, '#ffe44d');
  grad.addColorStop(0.65, '#ff9900');
  grad.addColorStop(1, '#b84000');
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

function ellipsePoint(cx: number, cy: number, rx: number, ry: number, angle: number) {
  return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
}

function drawOrbitEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number,
  highlight?: { angle: number; color: string }[]
) {
  ctx.save();
  ctx.setLineDash([8, 10]);
  ctx.strokeStyle = 'rgba(148,163,184,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  if (highlight) {
    highlight.forEach(({ angle, color }) => {
      const span = Math.PI * 0.5;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.6;
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const a = angle - span / 2 + (i / steps) * span;
        const p = ellipsePoint(cx, cy, rx, ry, a);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }
  ctx.restore();
}

function drawRevolutionArrow(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number
) {
  // Draw a short arc near top-right, counterclockwise direction
  const a0 = -Math.PI * 0.22;
  const a1 = Math.PI * 0.22;
  ctx.save();
  ctx.strokeStyle = 'rgba(148,163,184,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const p = ellipsePoint(cx, cy, rx, ry, a);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // Arrowhead at start (a0) pointing counterclockwise
  const p0 = ellipsePoint(cx, cy, rx, ry, a0);
  // Tangent direction at a0 (counterclockwise = going from a0 toward more negative angle)
  const tangentAngle = Math.atan2(ry * Math.cos(a0), -rx * Math.sin(a0)) + Math.PI;
  ctx.save();
  ctx.translate(p0.x, p0.y);
  ctx.rotate(tangentAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-11, -5);
  ctx.lineTo(-11, 5);
  ctx.closePath();
  ctx.fillStyle = 'rgba(148,163,184,0.85)';
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawSeasonMarkers(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number
) {
  SEASON_MARKERS.forEach(({ angle, label, date, color }) => {
    const p = ellipsePoint(cx, cy, rx, ry, angle);
    // Dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label offset outward from center
    const ox = Math.cos(angle) * 50;
    const oy = Math.sin(angle) * 50;
    ctx.save();
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(label, p.x + ox, p.y + oy - 4);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(200,210,220,0.8)';
    ctx.fillText(date, p.x + ox, p.y + oy + 10);
    ctx.restore();
  });
}

function drawEarth(
  ctx: CanvasRenderingContext2D,
  ex: number, ey: number, R: number,
  orbitAngle: number,
  cx: number, cy: number,
  tab: TabId
) {
  const toSunAngle = Math.atan2(cy - ey, cx - ex);

  // Clip to earth circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(ex, ey, R, 0, Math.PI * 2);
  ctx.clip();

  // Night side (full circle fill)
  const nightGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, R);
  nightGrad.addColorStop(0, '#162840');
  nightGrad.addColorStop(1, '#080f1e');
  ctx.fillStyle = nightGrad;
  ctx.fillRect(ex - R - 1, ey - R - 1, R * 2 + 2, R * 2 + 2);

  // Day hemisphere (right semicircle rotated toward sun)
  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(toSunAngle);
  const dayGrad = ctx.createRadialGradient(-R * 0.18, 0, 0, 0, 0, R);
  dayGrad.addColorStop(0, '#a5d8ff');
  dayGrad.addColorStop(0.35, '#3b82f6');
  dayGrad.addColorStop(0.7, '#1d4ed8');
  dayGrad.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = dayGrad;
  ctx.beginPath();
  ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore(); // end clip

  // Outline
  ctx.beginPath();
  ctx.arc(ex, ey, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Atmosphere thin ring
  const atmoGrad = ctx.createRadialGradient(ex, ey, R * 0.92, ex, ey, R * 1.12);
  atmoGrad.addColorStop(0, 'rgba(99,179,237,0.18)');
  atmoGrad.addColorStop(1, 'rgba(99,179,237,0)');
  ctx.beginPath();
  ctx.arc(ex, ey, R * 1.12, 0, Math.PI * 2);
  ctx.fillStyle = atmoGrad;
  ctx.fill();

  // Tilted axis — fixed 23.5° tilt in canvas space (always same direction)
  const axisTilt = (23.5 * Math.PI) / 180;
  const axisDir = -Math.PI / 2 + axisTilt; // slightly right of up
  const axisLen = R * 1.6;
  const nx = ex + Math.cos(axisDir) * axisLen;
  const ny = ey + Math.sin(axisDir) * axisLen;
  const sx = ex - Math.cos(axisDir) * axisLen;
  const sy = ey - Math.sin(axisDir) * axisLen;

  ctx.save();
  ctx.strokeStyle = 'rgba(248,113,113,0.9)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(nx, ny);
  ctx.lineTo(sx, sy);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pole labels
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f87171';
  ctx.fillText('N', nx, ny - 5);
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('S', sx, sy + 12);
  ctx.restore();

  // Hemisphere season label
  const norm = ((orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // orbitAngle=-π/2 (top) = Hạ chí = BCB summer
  // norm around 3π/2 or equivalently near -π/2
  const northSummer = norm > Math.PI && norm < Math.PI * 2;

  if (tab === 'northern' || tab === 'compare') {
    ctx.save();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = northSummer ? '#fde68a' : '#93c5fd';
    ctx.textAlign = 'center';
    ctx.fillText(northSummer ? 'BCB: Hè ☀️' : 'BCB: Đông ❄️', ex, ey - R - 18);
    ctx.restore();
  }
  if (tab === 'southern' || tab === 'compare') {
    ctx.save();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = northSummer ? '#93c5fd' : '#fde68a';
    ctx.textAlign = 'center';
    ctx.fillText(northSummer ? 'BCN: Đông ❄️' : 'BCN: Hè ☀️', ex, ey + R + 18);
    ctx.restore();
  }
}

function drawHemispherePanel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  isNorth: boolean,
  hasSummer: boolean
) {
  ctx.save();
  // Panel bg
  const bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, hasSummer ? 'rgba(251,191,36,0.14)' : 'rgba(147,197,253,0.11)');
  bg.addColorStop(1, 'rgba(3,7,18,0.55)');
  ctx.fillStyle = bg;
  ctx.strokeStyle = hasSummer ? 'rgba(251,191,36,0.55)' : 'rgba(147,197,253,0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  (ctx as any).roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  const mx = x + w / 2;

  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(isNorth ? '🌍 Bán Cầu Bắc' : '🌎 Bán Cầu Nam', mx, y + 24);

  ctx.font = 'bold 20px Inter, sans-serif';
  ctx.fillStyle = hasSummer ? '#fde68a' : '#93c5fd';
  ctx.fillText(hasSummer ? '☀️ Mùa Hè' : '❄️ Mùa Đông', mx, y + 52);

  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = 'rgba(203,213,225,0.85)';
  const desc = hasSummer
    ? ['Nhận nhiều ánh sáng hơn', 'Ngày dài hơn đêm', 'Nhiệt độ cao']
    : ['Nhận ít ánh sáng hơn', 'Đêm dài hơn ngày', 'Nhiệt độ thấp'];
  desc.forEach((d, i) => ctx.fillText(d, mx, y + 70 + i * 16));

  ctx.restore();
}

function drawComparePanel(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  orbitAngle: number
) {
  const norm = ((orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const northSummer = norm > Math.PI && norm < Math.PI * 2;
  const panelW = W * 0.37;
  const panelH = H * 0.33;
  const py = H * 0.61;
  drawHemispherePanel(ctx, W * 0.05, py, panelW, panelH, true, northSummer);
  drawHemispherePanel(ctx, W * 0.56, py, panelW, panelH, false, !northSummer);
}

// ─── Main draw function ───────────────────────────────────────────────────────
function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  orbitAngle: number,
  tab: TabId,
  t: number
) {
  ctx.clearRect(0, 0, W, H);

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#020a1a');
  bg.addColorStop(0.5, '#030c20');
  bg.addColorStop(1, '#010510');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawStars(ctx, W, H);

  const cx = W / 2;
  const cy = tab === 'compare' ? H * 0.35 : H / 2;
  const minDim = Math.min(W, H);
  const R_sun = minDim * 0.078;
  const rx = W * 0.38;
  const ry = H * (tab === 'compare' ? 0.19 : 0.27);
  const R_earth = minDim * 0.052;

  // Orbit highlight arcs per tab
  let orbitHighlight: { angle: number; color: string }[] | undefined;
  if (tab === 'northern') {
    orbitHighlight = [{ angle: -Math.PI / 2, color: '#fde68a' }]; // Hạ chí (top)
  } else if (tab === 'southern') {
    orbitHighlight = [{ angle: Math.PI / 2, color: '#fde68a' }]; // Đông chí (bottom)
  }

  drawOrbitEllipse(ctx, cx, cy, rx, ry, orbitHighlight);
  drawSeasonMarkers(ctx, cx, cy, rx, ry);
  drawRevolutionArrow(ctx, cx, cy, rx, ry);
  drawSun(ctx, cx, cy, R_sun, t);

  // Earth position
  const ex = cx + rx * Math.cos(orbitAngle);
  const ey = cy + ry * Math.sin(orbitAngle);

  // Earth glow
  const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, R_earth * 2.8);
  eg.addColorStop(0, 'rgba(59,130,246,0.2)');
  eg.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.beginPath();
  ctx.arc(ex, ey, R_earth * 2.8, 0, Math.PI * 2);
  ctx.fillStyle = eg;
  ctx.fill();

  drawEarth(ctx, ex, ey, R_earth, orbitAngle, cx, cy, tab);

  if (tab === 'compare') {
    drawComparePanel(ctx, W, H, orbitAngle);
  }

  // Footer label
  ctx.save();
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = 'rgba(148,163,184,0.65)';
  ctx.textAlign = 'left';
  ctx.fillText('↺ Ngược chiều kim đồng hồ (nhìn từ cực Bắc)', 12, H - 10);
  ctx.restore();
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',  label: '🌍 Tổng quan' },
  { id: 'northern',  label: '🌞 Bán cầu Bắc' },
  { id: 'southern',  label: '❄️ Bán cầu Nam' },
  { id: 'compare',   label: '⚖️ So sánh' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const SeasonsSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabId>('overview');
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const orbitAngleRef = useRef(-Math.PI / 2);
  const animRef       = useRef<number>(0);
  const activeRef     = useRef(true);
  const tRef          = useRef(0);
  const tabRef        = useRef<TabId>('overview');
  const pausedRef     = useRef(false);
  const speedRef      = useRef(1);
  const [tick, setTick] = useState(0);
  const [quizStates, setQuizStates] = useState<Record<string, QuizState>>({});

  const handleAnswer = (id: string, opt: string, answer: string) => {
    setQuizStates(prev => ({
      ...prev,
      [id]: { selected: opt, submitted: true, correct: opt === answer },
    }));
  };

  // Keep refs in sync with state
  useEffect(() => { tabRef.current    = tab;    }, [tab]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { speedRef.current  = speed;  }, [speed]);

  // Stable animation loop — runs once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = true;
    let last = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth  || canvas.parentElement?.clientWidth  || 600;
      const h = canvas.offsetHeight || canvas.parentElement?.clientHeight || 400;
      if (w === 0 || h === 0) return;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      const c = canvas.getContext('2d');
      if (c) c.scale(dpr, dpr);
    };

    const obs = new ResizeObserver(resize);
    obs.observe(canvas);
    resize();
    const retryTimer = setTimeout(resize, 80);

    const loop = (ts: number) => {
      if (!activeRef.current) return;
      const dt = Math.min(ts - last, 80);
      last = ts;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width  / dpr;
      const H = canvas.height / dpr;

      if (W > 0 && H > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!pausedRef.current) {
            orbitAngleRef.current = (orbitAngleRef.current + (dt / 1000) * speedRef.current * 0.32) % (Math.PI * 2);
            tRef.current += dt / 1000;
            if (Math.floor(tRef.current * 10) % 3 === 0) setTick(n => n + 1);
          }
          drawScene(ctx, W, H, orbitAngleRef.current, tabRef.current, tRef.current);
        }
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(animRef.current);
      clearTimeout(retryTimer);
      obs.disconnect();
    };
  }, []); // runs once only

  // Current season badge
  const norm = ((orbitAngleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const distances = SEASON_MARKERS.map(m => {
    const ma = ((m.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let d = Math.abs(norm - ma);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d;
  });
  const nearestIdx = distances.indexOf(Math.min(...distances));
  const currentSeason = SEASON_MARKERS[nearestIdx];

  const s = styles;
  return (
    <div style={s.wrapper}>
      {/* Header */}
      <div style={s.header}>
        <h2 style={s.title}>🌍 Các Mùa Trong Năm</h2>
        <p style={s.subtitle}>
          Mô phỏng chuyển động của Trái Đất quanh Mặt Trời và sự hình thành các mùa
        </p>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            style={{ ...s.tabBtn, ...(tab === id ? s.tabActive : {}) }}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div style={s.canvasWrap}>
        <canvas ref={canvasRef} style={s.canvas} />
      </div>

      {/* Controls */}
      <div style={s.controls}>
        <button style={s.ctrlBtn} onClick={() => setPaused(p => !p)}>
          {paused ? '▶ Tiếp tục' : '⏸ Dừng'}
        </button>
        <div style={s.speedRow}>
          <span style={s.ctrlLabel}>Tốc độ:</span>
          {[0.5, 1, 2, 3].map(sp => (
            <button
              key={sp}
              style={{ ...s.speedBtn, ...(speed === sp ? s.speedActive : {}) }}
              onClick={() => setSpeed(sp)}
            >
              {sp}×
            </button>
          ))}
        </div>
        <div style={s.badge}>
          <span style={{ color: currentSeason?.color, fontWeight: 700, fontSize: 13 }}>
            {currentSeason?.label}
          </span>
          <span style={{ color: '#94a3b8', fontSize: 11, marginLeft: 5 }}>
            {currentSeason?.date}
          </span>
        </div>
      </div>

      {/* Info cards */}
      <div style={s.infoRow}>
        {[
          {
            icon: '🔴',
            title: 'Trục nghiêng 23,5°',
            desc: 'Trục Trái Đất nghiêng cố định so với mặt phẳng quỹ đạo, luôn hướng về cực Bắc thiên cầu.',
          },
          {
            icon: '🔵',
            title: 'Bán cầu Bắc',
            desc: 'Hạ chí (21/6): BCB hướng về Mặt Trời → Mùa Hè. Đông chí (22/12): BCB quay đi → Mùa Đông.',
          },
          {
            icon: '🟢',
            title: 'Bán cầu Nam',
            desc: 'Ngược hoàn toàn với BCB. Khi BCB là Hè, BCN là Đông và ngược lại.',
          },
        ].map(c => (
          <div key={c.title} style={s.infoCard}>
            <span style={s.infoIcon}>{c.icon}</span>
            <div>
              <div style={s.infoTitle}>{c.title}</div>
              <div style={s.infoDesc}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz */}
      <div style={s.quizWrap}>
        <h3 style={s.quizTitle}>📝 Câu hỏi kiểm tra</h3>
        {QUIZ[tab].map(q => {
          const qs = quizStates[q.id];
          return (
            <div key={q.id} style={s.quizCard}>
              <p style={s.quizHint}>{q.hint}</p>
              <div style={s.optRow}>
                {q.options.map(opt => {
                  let bs: React.CSSProperties = { ...s.optBtn };
                  if (qs?.submitted) {
                    if (opt === q.answer) bs = { ...bs, ...s.optCorrect };
                    else if (opt === qs.selected && !qs.correct) bs = { ...bs, ...s.optWrong };
                  } else if (qs?.selected === opt) {
                    bs = { ...bs, ...s.optSelected };
                  }
                  return (
                    <button
                      key={opt}
                      style={bs}
                      disabled={!!qs?.submitted}
                      onClick={() => handleAnswer(q.id, opt, q.answer)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {qs?.submitted && (
                <p style={{ ...s.quizResult, color: qs.correct ? '#4ade80' : '#f87171' }}>
                  {qs.correct ? '✅ Chính xác!' : `❌ Đáp án đúng: ${q.answer}`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: 'linear-gradient(140deg,#020c1e 0%,#0d1f40 55%,#020810 100%)',
    borderRadius: 22,
    padding: '24px 20px 30px',
    fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
    color: '#e2e8f0',
    maxWidth: 920,
    margin: '0 auto',
    boxShadow: '0 0 80px rgba(59,130,246,0.14), 0 8px 50px rgba(0,0,0,0.75)',
  },
  header: { textAlign: 'center', marginBottom: 20 },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    background: 'linear-gradient(100deg,#fde68a 0%,#fb923c 60%,#f97316 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  subtitle: { margin: '7px 0 0', fontSize: 13, color: '#94a3b8' },
  tabBar: {
    display: 'flex', gap: 8, marginBottom: 16,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  tabBtn: {
    padding: '8px 18px',
    borderRadius: 999,
    border: '1.5px solid rgba(100,116,139,0.38)',
    background: 'rgba(15,23,42,0.55)',
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  tabActive: {
    background: 'linear-gradient(135deg,#1e40af,#0e7490)',
    borderColor: '#3b82f6',
    color: '#fff',
    boxShadow: '0 0 18px rgba(59,130,246,0.45)',
  },
  canvasWrap: {
    width: '100%',
    aspectRatio: '2 / 1.12',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(59,130,246,0.22)',
    background: '#010a16',
    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.7)',
  },
  canvas: { width: '100%', height: '100%', display: 'block' },
  controls: {
    display: 'flex', alignItems: 'center', gap: 14,
    marginTop: 14, flexWrap: 'wrap', justifyContent: 'center',
  },
  ctrlBtn: {
    padding: '8px 22px', borderRadius: 9,
    border: '1px solid rgba(148,163,184,0.28)',
    background: 'rgba(30,41,59,0.75)',
    color: '#e2e8f0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  },
  speedRow: { display: 'flex', alignItems: 'center', gap: 6 },
  ctrlLabel: { fontSize: 12, color: '#94a3b8' },
  speedBtn: {
    padding: '5px 12px', borderRadius: 7,
    border: '1px solid rgba(100,116,139,0.32)',
    background: 'rgba(15,23,42,0.55)',
    color: '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  speedActive: {
    background: 'rgba(37,99,235,0.75)', borderColor: '#3b82f6', color: '#fff',
  },
  badge: {
    padding: '6px 15px', borderRadius: 999,
    background: 'rgba(15,23,42,0.65)',
    border: '1px solid rgba(100,116,139,0.28)',
    fontSize: 13, display: 'flex', alignItems: 'center',
  },
  infoRow: {
    display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap',
  },
  infoCard: {
    flex: 1, minWidth: 195,
    background: 'rgba(15,23,42,0.62)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 13, padding: '14px 15px',
    display: 'flex', gap: 11, alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 22, lineHeight: 1, marginTop: 2 },
  infoTitle: { fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 5 },
  infoDesc: { fontSize: 12, color: '#94a3b8', lineHeight: 1.55 },
  quizWrap: { marginTop: 26 },
  quizTitle: { fontSize: 16, fontWeight: 800, color: '#e2e8f0', marginBottom: 14 },
  quizCard: {
    background: 'rgba(15,23,42,0.58)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 13, padding: '16px 18px', marginBottom: 12,
  },
  quizHint: { fontSize: 14, color: '#e2e8f0', marginBottom: 13, fontWeight: 500, lineHeight: 1.5 },
  optRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  optBtn: {
    padding: '8px 16px', borderRadius: 9,
    border: '1.5px solid rgba(100,116,139,0.38)',
    background: 'rgba(30,41,59,0.65)',
    color: '#cbd5e1', fontSize: 13, cursor: 'pointer',
    transition: 'all 0.15s',
  },
  optSelected: {
    borderColor: '#3b82f6', background: 'rgba(37,99,235,0.32)', color: '#fff',
  },
  optCorrect: {
    borderColor: '#22c55e', background: 'rgba(34,197,94,0.22)', color: '#4ade80',
  },
  optWrong: {
    borderColor: '#ef4444', background: 'rgba(239,68,68,0.2)', color: '#f87171',
  },
  quizResult: { marginTop: 11, fontSize: 13, fontWeight: 700 },
};

export default SeasonsSim;
