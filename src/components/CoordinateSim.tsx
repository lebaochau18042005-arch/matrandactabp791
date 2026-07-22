import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tabs — matching the Mozaik3D image ──────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'main_lat',   label: 'Đường vĩ tuyến chính', color: '#ef4444' },
  { id: 'prime_lon',  label: 'Kinh tuyến gốc',        color: '#f59e0b' },
  { id: 'parallels',  label: 'Các đường vĩ tuyến',    color: '#3b82f6' },
  { id: 'meridians',  label: 'Các đường kinh tuyến',  color: '#10b981' },
  { id: 'coord',      label: 'Hệ tọa độ',             color: '#a78bfa' },
];

// ─── Questions per tab ────────────────────────────────────────────────────────
const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  main_lat: [
    { id: 'ml1', hint: ': xác định ranh giới bắc-nam của đới nóng', answer: 'Các chí tuyến', options: ['Các chí tuyến', 'Các vòng cực', 'Xích đạo', 'Kinh tuyến gốc'] },
    { id: 'ml2', hint: ': ranh giới các đới khí hậu lạnh', answer: 'Các vòng cực', options: ['Các vòng cực', 'Chí tuyến', 'Xích đạo', 'Vĩ tuyến 45°'] },
  ],
  prime_lon: [
    { id: 'pl1', hint: ': Đông bán cầu, Tây bán cầu', answer: 'Kinh tuyến gốc', options: ['Kinh tuyến gốc', 'Xích đạo', 'Vĩ tuyến gốc', 'Kinh tuyến 180°'] },
    { id: 'pl2', hint: ': đi qua đài thiên văn Greenwich, Anh', answer: 'Kinh tuyến 0°', options: ['Kinh tuyến 0°', 'Kinh tuyến 90°', 'Vĩ tuyến 0°', 'Kinh tuyến 180°'] },
  ],
  parallels: [
    { id: 'pa1', hint: ': bắc-nam', answer: 'Các đường vĩ tuyến', options: ['Các đường vĩ tuyến', 'Các đường kinh tuyến', 'Đường chân trời', 'Đường xích đạo'] },
    { id: 'pa2', hint: ': vòng tròn song song với Xích đạo', answer: 'Đường vĩ tuyến', options: ['Đường vĩ tuyến', 'Đường kinh tuyến', 'Đường tự nhiên', 'Đường sinh'] },
    { id: 'pa3', hint: ': vĩ tuyến dài nhất và chia đôi Trái Đất', answer: 'Xích đạo', options: ['Xích đạo', 'Chí tuyến Bắc', 'Vòng Bắc cực', 'Kinh tuyến gốc'] },
  ],
  meridians: [
    { id: 'me1', hint: ': đông-tây', answer: 'Các đường kinh tuyến', options: ['Các đường kinh tuyến', 'Các đường vĩ tuyến', 'Xích đạo', 'Đường đổi ngày'] },
    { id: 'me2', hint: ': số đường kinh tuyến nếu chia mỗi 1°', answer: '360 kinh tuyến', options: ['360 kinh tuyến', '180 kinh tuyến', '90 kinh tuyến', '720 kinh tuyến'] },
  ],
  coord: [
    { id: 'co1', hint: ': dùng để xác định vị trí một điểm trên Trái Đất', answer: 'Hệ tọa độ địa lý', options: ['Hệ tọa độ địa lý', 'Bản đồ địa hình', 'La bàn', 'GPS vệ tinh'] },
    { id: 'co2', hint: ': kinh độ và vĩ độ hợp thành', answer: 'Tọa độ địa lý', options: ['Tọa độ địa lý', 'Lưới ô vuông', 'Hướng gió', 'Múi giờ'] },
  ],
};

// ─── Draw coordinate globe ────────────────────────────────────────────────────
function drawCoordinate(
  canvas: HTMLCanvasElement,
  tab: string,
  angle: number,
  pulse: number,
  clickedLine: { type: 'lat' | 'lon'; value: number } | null
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.38;

  ctx.fillStyle = '#06090f';
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 55; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.35 * Math.abs(Math.sin(i * 7.3 + pulse * 0.5))})`;
    ctx.beginPath();
    ctx.arc((Math.sin(i * 4723) * 0.5 + 0.5) * W, (Math.cos(i * 9182) * 0.5 + 0.5) * H, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Atmosphere glow
  const glow = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.22);
  glow.addColorStop(0, 'rgba(56,189,248,0.3)');
  glow.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2); ctx.fill();

  // Project helper
  function project(latDeg: number, lonDeg: number) {
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180 + angle;
    const x = R * Math.cos(lat) * Math.sin(lon);
    const y = -R * Math.sin(lat);
    const z = R * Math.cos(lat) * Math.cos(lon);
    return { x: cx + x, y: cy + y, z, visible: z > -R * 0.05 };
  }

  // Ocean sphere
  const sphereGrad = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.05, cx, cy, R);
  sphereGrad.addColorStop(0, '#1e4d8c');
  sphereGrad.addColorStop(0.5, '#143e70');
  sphereGrad.addColorStop(1, '#0a1e40');
  ctx.fillStyle = sphereGrad;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

  // Continents (clip to sphere)
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
  const drawCont = (pts: [number, number][], col: string) => {
    ctx.beginPath();
    let first = true;
    pts.forEach(([la, lo]) => {
      const p = project(la, lo);
      if (p.visible) {
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      } else first = true;
    });
    ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
  };
  drawCont([[37,-5],[55,18],[65,30],[45,40],[35,30],[10,15],[-5,12],[-20,18],[-34,26],[-10,42],[5,45],[25,35],[37,-5]], 'rgba(34,197,94,0.7)');
  drawCont([[50,-125],[60,-100],[45,-75],[35,-80],[20,-90],[5,-55],[-20,-45],[-55,-70],[-40,-70],[5,-55],[35,-90],[50,-125]], 'rgba(22,163,74,0.65)');
  drawCont([[35,60],[55,80],[65,100],[50,130],[35,100],[25,80],[35,60]], 'rgba(16,185,129,0.55)');
  ctx.restore();

  const showParallels = tab === 'parallels' || tab === 'main_lat' || tab === 'coord';
  const showMeridians = tab === 'meridians' || tab === 'prime_lon' || tab === 'coord';

  // ── Draw latitude lines ──
  if (showParallels) {
    const lats = tab === 'main_lat'
      ? [90, 66.5, 23.5, 0, -23.5, -66.5, -90]
      : [-80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80];

    lats.forEach(lat => {
      const isKey = Math.abs(lat) === 0;
      const isChituyen = Math.abs(lat) === 23.5;
      const isVongCuc = Math.abs(lat) === 66.5;
      const isClicked = clickedLine?.type === 'lat' && clickedLine.value === lat;

      let lineColor = 'rgba(255,255,255,0.2)';
      let lineWidth = 0.8;
      let dash: number[] = [];

      if (isKey) { lineColor = '#ef4444'; lineWidth = 2.5; }
      else if (isChituyen) { lineColor = 'rgba(253,224,71,0.85)'; lineWidth = 2; dash = [5, 4]; }
      else if (isVongCuc) { lineColor = 'rgba(147,197,253,0.85)'; lineWidth = 2; dash = [5, 4]; }

      if (isClicked) { lineColor = '#ffffff'; lineWidth = 3; dash = []; }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(dash);
      ctx.beginPath();
      let first = true;
      for (let lon = 0; lon <= 365; lon += 4) {
        const p = project(lat, lon);
        if (p.visible) {
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        } else first = true;
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Label on front side
      const frontLon = 90 - angle * (180 / Math.PI);
      const lp = project(lat, frontLon);
      if (lp.visible && (isKey || isChituyen || isVongCuc || isClicked)) {
        const label = lat === 0 ? '0° Xích đạo'
          : lat === 23.5 ? '23.5°B CTB'
          : lat === -23.5 ? '23.5°N CTN'
          : lat === 66.5 ? '66.5°B VBC'
          : lat === -66.5 ? '66.5°N VNC'
          : lat > 0 ? `${lat}°B` : `${Math.abs(lat)}°N`;
        ctx.fillStyle = lineColor;
        ctx.font = `bold 9px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(label, cx + R + 6, lp.y + 4);
      }
    });
  }

  // ── Draw longitude lines ──
  if (showMeridians) {
    const lons = tab === 'prime_lon'
      ? [0, 180]
      : Array.from({ length: 24 }, (_, i) => i * 15);

    lons.forEach(lon => {
      const isPrime = lon === 0 || lon === 180;
      const isClicked = clickedLine?.type === 'lon' && clickedLine.value === lon;

      let lineColor = 'rgba(255,255,255,0.18)';
      let lineWidth = 0.8;

      if (isPrime && tab === 'prime_lon') { lineColor = '#f59e0b'; lineWidth = 2.5; }
      else if (lon % 90 === 0) { lineColor = 'rgba(255,255,255,0.45)'; lineWidth = 1.2; }
      if (isClicked) { lineColor = '#ffffff'; lineWidth = 3; }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      let first = true;
      for (let lat = -89; lat <= 89; lat += 3) {
        const p = project(lat, lon);
        if (p.visible) {
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        } else first = true;
      }
      ctx.stroke();

      // Label for prime
      if ((isPrime && tab === 'prime_lon') || isClicked) {
        const lp = project(0, lon);
        if (lp.visible) {
          ctx.fillStyle = lineColor;
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          const lbl = lon === 0 ? '0° KTG' : `${lon}°`;
          ctx.fillText(lbl, lp.x, lp.y - 6);
        }
      }
    });
  }

  // Degree numbers (like the image — vertical axis labels)
  if (tab === 'parallels' || tab === 'coord') {
    [60, 50, 40, 30, 20, 10, 0, -10, -20, -30, -40].forEach(lat => {
      const p = project(lat, 90 - angle * (180 / Math.PI));
      if (p.visible) {
        ctx.fillStyle = lat === 0 ? '#ef4444' : 'rgba(255,255,255,0.65)';
        ctx.font = `bold ${lat === 0 ? 10 : 8}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`${lat > 0 ? lat + '°' : lat < 0 ? Math.abs(lat) + '°' : '0°'}`, cx + R + 32, p.y + 3);
      }
    });
  }

  // Vertical line guide (like image)
  if (tab === 'parallels' || tab === 'coord') {
    const topP = project(80, 90 - angle * (180 / Math.PI));
    const botP = project(-80, 90 - angle * (180 / Math.PI));
    if (topP.visible && botP.visible) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(cx + R + 15, topP.y);
      ctx.lineTo(cx + R + 15, botP.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Sphere shading
  const shadeGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.5, cx, cy, R);
  shadeGrad.addColorStop(0, 'rgba(0,0,0,0)');
  shadeGrad.addColorStop(0.8, 'rgba(0,0,0,0.25)');
  shadeGrad.addColorStop(1, 'rgba(0,0,0,0.82)');
  ctx.fillStyle = shadeGrad;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

  // Outline
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

  // Coord tab: show selected point and its coordinates
  if (tab === 'coord') {
    const POINT_LAT = 21, POINT_LON = 105; // Hanoi approx
    const pp = project(POINT_LAT, POINT_LON);
    if (pp.visible) {
      ctx.fillStyle = '#f472b6';
      ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(pp.x, pp.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f9a8d4';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`📍 Hà Nội (${POINT_LAT}°B, ${POINT_LON}°Đ)`, pp.x + 7, pp.y + 3);
    }
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CoordinateSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const activeRef = useRef(true);
  const pulseRef = useRef(0);
  const angleRef = useRef(0);
  const dragRef = useRef({ dragging: false, startX: 0, baseAngle: 0, dragAngle: 0 });
  const tabRef = useRef('main_lat');
  const clickedRef = useRef<{ type: 'lat' | 'lon'; value: number } | null>(null);
  const playRef = useRef(true);
  const speedRef = useRef(1);

  const [tab, setTab] = useState('main_lat');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activityOpen, setActivityOpen] = useState(true);
  const [clickedLine, setClickedLine] = useState<{ type: 'lat' | 'lon'; value: number } | null>(null);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { clickedRef.current = clickedLine; }, [clickedLine]);

  // Mouse drag
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const d = dragRef.current;

    const onDown = (e: MouseEvent) => {
      d.dragging = true; d.startX = e.clientX; d.baseAngle = d.dragAngle;
      canvas.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent) => {
      if (!d.dragging) return;
      d.dragAngle = d.baseAngle + (e.clientX - d.startX) * 0.012;
    };
    const onUp = () => { d.dragging = false; canvas.style.cursor = 'grab'; };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.style.cursor = 'grab';
    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = true;
    const d = dragRef.current;

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
      if (!activeRef.current) return;
      if (playRef.current && !d.dragging) {
        angleRef.current += 0.005 * speedRef.current;
      }
      if (playRef.current) pulseRef.current += 0.04 * speedRef.current;

      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr, H = canvas.height / dpr;
      if (W > 0 && H > 0) {
        const totalAngle = angleRef.current + d.dragAngle;
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        drawCoordinate(off, tabRef.current, totalAngle, pulseRef.current, clickedRef.current);
        const ctx = canvas.getContext('2d');
        if (ctx) {
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
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(retryTimer);
      ro.disconnect();
    };
  }, []);

  const questions = TAB_QUESTIONS[tab] || TAB_QUESTIONS['main_lat'];
  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div className="flex flex-col h-full bg-[#07091a] rounded-2xl overflow-hidden select-none" style={{ fontFamily: "'Inter',sans-serif" }}>
      <SimTopBar
        title="Hệ tọa độ địa lý"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        <SimActivity
          title="Điền vào chỗ trống"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor={activeTab?.color ?? '#3b82f6'}
        />

        {/* Tab description */}
        <div className="absolute bottom-2 left-2 right-2 text-[9px] text-slate-500 font-medium text-center pointer-events-none">
          {tab === 'main_lat' && '🔴 Xích đạo · 🟡 Chí tuyến Bắc/Nam · 🔵 Vòng Bắc/Nam cực'}
          {tab === 'prime_lon' && '🟡 Kinh tuyến gốc 0° (Greenwich) phân chia Đông/Tây bán cầu'}
          {tab === 'parallels' && 'Đường vĩ tuyến song song với Xích đạo — đo theo hướng Bắc/Nam · 💡 Kéo để xoay'}
          {tab === 'meridians' && 'Đường kinh tuyến nối hai cực — đo theo hướng Đông/Tây · 💡 Kéo để xoay'}
          {tab === 'coord' && '📍 Vị trí Hà Nội: 21°B vĩ độ Bắc, 105°Đ kinh độ Đông · 💡 Kéo để xoay'}
        </div>
      </div>

      <SimTabs tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
};

export default CoordinateSim;
