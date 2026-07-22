import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'system',  label: '🌙 Hệ Mặt Trời – Trái Đất – Mặt Trăng', color: '#facc15' },
  { id: 'spring',  label: '🌊 Triều cường (Sóc/Vọng)',               color: '#3b82f6' },
  { id: 'neap',    label: '🌊 Triều kém (Thượng/Hạ huyền)',           color: '#8b5cf6' },
  { id: 'cycle',   label: '🔄 Chu kỳ thủy triều',                     color: '#10b981' },
  { id: 'quiz',    label: '❓ Đố vui',                                 color: '#f59e0b' },
];

// ─── Quiz questions per tab ────────────────────────────────────────────────────
const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  system: [
    {
      id: 's1',
      hint: 'lực chính tạo ra thủy triều là lực',
      answer: 'Hấp dẫn của Mặt Trăng',
      options: ['Hấp dẫn của Mặt Trăng', 'Gió bề mặt đại dương', 'Lực Coriolis', 'Áp suất khí quyển'],
    },
    {
      id: 's2',
      hint: 'trong một ngày có bao nhiêu lần triều cao và triều thấp?',
      answer: '2 lần triều cao, 2 lần triều thấp',
      options: ['2 lần triều cao, 2 lần triều thấp', '1 lần triều cao, 1 lần triều thấp', '4 lần triều cao', '3 lần mỗi loại'],
    },
  ],
  spring: [
    {
      id: 'sp1',
      hint: 'triều cường xảy ra khi Mặt Trời, Trái Đất và Mặt Trăng',
      answer: 'Thẳng hàng',
      options: ['Thẳng hàng', 'Vuông góc nhau', 'Cách đều nhau', 'Đối diện nhau'],
    },
    {
      id: 'sp2',
      hint: 'triều cường có biên độ',
      answer: 'Lớn nhất',
      options: ['Lớn nhất', 'Nhỏ nhất', 'Trung bình', 'Bằng với triều kém'],
    },
  ],
  neap: [
    {
      id: 'n1',
      hint: 'triều kém xảy ra khi Mặt Trăng và Mặt Trời tạo với Trái Đất góc',
      answer: '90°',
      options: ['90°', '0°', '180°', '45°'],
    },
    {
      id: 'n2',
      hint: 'triều kém xảy ra vào pha Mặt Trăng',
      answer: 'Thượng huyền hoặc Hạ huyền',
      options: ['Thượng huyền hoặc Hạ huyền', 'Trăng tròn hoặc Trăng mới', 'Chỉ Thượng huyền', 'Chỉ trăng tròn'],
    },
  ],
  cycle: [
    {
      id: 'c1',
      hint: 'chu kỳ thủy triều bán nhật triều khoảng',
      answer: '12 giờ 25 phút',
      options: ['12 giờ 25 phút', '24 giờ', '6 giờ', '29,5 ngày'],
    },
    {
      id: 'c2',
      hint: 'vùng có biên độ thủy triều lớn nhất thế giới là Vịnh',
      answer: 'Fundy (Canada)',
      options: ['Fundy (Canada)', 'Bengal (Ấn Độ)', 'Mexico', 'Bắc Bộ (Việt Nam)'],
    },
  ],
  quiz: [
    {
      id: 'q1',
      hint: 'thủy triều giúp ích cho',
      answer: 'Hàng hải và thủy điện',
      options: ['Hàng hải và thủy điện', 'Trồng lúa nước', 'Dự báo thời tiết', 'Đo địa chấn'],
    },
    {
      id: 'q2',
      hint: 'Mặt Trời đóng góp lực kéo thủy triều',
      answer: 'Yếu hơn Mặt Trăng',
      options: ['Yếu hơn Mặt Trăng', 'Mạnh hơn Mặt Trăng', 'Bằng Mặt Trăng', 'Không có đóng góp'],
    },
    {
      id: 'q3',
      hint: 'biên độ thủy triều ở biển là',
      answer: 'Chênh lệch mực nước triều cao và triều thấp',
      options: [
        'Chênh lệch mực nước triều cao và triều thấp',
        'Chiều cao sóng biển',
        'Tốc độ dòng triều',
        'Thời gian giữa hai lần triều cao',
      ],
    },
  ],
};

// ─── Info panel text ───────────────────────────────────────────────────────────
const INFO_TEXT: Record<string, string> = {
  system: 'Thủy triều là hiện tượng mực nước biển dâng lên và hạ xuống theo chu kỳ do lực hấp dẫn của Mặt Trăng (và một phần Mặt Trời) tác động lên các đại dương. Phía gần Mặt Trăng nhất bị kéo tạo gù nước cao (triều lên). Phía đối diện cũng tạo gù do quán tính ly tâm. Mỗi ngày có khoảng 2 lần triều cao và 2 lần triều thấp.',
  spring: 'Triều cường (Spring Tide) xảy ra khi Mặt Trăng và Mặt Trời thẳng hàng với Trái Đất — vào pha Trăng Mới (Sóc) và Trăng Tròn (Vọng). Khi đó lực kéo của cả hai thiên thể cộng hưởng, tạo ra biên độ thủy triều lớn nhất trong tháng.',
  neap: 'Triều kém (Neap Tide) xảy ra khi Mặt Trăng vuông góc với đường nối Trái Đất – Mặt Trời — vào pha Thượng Huyền và Hạ Huyền. Khi đó lực kéo của Mặt Trăng và Mặt Trời triệt tiêu một phần nhau, biên độ thủy triều đạt giá trị nhỏ nhất.',
  cycle: 'Bán nhật triều (Semidiurnal Tide): Trong 24 giờ 50 phút, mực nước dâng và hạ hai lần. Chu kỳ là khoảng 12 giờ 25 phút. Nhật triều (Diurnal Tide): Chỉ có 1 lần triều cao và 1 lần triều thấp mỗi ngày — phổ biến tại vịnh Bắc Bộ Việt Nam.',
  quiz: 'Kiểm tra kiến thức về thủy triều — một hiện tượng thiên văn địa lý quan trọng trong chương trình Địa lí 10!',
};

// ─── Drawing ───────────────────────────────────────────────────────────────────
interface DrawState {
  angle: number;      // Moon orbital angle (radians)
  frame: number;
  tab: string;
  playing: boolean;
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  state: DrawState
) {
  const { angle, frame, tab, playing } = state;
  ctx.clearRect(0, 0, W, H);

  // ── Background: starfield ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#03071e');
  bgGrad.addColorStop(1, '#07091a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 80; i++) {
    const sx = (Math.sin(i * 4731 + 0.3) * 0.5 + 0.5) * W;
    const sy = (Math.cos(i * 7392 + 0.1) * 0.5 + 0.5) * H;
    const size = i % 5 === 0 ? 1.5 : 1;
    const flicker = 0.4 + 0.5 * Math.abs(Math.sin(frame * 0.02 + i));
    ctx.fillStyle = `rgba(255,255,255,${flicker * 0.7})`;
    ctx.fillRect(sx, sy, size, size);
  }

  // Layout constants
  const sunR = Math.min(W * 0.09, 60);
  const sunX = W * 0.12, sunY = H * 0.50;
  const earthX = W * 0.58, earthY = H * 0.50;
  const earthR = Math.min(W * 0.075, 48);

  // ── Sun ──
  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 1.8);
  sunGlow.addColorStop(0, 'rgba(255,248,200,0.6)');
  sunGlow.addColorStop(0.4, 'rgba(253,224,71,0.2)');
  sunGlow.addColorStop(1, 'rgba(253,224,71,0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 1.8, 0, Math.PI * 2);
  ctx.fill();

  const sunBody = ctx.createRadialGradient(sunX - sunR * 0.3, sunY - sunR * 0.3, sunR * 0.05, sunX, sunY, sunR);
  sunBody.addColorStop(0, '#fffde7');
  sunBody.addColorStop(0.4, '#fde047');
  sunBody.addColorStop(0.8, '#f59e0b');
  sunBody.addColorStop(1, '#d97706');
  ctx.fillStyle = sunBody;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Sun label
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Mặt Trời', sunX, sunY + sunR + 13);

  // ── Sunlight rays toward Earth (shadow geometry) ──
  if (tab === 'system' || tab === 'spring' || tab === 'neap' || tab === 'cycle') {
    const tangentAngle = Math.atan2(earthR, earthX - sunX - sunR);
    const rayAlpha = 0.18;
    ctx.save();
    ctx.globalAlpha = rayAlpha;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(sunX + sunR * Math.cos(-tangentAngle), sunY + sunR * Math.sin(-tangentAngle));
    ctx.lineTo(earthX, sunY - earthR * 1.5);
    ctx.lineTo(earthX + W * 0.12, sunY - earthR * 2.5);
    ctx.lineTo(earthX + W * 0.12, sunY + earthR * 2.5);
    ctx.lineTo(earthX, sunY + earthR * 1.5);
    ctx.lineTo(sunX + sunR * Math.cos(tangentAngle), sunY + sunR * Math.sin(tangentAngle));
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Ray label
    ctx.save();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ánh sáng mặt trời', (sunX + earthX) / 2, sunY - earthR - 8);
    ctx.restore();
  }

  // ── Moon orbit path ──
  const orbitRx = Math.min(W * 0.19, 120);
  const orbitRy = orbitRx * 0.55;

  ctx.save();
  ctx.strokeStyle = 'rgba(74,222,128,0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(earthX, earthY, orbitRx, orbitRy, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Orbit label
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Quỹ đạo mặt trăng', earthX, earthY + orbitRy + 10);

  // ── Moon position ──
  const moonAngle = tab === 'spring' ? Math.PI : // Full moon (opposite sun)
                    tab === 'neap'   ? Math.PI / 2 :  // Neap: 90°
                    angle; // animated otherwise
  const moonX = earthX + orbitRx * Math.cos(moonAngle);
  const moonY = earthY + orbitRy * Math.sin(moonAngle);
  const moonR = earthR * 0.32;

  // Moon body
  const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.1, moonX, moonY, moonR * 1.6);
  moonGlow.addColorStop(0, 'rgba(226,232,240,0.4)');
  moonGlow.addColorStop(1, 'rgba(226,232,240,0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR * 1.6, 0, Math.PI * 2);
  ctx.fill();

  const moonBody = ctx.createRadialGradient(moonX - moonR * 0.2, moonY - moonR * 0.2, moonR * 0.05, moonX, moonY, moonR);
  moonBody.addColorStop(0, '#f1f5f9');
  moonBody.addColorStop(0.6, '#cbd5e1');
  moonBody.addColorStop(1, '#64748b');
  ctx.fillStyle = moonBody;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Mặt Trăng', moonX, moonY + moonR + 11);

  // ── Gravitational force arrow from Moon toward Earth ──
  const toEarthX = earthX - moonX, toEarthY = earthY - moonY;
  const toEarthLen = Math.sqrt(toEarthX ** 2 + toEarthY ** 2);
  const arrowStart = 0.25, arrowEnd = 0.55;
  const ax1 = moonX + toEarthX * arrowStart, ay1 = moonY + toEarthY * arrowStart;
  const ax2 = moonX + toEarthX * arrowEnd, ay2 = moonY + toEarthY * arrowEnd;

  ctx.save();
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(ax1, ay1);
  ctx.lineTo(ax2, ay2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrow head
  const headAngle = Math.atan2(toEarthY, toEarthX);
  ctx.fillStyle = '#a78bfa';
  ctx.beginPath();
  ctx.moveTo(ax2, ay2);
  ctx.lineTo(ax2 - 7 * Math.cos(headAngle - 0.4), ay2 - 7 * Math.sin(headAngle - 0.4));
  ctx.lineTo(ax2 - 7 * Math.cos(headAngle + 0.4), ay2 - 7 * Math.sin(headAngle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── Earth ──
  // Ocean
  const earthOcean = ctx.createRadialGradient(earthX - earthR * 0.3, earthY - earthR * 0.3, earthR * 0.05, earthX, earthY, earthR);
  earthOcean.addColorStop(0, '#3b82f6');
  earthOcean.addColorStop(0.5, '#1d4ed8');
  earthOcean.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = earthOcean;
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
  ctx.fill();

  // Land masses (simplified)
  ctx.fillStyle = '#22c55e';
  ctx.save();
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
  ctx.clip();
  const landShapes = [
    [earthX - earthR * 0.3, earthY - earthR * 0.5, earthR * 0.25, earthR * 0.4],
    [earthX + earthR * 0.1, earthY - earthR * 0.45, earthR * 0.18, earthR * 0.35],
    [earthX - earthR * 0.15, earthY + earthR * 0.1, earthR * 0.2, earthR * 0.35],
    [earthX + earthR * 0.35, earthY - earthR * 0.1, earthR * 0.15, earthR * 0.3],
  ];
  landShapes.forEach(([lx, ly, rw, rh]) => {
    ctx.beginPath();
    ctx.ellipse(lx, ly, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // ── Tidal bulges ──
  // Direction from Earth toward Moon
  const toMoonNormX = (moonX - earthX) / toEarthLen;
  const toMoonNormY = (moonY - earthY) / toEarthLen;
  // Perpendicular
  const perpX = -toMoonNormY, perpY = toMoonNormX;

  // Bulge sizes
  const bulgeNear = earthR * (0.22 + 0.05 * Math.abs(Math.sin(frame * 0.04)));
  const bulgeFar   = earthR * (0.16 + 0.04 * Math.abs(Math.sin(frame * 0.04)));
  const bulgePerp  = earthR * 0.08;

  // Determine bulge size based on tab
  const springFactor = tab === 'spring' ? 1.35 : tab === 'neap' ? 0.55 : 1;
  const nearBulge = bulgeNear * springFactor;
  const farBulge  = bulgeFar  * springFactor;

  const drawBulge = (dirX: number, dirY: number, size: number, label: string, color: string) => {
    const bx = earthX + dirX * (earthR + size * 0.4);
    const by = earthY + dirY * (earthR + size * 0.4);
    const bGlow = ctx.createRadialGradient(bx, by, 1, bx, by, size + 6);
    bGlow.addColorStop(0, color.replace('0.8', '0.4'));
    bGlow.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = bGlow;
    ctx.beginPath();
    ctx.arc(bx, by, size + 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(bx, by, size, size * 0.65, Math.atan2(dirY, dirX), 0, Math.PI * 2);
    ctx.fill();

    if (label) {
      ctx.fillStyle = '#bfdbfe';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, bx, by + size + 10);
    }
  };

  // Near-side bulge (toward Moon) — Triều lên
  drawBulge(toMoonNormX, toMoonNormY, nearBulge, 'Triều lên ↑', 'rgba(59,130,246,0.8)');
  // Far-side bulge (away from Moon) — also Triều lên
  drawBulge(-toMoonNormX, -toMoonNormY, farBulge, 'Triều lên ↑', 'rgba(59,130,246,0.7)');
  // Perpendicular sides — Triều xuống
  drawBulge(perpX, perpY, bulgePerp, '', 'rgba(30,58,138,0.6)');
  drawBulge(-perpX, -perpY, bulgePerp, '', 'rgba(30,58,138,0.6)');

  // Earth rim
  ctx.strokeStyle = 'rgba(147,197,253,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
  ctx.stroke();

  // Earth specular
  const earthSpec = ctx.createRadialGradient(earthX - earthR * 0.3, earthY - earthR * 0.3, 0, earthX, earthY, earthR);
  earthSpec.addColorStop(0, 'rgba(255,255,255,0.12)');
  earthSpec.addColorStop(0.5, 'rgba(255,255,255,0.02)');
  earthSpec.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = earthSpec;
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#bfdbfe';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Trái Đất', earthX, earthY + earthR + 13);

  // ── Alignment indicator for spring/neap ──
  if (tab === 'spring') {
    ctx.save();
    ctx.strokeStyle = 'rgba(253,224,71,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(sunX + sunR, sunY);
    ctx.lineTo(moonX - moonR, moonY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⬅ Thẳng hàng → Triều CƯỜNG', earthX, H * 0.9);
    ctx.restore();
  }

  if (tab === 'neap') {
    ctx.save();
    ctx.strokeStyle = 'rgba(167,139,250,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    // Line from Sun through Earth
    ctx.beginPath();
    ctx.moveTo(sunX + sunR, sunY);
    ctx.lineTo(earthX + earthR * 1.5, earthY);
    ctx.stroke();
    // Line from Moon through Earth
    ctx.beginPath();
    ctx.moveTo(moonX, moonY - moonR);
    ctx.lineTo(moonX, earthY + earthR * 1.5);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⊥ Vuông góc → Triều KÉM', earthX, H * 0.9);
    ctx.restore();
  }

  // ── Cycle mode: tide timeline ──
  if (tab === 'cycle') {
    const tlX = W * 0.05, tlY = H * 0.83, tlW = W * 0.9, tlH = H * 0.1;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(tlX, tlY, tlW, tlH);

    // Tide wave
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = 0; x <= tlW; x++) {
      const t = (x / tlW) * Math.PI * 4;
      const y = tlY + tlH / 2 - Math.sin(t - frame * 0.05) * tlH * 0.38;
      if (x === 0) ctx.moveTo(tlX + x, y);
      else ctx.lineTo(tlX + x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Labels
    const labels = ['Triều\ncao', 'Triều\nthấp', 'Triều\ncao', 'Triều\nthấp', 'Triều\ncao'];
    labels.forEach((label, i) => {
      const lx = tlX + (i / (labels.length - 1)) * tlW;
      ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#64748b';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      label.split('\n').forEach((line, li) => {
        ctx.fillText(line, lx, tlY - 12 + li * 8);
      });
    });

    // Time axis
    ctx.fillStyle = '#475569';
    ctx.font = '7px sans-serif';
    ctx.textAlign = 'center';
    ['0h', '6h', '12h', '18h', '24h'].forEach((t, i) => {
      ctx.fillText(t, tlX + (i / 4) * tlW, tlY + tlH + 11);
    });

    // Playhead
    const phead = tlX + ((frame * 0.5) % tlW);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(phead, tlY);
    ctx.lineTo(phead, tlY + tlH);
    ctx.stroke();
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
const TideSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const activeRef = useRef(true);
  const stateRef = useRef({ angle: 0, frame: 0 });

  const [tab, setTab] = useState('system');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activityOpen, setActivityOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  const tabRef = useRef(tab);
  const playRef = useRef(playing);
  const speedRef = useRef(speed);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

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
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      if (W <= 0 || H <= 0) { rafRef.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(loop); return; }

      if (playRef.current) {
        stateRef.current.frame += 0.6 * speedRef.current;
        stateRef.current.angle += 0.008 * speedRef.current;
      }

      drawScene(ctx, W, H, {
        angle: stateRef.current.angle,
        frame: stateRef.current.frame,
        tab: tabRef.current,
        playing: playRef.current,
      });

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

  const questions = TAB_QUESTIONS[tab] ?? TAB_QUESTIONS['system'];

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif", background: '#03071e' }}
    >
      <SimTopBar
        title="Thủy triều — Hệ Mặt Trăng – Trái Đất – Mặt Trời"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
        extraControls={
          <button
            onClick={() => setInfoOpen(o => !o)}
            className="px-2 py-1 rounded-full text-[9px] font-black transition-all"
            style={{
              background: infoOpen ? '#1d4ed822' : 'rgba(255,255,255,0.06)',
              color: infoOpen ? '#93c5fd' : '#64748b',
              border: `1px solid ${infoOpen ? '#1d4ed855' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            ℹ Thông tin
          </button>
        }
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Quiz panel */}
        <SimActivity
          title="Câu đố"
          questions={questions}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor="#1d4ed8"
        />

        {/* Info overlay */}
        {infoOpen && (
          <div
            className="absolute top-2 right-2 z-30 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: '245px',
              background: 'rgba(3,7,30,0.95)',
              backdropFilter: 'blur(14px)',
              border: '1.5px solid rgba(250,204,21,0.3)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ background: 'rgba(250,204,21,0.15)', borderBottom: '1px solid rgba(250,204,21,0.2)' }}
            >
              <span className="text-yellow-300 font-black text-xs tracking-wide">📖 Thông tin</span>
              <button onClick={() => setInfoOpen(false)} className="text-slate-400 hover:text-white text-sm leading-none">✕</button>
            </div>
            <p className="px-4 py-3 text-[11px] text-slate-300 leading-relaxed">{INFO_TEXT[tab]}</p>
          </div>
        )}

        {/* Moon phase indicator */}
        {(tab === 'spring' || tab === 'neap') && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-[10px] font-black px-3 py-1.5 rounded-full pointer-events-none"
            style={{
              background: tab === 'spring' ? 'rgba(59,130,246,0.2)' : 'rgba(139,92,246,0.2)',
              border: `1px solid ${tab === 'spring' ? 'rgba(59,130,246,0.4)' : 'rgba(139,92,246,0.4)'}`,
              color: tab === 'spring' ? '#93c5fd' : '#c4b5fd',
            }}
          >
            {tab === 'spring' ? '🌕 Trăng Tròn / 🌑 Trăng Mới → TRIỀU CƯỜNG' : '🌓 Thượng Huyền / 🌗 Hạ Huyền → TRIỀU KÉM'}
          </div>
        )}
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

export default TideSim;
