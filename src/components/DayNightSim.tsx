import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'overview',    label: '🌍 Tổng quan',              color: '#f59e0b' },
  { id: 'terminator', label: '🌓 Ranh giới ngày-đêm',      color: '#818cf8' },
  { id: 'rotation',   label: '🔄 Vòng quay',               color: '#34d399' },
];

// ─── Quiz questions ───────────────────────────────────────────────────────────
const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  overview: [
    {
      id: 'dn1',
      hint: 'Trái Đất tự quay quanh trục theo hướng',
      answer: 'Từ tây sang đông',
      options: ['Từ tây sang đông', 'Từ đông sang tây', 'Từ bắc xuống nam', 'Từ nam lên bắc'],
    },
    {
      id: 'dn2',
      hint: 'Thời gian Trái Đất tự quay một vòng quanh trục là',
      answer: '24 giờ',
      options: ['24 giờ', '12 giờ', '365 ngày', '1 tháng'],
    },
  ],
  terminator: [
    {
      id: 'dn3',
      hint: 'Ranh giới ngày đêm là đường phân chia giữa vùng',
      answer: 'Sáng và tối',
      options: ['Sáng và tối', 'Nóng và lạnh', 'Khô và ẩm', 'Cao và thấp'],
    },
  ],
  rotation: [
    {
      id: 'dn4',
      hint: 'Sự luân phiên ngày đêm xảy ra do Trái Đất',
      answer: 'Tự quay quanh trục',
      options: ['Tự quay quanh trục', 'Quay quanh Mặt Trời', 'Có trục nghiêng', 'Có Mặt Trăng'],
    },
    {
      id: 'dn5',
      hint: 'Hướng mặt trời mọc là hướng',
      answer: 'Đông',
      options: ['Đông', 'Tây', 'Bắc', 'Nam'],
    },
  ],
};

// ─── Fixed star positions (seeded, deterministic) ────────────────────────────
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: ((i * 137.508 + 23) % 100) / 100,
  y: ((i * 73.1 + 11) % 100) / 100,
  r: 0.5 + (i % 3) * 0.5,
}));

// ─── Simplified continent outlines [latDeg, lonDeg] ──────────────────────────
const CONTINENTS: Array<[number, number][]> = [
  // North America
  [
    [70,-140],[60,-140],[55,-130],[48,-124],[35,-120],[22,-100],
    [15,-87],[8,-77],[10,-63],[18,-68],[28,-80],[40,-70],
    [46,-64],[52,-56],[58,-64],[64,-68],[70,-90],[72,-110],[72,-130],[70,-140],
  ],
  // South America
  [
    [10,-73],[0,-78],[-10,-78],[-25,-70],[-38,-72],
    [-55,-66],[-50,-58],[-35,-52],[-20,-40],
    [-5,-35],[0,-50],[5,-60],[10,-63],[10,-73],
  ],
  // Europe + Asia (simplified)
  [
    [35,-8],[44,0],[46,12],[42,18],[36,22],[35,28],[40,35],
    [42,45],[50,55],[52,60],[55,58],[58,28],[62,26],[68,28],
    [72,30],[74,55],[70,95],[60,110],[50,120],[48,135],
    [35,135],[28,120],[22,114],[12,109],[5,103],[0,110],
    [5,80],[8,77],[22,68],[25,65],[15,42],[12,45],
    [15,37],[22,37],[30,32],[36,26],[36,22],[38,12],[35,8],[35,-8],
  ],
  // Africa
  [
    [35,-5],[25,0],[10,-15],[0,-8],[-10,-14],[-20,-12],
    [-35,-18],[-35,18],[-25,33],[-15,40],[0,42],
    [10,45],[15,40],[25,38],[30,32],[35,25],[37,12],[35,8],[35,-5],
  ],
  // Australia
  [
    [-15,130],[-25,114],[-35,118],[-38,140],
    [-30,152],[-15,145],[-12,137],[-15,130],
  ],
];

// ─── Projection helper ────────────────────────────────────────────────────────
function project3D(
  latDeg: number, lonDeg: number,
  earthAngle: number,
  cx: number, cy: number, R: number
): { x: number; y: number; z: number } {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180 + earthAngle;
  const x = R * Math.cos(lat) * Math.sin(lon);
  const y = -R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.cos(lon);
  return { x: cx + x, y: cy + y, z };
}

// ─── Curved arrow helper ──────────────────────────────────────────────────────
function drawCurvedArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  lineWidth: number,
  alpha: number
) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 4) return;
  const nx = -dy / len, ny = dx / len;
  const cpx = (x1 + x2) / 2 + nx * len * 0.35;
  const cpy = (y1 + y2) / 2 + ny * len * 0.35;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.stroke();

  const headA = Math.atan2(y2 - cpy, x2 - cpx);
  const hl = lineWidth * 3.5;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hl * Math.cos(headA - Math.PI / 6), y2 - hl * Math.sin(headA - Math.PI / 6));
  ctx.lineTo(x2 - hl * Math.cos(headA + Math.PI / 6), y2 - hl * Math.sin(headA + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Main drawScene ───────────────────────────────────────────────────────────
function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  angle: number,
  tab: string,
  _playing: boolean
) {
  ctx.clearRect(0, 0, W, H);

  // 1. Space background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, W, H);

  // 2. Stars
  for (const s of STARS) {
    ctx.globalAlpha = 0.4 + 0.6 * (s.r / 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) * 0.36;
  const sunX = W * 0.12;
  const sunY = H * 0.5;
  const sunR = H * 0.075;

  // 3. Sun (overview + terminator)
  if (tab === 'overview' || tab === 'terminator') {
    // Outer corona glow
    const cg = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 3.2);
    cg.addColorStop(0, 'rgba(255,210,60,0.32)');
    cg.addColorStop(0.4, 'rgba(255,140,20,0.12)');
    cg.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Sun disk
    const sg = ctx.createRadialGradient(sunX - sunR * 0.28, sunY - sunR * 0.28, sunR * 0.04, sunX, sunY, sunR);
    sg.addColorStop(0, '#fffde8');
    sg.addColorStop(0.3, '#ffe566');
    sg.addColorStop(0.7, '#ffaa00');
    sg.addColorStop(1, '#ff5500');
    ctx.fillStyle = sg;
    ctx.shadowColor = '#ffb300';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Light cone from sun toward earth
    const coneGrad = ctx.createLinearGradient(sunX + sunR, sunY, cx - R, sunY);
    coneGrad.addColorStop(0, 'rgba(255,220,80,0.22)');
    coneGrad.addColorStop(1, 'rgba(255,220,80,0)');
    for (let ri = 0; ri < 5; ri++) {
      const off = ((ri - 2) / 5) * R * 0.85;
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(sunX + sunR, sunY + off * 0.45);
      ctx.lineTo(cx - R, sunY + off);
      ctx.lineTo(cx - R, sunY + off + 5);
      ctx.lineTo(sunX + sunR, sunY + off * 0.45 + 2);
      ctx.fill();
      ctx.restore();
    }

    // "Mat Troi" label
    ctx.save();
    ctx.font = `bold ${Math.max(9, Math.floor(H * 0.022))}px 'Inter', sans-serif`;
    ctx.fillStyle = '#fde68a';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
    ctx.fillText('\u004d\u1eb7t Tr\u1eddi', sunX, sunY + sunR + 15);
    ctx.restore();
  }

  // 4. Atmosphere outer glow
  const atmGlow = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.32);
  atmGlow.addColorStop(0, 'rgba(56,189,248,0.32)');
  atmGlow.addColorStop(0.55, 'rgba(56,189,248,0.10)');
  atmGlow.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = atmGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.32, 0, Math.PI * 2);
  ctx.fill();

  // 5. Earth — clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // Night base fill
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

  // Day side (left) warm radial gradient
  const dayGrad = ctx.createRadialGradient(cx - R * 0.35, cy, 0, cx - R * 0.1, cy, R * 1.25);
  dayGrad.addColorStop(0, 'rgba(255,240,150,0.58)');
  dayGrad.addColorStop(0.3, 'rgba(255,200,80,0.38)');
  dayGrad.addColorStop(0.6, 'rgba(100,160,255,0.12)');
  dayGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = dayGrad;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

  // Latitude grid lines (ellipses)
  ctx.lineWidth = 0.65;
  for (let lat = -60; lat <= 60; lat += 30) {
    const latRad = (lat * Math.PI) / 180;
    const yLine = cy - R * Math.sin(latRad);
    const rLine = R * Math.cos(latRad);
    if (rLine < 1) continue;
    ctx.strokeStyle = lat === 0 ? 'rgba(100,200,255,0.18)' : 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.ellipse(cx, yLine, rLine, rLine * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Meridian lines rotating with angle
  for (let lon = 0; lon < 360; lon += 30) {
    const lonRad = (lon * Math.PI) / 180 + angle;
    const frontFace = Math.cos(lonRad) > 0;
    ctx.strokeStyle = frontFace ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(R * Math.sin(lonRad)), R, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Continents with day/night coloring
  for (const shape of CONTINENTS) {
    const midLat = shape.reduce((s, [la]) => s + la, 0) / shape.length;
    const midLon = shape.reduce((s, [, lo]) => s + lo, 0) / shape.length;
    const sample = project3D(midLat, midLon, angle, cx, cy, R);
    const dayF = Math.max(0, Math.min(1, sample.z / R + 0.5));

    ctx.beginPath();
    let first = true;
    for (const [la, lo] of shape) {
      const p = project3D(la, lo, angle, cx, cy, R);
      if (first) { ctx.moveTo(p.x, p.y); first = false; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();

    if (dayF > 0.38) {
      ctx.fillStyle = `rgba(55,130,35,${0.7 + dayF * 0.28})`;
    } else {
      ctx.fillStyle = `rgba(18,48,12,${0.6 + (1 - dayF) * 0.3})`;
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 0.45;
    ctx.stroke();
  }

  // Terminator gradient stripe at cx
  const tW = R * (tab === 'terminator' ? 0.15 : 0.075);
  const tGrad = ctx.createLinearGradient(cx - tW, 0, cx + tW, 0);
  tGrad.addColorStop(0, 'rgba(0,0,0,0)');
  tGrad.addColorStop(0.42, 'rgba(0,0,0,0.38)');
  tGrad.addColorStop(0.58, 'rgba(0,0,0,0.38)');
  tGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = tGrad;
  ctx.fillRect(cx - tW, cy - R, tW * 2, R * 2);

  ctx.restore(); // end globe clip

  // 6. Globe rim
  ctx.strokeStyle = 'rgba(56,189,248,0.32)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();

  // Specular sheen
  const spec = ctx.createRadialGradient(cx - R * 0.36, cy - R * 0.36, 0, cx, cy, R);
  spec.addColorStop(0, 'rgba(255,255,255,0.18)');
  spec.addColorStop(0.38, 'rgba(255,255,255,0.04)');
  spec.addColorStop(1, 'rgba(0,0,0,0.40)');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // 7. Vietnam marker
  const vnP = project3D(16, 108, angle, cx, cy, R);
  if (vnP.z > -R * 0.12) {
    const alpha = Math.max(0.15, Math.min(1, vnP.z / R + 0.5));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(vnP.x, vnP.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = `bold ${Math.max(9, Math.floor(H * 0.02))}px 'Inter', sans-serif`;
    ctx.fillStyle = '#fca5a5';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
    ctx.fillText('Vi\u1ec7t Nam', vnP.x + 6, vnP.y + 4);
    ctx.restore();
  }

  // ── Tab overlays ───────────────────────────────────────────────────────────

  // OVERVIEW: orbital direction arrow + equator label
  if (tab === 'overview') {
    const orbY = cy + R * 1.18;
    drawCurvedArrow(ctx, cx - R * 0.5, orbY, cx + R * 0.5, orbY, '#f59e0b', 2.5, 0.82);
    ctx.save();
    ctx.font = `bold ${Math.max(9, Math.floor(H * 0.019))}px 'Inter', sans-serif`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    ctx.fillText('H\u01b0\u1edbng t\u1ef1 quay: T\u00e2y \u2192 \u0110\u00f4ng', cx, orbY + 16);
    ctx.restore();

    // Equator label
    const eqP = project3D(0, -25, angle, cx, cy, R);
    if (eqP.z > 0) {
      ctx.save();
      ctx.globalAlpha = 0.68;
      ctx.font = `${Math.max(8, Math.floor(H * 0.016))}px 'Inter', sans-serif`;
      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
      ctx.fillText('X\u00edch \u0110\u1ea1o', eqP.x, eqP.y + 3);
      ctx.restore();
    }
  }

  // TERMINATOR: glowing terminator line + annotations
  if (tab === 'terminator') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = 'rgba(167,139,250,0.72)';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(cx, cy - R);
    ctx.lineTo(cx, cy + R);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.save();
    const fs = Math.max(10, Math.floor(H * 0.022));
    ctx.font = `bold ${fs}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 6;

    ctx.fillStyle = '#fde68a';
    ctx.fillText('\u2600 BAN NG\u00c0Y', cx - R * 0.4, cy - R * 0.52);

    ctx.fillStyle = '#818cf8';
    ctx.fillText('\uD83C\uDF11 BAN \u0110\u00caM', cx + R * 0.4, cy - R * 0.52);

    ctx.font = `bold ${Math.max(9, Math.floor(H * 0.018))}px 'Inter', sans-serif`;
    ctx.fillStyle = '#c4b5fd';
    ctx.fillText('Ranh gi\u1edbi ng\u00e0y-\u0111\u00eam', cx, cy - R - 14);
    ctx.restore();

    drawCurvedArrow(ctx, cx - 6, cy - R * 0.32, cx - R * 0.62, cy - R * 0.32, '#fde68a', 1.5, 0.55);
    drawCurvedArrow(ctx, cx + 6, cy + R * 0.32, cx + R * 0.62, cy + R * 0.32, '#818cf8', 1.5, 0.55);
  }

  // ROTATION: axis, rotation arrows, labels
  if (tab === 'rotation') {
    const axTx = cx + R * 0.2, axTy = cy - R * 1.12;
    const axBx = cx - R * 0.2, axBy = cy + R * 1.12;

    ctx.save();
    ctx.strokeStyle = 'rgba(250,204,21,0.65)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([7, 4]);
    ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(axTx, axTy);
    ctx.lineTo(axBx, axBy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    ctx.font = `bold ${Math.max(8, Math.floor(H * 0.018))}px 'Inter', sans-serif`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    ctx.fillText('B\u1eaec C\u1ef0C \u2191', axTx, axTy - 8);
    ctx.fillText('\u2193 NAM C\u1ef0C', axBx, axBy + 14);
    ctx.restore();

    const arR = R * 1.15;
    for (let i = 0; i < 4; i++) {
      const sa = (i / 4) * Math.PI * 2 + angle * 0.5;
      const ea = sa + Math.PI * 0.30;
      const x1 = cx + arR * Math.cos(sa);
      const y1 = cy + arR * Math.sin(sa);
      const x2 = cx + arR * Math.cos(ea);
      const y2 = cy + arR * Math.sin(ea);
      drawCurvedArrow(ctx, x1, y1, x2, y2, '#34d399', 2.5, 0.78);
    }

    ctx.save();
    ctx.font = `bold ${Math.max(9, Math.floor(H * 0.019))}px 'Inter', sans-serif`;
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    ctx.fillText('\u2190 Tr\u00e1i \u0110\u1ea5t quay: T\u00e2y \u2192 \u0110\u00f4ng', cx, cy + R + 24);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('M\u1eb7t Tr\u1eddi m\u1ecdc \u1edf ph\u00eda \u0110\u00f4ng \u2191', cx, cy + R + 40);
    ctx.restore();

    const dayP2 = project3D(0, -55, angle, cx, cy, R);
    if (dayP2.z > 0) {
      ctx.save();
      ctx.font = `bold ${Math.max(9, Math.floor(H * 0.018))}px 'Inter', sans-serif`;
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText('Ban ng\u00e0y', dayP2.x, dayP2.y);
      ctx.restore();
    }
    const nightP2 = project3D(0, 125, angle, cx, cy, R);
    if (nightP2.z > 0) {
      ctx.save();
      ctx.font = `bold ${Math.max(9, Math.floor(H * 0.018))}px 'Inter', sans-serif`;
      ctx.fillStyle = '#818cf8';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText('Ban \u0111\u00eam', nightP2.x, nightP2.y);
      ctx.restore();
    }
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
const DayNightSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const activeRef = useRef(true);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tab, setTab] = useState('overview');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activityOpen, setActivityOpen] = useState(false);

  const tabRef = useRef(tab);
  const playRef = useRef(playing);
  const speedRef = useRef(speed);
  const angleRef = useRef(0.5);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = true;

    const resize = () => {
      const W = canvas.offsetWidth || canvas.parentElement?.clientWidth || 600;
      const H = canvas.offsetHeight || canvas.parentElement?.clientHeight || 400;
      if (W <= 0 || H <= 0) {
        retryRef.current = setTimeout(resize, 80);
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    retryRef.current = setTimeout(resize, 80);

    const loop = () => {
      if (!activeRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      if (W <= 0 || H <= 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (playRef.current) {
        angleRef.current += 0.004 * speedRef.current;
      }

      drawScene(ctx, W, H, angleRef.current, tabRef.current, playRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      if (retryRef.current) clearTimeout(retryRef.current);
      ro.disconnect();
    };
  }, []);

  const questions: ActivityQuestion[] = TAB_QUESTIONS[tab] ?? TAB_QUESTIONS['overview'];

  return (
    <div className="flex flex-col h-full bg-[#030712] rounded-2xl overflow-hidden select-none">
      <SimTopBar
        title="S\u1ef1 lu\u00e2n phi\u00ean ng\u00e0y \u0111\u00eam"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        <SimActivity
          title="C\u00e2u h\u1ecfi"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor="#f59e0b"
        />

        <div
          className="absolute bottom-2 right-2 text-[9px] text-slate-600 font-bold pointer-events-none"
          style={{ textShadow: '0 0 6px #000' }}
        >
          🌍 M\u00f4 ph\u1ecfng t\u1ef1 quay Tr\u00e1i \u0110\u1ea5t
        </div>
      </div>

      <SimTabs
        tabs={TABS}
        active={tab}
        onChange={id => {
          setTab(id);
          setActivityOpen(true);
        }}
      />
    </div>
  );
};

export default DayNightSim;
