import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'zones',     label: '🕐 Múi giờ',        color: '#3b82f6' },
  { id: 'greenwich', label: '🌐 Kinh tuyến gốc',  color: '#facc15' },
  { id: 'dateline',  label: '📅 Đường đổi ngày',  color: '#f97316' },
];

// ─── Quiz questions per tab ────────────────────────────────────────────────────
const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  zones: [
    {
      id: 'tz1',
      hint: 'Trái Đất được chia thành bao nhiêu múi giờ?',
      answer: '24',
      options: ['24', '12', '36', '48'],
    },
    {
      id: 'tz2',
      hint: 'Việt Nam thuộc múi giờ số',
      answer: 'UTC+7',
      options: ['UTC+7', 'UTC+8', 'UTC+6', 'UTC+5'],
    },
  ],
  greenwich: [
    {
      id: 'tz3',
      hint: 'Kinh tuyến gốc đi qua thành phố',
      answer: 'Greenwich (London)',
      options: ['Greenwich (London)', 'Paris', 'Rome', 'Berlin'],
    },
  ],
  dateline: [
    {
      id: 'tz4',
      hint: 'Khi vượt đường đổi ngày từ đông sang tây, ngày tháng sẽ',
      answer: 'Tăng thêm 1 ngày',
      options: ['Tăng thêm 1 ngày', 'Giảm đi 1 ngày', 'Không đổi', 'Đổi múi giờ'],
    },
    {
      id: 'tz5',
      hint: 'Đường chuyển ngày quốc tế nằm gần kinh tuyến',
      answer: '180°',
      options: ['180°', '0°', '90°Đ', '90°T'],
    },
  ],
};

// ─── Info text ────────────────────────────────────────────────────────────────
const INFO_TEXT: Record<string, string> = {
  zones:
    'Trái Đất được chia thành 24 múi giờ, mỗi múi rộng 15° kinh độ. Múi giờ 0 (UTC) đặt tại kinh tuyến gốc Greenwich. Việt Nam nằm ở múi giờ UTC+7, tức là nhanh hơn giờ quốc tế 7 tiếng.',
  greenwich:
    'Kinh tuyến gốc (0°) đi qua đài thiên văn Greenwich tại London, Anh. Đây là điểm tham chiếu quốc tế để tính múi giờ và kinh độ. Giờ Greenwich (GMT/UTC) là chuẩn thời gian toàn cầu.',
  dateline:
    'Đường đổi ngày quốc tế nằm gần kinh tuyến 180°, ở giữa Thái Bình Dương. Khi vượt từ Đông sang Tây qua đường này, lịch tăng thêm 1 ngày. Ngược lại, từ Tây sang Đông thì lịch giảm đi 1 ngày.',
};

// ─── City data ─────────────────────────────────────────────────────────────────
const CITIES = [
  { name: 'Hà Nội',   utcOffset: 7,  color: '#34d399' },
  { name: 'London',   utcOffset: 0,  color: '#facc15' },
  { name: 'Tokyo',    utcOffset: 9,  color: '#f472b6' },
  { name: 'New York', utcOffset: -5, color: '#60a5fa' },
];

// ─── Pre-generated stars ──────────────────────────────────────────────────────
const STARS = Array.from({ length: 120 }, (_, i) => ({
  xFrac:         Math.sin(i * 4731.3 + 0.3) * 0.5 + 0.5,
  yFrac:         Math.cos(i * 7392.7 + 0.1) * 0.5 + 0.5,
  size:          i % 7 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1,
  flickerOffset: i * 0.37,
}));

// ─── roundRect helper ─────────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Main draw function ────────────────────────────────────────────────────────
function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  angle: number,
  tab: string,
  frame: number,
): void {
  ctx.clearRect(0, 0, W, H);

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, W, H);

  // ── Twinkling starfield ──────────────────────────────────────────────────────
  for (const s of STARS) {
    const flicker = 0.3 + 0.6 * Math.abs(Math.sin(frame * 0.018 + s.flickerOffset));
    ctx.fillStyle = `rgba(255,255,255,${(flicker * 0.65).toFixed(2)})`;
    ctx.fillRect(s.xFrac * W, s.yFrac * H, s.size, s.size);
  }

  // ── Globe geometry ───────────────────────────────────────────────────────────
  const cx = W / 2;
  const cy = H * 0.42;
  const R  = Math.min(W, H) * 0.34;

  // Clip everything inside the globe circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // Ocean base
  const oceanGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.05, cx, cy, R);
  oceanGrad.addColorStop(0,   '#1e4080');
  oceanGrad.addColorStop(0.6, '#0f2a56');
  oceanGrad.addColorStop(1,   '#071525');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

  // ── 24 time-zone strips ──────────────────────────────────────────────────────
  for (let tz = 0; tz < 24; tz++) {
    const lonDeg  = tz * 15 - 180;        // -180 … +165
    const lonRad  = (lonDeg * Math.PI) / 180 + angle;
    const lonRad2 = ((lonDeg + 15) * Math.PI) / 180 + angle;

    // Visibility: only front hemisphere
    const mid    = (lonRad + lonRad2) / 2;
    const midMod = ((mid % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (!(midMod < Math.PI * 0.95 || midMod > Math.PI * 1.05)) continue;

    const x1 = cx + R * Math.sin(lonRad);
    const x2 = cx + R * Math.sin(lonRad2);
    const xL = Math.min(x1, x2);
    const xR = Math.max(x1, x2);
    if (xR - xL < 0.5) continue;

    // Special zone highlight
    const actualLon = ((lonDeg % 360) + 360) % 360;
    const isGwZone  = actualLon >= 165 && actualLon <= 195;
    const isDlZone  = actualLon <= 15 || actualLon >= 345;

    let color = tz % 2 === 0 ? '#1e3a5f' : '#162d4a';
    if (tab === 'greenwich' && isGwZone) color = 'rgba(250,204,21,0.28)';
    if (tab === 'dateline'  && isDlZone) color = 'rgba(249,115,22,0.28)';

    ctx.fillStyle = color;
    ctx.fillRect(xL, cy - R, xR - xL, R * 2);
  }

  // ── Meridian lines every 15° ─────────────────────────────────────────────────
  for (let tz = 0; tz < 24; tz++) {
    const lonDeg = tz * 15 - 180;
    const lonRad = (lonDeg * Math.PI) / 180 + angle;
    const norm   = ((lonRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (!(norm < Math.PI * 0.92 || norm > Math.PI * 1.08)) continue;

    const sx         = cx + R * Math.sin(lonRad);
    const mappedLon  = ((lonDeg % 360) + 360) % 360;
    const isGreenwich = mappedLon >= 179 && mappedLon <= 181;
    const isDateline  = mappedLon <= 1 || mappedLon >= 359;

    if (isGreenwich) {
      ctx.strokeStyle = tab === 'greenwich' ? '#facc15' : 'rgba(250,204,21,0.7)';
      ctx.lineWidth   = tab === 'greenwich' ? 2.5 : 1.5;
    } else if (isDateline) {
      ctx.strokeStyle = tab === 'dateline' ? '#fb923c' : 'rgba(251,146,60,0.6)';
      ctx.lineWidth   = tab === 'dateline' ? 2.5 : 1.5;
    } else {
      ctx.strokeStyle = 'rgba(100,140,200,0.22)';
      ctx.lineWidth   = 0.6;
    }
    ctx.beginPath();
    ctx.moveTo(sx, cy - R);
    ctx.lineTo(sx, cy + R);
    ctx.stroke();
  }

  // ── Latitude parallels ───────────────────────────────────────────────────────
  for (const lat of [-60, -30, 0, 30, 60]) {
    const latRad = (lat * Math.PI) / 180;
    const ry     = R * Math.cos(latRad);
    const yPos   = cy + R * Math.sin(latRad);
    ctx.strokeStyle = lat === 0 ? 'rgba(100,180,255,0.35)' : 'rgba(100,140,200,0.16)';
    ctx.lineWidth   = lat === 0 ? 1.2 : 0.5;
    ctx.beginPath();
    ctx.ellipse(cx, yPos, ry, ry * 0.25, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore(); // end globe clip

  // ── Globe border glow ────────────────────────────────────────────────────────
  const glowG = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.12);
  glowG.addColorStop(0,   'rgba(59,130,246,0)');
  glowG.addColorStop(0.7, 'rgba(59,130,246,0.16)');
  glowG.addColorStop(1,   'rgba(59,130,246,0)');
  ctx.fillStyle = glowG;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = 'rgba(59,130,246,0.45)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

  // ── Atmosphere shimmer ───────────────────────────────────────────────────────
  const atmG = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.4, 0, cx, cy, R * 1.05);
  atmG.addColorStop(0,    'rgba(180,220,255,0.10)');
  atmG.addColorStop(0.65, 'rgba(100,160,255,0.04)');
  atmG.addColorStop(1,    'rgba(60,120,255,0)');
  ctx.fillStyle = atmG;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.05, 0, Math.PI * 2); ctx.fill();

  // ── Greenwich tab annotations ────────────────────────────────────────────────
  if (tab === 'greenwich') {
    const gwLon  = angle; // lon=0° maps here with our offset convention
    const gwX    = cx + R * Math.sin(gwLon);
    const gwNorm = ((gwLon % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const gwVis  = gwNorm < Math.PI * 0.9 || gwNorm > Math.PI * 1.1;

    if (gwVis) {
      ctx.save();
      ctx.shadowColor = '#facc15'; ctx.shadowBlur = 16;
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(gwX, cy - R * 1.05); ctx.lineTo(gwX, cy + R * 1.05); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#facc15'; ctx.textAlign = 'center';
      ctx.fillText('0\u00b0', gwX, cy - R - 10);
      ctx.restore();
    }

    // Annotation box (top-right)
    const bx = W > 320 ? W - 178 : W * 0.54, by = 10, bw = 165, bh = 76;
    ctx.save();
    roundRect(ctx, bx, by, bw, bh, 10);
    ctx.fillStyle   = 'rgba(250,204,21,0.12)'; ctx.fill();
    ctx.strokeStyle = 'rgba(250,204,21,0.48)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#facc15'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('\ud83c\udf10 Kinh tuy\u1ebfn g\u1ed1c (0\u00b0)', bx + 10, by + 18);
    ctx.fillStyle = '#fde68a'; ctx.font = '10px Inter, sans-serif';
    ['\u2022 \u0110i qua Greenwich, London', '\u2022 Chia \u0110\u00f4ng/T\u00e2y b\u00e1n c\u1ea7u', '\u2022 C\u01a1 s\u1edf t\u00ednh m\u00fai gi\u1edd UTC']
      .forEach((l, i) => ctx.fillText(l, bx + 10, by + 34 + i * 14));
    ctx.restore();
  }

  // ── Dateline tab annotations ─────────────────────────────────────────────────
  if (tab === 'dateline') {
    const dlLon  = Math.PI + angle; // 180° lon
    const dlX    = cx + R * Math.sin(dlLon);
    const dlNorm = ((dlLon % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const dlVis  = dlNorm < Math.PI * 0.9 || dlNorm > Math.PI * 1.1;

    if (dlVis) {
      ctx.save();
      ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 18;
      ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.beginPath(); ctx.moveTo(dlX, cy - R * 1.05); ctx.lineTo(dlX, cy + R * 1.05); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#fb923c'; ctx.textAlign = 'center';
      ctx.fillText('180\u00b0', dlX, cy - R - 10);
      ctx.restore();
    }

    const bx = W > 320 ? W - 190 : W * 0.50, by = 10, bw = 178, bh = 84;
    ctx.save();
    roundRect(ctx, bx, by, bw, bh, 10);
    ctx.fillStyle   = 'rgba(249,115,22,0.12)'; ctx.fill();
    ctx.strokeStyle = 'rgba(249,115,22,0.48)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#fb923c'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('\ud83d\udcc5 \u0110\u01b0\u1eddng \u0111\u1ed5i ng\u00e0y qu\u1ed1c t\u1ebf', bx + 10, by + 18);
    ctx.fillStyle = '#fed7aa'; ctx.font = '10px Inter, sans-serif';
    ['\u2022 G\u1ea7n kinh tuy\u1ebfn 180\u00b0', '\u2022 \u0110\u00f4ng \u2192 T\u00e2y: +1 ng\u00e0y', '\u2022 T\u00e2y \u2192 \u0110\u00f4ng: \u22121 ng\u00e0y', '\u2022 U\u1ed1n quanh qu\u1ea7n \u0111\u1ea3o TBD']
      .forEach((l, i) => ctx.fillText(l, bx + 10, by + 34 + i * 13));
    ctx.restore();
  }

  // ── North Pole dot ───────────────────────────────────────────────────────────
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.arc(cx, cy - R, 4, 0, Math.PI * 2); ctx.fill();
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy - R - 9);
  ctx.restore();

  // ── Globe sub-label ───────────────────────────────────────────────────────────
  ctx.save();
  ctx.font      = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(148,163,184,0.55)';
  ctx.fillText('Tr\u00e1i \u0110\u1ea5t \u2014 24 m\u00fai gi\u1edd', cx, cy + R + 15);
  ctx.restore();

  // ── City clock panels ─────────────────────────────────────────────────────────
  const baseHourFrac = ((angle / (Math.PI * 2)) * 24 % 24 + 24) % 24;
  const blinkColon   = Math.floor(frame / 30) % 2 === 0;

  const panelCount  = CITIES.length;
  const panelMargin = 8;
  const panelGap    = 5;
  const panelW      = (W - panelMargin * 2 - panelGap * (panelCount - 1)) / panelCount;
  const panelH      = 64;
  const panelY      = H - panelH - 10;

  CITIES.forEach((city, i) => {
    const px = panelMargin + i * (panelW + panelGap);
    const py = panelY;

    const totalH = ((baseHourFrac + city.utcOffset) % 24 + 24) % 24;
    const hh     = Math.floor(totalH);
    const mm     = Math.floor((totalH - hh) * 60);
    const colon  = blinkColon ? ':' : '\u2009';
    const timeStr = `${String(hh).padStart(2, '0')}${colon}${String(mm).padStart(2, '0')}`;
    const utcStr  = city.utcOffset >= 0 ? `UTC+${city.utcOffset}` : `UTC${city.utcOffset}`;
    const timeFontSize = Math.max(14, Math.min(20, panelW * 0.18));

    ctx.save();
    roundRect(ctx, px, py, panelW, panelH, 8);
    ctx.fillStyle   = 'rgba(15,23,54,0.85)'; ctx.fill();
    ctx.strokeStyle = `${city.color}55`;      ctx.lineWidth = 1.2; ctx.stroke();

    // Top accent bar
    ctx.fillStyle = city.color;
    ctx.fillRect(px + 8, py + 3, panelW - 16, 2.5);

    // City name
    ctx.font      = `bold ${Math.max(9, Math.min(11, panelW * 0.10))}px Inter, sans-serif`;
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(city.name, px + panelW / 2, py + 20);

    // Digital time
    ctx.font      = `bold ${timeFontSize}px "Courier New", monospace`;
    ctx.fillStyle = city.color;
    ctx.fillText(timeStr, px + panelW / 2, py + 43);

    // UTC offset label
    ctx.font      = `${Math.max(8, Math.min(9, panelW * 0.085))}px Inter, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText(utcStr, px + panelW / 2, py + 57);

    ctx.restore();
  });
}

// ─── React component ──────────────────────────────────────────────────────────
const TimeZoneSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const activeRef = useRef(true);
  const speedRef  = useRef(0.4);
  const playRef   = useRef(true);
  const tabRef    = useRef('zones');
  const stateRef  = useRef({ angle: 0, frame: 0 });

  const [tab,             setTab]             = useState('zones');
  const [playing,         setPlaying]         = useState(true);
  const [speed,           setSpeed]           = useState(0.4);
  const [activityVisible, setActivityVisible] = useState(false);

  // ── Canvas sizing with retry ────────────────────────────────────────────────
  const sizeCanvas = useCallback((retries = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth  || canvas.parentElement?.clientWidth  || 600;
    const H = canvas.offsetHeight || canvas.parentElement?.clientHeight || 400;
    if ((W === 0 || H === 0) && retries < 6) {
      setTimeout(() => sizeCanvas(retries + 1), 80);
      return;
    }
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      if (c) { c.setTransform(1,0,0,1,0,0); c.scale(dpr, dpr); }
    }
  }, []);

  // ── RAF animation loop ──────────────────────────────────────────────────────
  const loop = useCallback(() => {
    if (!activeRef.current) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const W = canvas.width;
      const H = canvas.height;
      if (W > 0 && H > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (playRef.current) {
            stateRef.current.angle += speedRef.current * 0.008;
            stateRef.current.frame += 1;
          }
          drawScene(ctx, W, H, stateRef.current.angle, tabRef.current, stateRef.current.frame);
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // ── Mount / unmount ─────────────────────────────────────────────────────────
  useEffect(() => {
    activeRef.current = true;
    sizeCanvas();
    rafRef.current = requestAnimationFrame(loop);
    const canvas = canvasRef.current;
    const ro = canvas ? new ResizeObserver(() => sizeCanvas()) : null;
    if (canvas && ro) ro.observe(canvas);
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      ro?.disconnect();
    };
  }, [loop, sizeCanvas]);

  // ── Sync mutable refs ───────────────────────────────────────────────────────
  useEffect(() => { speedRef.current = speed;   }, [speed]);
  useEffect(() => { playRef.current  = playing; }, [playing]);
  useEffect(() => { tabRef.current   = tab;     }, [tab]);

  const themeColor = TABS.find(t => t.id === tab)?.color ?? '#3b82f6';

  return (
    <div
      className="relative flex flex-col w-full h-full overflow-hidden"
      style={{ background: '#030712', minHeight: 0 }}
    >
      {/* ── Top control bar ── */}
      <SimTopBar
        title="Múi giờ & Đường chuyển ngày"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      {/* ── Main canvas area ── */}
      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: 'block' }}
        />

        {/* Fill-in-the-blank activity panel */}
        <SimActivity
          title="Điền vào chỗ trống"
          questions={TAB_QUESTIONS[tab] ?? []}
          visible={activityVisible}
          onToggle={() => setActivityVisible(v => !v)}
          themeColor={themeColor}
        />

        {/* Info text overlay (bottom-left, above clock panels) */}
        <div
          className="absolute bottom-[84px] left-2 z-20 rounded-xl px-3 py-2 pointer-events-none"
          style={{
            maxWidth: '215px',
            background: 'rgba(15,23,54,0.80)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${themeColor}33`,
          }}
        >
          <p className="text-[10px] leading-relaxed" style={{ color: '#94a3b8' }}>
            {INFO_TEXT[tab]}
          </p>
        </div>

        {/* Legend (zones tab only, top-right) */}
        {tab === 'zones' && (
          <div
            className="absolute top-2 right-2 z-20 rounded-xl px-3 py-2.5 pointer-events-none"
            style={{
              background: 'rgba(15,23,54,0.82)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59,130,246,0.28)',
            }}
          >
            <p className="text-[10px] font-black text-blue-300 mb-1.5 tracking-wide">CHÚ THÍCH</p>
            <div className="space-y-1">
              {[
                { bg: '#1e3a5f', label: 'Múi giờ chẵn'    },
                { bg: '#162d4a', label: 'Múi giờ lẻ'      },
                { bg: '#facc15', label: 'Kinh tuyến 0°'   },
                { bg: '#fb923c', label: 'Kinh tuyến 180°' },
              ].map(({ bg, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: bg }} />
                  <span className="text-[9px] text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <SimTabs tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
};

export default TimeZoneSim;
