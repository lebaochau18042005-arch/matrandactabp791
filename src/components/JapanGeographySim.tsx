import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'overview',  label: '🗾 Tổng quan',       color: '#3b82f6' },
  { id: 'currents',  label: '🌊 Dòng biển',        color: '#06b6d4' },
  { id: 'volcanoes', label: '🌋 Núi lửa & ĐĐ',    color: '#ef4444' },
  { id: 'climate',   label: '🌤️ Khí hậu',          color: '#10b981' },
  { id: 'economy',   label: '⚡ Kinh tế biển',     color: '#f59e0b' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  overview: [
    { id: 'ov1', hint: 'quần đảo lớn nhất của Nhật Bản', answer: 'Honshu', options: ['Honshu', 'Kyushu', 'Hokkaido', 'Shikoku'] },
    { id: 'ov2', hint: 'Nhật Bản có bao nhiêu đảo lớn chính?', answer: '4 đảo', options: ['4 đảo', '3 đảo', '5 đảo', '6 đảo'] },
  ],
  currents: [
    { id: 'cu1', hint: 'dòng biển nóng chảy từ Nam lên', answer: 'Kuroshio', options: ['Kuroshio', 'Oyashio', 'Gulfstream', 'Đông Úc'] },
    { id: 'cu2', hint: 'dòng biển lạnh chảy từ Bắc xuống', answer: 'Oyashio', options: ['Oyashio', 'Kuroshio', 'Bắc Thái Bình Dương', 'Alaska'] },
    { id: 'cu3', hint: 'hội tụ 2 dòng biển tạo ra', answer: 'Ngư trường lớn', options: ['Ngư trường lớn', 'Bão tố', 'Sóng thần', 'Hoang mạc'] },
  ],
  volcanoes: [
    { id: 'vo1', hint: 'Nhật Bản nằm trên vành đai lửa', answer: 'Thái Bình Dương', options: ['Thái Bình Dương', 'Đại Tây Dương', 'Ấn Độ Dương', 'Bắc Băng Dương'] },
    { id: 'vo2', hint: 'núi lửa biểu tượng của Nhật Bản', answer: 'Phú Sĩ', options: ['Phú Sĩ', 'Asama', 'Kirishima', 'Aso'] },
  ],
  climate: [
    { id: 'cl1', hint: 'khí hậu chủ yếu ở Nhật Bản', answer: 'Gió mùa', options: ['Gió mùa', 'Sa mạc', 'Địa Trung Hải', 'Cực'] },
    { id: 'cl2', hint: 'mùa có tuyết rơi nhiều ở Hokkaido', answer: 'Mùa đông', options: ['Mùa đông', 'Mùa hè', 'Mùa xuân', 'Mùa thu'] },
  ],
  economy: [
    { id: 'ec1', hint: 'ngành kinh tế biển nổi tiếng của Nhật Bản', answer: 'Đánh bắt thủy sản', options: ['Đánh bắt thủy sản', 'Khai thác dầu', 'Làm muối', 'Du lịch'] },
    { id: 'ec2', hint: 'Nhật Bản thuộc top đầu thế giới về', answer: 'Đóng tàu biển', options: ['Đóng tàu biển', 'Khai thác khoáng sản', 'Nuôi cá hồi', 'Khai thác gỗ'] },
  ],
};

// ─── Particle system for currents ─────────────────────────────────────────────
interface Particle { progress: number; speed: number; offset: number; type: 'warm' | 'cold' }

function makeParticles(n: number, type: 'warm' | 'cold'): Particle[] {
  return Array.from({ length: n }, () => ({
    progress: Math.random(),
    speed: 0.002 + Math.random() * 0.003,
    offset: (Math.random() - 0.5) * 12,
    type,
  }));
}

// ─── Draw Japan map on canvas ─────────────────────────────────────────────────
function drawJapan(
  canvas: HTMLCanvasElement,
  tab: string,
  particles: { warm: Particle[]; cold: Particle[]; fish: { x: number; y: number; age: number; maxAge: number }[] },
  pulse: number,
  playing: boolean,
  speed: number,
  activeMarker: string | null
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#06090f';
  ctx.fillRect(0, 0, W, H);

  // Ocean background
  const oceanGrad = ctx.createRadialGradient(W * 0.6, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.7);
  oceanGrad.addColorStop(0, '#0c4a6e');
  oceanGrad.addColorStop(1, '#06090f');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  const showCurrents = tab === 'currents' || tab === 'overview';
  const showVolcanoes = tab === 'volcanoes' || tab === 'overview';
  const showClimate = tab === 'climate';
  const showEconomy = tab === 'economy';

  // ── Ocean currents ──
  const intersectX = W * 0.62, intersectY = H * 0.50;
  if (showCurrents) {
    // Warm Kuroshio particles (red)
    particles.warm.forEach(p => {
      let px, py;
      const t = p.progress;
      if (t < 0.7) {
        const s = t / 0.7;
        px = (1 - s) ** 2 * (W * 0.18) + 2 * (1 - s) * s * (W * 0.35) + s ** 2 * intersectX;
        py = (1 - s) ** 2 * (H * 0.95) + 2 * (1 - s) * s * (H * 0.75) + s ** 2 * intersectY;
      } else {
        const s = (t - 0.7) / 0.3;
        px = (1 - s) * intersectX + s * (W * 0.92);
        py = (1 - s) * intersectY + s * (H * 0.46);
      }
      px += Math.sin(p.progress * 12) * 6 + p.offset;
      ctx.fillStyle = 'rgba(239,68,68,0.85)';
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Cold Oyashio particles (blue)
    particles.cold.forEach(p => {
      let px, py;
      const t = p.progress;
      if (t < 0.6) {
        const s = t / 0.6;
        px = (1 - s) ** 2 * (W * 0.92) + 2 * (1 - s) * s * (W * 0.78) + s ** 2 * intersectX;
        py = (1 - s) ** 2 * (H * 0.08) + 2 * (1 - s) * s * (H * 0.28) + s ** 2 * intersectY;
      } else {
        const s = (t - 0.6) / 0.4;
        px = (1 - s) * intersectX + s * (W * 0.45);
        py = (1 - s) * intersectY + s * (H * 0.78);
      }
      px += Math.cos(p.progress * 12) * 6 + p.offset;
      ctx.fillStyle = 'rgba(59,130,246,0.85)';
      ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Fish stars at intersection
    particles.fish.forEach(f => {
      const size = Math.sin((f.age / f.maxAge) * Math.PI) * 5;
      ctx.fillStyle = 'rgba(234,179,8,0.9)';
      ctx.shadowColor = '#eab308'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(f.x, f.y, size / 2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Kuroshio label
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Kuroshio →', W * 0.28, H * 0.82);
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('← Oyashio', W * 0.88, H * 0.18);
  }

  // ── Japan landmass ──
  // Main island (Honshu)
  ctx.beginPath();
  ctx.moveTo(W * 0.35, H * 0.70);
  ctx.bezierCurveTo(W * 0.43, H * 0.64, W * 0.52, H * 0.57, W * 0.56, H * 0.50);
  ctx.bezierCurveTo(W * 0.61, H * 0.43, W * 0.66, H * 0.37, W * 0.71, H * 0.26);
  ctx.bezierCurveTo(W * 0.74, H * 0.28, W * 0.68, H * 0.43, W * 0.61, H * 0.52);
  ctx.bezierCurveTo(W * 0.56, H * 0.59, W * 0.49, H * 0.68, W * 0.38, H * 0.73);
  ctx.closePath();
  ctx.fillStyle = showClimate ? '#14532d' : '#334155';
  ctx.fill();
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.stroke();

  // Hokkaido
  ctx.beginPath();
  ctx.moveTo(W * 0.72, H * 0.24);
  ctx.bezierCurveTo(W * 0.77, H * 0.16, W * 0.86, H * 0.13, W * 0.83, H * 0.24);
  ctx.bezierCurveTo(W * 0.80, H * 0.31, W * 0.74, H * 0.33, W * 0.72, H * 0.24);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Kyushu & Shikoku
  ctx.beginPath();
  ctx.moveTo(W * 0.25, H * 0.79);
  ctx.bezierCurveTo(W * 0.28, H * 0.74, W * 0.33, H * 0.74, W * 0.31, H * 0.81);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(W * 0.34, H * 0.74);
  ctx.bezierCurveTo(W * 0.37, H * 0.70, W * 0.41, H * 0.73, W * 0.38, H * 0.76);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // ── Tectonic / Volcanic zone ──
  if (showVolcanoes) {
    // Fault line
    ctx.strokeStyle = `rgba(239,68,68,${0.3 + 0.15 * Math.sin(pulse)})`;
    ctx.lineWidth = 8 + 4 * Math.sin(pulse);
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(W * 0.42, H * 0.86);
    ctx.bezierCurveTo(W * 0.49, H * 0.68, W * 0.56, H * 0.51, W * 0.73, H * 0.40);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1.5;

    // Volcano markers
    const volcanoes = [
      { x: W * 0.52, y: H * 0.57, name: 'Phú Sĩ', key: 'fuji' },
      { x: W * 0.62, y: H * 0.45, name: 'Asama', key: 'asama' },
      { x: W * 0.68, y: H * 0.35, name: 'Bandai', key: 'bandai' },
    ];

    volcanoes.forEach(v => {
      const fp = Math.abs(Math.sin(pulse + v.x));
      const isActive = activeMarker === v.key;
      ctx.fillStyle = `rgba(249,115,22,${0.5 + 0.4 * fp})`;
      ctx.shadowColor = '#f97316'; ctx.shadowBlur = isActive ? 16 : 6;
      ctx.beginPath();
      ctx.moveTo(v.x, v.y - 9);
      ctx.lineTo(v.x - 7, v.y + 4);
      ctx.lineTo(v.x + 7, v.y + 4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = `rgba(249,115,22,${0.8 - fp})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(v.x, v.y + 2, 5 + fp * 14, 0, Math.PI * 2);
      ctx.stroke();

      if (isActive || v.key === 'fuji') {
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${isActive ? 10 : 8}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(v.name, v.x, v.y - 13);
      }
    });
  }

  // ── Climate overlay ──
  if (showClimate) {
    // Cold north
    const northGrad = ctx.createLinearGradient(W * 0.5, 0, W * 0.5, H * 0.35);
    northGrad.addColorStop(0, 'rgba(147,197,253,0.25)');
    northGrad.addColorStop(1, 'rgba(147,197,253,0)');
    ctx.fillStyle = northGrad;
    ctx.fillRect(0, 0, W, H * 0.35);

    // Hot south
    const southGrad = ctx.createLinearGradient(W * 0.5, H * 0.65, W * 0.5, H);
    southGrad.addColorStop(0, 'rgba(253,224,71,0)');
    southGrad.addColorStop(1, 'rgba(253,130,24,0.25)');
    ctx.fillStyle = southGrad;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);

    ctx.fillStyle = '#93c5fd'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Ôn đới lạnh ❄️', W * 0.06, H * 0.14);
    ctx.fillStyle = '#86efac';
    ctx.fillText('Ôn đới ấm', W * 0.06, H * 0.45);
    ctx.fillStyle = '#fde68a';
    ctx.fillText('Cận nhiệt đới 🌞', W * 0.06, H * 0.78);
  }

  // ── Economy layer ──
  if (showEconomy) {
    // Fishing zone highlight
    ctx.fillStyle = 'rgba(234,179,8,0.12)';
    ctx.beginPath();
    ctx.ellipse(intersectX, intersectY, W * 0.22, H * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(234,179,8,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(intersectX, intersectY, W * 0.22, H * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fde047'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Ngư trường 🐟', intersectX, intersectY - H * 0.16);

    // Shipyard markers
    const shipyards = [{ x: W * 0.42, y: H * 0.66 }, { x: W * 0.32, y: H * 0.75 }];
    shipyards.forEach(s => {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚓', s.x, s.y);
    });
    ctx.fillStyle = '#7dd3fc'; ctx.font = 'bold 9px sans-serif';
    ctx.fillText('Cảng đóng tàu', W * 0.27, H * 0.82);
  }

  // ── Compass ──
  const cx2 = W * 0.08, cy2 = H * 0.12;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.arc(cx2, cy2, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('N', cx2, cy2 - 8);
  ctx.fillStyle = '#64748b'; ctx.fillText('S', cx2, cy2 + 14);
  ctx.fillStyle = '#94a3b8'; ctx.fillText('E', cx2 + 12, cy2 + 4);
  ctx.fillText('W', cx2 - 12, cy2 + 4);
}

// ─── Main Component ────────────────────────────────────────────────────────────
const JapanGeographySim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const particlesRef = useRef({
    warm: makeParticles(35, 'warm'),
    cold: makeParticles(35, 'cold'),
    fish: Array.from({ length: 12 }, () => ({
      x: 0.62 * 600 + (Math.random() - 0.5) * 50,
      y: 0.50 * 300 + (Math.random() - 0.5) * 40,
      age: Math.random() * 60,
      maxAge: 50 + Math.random() * 50,
    })),
  });

  const [tab, setTab] = useState('overview');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(true);

  const tabRef = useRef(tab);
  const playRef = useRef(playing);
  const speedRef = useRef(speed);
  const markerRef = useRef(activeMarker);
  const pulseRef = useRef(0);
  const activeRef = useRef(true);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { markerRef.current = activeMarker; }, [activeMarker]);

  // Click handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width / dpr);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height / dpr);
      const W = canvas.width / dpr, H = canvas.height / dpr;
      const volcanoes = [
        { x: W * 0.52, y: H * 0.57, key: 'fuji' },
        { x: W * 0.62, y: H * 0.45, key: 'asama' },
        { x: W * 0.68, y: H * 0.35, key: 'bandai' },
      ];
      let found = false;
      volcanoes.forEach(v => {
        if (Math.sqrt((mx - v.x) ** 2 + (my - v.y) ** 2) < 18) {
          setActiveMarker(k => k === v.key ? null : v.key);
          found = true;
        }
      });
      if (!found) setActiveMarker(null);
    };
    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, []);

  // Animation loop
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
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr, H = canvas.height / dpr;
      if (playRef.current) {
        pulseRef.current += 0.05 * speedRef.current;
        const sp = speedRef.current;
        particlesRef.current.warm.forEach(p => {
          p.progress = (p.progress + p.speed * sp) % 1;
        });
        particlesRef.current.cold.forEach(p => {
          p.progress = (p.progress + p.speed * sp) % 1;
        });
        particlesRef.current.fish.forEach(f => {
          f.age += sp * 0.3;
          if (f.age > f.maxAge) {
            f.age = 0;
            f.x = W * 0.62 + (Math.random() - 0.5) * W * 0.08;
            f.y = H * 0.50 + (Math.random() - 0.5) * H * 0.1;
          }
        });
      }

      if (W > 0 && H > 0) {
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        drawJapan(off, tabRef.current, particlesRef.current, pulseRef.current, playRef.current, speedRef.current, markerRef.current);
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

  const questions = TAB_QUESTIONS[tab] || TAB_QUESTIONS['overview'];

  return (
    <div className="flex flex-col h-full bg-[#07091a] rounded-2xl overflow-hidden select-none" style={{ fontFamily: "'Inter',sans-serif" }}>
      <SimTopBar
        title="Địa lý Nhật Bản — Điều kiện tự nhiên"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" style={{ cursor: 'pointer' }} />

        <SimActivity
          title="Điền vào chỗ trống"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor="#0369a1"
        />

        {/* Active marker info */}
        {activeMarker && (
          <div className="absolute bottom-8 right-2 z-20 rounded-xl px-3 py-2 text-[10px] font-bold"
            style={{ background: 'rgba(10,14,30,0.9)', border: '1px solid rgba(249,115,22,0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="text-orange-400 font-black text-xs mb-1">
              🌋 {activeMarker === 'fuji' ? 'Núi Phú Sĩ' : activeMarker === 'asama' ? 'Núi Asama' : 'Núi Bandai'}
            </div>
            <div className="text-slate-400">
              {activeMarker === 'fuji' ? 'Cao 3.776 m — Cao nhất Nhật Bản' :
               activeMarker === 'asama' ? 'Cao 2.568 m — Còn hoạt động' :
               'Cao 1.816 m — Phun trào 1888'}
            </div>
          </div>
        )}

        <div className="absolute bottom-2 right-2 text-[9px] text-slate-600 font-bold pointer-events-none">
          💡 Click vào núi lửa để xem thông tin
        </div>
      </div>

      <SimTabs tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
};

export default JapanGeographySim;
