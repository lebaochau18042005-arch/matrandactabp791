import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tabs matching Mozaik3D image ─────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'largest',   label: '🌋 Vụ phun trào lớn nhất', color: '#dc2626' },
  { id: 'explosive', label: '💥 Phun trào nổ',         color: '#ea580c' },
  { id: 'effusive',  label: '💧 Phun trào chảy',       color: '#f59e0b' },
  { id: 'mixed',     label: '🌀 Phun trào hỗn hợp',     color: '#84cc16' },
  { id: 'post',      label: '🌱 Hoạt động sau phun',    color: '#10b981' },
];

// ─── Questions ────────────────────────────────────────────────────────────────
const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  largest: [
    { id: 'la1', hint: 'đại diện tiêu biểu cho kiểu phun trào nổ tàn khốc', answer: 'Krakatoa', options: ['Krakatoa', 'Mauna Loa', 'Fuji', 'Kilauea'] },
    { id: 'la2', hint: 'núi lửa nằm ở biên giới mảng kiến tạo tạo thành các', answer: 'Chuỗi núi lửa', options: ['Chuỗi núi lửa', 'Hoang mạc', 'Hố sâu', 'Đảo san hô'] },
  ],
  explosive: [
    { id: 'ex1', hint: 'vật chất đẩy ra tạo thành cột phun trào cao và', answer: 'Mạt vụn núi lửa', options: ['Mạt vụn núi lửa', 'Sông dung nham', 'Mạch nước nóng', 'Khí trơ'] },
    { id: 'ex2', hint: 'kiểu phun trào nổ đặc trưng của núi lửa hình', answer: 'Nón', options: ['Nón', 'Khiên', 'Vòm', 'Khe nứt'] },
  ],
  effusive: [
    { id: 'ef1', hint: 'magma trào lên mặt đất gọi là', answer: 'Dung nham', options: ['Dung nham', 'Magma nguội', 'Đá trầm tích', 'Tro bụi'] },
    { id: 'ef2', hint: 'phun trào chảy tạo thành các dòng chảy tràn lan do dung nham', answer: 'Lỏng, ít khí', options: ['Lỏng, ít khí', 'Quánh dẻo, nhiều khí', 'Rắn đặc', 'Lạnh buốt'] },
  ],
  mixed: [
    { id: 'mi1', hint: 'phun trào hỗn hợp bao gồm cả hình thức', answer: 'Nổ và chảy', options: ['Nổ và chảy', 'Chảy và nguội', 'Nổ và phun hơi', 'Địa chấn'] },
    { id: 'mi2', hint: 'magma bị đẩy ra ngoài do áp suất của', answer: 'Khí tích tụ', options: ['Khí tích tụ', 'Trọng lực', 'Nước ngầm', 'Sóng thần'] },
  ],
  post: [
    { id: 'po1', hint: 'các lỗ phun khí và mạch nước nóng gọi là hiện tượng', answer: 'Sau phun trào', options: ['Sau phun trào', 'Đang hoạt động', 'Núi lửa tắt', 'Tiền phun trào'] },
    { id: 'po2', hint: 'tro bụi núi lửa sau khi nguội đi tạo thành đất', answer: 'Feralit đỏ vàng', options: ['Feralit đỏ vàng', 'Đất sét', 'Đất cát', 'Đất mùn ôn đới'] },
  ],
};

// ─── Particle definitions for Eruptions ───────────────────────────────────────
interface AshParticle { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number; maxLife: number; color: string }
interface LavaStream { x: number; y: number; targetY: number; currentY: number; speed: number; width: number }

function makeAsh(cx: number, cy: number, spreadX: number, speedY: number): AshParticle {
  const maxLife = 40 + Math.random() * 50;
  const size = 3 + Math.random() * 12;
  const grey = Math.floor(60 + Math.random() * 80);
  return {
    x: cx + (Math.random() - 0.5) * 10,
    y: cy,
    vx: (Math.random() - 0.5) * spreadX,
    vy: -Math.random() * speedY - 1.5,
    size,
    alpha: 0.8 + Math.random() * 0.2,
    life: 0,
    maxLife,
    color: `rgba(${grey}, ${grey - 5}, ${grey - 8}, `,
  };
}

function makeLavaSpark(cx: number, cy: number): AshParticle {
  const maxLife = 15 + Math.random() * 20;
  return {
    x: cx + (Math.random() - 0.5) * 8,
    y: cy,
    vx: (Math.random() - 0.5) * 4,
    vy: -Math.random() * 5 - 2,
    size: 2 + Math.random() * 4,
    alpha: 1,
    life: 0,
    maxLife,
    color: 'rgba(239, 68, 68, ',
  };
}

// ─── Drawing function ─────────────────────────────────────────────────────────
function drawVolcano(
  canvas: HTMLCanvasElement,
  tab: string,
  particles: { ash: AshParticle[]; lava: AshParticle[]; streams: LavaStream[] },
  frame: number,
  playing: boolean,
  activeHotspot: string | null
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H * 0.72;

  ctx.clearRect(0, 0, W, H);

  // Background sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, cy);
  if (tab === 'explosive' || tab === 'mixed') {
    skyGrad.addColorStop(0, '#110502');
    skyGrad.addColorStop(0.5, '#2c1208');
    skyGrad.addColorStop(1, '#0e0b12');
  } else {
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Stars (for non-explosive modes)
  if (tab !== 'explosive' && tab !== 'mixed') {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 30; i++) {
      const sx = (Math.sin(i * 4732) * 0.5 + 0.5) * W;
      const sy = (Math.cos(i * 8219) * 0.5 + 0.5) * cy;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }
  }

  // ── Mode: Largest (World Hotspots Map) ──
  if (tab === 'largest') {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Flat map continent representations
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(W * 0.25, H * 0.45, W * 0.12, H * 0.2, 0, 0, Math.PI * 2);
    ctx.ellipse(W * 0.65, H * 0.35, W * 0.18, H * 0.15, 0, 0, Math.PI * 2);
    ctx.ellipse(W * 0.78, H * 0.65, W * 0.08, H * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    const hotspots = [
      { x: W * 0.15, y: H * 0.35, name: 'St. Helens 🇺🇸', key: 'helens' },
      { x: W * 0.60, y: H * 0.52, name: 'Krakatoa 🇮🇩', key: 'krakatoa' },
      { x: W * 0.52, y: H * 0.38, name: 'Vesuvius 🇮🇹', key: 'vesuvius' },
      { x: W * 0.48, y: H * 0.58, name: 'Nyiragongo 🇨🇩', key: 'nyiragongo' },
    ];

    hotspots.forEach(h => {
      const isSelected = activeHotspot === h.key;
      const pulseSize = 6 + 3 * Math.sin(frame * 0.1 + h.x);
      
      // Pulse ring
      ctx.strokeStyle = isSelected ? '#ef4444' : 'rgba(239,68,68,0.5)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.arc(h.x, h.y, pulseSize * 1.8, 0, Math.PI * 2);
      ctx.stroke();

      // Core dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(h.x, h.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = isSelected ? '#fca5a5' : '#94a3b8';
      ctx.font = `bold ${isSelected ? 10 : 8}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(h.name, h.x, h.y - 12);
    });

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔴 Click các chấm đỏ để xem thông tin các vụ phun trào lịch sử', W / 2, H - 12);
    return;
  }

  // ── Volcano slope drawing ──
  const isShield = tab === 'effusive';
  const slopeWidth = isShield ? W * 0.48 : W * 0.32;
  const craterWidth = isShield ? 35 : 20;

  // Draw background mountain silhouette
  ctx.fillStyle = '#080c18';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.95);
  ctx.lineTo(W * 0.25, H * 0.80);
  ctx.lineTo(W * 0.5, H * 0.95);
  ctx.lineTo(W, H * 0.95);
  ctx.fill();

  // Draw the main volcano body
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(cx - slopeWidth, H * 0.92);
  ctx.quadraticCurveTo(cx - slopeWidth * 0.5, cy + (H - cy) * 0.3, cx - craterWidth, cy);
  ctx.lineTo(cx + craterWidth, cy);
  ctx.quadraticCurveTo(cx + slopeWidth * 0.5, cy + (H - cy) * 0.3, cx + slopeWidth, H * 0.92);
  ctx.closePath();
  ctx.fill();

  // Highlight crater rim
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, craterWidth, 4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // ── Mode-specific Eruption Animations ──

  // 💥 Explosive or Mixed Eruption
  if (tab === 'explosive' || tab === 'mixed') {
    // Crater glow
    const glowGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 24);
    glowGrad.addColorStop(0, '#ffffff');
    glowGrad.addColorStop(0.3, '#f97316');
    glowGrad.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, craterWidth * 1.5, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw ash clouds particles (billowing upwards)
    particles.ash.forEach(p => {
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw hot lava sparks shooting out
    particles.lava.forEach(p => {
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // 💧 Effusive (Lava Streams flowing down the slopes) or Mixed Eruption
  if (tab === 'effusive' || tab === 'mixed') {
    // Draw lava stream flowing down the sides
    ctx.save();
    ctx.lineCap = 'round';

    particles.streams.forEach(s => {
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.85 + 0.15 * Math.sin(frame * 0.1 + s.x)})`;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.lineWidth = s.width;
      
      ctx.beginPath();
      ctx.moveTo(s.x, cy + 2);
      ctx.lineTo(s.x + (s.x < cx ? -25 : 25), s.currentY);
      ctx.stroke();
    });

    ctx.restore();

    // Crater magma overflow lake
    const magmaLake = ctx.createLinearGradient(cx - craterWidth, cy, cx + craterWidth, cy);
    magmaLake.addColorStop(0, '#ea580c');
    magmaLake.addColorStop(0.5, '#facc15');
    magmaLake.addColorStop(1, '#ea580c');
    ctx.fillStyle = magmaLake;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 1, craterWidth * 0.9, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🌱 Post-eruption (geysers, hot spring smoke, grass coming back)
  if (tab === 'post') {
    // Green grass returning to the slopes
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.moveTo(cx - slopeWidth, H * 0.92);
    ctx.quadraticCurveTo(cx - slopeWidth * 0.8, H * 0.91, cx - slopeWidth * 0.5, H * 0.89);
    ctx.lineTo(cx - slopeWidth * 0.5, H * 0.92);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + slopeWidth, H * 0.92);
    ctx.quadraticCurveTo(cx + slopeWidth * 0.8, H * 0.91, cx + slopeWidth * 0.5, H * 0.89);
    ctx.lineTo(cx + slopeWidth * 0.5, H * 0.92);
    ctx.closePath();
    ctx.fill();

    // Hot steam particles (white fumaroles) rising gently from crater
    particles.ash.forEach(p => {
      ctx.fillStyle = `rgba(241, 245, 249, ${p.alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Geysers shooting hot water streams at the bottom
    const g1x = cx - slopeWidth * 0.6, g1y = H * 0.90;
    const g2x = cx + slopeWidth * 0.6, g2y = H * 0.90;

    const drawGeyser = (gx: number, gy: number, offset: number) => {
      const height = 15 + 10 * Math.sin(frame * 0.08 + offset);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + (Math.random() - 0.5) * 2, gy - height);
      ctx.stroke();

      // Splash splash particles
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(gx + (Math.random() - 0.5) * 8, gy - height - Math.random() * 4, 1.5, 1.5);
      }
    };
    drawGeyser(g1x, g1y, 0);
    drawGeyser(g2x, g2y, 3.14);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mạch nước nóng (Geyser)', g1x, g1y + 10);
    ctx.fillText('Mạch nước nóng (Geyser)', g2x, g2y + 10);
  }

  // Draw ground overlay at bottom
  const groundGrad = ctx.createLinearGradient(0, H * 0.9, 0, H);
  groundGrad.addColorStop(0, '#0f172a');
  groundGrad.addColorStop(1, '#020617');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, H * 0.9, W, H * 0.1);
}

// ─── Main Component ────────────────────────────────────────────────────────────
const VolcanoSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const activeRef = useRef(true);
  const stateRef = useRef({ frame: 0 });

  const [tab, setTab] = useState('explosive');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(true);

  // Keep references to access inside requestAnimationFrame loop cleanly
  const tabRef = useRef(tab);
  const playRef = useRef(playing);
  const speedRef = useRef(speed);
  const hotspotRef = useRef(activeHotspot);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { hotspotRef.current = activeHotspot; }, [activeHotspot]);

  // Particle systems
  const particlesRef = useRef<{
    ash: AshParticle[];
    lava: AshParticle[];
    streams: LavaStream[];
  }>({
    ash: [],
    lava: [],
    streams: [],
  });

  // Hotspot click handler for 'largest' tab
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onClick = (e: MouseEvent) => {
      if (tabRef.current !== 'largest') return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width / dpr);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height / dpr);
      const W = canvas.width / dpr, H = canvas.height / dpr;

      const hotspots = [
        { x: W * 0.15, y: H * 0.35, key: 'helens' },
        { x: W * 0.60, y: H * 0.52, key: 'krakatoa' },
        { x: W * 0.52, y: H * 0.38, key: 'vesuvius' },
        { x: W * 0.48, y: H * 0.58, key: 'nyiragongo' },
      ];

      let clickedKey: string | null = null;
      hotspots.forEach(h => {
        if (Math.sqrt((mx - h.x) ** 2 + (my - h.y) ** 2) < 22) {
          clickedKey = h.key;
        }
      });
      setActiveHotspot(clickedKey);
    };

    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, []);

  // Animation Loop
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
      const cx = W / 2, cy = H * 0.72;

      // Update frame counter
      if (playRef.current) {
        stateRef.current.frame += 0.5 * speedRef.current;
      }

      // ── Particle logic update ──
      const p = particlesRef.current;
      const sp = speedRef.current;

      if (playRef.current) {
        // Mode-specific initialization
        if (tabRef.current === 'explosive' || tabRef.current === 'mixed') {
          // Add ash
          if (p.ash.length < 90) {
            p.ash.push(makeAsh(cx, cy, 3, 3));
          }
          // Add lava sparks
          if (p.lava.length < 40) {
            p.lava.push(makeLavaSpark(cx, cy));
          }
        } else if (tabRef.current === 'post') {
          // gentle fumarole steam rising
          if (p.ash.length < 25) {
            p.ash.push(makeAsh(cx + (Math.random() - 0.5) * 8, cy, 0.4, 0.8));
          }
          p.lava = [];
          p.streams = [];
        } else {
          p.ash = [];
          p.lava = [];
        }

        // Initialize lava streams for effusive / mixed
        if (tabRef.current === 'effusive' || tabRef.current === 'mixed') {
          if (p.streams.length === 0) {
            p.streams = [
              { x: cx - 8, y: cy, targetY: cy + H * 0.15, currentY: cy, speed: 0.15, width: 3.5 },
              { x: cx + 8, y: cy, targetY: cy + H * 0.18, currentY: cy, speed: 0.10, width: 4.5 },
              { x: cx - 4, y: cy, targetY: cy + H * 0.08, currentY: cy, speed: 0.22, width: 2.5 },
            ];
          }
        }

        // Update ash particles
        p.ash.forEach((ash, idx) => {
          ash.life += sp;
          ash.x += ash.vx * sp;
          ash.y += ash.vy * sp;
          ash.vx += (Math.random() - 0.5) * 0.15 * sp;
          ash.alpha = Math.max(0, 1 - ash.life / ash.maxLife);
          if (ash.life >= ash.maxLife || ash.y < 0) {
            p.ash[idx] = makeAsh(cx, cy, tabRef.current === 'post' ? 0.4 : 3, tabRef.current === 'post' ? 0.8 : 3);
          }
        });

        // Update lava particles
        p.lava.forEach((lav, idx) => {
          lav.life += sp;
          lav.x += lav.vx * sp;
          lav.y += lav.vy * sp;
          lav.vy += 0.18 * sp; // Gravity pull
          lav.alpha = Math.max(0, 1 - lav.life / lav.maxLife);
          if (lav.life >= lav.maxLife) {
            p.lava[idx] = makeLavaSpark(cx, cy);
          }
        });

        // Update lava streams flow
        p.streams.forEach(s => {
          if (s.currentY < s.targetY) {
            s.currentY += s.speed * sp;
          } else {
            // flow resets or fluctuates
            s.currentY = s.targetY + 2 * Math.sin(stateRef.current.frame * 0.1);
          }
        });
      }

      if (W > 0 && H > 0) {
        // Draw onto temporary offscreen canvas
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        drawVolcano(off, tabRef.current, p, stateRef.current.frame, playRef.current, hotspotRef.current);

        // Render offscreen canvas onto primary screen
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

  const questions = TAB_QUESTIONS[tab] || TAB_QUESTIONS['explosive'];

  return (
    <div className="flex flex-col h-full bg-[#07091a] rounded-2xl overflow-hidden select-none" style={{ fontFamily: "'Inter',sans-serif" }}>
      <SimTopBar
        title="Hoạt động núi lửa — Mô phỏng thực tế Mozaik3D"
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
          themeColor="#ea580c"
        />

        {/* Hotspot details dialog */}
        {tab === 'largest' && activeHotspot && (
          <div className="absolute top-2 right-2 z-20 rounded-xl p-3 text-[10px] font-bold space-y-1 w-48"
            style={{ background: 'rgba(10,14,30,0.92)', border: '1px solid rgba(239,68,68,0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="text-red-400 font-black text-xs mb-1">
              🌋 {activeHotspot === 'helens' ? 'Núi St. Helens (1980)' :
                  activeHotspot === 'krakatoa' ? 'Krakatoa (1883)' :
                  activeHotspot === 'vesuvius' ? 'Vesuvius (Năm 79)' : 'Nyiragongo (2021)'}
            </div>
            <div className="text-slate-300 leading-normal font-medium">
              {activeHotspot === 'helens' && 'Vụ phun trào nổ làm sập toàn bộ sườn núi phía bắc, cột tro bụi cao 24 km, tàn phá hàng trăm km vuông rừng.'}
              {activeHotspot === 'krakatoa' && 'Vụ nổ cực lớn tương đương 200 megaton TNT, tạo ra sóng thần cao 40m, âm thanh nghe thấy từ cách 4.800 km.'}
              {activeHotspot === 'vesuvius' && 'Chôn vùi hoàn toàn thành phố cổ Pompeii và Herculaneum dưới lớp tro bụi dày đặc.'}
              {activeHotspot === 'nyiragongo' && 'Hồ dung nham lớn nhất thế giới tràn xuống thành phố Goma, buộc hàng vạn người phải di tản khẩn cấp.'}
            </div>
          </div>
        )}
      </div>

      <SimTabs tabs={TABS} active={tab} onChange={id => { setTab(id); setActiveHotspot(null); }} />
    </div>
  );
};

export default VolcanoSim;
