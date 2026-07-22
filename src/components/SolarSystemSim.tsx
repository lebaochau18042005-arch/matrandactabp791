import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

const TABS: SimTab[] = [
  { id: 'overview',   label: '🌌 Hệ Mặt Trời',    color: '#6366f1' },
  { id: 'earth-moon', label: '🌙 Trái Đất - Mặt Trăng', color: '#14b8a6' },
  { id: 'orbit',      label: '💫 Điểm Cận/Viễn Nhật', color: '#fbbf24' },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  overview: [
    { id: 'ss1', hint: 'Trong hệ Mặt Trời, Trái Đất nằm ở vị trí thứ mấy tính từ trong ra ngoài?', answer: 'Thứ 3', options: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5'] },
    { id: 'ss2', hint: 'Hành tinh nào có kích thước lớn nhất trong hệ Mặt Trời?', answer: 'Sao Mộc', options: ['Trái Đất', 'Sao Hỏa', 'Sao Mộc', 'Sao Thổ'] },
  ],
  'earth-moon': [
    { id: 'ss3', hint: 'Mặt Trăng quay quanh Trái Đất theo hướng nào khi nhìn từ cực Bắc?', answer: 'Ngược chiều kim đồng hồ', options: ['Ngược chiều kim đồng hồ', 'Thuận chiều kim đồng hồ', 'Từ đông sang tây', 'Ngẫu nhiên'] },
  ],
  orbit: [
    { id: 'ss4', hint: 'Điểm cận nhật là thời điểm Trái Đất nằm ở vị trí', answer: 'Gần Mặt Trời nhất', options: ['Gần Mặt Trời nhất', 'Xa Mặt Trời nhất', 'Ở vĩ độ 0 độ', 'Ở xích đạo'] },
    { id: 'ss5', hint: 'Khoảng cách giữa Trái Đất và Mặt Trời thay đổi do quỹ đạo chuyển động có hình', answer: 'Elip gần tròn', options: ['Elip gần tròn', 'Tròn hoàn hảo', 'Hình parabol', 'Hình xoắn ốc'] },
  ],
};

const ALL_QUESTIONS = Object.values(TAB_QUESTIONS).flat();

// Planet configurations
const PLANETS = [
  { name: 'Thủy', r: 4, dist: 0.14, speed: 0.04, color: '#94a3b8' },
  { name: 'Kim', r: 8, dist: 0.22, speed: 0.025, color: '#e2e8f0' },
  { name: 'Trái Đất', r: 10, dist: 0.32, speed: 0.015, color: '#38bdf8' },
  { name: 'Hỏa', r: 7, dist: 0.42, speed: 0.012, color: '#f87171' },
];

function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  frame: number,
  tab: string,
  playing: boolean,
  speedMultiplier: number
) {
  const cx = W / 2;
  const cy = H / 2;

  // Background - space
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, W, H);

  // Distant Stars (static look)
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 382.23) % 1) * W;
    const sy = ((i * 723.11) % 1) * H;
    ctx.fillRect(sx, sy, 1.2, 1.2);
  }

  if (tab === 'overview') {
    // ── Draw Sun ──
    const sunR = Math.min(W, H) * 0.08;
    const sunGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, sunR * 1.5);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.3, '#f59e0b');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, sunR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Text: Mặt Trời
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Mặt Trời', cx - 22, cy - sunR - 6);

    // Draw Orbit lines and Planets
    PLANETS.forEach(p => {
      const rx = W * p.dist * 1.1;
      const ry = H * p.dist * 0.85;

      // Orbit Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Planet Position
      const angle = frame * p.speed * speedMultiplier;
      const px = cx + Math.cos(angle) * rx;
      const py = cy + Math.sin(angle) * ry;

      // Planet Shadow Side
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // 3D Shadow look (dark half facing away from Sun)
      const sunAngle = Math.atan2(py - cy, px - cx);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(px, py, p.r, sunAngle - Math.PI / 2, sunAngle + Math.PI / 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px sans-serif';
      ctx.fillText(p.name, px + p.r + 4, py + 3);
    });

  } else if (tab === 'earth-moon') {
    // Zoom in on Earth and Moon
    const earthR = Math.min(W, H) * 0.16;
    const moonR = earthR * 0.28;
    const orbitR = earthR * 2.2;

    // Draw Earth at Center
    // Atmosphere rim
    const atmGrad = ctx.createRadialGradient(cx, cy, earthR * 0.8, cx, cy, earthR * 1.15);
    atmGrad.addColorStop(0, 'rgba(56,189,248,0.2)');
    atmGrad.addColorStop(0.8, 'rgba(56,189,248,0.4)');
    atmGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = atmGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, earthR * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#0d5885'; // Ocean
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.fill();

    // Draw rotating Continents
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#16a34a'; // Land
    const rot = frame * 0.005;
    for (let i = 0; i < 3; i++) {
      const offsetAngle = rot + (i * Math.PI * 2) / 3;
      const lx = cx + Math.cos(offsetAngle) * earthR * 0.5;
      const ly = cy + Math.sin(offsetAngle) * earthR * 0.3;
      ctx.beginPath();
      ctx.arc(lx, ly, earthR * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Sun rays from Left side
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(0, cy - earthR * 1.4, cx, earthR * 2.8);
    // Draw day-night shadow on Earth (right side is dark)
    ctx.fillStyle = 'rgba(3,7,18,0.7)';
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Earth rotation direction arrow
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, earthR + 15, Math.PI * 0.8, Math.PI * 1.2);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.moveTo(cx - (earthR + 15), cy + 10);
    ctx.lineTo(cx - (earthR + 21), cy + 2);
    ctx.lineTo(cx - (earthR + 9), cy + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Trái Đất (Tự quay Tây → Đông)', cx - 75, cy + earthR + 32);

    // Draw Moon Orbit
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Moon
    const moonAngle = frame * 0.008 * speedMultiplier;
    const mx = cx + Math.cos(moonAngle) * orbitR;
    const my = cy + Math.sin(moonAngle) * orbitR;

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(mx, my, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Moon shadow (Right side dark)
    ctx.fillStyle = 'rgba(3,7,18,0.7)';
    ctx.beginPath();
    ctx.arc(mx, my, moonR, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Label Moon
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Mặt Trăng', mx + moonR + 5, my + 3);

  } else if (tab === 'orbit') {
    // ── Orbit Elip - Perihelion / Aphelion ──
    const rx = W * 0.38;
    const ry = H * 0.28;
    // Shift Sun to left focus of ellipse
    const focusDist = Math.sqrt(rx * rx - ry * ry) * 0.8;
    const sunX = cx - focusDist;

    // Draw Orbit Line
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Sun at left focus
    const sunR = Math.min(W, H) * 0.09;
    const sunGrad = ctx.createRadialGradient(sunX, cy, 2, sunX, cy, sunR * 1.4);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.3, '#f59e0b');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, cy, sunR * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(sunX, cy, sunR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Mặt Trời', sunX - 22, cy - sunR - 6);

    // Orbiting Earth
    const angle = frame * 0.006 * speedMultiplier;
    const ex = cx + Math.cos(angle) * rx;
    const ey = cy + Math.sin(angle) * ry;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(ex, ey, 12, 0, Math.PI * 2);
    ctx.fill();

    // Earth shadow
    const sunAngle = Math.atan2(ey - cy, ex - sunX);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(ex, ey, 12, sunAngle - Math.PI / 2, sunAngle + Math.PI / 2);
    ctx.fill();

    // Annotations for perihelion & aphelion
    // Perihelion: closest (Leftmost point)
    const periX = cx - rx;
    const periY = cy;
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(periX, periY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('Điểm Cận Nhật (~3/1)', periX - 100, periY - 8);
    ctx.font = '9px sans-serif';
    ctx.fillText('Khoảng cách: 147 triệu km', periX - 100, periY + 6);

    // Aphelion: furthest (Rightmost point)
    const aphX = cx + rx;
    const aphY = cy;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(aphX, aphY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('Điểm Viễn Nhật (~4/7)', aphX + 8, aphY - 8);
    ctx.font = '9px sans-serif';
    ctx.fillText('Khoảng cách: 152 triệu km', aphX + 8, aphY + 6);

    // Direction line to Earth
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sunX, cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Current distance calculator text
    const distPx = Math.sqrt((ex - sunX) * (ex - sunX) + (ey - cy) * (ey - cy));
    const distRatio = (distPx - (rx - focusDist)) / (2 * focusDist); // 0 to 1
    const actualDist = 147 + distRatio * 5; // 147M to 152M km
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`Khoảng cách hiện tại: ${actualDist.toFixed(1)} triệu km`, cx - 90, H - 35);
  }
}

const SolarSystemSim: React.FC<{ customParams?: any; customQuestions?: any }> = ({ customParams, customQuestions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(true);
  const playRef = useRef(true);
  const speedRef = useRef(1);
  const tabRef = useRef('overview');
  const frameRef = useRef(0);

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState('overview');
  const [activityOpen, setActivityOpen] = useState(false);

  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { tabRef.current = tab; }, [tab]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth || canvas.parentElement?.clientWidth || 700;
      const h = canvas.offsetHeight || canvas.parentElement?.clientHeight || 420;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
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
      if (playRef.current) frameRef.current += 1;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      if (W > 0 && H > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
          drawScene(ctx, W, H, frameRef.current, tabRef.current, playRef.current, speedRef.current);
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
         style={{ background: '#020617', fontFamily: "'Inter', sans-serif" }}>
      <SimTopBar
        title="Trái Đất trong hệ Mặt Trời"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        <SimActivity
          title="Câu hỏi trắc nghiệm"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor="#6366f1"
        />
      </div>

      <SimTabs tabs={TABS} active={tab} onChange={t => setTab(t)} />
    </div>
  );
};

export default SolarSystemSim;
