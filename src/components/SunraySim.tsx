import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

const TABS: SimTab[] = [
  { id: 'equinox',  label: '🌗 Xuân/Thu phân',    color: '#10b981' },
  { id: 'summer',   label: '☀️ Hạ chí',            color: '#f59e0b' },
  { id: 'winter',   label: '❄️ Đông chí',           color: '#38bdf8' },
  { id: 'zones',    label: '🌐 Các đới nhiệt',      color: '#a78bfa' },
  { id: 'compare',  label: '📊 So sánh',            color: '#f472b6' },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  equinox: [
    { id: 'eq1', hint: 'góc nhập xạ tại Xích đạo vào ngày xuân/thu phân', answer: '90°', options: ['90°', '45°', '66.5°', '23.5°'] },
    { id: 'eq2', hint: 'ngày xuân phân và thu phân, ngày và đêm dài', answer: 'Bằng nhau', options: ['Bằng nhau', 'Ngày dài hơn', 'Đêm dài hơn', 'Khác nhau'] },
  ],
  summer: [
    { id: 'su1', hint: 'Mặt Trời chiếu thẳng vào vào hạ chí (22/6)', answer: 'Chí tuyến Bắc', options: ['Chí tuyến Bắc', 'Chí tuyến Nam', 'Xích đạo', 'Vòng Bắc cực'] },
    { id: 'su2', hint: 'bán cầu Bắc vào hạ chí nhận được nhiệt lượng', answer: 'Nhiều nhất', options: ['Nhiều nhất', 'Ít nhất', 'Bằng nhau', 'Không đổi'] },
  ],
  winter: [
    { id: 'wi1', hint: 'Mặt Trời chiếu thẳng vào đông chí (22/12)', answer: 'Chí tuyến Nam', options: ['Chí tuyến Nam', 'Chí tuyến Bắc', 'Xích đạo', 'Vòng Nam cực'] },
    { id: 'wi2', hint: 'ngày 22/12 tại cực Bắc', answer: 'Đêm dài 24h', options: ['Đêm dài 24h', 'Ngày dài 24h', 'Ngày bằng đêm', 'Không có mặt trời'] },
  ],
  zones: [
    { id: 'zo1', hint: 'đới nóng nằm giữa hai chí tuyến, nhận nhiệt lượng', answer: 'Nhiều nhất', options: ['Nhiều nhất', 'Ít nhất', 'Trung bình', 'Không đổi'] },
    { id: 'zo2', hint: 'đới lạnh bắt đầu từ', answer: 'Vòng cực', options: ['Vòng cực', 'Chí tuyến', 'Xích đạo', 'Cực'] },
  ],
  compare: [
    { id: 'co1', hint: 'góc nhập xạ càng lớn, nhiệt lượng nhận được càng', answer: 'Nhiều', options: ['Nhiều', 'Ít', 'Không đổi', 'Phân tán'] },
    { id: 'co2', hint: 'vùng xích đạo quanh năm nóng vì', answer: 'Góc nhập xạ lớn', options: ['Góc nhập xạ lớn', 'Gần Mặt Trời', 'Không có tuyết', 'Nhiều mây'] },
  ],
};

function drawSunray(
  canvas: HTMLCanvasElement,
  tab: string,
  angle: number,
  pulse: number,
  playing: boolean
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#06090f';
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.3 * Math.abs(Math.sin(i * 7.3 + pulse))})`;
    ctx.beginPath();
    ctx.arc((Math.sin(i * 4723) * 0.5 + 0.5) * W, (Math.cos(i * 9182) * 0.5 + 0.5) * H * 0.75, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  const groundY = H * 0.78;

  // Ground + atmosphere
  const atmGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  atmGrad.addColorStop(0, '#03051a');
  atmGrad.addColorStop(1, '#0a1540');
  ctx.fillStyle = atmGrad;
  ctx.fillRect(0, 0, W, groundY);

  // Ground
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
  groundGrad.addColorStop(0, '#14532d');
  groundGrad.addColorStop(1, '#052e16');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, W, H - groundY);

  // Horizontal reference
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

  // Latitude markers
  const seasons: Record<string, number> = { equinox: W * 0.5, summer: W * 0.75, winter: W * 0.25 };
  const hitX = tab === 'compare' ? W * 0.5 : (seasons[tab] ?? W * 0.5);

  const markers = [
    { x: W * 0.12, label: '90°N Cực Bắc', color: '#93c5fd' },
    { x: W * 0.25, label: '23.5°N CTB', color: '#fde68a' },
    { x: W * 0.50, label: '0° XĐ', color: '#6ee7b7' },
    { x: W * 0.75, label: '23.5°S CTN', color: '#fde68a' },
    { x: W * 0.88, label: '90°S Cực Nam', color: '#93c5fd' },
  ];
  markers.forEach(m => {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(m.x, groundY - 4); ctx.lineTo(m.x, groundY + 4); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = m.color;
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, m.x, groundY + 14);
  });

  // ── Zones tab: color bands ──
  if (tab === 'zones') {
    const bands = [
      { x1: 0,         x2: W * 0.18,  color: 'rgba(147,197,253,0.15)', label: 'Đới lạnh BCN' },
      { x1: W * 0.18,  x2: W * 0.38,  color: 'rgba(167,243,208,0.1)',  label: 'Đới ôn hoà BCN' },
      { x1: W * 0.38,  x2: W * 0.62,  color: 'rgba(253,224,71,0.15)',  label: '🌡️ Đới nóng' },
      { x1: W * 0.62,  x2: W * 0.82,  color: 'rgba(167,243,208,0.1)',  label: 'Đới ôn hoà BCS' },
      { x1: W * 0.82,  x2: W,         color: 'rgba(147,197,253,0.15)', label: 'Đới lạnh BCS' },
    ];
    bands.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x1, 0, b.x2 - b.x1, groundY);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, (b.x1 + b.x2) / 2, groundY * 0.15);
    });
  }

  // ── Compare tab: multiple rays ──
  if (tab === 'compare') {
    const rays = [
      { hitX: W * 0.25, angle: 30, color: '#93c5fd', label: '30°' },
      { hitX: W * 0.5, angle: 60, color: '#6ee7b7', label: '60°' },
      { hitX: W * 0.75, angle: 90, color: '#fde68a', label: '90°' },
    ];
    rays.forEach(r => {
      const rad = (r.angle * Math.PI) / 180;
      const rLen = H * 0.5;
      const sx = r.hitX - rLen * Math.cos(rad);
      const sy = groundY - rLen * Math.sin(rad);
      const dispersion = Math.min(W * 0.25, 120 / Math.sin(rad));

      const glowGrad = ctx.createRadialGradient(r.hitX, groundY, 0, r.hitX, groundY, dispersion);
      glowGrad.addColorStop(0, `${r.color}bb`);
      glowGrad.addColorStop(1, `${r.color}00`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(r.hitX, groundY, dispersion, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(r.hitX, groundY); ctx.stroke();

      ctx.fillStyle = r.color;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.label, r.hitX, groundY - 8);

      // Sun orb
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
      sg.addColorStop(0, '#fff');
      sg.addColorStop(0.4, r.color);
      sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx, sy, 14, 0, Math.PI * 2); ctx.fill();
    });
    return; // skip single-ray drawing
  }

  // ── Single ray ──
  const angleRad = (angle * Math.PI) / 180;
  const rLen = H * 0.55;
  const sunX = hitX - rLen * Math.cos(angleRad);
  const sunY = groundY - rLen * Math.sin(angleRad);
  const disp = Math.min(W * 0.3, 160 / Math.sin(angleRad));

  // Ground glow / illuminated area
  const heatColor = angle > 60 ? '#ef4444' : angle > 35 ? '#f59e0b' : '#3b82f6';
  const glowGrad = ctx.createRadialGradient(hitX, groundY, 5, hitX, groundY, disp);
  glowGrad.addColorStop(0, `${heatColor}cc`);
  glowGrad.addColorStop(0.35, `${heatColor}66`);
  glowGrad.addColorStop(1, `${heatColor}00`);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(hitX, groundY, disp, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main ray
  const rayAlpha = playing ? 0.8 + 0.15 * Math.sin(pulse) : 0.7;
  ctx.strokeStyle = `rgba(253,224,71,${rayAlpha})`;
  ctx.lineWidth = 3;
  ctx.shadowColor = '#fde047'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(hitX, groundY); ctx.stroke();
  ctx.shadowBlur = 0;

  // Parallel rays
  ctx.strokeStyle = 'rgba(253,224,71,0.2)';
  ctx.lineWidth = 1;
  [-80, -40, 40, 80].forEach(off => {
    ctx.beginPath();
    ctx.moveTo(sunX + off, sunY);
    ctx.lineTo(hitX + off, groundY);
    ctx.stroke();
  });

  // Angle arc
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hitX, groundY, 40, Math.PI, Math.PI + angleRad);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${angle}°`, hitX - 38, groundY - 24);

  // Dispersion indicator
  const dispLabel = angle > 60 ? '🔴 Tập trung cao' : angle > 35 ? '🟡 Trung bình' : '🔵 Phân tán rộng';
  ctx.fillStyle = heatColor;
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(dispLabel, hitX, groundY - 44);

  // Sun orb
  const sunPulse = 18 + 2 * Math.sin(pulse);
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, sunPulse);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.3, '#fde047');
  sunGrad.addColorStop(0.7, '#ea580c');
  sunGrad.addColorStop(1, 'rgba(234,88,12,0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath(); ctx.arc(sunX, sunY, sunPulse, 0, Math.PI * 2); ctx.fill();

  // Season labels
  const seasonLabel: Record<string, string> = {
    equinox: 'Xuân/Thu phân — Mặt Trời chiếu thẳng Xích đạo',
    summer: 'Hạ chí — Mặt Trời chiếu thẳng Chí tuyến Bắc (23.5°B)',
    winter: 'Đông chí — Mặt Trời chiếu thẳng Chí tuyến Nam (23.5°N)',
    zones: '3 đới nhiệt — dựa theo góc nhập xạ trung bình năm',
  };
  ctx.fillStyle = 'rgba(203,213,225,0.8)';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(seasonLabel[tab] ?? '', W / 2, H - 6);
}

const SunraySim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const activeRef = useRef(true);
  const pulseRef = useRef(0);
  const playRef = useRef(true);
  const speedRef = useRef(1.0);
  const tabRef = useRef('equinox');
  const angleRef = useRef(90);

  const [tab, setTab] = useState('equinox');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [angle, setAngle] = useState(90);
  const [activityOpen, setActivityOpen] = useState(true);

  useEffect(() => { tabRef.current = tab; if (tab === 'equinox') setAngle(90); else if (tab === 'summer') setAngle(66); else if (tab === 'winter') setAngle(43); }, [tab]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { angleRef.current = angle; }, [angle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = true;

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
      if (playRef.current) pulseRef.current += 0.05 * speedRef.current;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr, H = canvas.height / dpr;
      if (W > 0 && H > 0) {
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        drawSunray(off, tabRef.current, angleRef.current, pulseRef.current, playRef.current);
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

  const questions = TAB_QUESTIONS[tab] || TAB_QUESTIONS['equinox'];

  return (
    <div className="flex flex-col h-full bg-[#07091a] rounded-2xl overflow-hidden select-none" style={{ fontFamily: "'Inter',sans-serif" }}>
      <SimTopBar
        title="Góc nhập xạ — Bức xạ Mặt Trời"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
        extraControls={
          tab !== 'compare' && tab !== 'zones' ? (
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-500 font-bold">Góc</span>
              <input type="range" min="10" max="90" value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="w-16 accent-amber-500 cursor-pointer" />
              <span className="text-[9px] text-amber-400 font-black w-6">{angle}°</span>
            </div>
          ) : undefined
        }
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        <SimActivity
          title="Điền vào chỗ trống"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor="#b45309"
        />
      </div>

      <SimTabs tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
};

export default SunraySim;
