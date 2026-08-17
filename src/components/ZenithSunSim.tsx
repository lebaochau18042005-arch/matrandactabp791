import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

const TABS: SimTab[] = [
  { id: 'concept',  label: '📖 Nguyên Lý',    color: '#f59e0b' },
  { id: 'movement', label: '📈 Chuyển Động Biểu Kiến', color: '#10b981' },
  { id: 'vietnam',  label: '🇻🇳 Tại Việt Nam', color: '#ef4444' },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  concept: [
    { id: 'zs1', hint: 'Hiện tượng Mặt Trời lên thiên đỉnh là hiện tượng tia sáng Mặt Trời chiếu vuông góc với bề mặt Trái Đất lúc', answer: '12 giờ trưa', options: ['12 giờ trưa', '6 giờ sáng', '18 giờ tối', 'Bất kỳ lúc nào'] },
    { id: 'zs2', hint: 'Khu vực nào trên Trái Đất có hiện tượng Mặt Trời lên thiên đỉnh?', answer: 'Vùng nội chí tuyến', options: ['Vùng nội chí tuyến', 'Vùng ngoại chí tuyến', 'Vùng vòng cực', 'Toàn bộ Trái Đất'] },
  ],
  movement: [
    { id: 'zs3', hint: 'Vào ngày 22/6 (Hạ chí), Mặt Trời lên thiên đỉnh tại vĩ tuyến nào?', answer: 'Chí tuyến Bắc', options: ['Xích đạo', 'Chí tuyến Bắc', 'Chí tuyến Nam', 'Vòng cực Bắc'] },
    { id: 'zs4', hint: 'Vào ngày Xuân phân (21/3) và Thu phân (23/9), Mặt Trời lên thiên đỉnh tại', answer: 'Xích đạo', options: ['Xích đạo', 'Chí tuyến Bắc', 'Chí tuyến Nam', 'Cực Bắc'] },
  ],
  vietnam: [
    { id: 'zs5', hint: 'Hà Nội và TP. Hồ Chí Minh có hiện tượng Mặt Trời lên thiên đỉnh bao nhiêu lần trong năm?', answer: '2 lần', options: ['1 lần', '2 lần', '3 lần', 'Không có lần nào'] },
  ],
};

const ALL_QUESTIONS = Object.values(TAB_QUESTIONS).flat();

// Months for simulation slider
const DAYS_OF_YEAR = [
  { day: 80,  label: '21/3 (Xuân phân)', latitude: 0, desc: 'Mặt Trời vuông góc với Xích đạo' },
  { day: 172, label: '22/6 (Hạ chí)', latitude: 23.45, desc: 'Mặt Trời vuông góc với Chí tuyến Bắc' },
  { day: 266, label: '23/9 (Thu phân)', latitude: 0, desc: 'Mặt Trời vuông góc với Xích đạo' },
  { day: 356, label: '22/12 (Đông chí)', latitude: -23.45, desc: 'Mặt Trời vuông góc với Chí tuyến Nam' },
];

function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  tab: string,
  currentDay: number,
  playing: boolean,
  onDayChange: (day: number) => void
) {
  // Center coordinates
  const cx = W * 0.45;
  const cy = H * 0.5;
  const R = Math.min(W, H) * 0.28;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // Calculate current subsolar latitude based on day of year (simple sine wave approximation)
  // Day 80 is vernal equinox (latitude = 0, going north)
  const angleRad = ((currentDay - 80) / 365) * Math.PI * 2;
  const subsolarLat = 23.45 * Math.sin(angleRad); // -23.45 to +23.45

  if (tab === 'concept') {
    // ── Draw Earth Globe ──
    const earthX = cx;
    const earthY = cy;

    // Outer atmosphere glow
    const atmGrad = ctx.createRadialGradient(earthX, earthY, R * 0.9, earthX, earthY, R * 1.15);
    atmGrad.addColorStop(0, 'rgba(56,189,248,0.15)');
    atmGrad.addColorStop(0.8, 'rgba(56,189,248,0.3)');
    atmGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = atmGrad;
    ctx.beginPath();
    ctx.arc(earthX, earthY, R * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Earth Body
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(earthX, earthY, R, 0, Math.PI * 2);
    ctx.fill();

    // Helper to draw horizontal lines of latitude
    const drawLatitudeLine = (latDeg: number, label: string, color: string, isDashed = false) => {
      const latRad = (latDeg * Math.PI) / 180;
      const yOffset = -R * Math.sin(latRad);
      const lineY = earthY + yOffset;
      const halfWidth = R * Math.cos(latRad);

      ctx.strokeStyle = color;
      ctx.lineWidth = isDashed ? 1 : 1.5;
      if (isDashed) ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(earthX - halfWidth, lineY);
      ctx.lineTo(earthX + halfWidth, lineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = color;
      ctx.font = '9px sans-serif';
      ctx.fillText(label, earthX + halfWidth + 8, lineY + 3);
    };

    // Draw reference lines
    drawLatitudeLine(23.45, 'Chí tuyến Bắc (+23.5°)', '#f87171');
    drawLatitudeLine(0, 'Xích đạo (0°)', '#ef4444');
    drawLatitudeLine(-23.45, 'Chí tuyến Nam (-23.5°)', '#38bdf8');

    // Draw Axis of Earth (Tilted 23.5 degrees)
    const axisAngle = (23.5 * Math.PI) / 180;
    const ax = R * 1.15 * Math.sin(axisAngle);
    const ay = R * 1.15 * Math.cos(axisAngle);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(earthX - ax, earthY + ay);
    ctx.lineTo(earthX + ax, earthY - ay);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('B', earthX + ax + 3, earthY - ay - 3);
    ctx.fillText('N', earthX - ax - 8, earthY + ay + 8);

    // ── Sun Rays from Right ──
    const rayCount = 5;
    const subsolarLatRad = (subsolarLat * Math.PI) / 180;
    const subsolarY = earthY - R * Math.sin(subsolarLatRad);

    // Highlight subsolar point (vertical ray)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.9, subsolarY);
    ctx.lineTo(earthX + R * Math.cos(subsolarLatRad), subsolarY);
    ctx.stroke();

    // Arrowhead on subsolar ray
    const rx = earthX + R * Math.cos(subsolarLatRad);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(rx, subsolarY);
    ctx.lineTo(rx + 10, subsolarY - 6);
    ctx.lineTo(rx + 10, subsolarY + 6);
    ctx.closePath();
    ctx.fill();

    // Other solar rays
    ctx.strokeStyle = 'rgba(251,191,36,0.3)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < rayCount; i++) {
      const offset = (i - 2) * R * 0.45;
      const rayY = earthY + offset;
      // Skip the central subsolar ray to avoid overlap
      if (Math.abs(rayY - subsolarY) > 10) {
        // Calculate intersection with circle
        const dy = offset;
        const dx = Math.sqrt(Math.max(0, R * R - dy * dy));
        ctx.beginPath();
        ctx.moveTo(W * 0.9, rayY);
        ctx.lineTo(earthX + dx, rayY);
        ctx.stroke();
      }
    }

    // Label subsolar ray
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`Tia nắng vuông góc (90°)`, W * 0.65, subsolarY - 8);
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Vĩ độ nhận thiên đỉnh: ${subsolarLat.toFixed(1)}°`, W * 0.65, subsolarY + 12);

    // Current Date display box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(15, 15, 260, 64, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 11px sans-serif';
    const dayObj = DAYS_OF_YEAR.find(d => Math.abs(d.day - currentDay) < 15) || { label: `Ngày thứ ${currentDay}/365` };
    ctx.fillText(dayObj.label, 25, 34);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '9px sans-serif';
    ctx.fillText(subsolarLat >= 0 ? `Vĩ tuyến vuông góc: ${subsolarLat.toFixed(1)}° B` : `Vĩ tuyến vuông góc: ${Math.abs(subsolarLat).toFixed(1)}° N`, 25, 49);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subsolarLat >= 0 ? 'Mặt Trời chiếu thẳng ở nửa cầu Bắc' : 'Mặt Trời chiếu thẳng ở nửa cầu Nam', 25, 62);

  } else if (tab === 'movement') {
    // ── Apparent Solar Movement Graph ──
    const startX = W * 0.12;
    const endX = W * 0.88;
    const rangeX = endX - startX;

    const graphY = cy;
    const amplitudeY = H * 0.28; // height of zenith curve

    // Draw Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    // Horizontal lines representing latitudes
    const drawGridLine = (latVal: number, label: string, color: string) => {
      const y = graphY - (latVal / 23.45) * amplitudeY;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = '10px sans-serif';
      ctx.fillText(label, startX - 85, y + 3);
    };

    drawGridLine(23.45, 'Chí tuyến Bắc (+23.5°)', 'rgba(248,113,113,0.3)');
    drawGridLine(0, 'Xích đạo (0°)', 'rgba(239,68,68,0.2)');
    drawGridLine(-23.45, 'Chí tuyến Nam (-23.5°)', 'rgba(56,189,248,0.3)');

    // Vertical date lines
    const datePoints = [
      { day: 80,  label: '21/3' },
      { day: 172, label: '22/6' },
      { day: 266, label: '23/9' },
      { day: 356, label: '22/12' },
    ];

    datePoints.forEach(pt => {
      const x = startX + (pt.day / 365) * rangeX;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(x, graphY - amplitudeY - 10);
      ctx.lineTo(x, graphY + amplitudeY + 10);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText(pt.label, x - 10, graphY + amplitudeY + 22);
    });

    // Draw Sine Wave (apparent movement curve)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let d = 0; d <= 365; d += 2) {
      const x = startX + (d / 365) * rangeX;
      const angle = ((d - 80) / 365) * Math.PI * 2;
      const y = graphY - Math.sin(angle) * amplitudeY;
      if (d === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Current Position on Curve
    const currentX = startX + (currentDay / 365) * rangeX;
    const currentAngle = ((currentDay - 80) / 365) * Math.PI * 2;
    const currentY = graphY - Math.sin(currentAngle) * amplitudeY;

    // Glowing Sun Marker
    const markerGrad = ctx.createRadialGradient(currentX, currentY, 2, currentX, currentY, 15);
    markerGrad.addColorStop(0, '#fff');
    markerGrad.addColorStop(0.3, '#fbbf24');
    markerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = markerGrad;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Annotation banner above marker
    ctx.fillStyle = 'rgba(15,23,42,0.9)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(currentX - 60, currentY - 36, 120, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Vĩ độ: ${subsolarLat.toFixed(1)}°`, currentX, currentY - 22);
    ctx.textAlign = 'left';

  } else if (tab === 'vietnam') {
    // ── Zenith Sun in Vietnam ──
    // Vietnam is located between ~8.5°N and 23.4°N (entirely in Northern hemisphere tropics)
    // Draw map outline/box for Vietnam area
    const boxX = W * 0.15;
    const boxY = cy - H * 0.35;
    const boxW = W * 0.28;
    const boxH = H * 0.7;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    // Latitude marks in Vietnam box
    const drawVNLat = (latVal: number, label: string, color: string) => {
      const pct = (23.4 - latVal) / (23.4 - 8.5); // normalized y position
      const y = boxY + pct * boxH;

      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(boxX, y);
      ctx.lineTo(boxX + boxW, y);
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '9px sans-serif';
      ctx.fillText(label, boxX - 78, y + 3);
    };

    drawVNLat(23.38, 'Hà Giang (23.3° B)', 'rgba(239,68,68,0.3)');
    drawVNLat(21.02, 'Hà Nội (21.0° B)', 'rgba(251,191,36,0.3)');
    drawVNLat(16.06, 'Đà Nẵng (16.0° B)', 'rgba(255,255,255,0.15)');
    drawVNLat(10.82, 'TP. HCM (10.8° B)', 'rgba(56,189,248,0.3)');
    drawVNLat(8.5, 'Cà Mau (8.5° B)', 'rgba(239,68,68,0.3)');

    // Draw subsolar line if it intersects Vietnam (8.5N to 23.4N)
    if (subsolarLat >= 8.5 && subsolarLat <= 23.4) {
      const pct = (23.4 - subsolarLat) / (23.4 - 8.5);
      const subsolarY = boxY + pct * boxH;

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(boxX, subsolarY);
      ctx.lineTo(boxX + boxW, subsolarY);
      ctx.stroke();

      // Glowing dot indicating subsolar position
      const rad = Math.sin(Date.now() * 0.003) * 4 + 8;
      const g = ctx.createRadialGradient(boxX + boxW / 2, subsolarY, 1, boxX + boxW / 2, subsolarY, rad);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.4, '#fbbf24');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(boxX + boxW / 2, subsolarY, rad, 0, Math.PI * 2);
      ctx.fill();

      // Text annotation
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('Đang lên thiên đỉnh tại vĩ độ này!', boxX + boxW + 10, subsolarY + 3);
    }

    // Explanation panel on the Right
    const panelX = W * 0.48;
    const panelY = boxY;
    const panelW = W * 0.45;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, boxH, 8);
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Đặc điểm Thiên đỉnh tại Việt Nam:', panelX + 15, panelY + 25);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    const points = [
      '• Lãnh thổ Việt Nam nằm trọn trong vùng nội chí tuyến Bắc.',
      '• Do đó, tất cả các địa điểm đều có 2 lần Mặt Trời lên thiên đỉnh.',
      '• TP. HCM (10.8°B): xảy ra vào ngày ~17/4 và ~25/8.',
      '• Hà Nội (21.0°B): xảy ra vào ngày ~26/5 và ~18/7.',
      '• Hà Giang (vĩ độ cao hơn): 2 lần lên thiên đỉnh sát nhau (cuối tháng 6).',
      '• Cà Mau (vĩ độ thấp hơn): 2 lần lên thiên đỉnh xa nhau (tháng 4 & tháng 9).'
    ];

    points.forEach((line, idx) => {
      ctx.fillText(line, panelX + 15, panelY + 55 + idx * 22);
    });
  }
}

const ZenithSunSim: React.FC<{ customParams?: any; customQuestions?: any }> = ({ customParams, customQuestions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(true);
  const tabRef = useRef('concept');
  const frameRef = useRef(0);

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState('concept');
  const [day, setDay] = useState(120); // day of year (1-365)
  const [activityOpen, setActivityOpen] = useState(false);

  const playingRef = useRef(true);
  const speedRef   = useRef(1);
  const dayRef     = useRef(120);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { dayRef.current = day; }, [day]);

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
      frameRef.current += 1;

      // Automatically increment day of year if simulation is playing
      if (playingRef.current) {
        dayRef.current = dayRef.current + speedRef.current;
        if (dayRef.current > 365) dayRef.current = 1;
        setDay(Math.round(dayRef.current));
      }

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
          drawScene(ctx, W, H, tabRef.current, dayRef.current, playingRef.current, (d) => { dayRef.current = d; setDay(Math.round(d)); });
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
  }, []); // ← empty deps: loop runs once, reads live values via refs

  const questions = customQuestions && customQuestions.length > 0
    ? customQuestions
    : (TAB_QUESTIONS[tab] || ALL_QUESTIONS);

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden select-none"
         style={{ background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      <SimTopBar
        title="Mặt Trời lên thiên đỉnh"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Day Slider overlay */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 w-3/4 max-w-md bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col gap-2">
          <div className="flex justify-between text-[10px] font-bold text-slate-300">
            <span>Chọn thời điểm trong năm (Ngày {day}/365):</span>
            <span className="text-amber-400">
              {DAYS_OF_YEAR.find(d => Math.abs(d.day - day) < 12)?.label || `Tháng ${Math.ceil(day / 30.5)}`}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="365"
            value={day}
            onChange={e => setDay(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <SimActivity
          title="Câu hỏi ôn tập"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor="#f59e0b"
        />
      </div>

      <SimTabs tabs={TABS} active={tab} onChange={t => setTab(t)} />
    </div>
  );
};

export default ZenithSunSim;
