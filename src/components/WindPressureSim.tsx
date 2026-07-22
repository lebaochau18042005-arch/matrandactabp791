import React, { useRef, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'pressure' | 'wind' | 'coriolis';

interface QuizQuestion {
  id: string;
  hint: string;
  answer: string;
  options: string[];
}

interface WindPath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  deflect: number;
  label: string;
}

interface Particle {
  t: number;
  speed: number;
  pathIdx: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const TABS: { key: Tab; label: string }[] = [
  { key: 'pressure', label: '🌡️ Khí áp' },
  { key: 'wind',     label: '💨 Gió' },
  { key: 'coriolis', label: '🌀 Hiệu ứng Coriolis' },
];

const QUIZ: Record<Tab, QuizQuestion[]> = {
  pressure: [
    {
      id: 'wp1',
      hint: 'Khí áp là sức ép của không khí lên',
      answer: 'Bề mặt Trái Đất',
      options: ['Bề mặt Trái Đất', 'Mây mưa', 'Nước biển', 'Lớp ozone'],
    },
    {
      id: 'wp2',
      hint: 'Đái áp thấp xích đạo hình thành do',
      answer: 'Nhiệt độ cao, không khí nở ra và dâng lên',
      options: [
        'Nhiệt độ cao, không khí nở ra và dâng lên',
        'Nhiệt độ thấp, không khí co lại',
        'Biển sâu',
        'Rừng nhiệt đới',
      ],
    },
  ],
  wind: [
    {
      id: 'wp3',
      hint: 'Gió thổi từ nơi áp cao về nơi',
      answer: 'Áp thấp',
      options: ['Áp thấp', 'Áp cao', 'Nhiệt độ cao', 'Nhiệt độ thấp'],
    },
    {
      id: 'wp4',
      hint: 'Gió mậu dịch thổi từ đái áp cao chí tuyến về',
      answer: 'Đái áp thấp xích đạo',
      options: [
        'Đái áp thấp xích đạo',
        'Đái áp cực',
        'Đái áp thấp ôn đới',
        'Đái áp cao ôn đới',
      ],
    },
  ],
  coriolis: [
    {
      id: 'wp5',
      hint: 'Ở bán cầu Bắc, gió bị lệch sang hướng',
      answer: 'Phải',
      options: ['Phải', 'Trái', 'Không lệch', 'Đi thẳng'],
    },
    {
      id: 'wp6',
      hint: 'Lực Coriolis do Trái Đất',
      answer: 'Tự quay quanh trục',
      options: [
        'Tự quay quanh trục',
        'Quay quanh Mặt Trời',
        'Có trục nghiêng',
        'Hút nước biển',
      ],
    },
  ],
};

const WIND_PATHS: WindPath[] = [
  { startX: 0.72, startY: 0.32, endX: 0.50, endY: 0.50, color: '#f97316', deflect:  0.10, label: 'Gió Mậu Dịch (BCB)' },
  { startX: 0.72, startY: 0.68, endX: 0.50, endY: 0.50, color: '#fb923c', deflect: -0.10, label: 'Gió Mậu Dịch (BCN)' },
  { startX: 0.72, startY: 0.32, endX: 0.50, endY: 0.17, color: '#38bdf8', deflect:  0.12, label: 'Gió Tây Ôn Đới (BCB)' },
  { startX: 0.72, startY: 0.68, endX: 0.50, endY: 0.83, color: '#7dd3fc', deflect: -0.12, label: 'Gió Tây Ôn Đới (BCN)' },
  { startX: 0.50, startY: 0.05, endX: 0.50, endY: 0.17, color: '#a78bfa', deflect:  0.08, label: 'Gió Đông Cực (BCB)' },
  { startX: 0.50, startY: 0.95, endX: 0.50, endY: 0.83, color: '#c4b5fd', deflect: -0.08, label: 'Gió Đông Cực (BCN)' },
];

const PRESSURE_ZONES = [
  { label: 'Áp cao cực\n(BCB)',       sym: 'H', y: 0.05, isHigh: true  },
  { label: 'Áp thấp ôn đới\n(BCB)',   sym: 'L', y: 0.17, isHigh: false },
  { label: 'Áp cao chí tuyến\n(BCB)', sym: 'H', y: 0.32, isHigh: true  },
  { label: 'Áp thấp xích đạo',        sym: 'L', y: 0.50, isHigh: false },
  { label: 'Áp cao chí tuyến\n(BCN)', sym: 'H', y: 0.68, isHigh: true  },
  { label: 'Áp thấp ôn đới\n(BCN)',   sym: 'L', y: 0.83, isHigh: false },
  { label: 'Áp cao cực\n(BCN)',        sym: 'H', y: 0.95, isHigh: true  },
];

function initParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    t: i / count,
    speed: 0.003 + (i % 5) * 0.0008,
    pathIdx: i % WIND_PATHS.length,
  }));
}

function bezier(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  ];
}

function controlPoint(path: WindPath, W: number, H: number): [number, number] {
  const mx = ((path.startX + path.endX) / 2 + path.deflect) * W;
  const my = ((path.startY + path.endY) / 2) * H;
  return [mx, my];
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size / 2);
  ctx.lineTo(-size, size / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  frame: number,
  tab: Tab,
  playing: boolean,
  particles: Particle[],
) {
  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0f1e');
  bg.addColorStop(1, '#1e293b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137.5) % W;
    const sy = (i * 97.3) % (H * 0.9);
    const sr = 0.4 + ((i * 17) % 10) / 20;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  PRESSURE_ZONES.forEach((zone, idx) => {
    const cy = zone.y * H;
    const halfH2 = (idx === 0 || idx === PRESSURE_ZONES.length - 1) ? H * 0.07 : H * 0.09;
    const grad = ctx.createLinearGradient(0, cy - halfH2, 0, cy + halfH2);
    if (zone.isHigh) {
      grad.addColorStop(0, 'rgba(59,130,246,0)');
      grad.addColorStop(0.5, 'rgba(59,130,246,0.18)');
      grad.addColorStop(1, 'rgba(59,130,246,0)');
    } else {
      grad.addColorStop(0, 'rgba(239,68,68,0)');
      grad.addColorStop(0.5, 'rgba(239,68,68,0.18)');
      grad.addColorStop(1, 'rgba(239,68,68,0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, cy - halfH2, W, halfH2 * 2);

    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = zone.isHigh ? 'rgba(147,197,253,0.4)' : 'rgba(252,165,165,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();
    ctx.restore();

    const pulse = tab === 'pressure' ? 1 + 0.06 * Math.sin(frame * 0.04 + idx) : 1;
    ctx.save();
    ctx.translate(W * 0.88, cy);
    ctx.scale(pulse, pulse);
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = zone.isHigh ? '#93c5fd' : '#fca5a5';
    ctx.shadowColor = zone.isHigh ? '#3b82f6' : '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillText(zone.sym, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const lines = zone.label.split('\n');
    lines.forEach((line, li) => {
      ctx.fillText(line, 8, cy + (li - (lines.length - 1) / 2) * 13);
    });
    ctx.restore();
  });

  if (tab === 'pressure') {
    PRESSURE_ZONES.forEach((zone) => {
      const cy = zone.y * H;
      const color = zone.isHigh ? 'rgba(147,197,253,0.3)' : 'rgba(252,165,165,0.3)';
      for (let ring = 1; ring <= 3; ring++) {
        const rx = W * 0.22 * ring;
        const ry = H * 0.035 * ring;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(W * 0.5, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  const eqY = H * 0.5;
  const earthGrad = ctx.createLinearGradient(0, eqY - 5, 0, eqY + 5);
  earthGrad.addColorStop(0, '#22c55e');
  earthGrad.addColorStop(0.5, '#16a34a');
  earthGrad.addColorStop(1, '#15803d');
  ctx.fillStyle = earthGrad;
  ctx.shadowColor = '#4ade80';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(W * 0.05, eqY - 3, W * 0.9, 6, 3);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#86efac';
  ctx.fillText('— XÍCH ĐẠO —', W * 0.5, eqY - 14);
  ctx.restore();

  if (tab === 'wind' || tab === 'coriolis') {
    WIND_PATHS.forEach((path) => {
      const p0: [number, number] = [path.startX * W, path.startY * H];
      const p2: [number, number] = [path.endX * W, path.endY * H];
      const cp = controlPoint(path, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.quadraticCurveTo(cp[0], cp[1], p2[0], p2[1]);
      ctx.strokeStyle = path.color + '40';
      ctx.lineWidth = tab === 'coriolis' ? 2.5 : 1.5;
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.restore();

      if (tab === 'coriolis') {
        const exCp: [number, number] = [
          cp[0] + (path.deflect > 0 ? 40 : -40),
          cp[1],
        ];
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.quadraticCurveTo(exCp[0], exCp[1], p2[0], p2[1]);
        ctx.strokeStyle = path.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = path.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();

        const midPt = bezier(0.5, p0, exCp, p2);
        ctx.save();
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = path.color;
        ctx.fillText(
          path.deflect > 0 ? '← lệch phải' : 'lệch trái →',
          midPt[0] + (path.deflect > 0 ? 32 : -32),
          midPt[1],
        );
        ctx.restore();
      }
    });

    particles.forEach((p) => {
      const path = WIND_PATHS[p.pathIdx];
      const pStart: [number, number] = [path.startX * W, path.startY * H];
      const pEnd: [number, number]   = [path.endX * W,   path.endY * H];
      const cp = controlPoint(path, W, H);
      const pos = bezier(p.t, pStart, cp, pEnd);
      const tNext = Math.min(p.t + 0.01, 1);
      const posNext = bezier(tNext, pStart, cp, pEnd);
      const angle = Math.atan2(posNext[1] - pos[1], posNext[0] - pos[0]);

      const grd = ctx.createRadialGradient(pos[0], pos[1], 0, pos[0], pos[1], 6);
      grd.addColorStop(0, path.color);
      grd.addColorStop(1, path.color + '00');
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      drawArrowHead(ctx, pos[0], pos[1], angle, 7, path.color);
    });
  }

  if (tab === 'wind') {
    const legendItems = [
      { color: '#f97316', label: 'Gió Mậu Dịch' },
      { color: '#38bdf8', label: 'Gió Tây Ôn Đới' },
      { color: '#a78bfa', label: 'Gió Đông Cực' },
    ];
    legendItems.forEach((item, i) => {
      const lx = W * 0.05;
      const ly = H * 0.87 + i * 18;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(item.label, lx + 10, ly);
    });
  }

  if (tab === 'coriolis') {
    ctx.save();
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('BÁN CẦU BẮC', W - 10, H * 0.24);
    ctx.fillText('BÁN CẦU NAM', W - 10, H * 0.76);
    ctx.fillStyle = '#f97316';
    ctx.font = '20px serif';
    ctx.fillText('↻', W - 12, H * 0.31);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('↺', W - 12, H * 0.69);
    ctx.restore();
  }

  if (playing && (tab === 'wind' || tab === 'coriolis')) {
    ctx.save();
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'right';
    ctx.fillText(`frame ${frame}`, W - 6, H - 4);
    ctx.restore();
  }
}

const WindPressureSim: React.FC = () => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const activeRef    = useRef(true);
  const frameRef     = useRef<number>(0);
  const particlesRef = useRef<Particle[]>(initParticles(48));
  const tabRef       = useRef<Tab>('pressure');
  const playingRef   = useRef(true);

  const [tab, setTab]         = useState<Tab>('pressure');
  const [playing, setPlaying] = useState(true);

  const questions = QUIZ[tab];
  const [qIdx, setQIdx]       = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore]     = useState<Record<string, boolean>>({});

  const currentQ = questions[qIdx];

  // Keep refs in sync with state
  useEffect(() => { tabRef.current = tab; setQIdx(0); setSelected(null); }, [tab]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Stable animation loop — runs once, reads state from refs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = true;

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

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const retryTimer = setTimeout(resize, 80);

    const loop = () => {
      if (!activeRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width  / dpr;
      const H = canvas.height / dpr;

      if (W > 0 && H > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (playingRef.current) {
            frameRef.current += 1;
            particlesRef.current = particlesRef.current.map((p) => ({
              ...p,
              t: p.t >= 1 ? 0 : p.t + p.speed,
            }));
          }
          drawScene(ctx, W, H, frameRef.current, tabRef.current, playingRef.current, particlesRef.current);
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
  }, []); // ← runs once only


  const handleAnswer = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    setScore((prev) => ({ ...prev, [currentQ.id]: opt === currentQ.answer }));
  };

  const handleNext = () => {
    setSelected(null);
    setQIdx((i) => (i + 1) % questions.length);
  };

  const totalAnswered = Object.keys(score).length;
  const totalCorrect  = Object.values(score).filter(Boolean).length;

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>🌍</span>
        <div>
          <h2 style={styles.title}>Khí Áp và Gió</h2>
          <p style={styles.subtitle}>Mô phỏng các đai khí áp và hệ thống gió toàn cầu</p>
        </div>
        {totalAnswered > 0 && (
          <div style={styles.scoreChip}>
            {totalCorrect}/{totalAnswered} ✓
          </div>
        )}
      </div>

      <div style={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            id={`wind-tab-${t.key}`}
            style={{ ...styles.tabBtn, ...(tab === t.key ? styles.tabBtnActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <button
          id="wind-playpause"
          style={{ ...styles.playBtn, ...(playing ? styles.playBtnActive : {}) }}
          onClick={() => setPlaying((p) => !p)}
          title={playing ? 'Tạm dừng' : 'Phát'}
        >
          {playing ? '⏸' : '▶'}
        </button>
      </div>

      <div style={styles.canvasWrapper}>
        <canvas ref={canvasRef} style={styles.canvas} id="wind-canvas" />
      </div>

      <div style={styles.infoPanel}>
        {tab === 'pressure' && (
          <p style={styles.infoText}>
            <strong style={{ color: '#93c5fd' }}>Khí áp</strong> là sức ép của không khí lên bề mặt Trái Đất.
            {' '}Vùng <span style={{ color: '#93c5fd' }}>áp cao (H)</span> – không khí lạnh, nặng, xuống thấp.
            {' '}Vùng <span style={{ color: '#fca5a5' }}>áp thấp (L)</span> – không khí ấm, nhẹ, bốc lên cao.
          </p>
        )}
        {tab === 'wind' && (
          <p style={styles.infoText}>
            Gió thổi từ <span style={{ color: '#93c5fd' }}>áp cao → áp thấp</span>.
            {' '}<span style={{ color: '#f97316' }}>Gió Mậu Dịch</span> từ chí tuyến về xích đạo.
            {' '}<span style={{ color: '#38bdf8' }}>Gió Tây</span> từ chí tuyến lên ôn đới.
            {' '}<span style={{ color: '#a78bfa' }}>Gió Đông Cực</span> từ cực về ôn đới.
          </p>
        )}
        {tab === 'coriolis' && (
          <p style={styles.infoText}>
            <strong style={{ color: '#c4b5fd' }}>Lực Coriolis</strong> do Trái Đất tự quay làm gió lệch hướng:
            {' '}bán cầu Bắc lệch <span style={{ color: '#f97316' }}>sang phải</span>,
            {' '}bán cầu Nam lệch <span style={{ color: '#38bdf8' }}>sang trái</span>.
          </p>
        )}
      </div>

      <div style={styles.quizBox}>
        <div style={styles.quizHeader}>
          <span style={styles.quizTitle}>📝 Câu hỏi ôn tập</span>
          <span style={styles.quizCount}>{qIdx + 1} / {questions.length}</span>
        </div>
        <p style={styles.quizHint}>{currentQ.hint}</p>
        <div style={styles.optionsGrid}>
          {currentQ.options.map((opt) => {
            const isCorrect  = opt === currentQ.answer;
            const isSelected = opt === selected;
            let bg     = 'rgba(255,255,255,0.05)';
            let border = 'rgba(255,255,255,0.15)';
            if (selected) {
              if (isCorrect)         { bg = 'rgba(34,197,94,0.2)'; border = '#22c55e'; }
              else if (isSelected)   { bg = 'rgba(239,68,68,0.2)'; border = '#ef4444'; }
            }
            return (
              <button
                key={opt}
                id={`wind-opt-${currentQ.id}-${opt.slice(0,8)}`}
                style={{ ...styles.optBtn, background: bg, borderColor: border }}
                onClick={() => handleAnswer(opt)}
              >
                {selected && isCorrect   && <span style={{ marginRight: 6 }}>✅</span>}
                {selected && isSelected && !isCorrect && <span style={{ marginRight: 6 }}>❌</span>}
                {opt}
              </button>
            );
          })}
        </div>
        {selected && (
          <div style={styles.feedback}>
            {selected === currentQ.answer
              ? <span style={{ color: '#4ade80' }}>🎉 Chính xác!</span>
              : <span style={{ color: '#f87171' }}>❌ Sai. Đáp án: <strong>{currentQ.answer}</strong></span>}
            <button id="wind-next" style={styles.nextBtn} onClick={handleNext}>
              Câu tiếp →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: '#0f172a',
    borderRadius: 16,
    padding: 16,
    color: '#f1f5f9',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    maxWidth: 700,
    margin: '0 auto',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon: { fontSize: 36, filter: 'drop-shadow(0 0 8px #4ade80)' },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    background: 'linear-gradient(90deg,#93c5fd,#4ade80)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: { margin: 0, fontSize: 12, color: '#94a3b8' },
  scoreChip: {
    marginLeft: 'auto',
    padding: '4px 12px',
    borderRadius: 20,
    background: 'rgba(34,197,94,0.15)',
    border: '1px solid #22c55e',
    color: '#4ade80',
    fontSize: 13,
    fontWeight: 600,
  },
  tabBar: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, alignItems: 'center' },
  tabBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    borderColor: '#6366f1',
    color: '#fff',
    boxShadow: '0 0 12px rgba(99,102,241,0.5)',
  },
  playBtn: {
    marginLeft: 'auto',
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: 16,
  },
  playBtnActive: {
    background: 'rgba(34,197,94,0.15)',
    borderColor: '#22c55e',
    color: '#4ade80',
  },
  canvasWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
  },
  canvas: { display: 'block', width: '100%', height: 380, background: '#0a0f1e' },
  infoPanel: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: '10px 14px',
    borderLeft: '3px solid #6366f1',
  },
  infoText: { margin: 0, fontSize: 13, lineHeight: 1.6, color: '#cbd5e1' },
  quizBox: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizTitle: { fontWeight: 600, fontSize: 14 },
  quizCount: {
    fontSize: 12,
    color: '#64748b',
    background: 'rgba(255,255,255,0.08)',
    padding: '2px 8px',
    borderRadius: 20,
  },
  quizHint: { margin: '0 0 10px', fontSize: 14, color: '#e2e8f0', fontStyle: 'italic' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  optBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: 13,
    textAlign: 'left' as const,
    transition: 'all 0.15s',
  },
  feedback: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
  },
  nextBtn: {
    padding: '5px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: 13,
  },
};

export default WindPressureSim;
