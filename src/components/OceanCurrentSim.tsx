import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions (matching Mozaik3D bottom bar) ──────────────────────────
const TABS: SimTab[] = [
  { id: 'currents',  label: '🌊 Hải lưu đại dương',         color: '#0ea5e9' },
  { id: 'ideal',     label: '🔄 Mô hình lý tưởng',          color: '#6366f1' },
  { id: 'deepwater', label: '🌀 Sự hình thành vùng nước sâu', color: '#14b8a6' },
  { id: 'quiz',      label: '❓ Đố vui',                     color: '#f59e0b' },
];

// ─── Quiz questions ───────────────────────────────────────────────────────────
const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  currents: [
    {
      id: 'c1',
      hint: 'là hải lưu nóng chạy dọc bờ Đông nước Mỹ lên Đại Tây Dương',
      answer: 'Gulf Stream',
      options: ['Gulf Stream', 'Humboldt', 'Benguela', 'Labrador'],
    },
    {
      id: 'c2',
      hint: 'hải lưu lạnh chạy dọc bờ Tây Nam Mỹ có tên là',
      answer: 'Humboldt',
      options: ['Humboldt', 'Kuroshio', 'Canary', 'Gulf Stream'],
    },
    {
      id: 'c3',
      hint: 'hướng chuyển động của dòng hải lưu bắc bán cầu là',
      answer: 'Chiều kim đồng hồ',
      options: ['Chiều kim đồng hồ', 'Ngược chiều kim đồng hồ', 'Từ đông sang tây', 'Từ tây sang đông'],
    },
  ],
  ideal: [
    {
      id: 'i1',
      hint: 'lực chính tạo ra các vòng hoàn lưu đại dương là',
      answer: 'Gió mậu dịch',
      options: ['Gió mậu dịch', 'Thủy triều', 'Áp suất khí quyển', 'Núi lửa đáy biển'],
    },
    {
      id: 'i2',
      hint: 'lực làm lệch hướng dòng hải lưu gọi là lực',
      answer: 'Coriolis',
      options: ['Coriolis', 'Hấp dẫn', 'Centrifugal', 'Archimedes'],
    },
  ],
  deepwater: [
    {
      id: 'd1',
      hint: 'vùng nước sâu hình thành khi nước biển trở nên',
      answer: 'Lạnh và mặn hơn',
      options: ['Lạnh và mặn hơn', 'Nóng và nhạt hơn', 'Lạnh và nhạt hơn', 'Nóng và mặn hơn'],
    },
    {
      id: 'd2',
      hint: 'băng biển hình thành đẩy muối ra ngoài làm nước',
      answer: 'Đặc hơn và chìm xuống',
      options: ['Đặc hơn và chìm xuống', 'Nhẹ hơn và nổi lên', 'Bay hơi nhanh hơn', 'Ấm hơn và nổi lên'],
    },
  ],
  quiz: [
    {
      id: 'q1',
      hint: 'hải lưu nào đưa cá ngừ đến ngư trường Nhật Bản?',
      answer: 'Kuroshio',
      options: ['Kuroshio', 'Oyashio', 'Gulf Stream', 'Canary'],
    },
    {
      id: 'q2',
      hint: 'El Niño ảnh hưởng đến hải lưu nào ở Thái Bình Dương?',
      answer: 'Humboldt',
      options: ['Humboldt', 'Gulf Stream', 'Benguela', 'Agulhas'],
    },
    {
      id: 'q3',
      hint: 'vòng hoàn lưu nhiệt muối toàn cầu còn gọi là',
      answer: 'Băng chuyền đại dương',
      options: ['Băng chuyền đại dương', 'Dòng xoáy địa trung hải', 'Dòng chảy ngầm', 'Thủy triều trọng lực'],
    },
  ],
};

// ─── Current arrow data: lat/lon anchors & direction vectors ──────────────────
interface CurrentArrow {
  lat: number; lon: number;   // start position (degrees)
  dlat: number; dlon: number; // direction vector
  warm: boolean;              // true = warm (red), false = cold (cyan)
  label?: string;
}

// Real-world major ocean currents
const WARM_CURRENTS: CurrentArrow[] = [
  // North Atlantic — Gulf Stream
  { lat: 25, lon: -80, dlat: 15, dlon: 30, warm: true, label: 'Gulf Stream' },
  { lat: 35, lon: -55, dlat: 10, dlon: 25, warm: true },
  { lat: 45, lon: -30, dlat: 5, dlon: 20, warm: true, label: 'N. Atlantic Drift' },
  // South Atlantic — Brazil Current
  { lat: -15, lon: -38, dlat: -15, dlon: -5, warm: true, label: 'Brazil' },
  // North Pacific — Kuroshio
  { lat: 20, lon: 125, dlat: 15, dlon: 15, warm: true, label: 'Kuroshio' },
  { lat: 35, lon: 145, dlat: 5, dlon: 20, warm: true },
  { lat: 45, lon: 165, dlat: 2, dlon: 20, warm: true, label: 'N. Pacific' },
  // South Pacific — East Australian
  { lat: -20, lon: 155, dlat: -18, dlon: -5, warm: true, label: 'E. Australian' },
  // Indian Ocean — Agulhas
  { lat: -30, lon: 40, dlat: -8, dlon: -15, warm: true, label: 'Agulhas' },
  // Equatorial counter-currents
  { lat: 5, lon: -30, dlat: 0, dlon: 30, warm: true },
  { lat: 5, lon: 160, dlat: 0, dlon: 30, warm: true },
];

const COLD_CURRENTS: CurrentArrow[] = [
  // Labrador (cold, N Atlantic)
  { lat: 58, lon: -55, dlat: -18, dlon: -5, warm: false, label: 'Labrador' },
  // Canary (cold, off NW Africa)
  { lat: 35, lon: -15, dlat: -20, dlon: -5, warm: false, label: 'Canary' },
  // Benguela (cold, SW Africa)
  { lat: -20, lon: 12, dlat: 18, dlon: 3, warm: false, label: 'Benguela' },
  // Falkland / Malvinas
  { lat: -45, lon: -58, dlat: 18, dlon: 3, warm: false, label: 'Falkland' },
  // Humboldt / Peru
  { lat: -35, lon: -80, dlat: 28, dlon: 3, warm: false, label: 'Humboldt' },
  { lat: -15, lon: -78, dlat: 12, dlon: 2, warm: false },
  // California (cold)
  { lat: 42, lon: -128, dlat: -25, dlon: -2, warm: false, label: 'California' },
  // Oyashio (cold, NW Pacific)
  { lat: 50, lon: 155, dlat: -20, dlon: -10, warm: false, label: 'Oyashio' },
  // West Australian
  { lat: -25, lon: 108, dlat: 18, dlon: 5, warm: false, label: 'W. Australian' },
  // Antarctic Circumpolar
  { lat: -58, lon: -60, dlat: 0, dlon: 35, warm: false },
  { lat: -58, lon: 0, dlat: 0, dlon: 35, warm: false },
  { lat: -58, lon: 80, dlat: 0, dlon: 35, warm: false },
  { lat: -58, lon: 160, dlat: 0, dlon: 35, warm: false },
];

// ─── Deep-water circulation steps ────────────────────────────────────────────
const DEEP_STEPS = [
  { id: 'evap', label: '1. Bốc hơi — Nước mặn', color: '#fbbf24' },
  { id: 'cool', label: '2. Làm lạnh ở cực',     color: '#38bdf8' },
  { id: 'sink', label: '3. Nước chìm xuống sâu', color: '#818cf8' },
  { id: 'flow', label: '4. Dòng chảy ngầm',      color: '#34d399' },
];

// ─── Projection helpers ───────────────────────────────────────────────────────
function project3D(
  latDeg: number, lonDeg: number,
  earthAngle: number,
  cx: number, cy: number, R: number
): { x: number; y: number; visible: boolean } {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180 + earthAngle;
  const x = R * Math.cos(lat) * Math.sin(lon);
  const y = -R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.cos(lon);
  return { x: cx + x, y: cy + y, visible: z > -R * 0.15 };
}

// Draw a curved arrow between two projected points on the globe
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
  if (len < 5) return;

  // Perpendicular offset for curve
  const nx = -dy / len, ny = dx / len;
  const curve = len * 0.35;
  const cx = (x1 + x2) / 2 + nx * curve;
  const cy2 = (y1 + y2) / 2 + ny * curve;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy2, x2, y2);
  ctx.stroke();

  // Arrow head
  const angle = Math.atan2(y2 - cy2, x2 - cx);
  const headLen = lineWidth * 3.5;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Main globe drawing ───────────────────────────────────────────────────────
function drawGlobe(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  earthAngle: number,
  tab: string,
  frame: number,
  playing: boolean,
  deepStep: string,
  showLabels: boolean
) {
  ctx.clearRect(0, 0, W, H);

  // Space background
  const bg = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.max(W, H) * 0.7);
  bg.addColorStop(0, '#0d1225');
  bg.addColorStop(1, '#040810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 55; i++) {
    const sx = (Math.sin(i * 5237) * 0.5 + 0.5) * W;
    const sy = (Math.cos(i * 8741) * 0.5 + 0.5) * H;
    ctx.fillRect(sx, sy, i % 3 === 0 ? 1.5 : 1, i % 3 === 0 ? 1.5 : 1);
  }

  const cx = W * 0.58, cy = H * 0.50;
  const R = Math.min(W * 0.38, H * 0.42);

  // Atmosphere glow
  const glow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.25);
  glow.addColorStop(0, 'rgba(14,165,233,0.35)');
  glow.addColorStop(0.6, 'rgba(14,165,233,0.08)');
  glow.addColorStop(1, 'rgba(14,165,233,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
  ctx.fill();

  // Ocean base
  const oceanGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.25, R * 0.05, cx, cy, R);
  oceanGrad.addColorStop(0, '#1d6fa4');
  oceanGrad.addColorStop(0.5, '#0c4a6e');
  oceanGrad.addColorStop(1, '#082f49');
  ctx.fillStyle = oceanGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // Clip everything inside globe
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.995, 0, Math.PI * 2);
  ctx.clip();

  // Land masses (simplified continent shapes via projected polygon paths)
  const land: Array<[number, number][]> = [
    // North America
    [[70,-145],[72,-130],[65,-120],[60,-130],[55,-132],[50,-128],[48,-125],[42,-124],[35,-120],[28,-110],[22,-100],[20,-88],[16,-87],[10,-83],[8,-77],[8,-73],[12,-70],[18,-68],[22,-72],[28,-80],[32,-80],[36,-75],[40,-70],[44,-66],[46,-64],[48,-68],[52,-56],[58,-64],[64,-68],[68,-78],[70,-90],[72,-110],[72,-128],[70,-145]],
    // South America
    [[10,-73],[5,-78],[0,-78],[-5,-80],[-10,-78],[-18,-70],[-25,-70],[-30,-70],[-38,-72],[-45,-65],[-50,-68],[-55,-66],[-55,-64],[-50,-58],[-45,-52],[-40,-50],[-35,-52],[-30,-50],[-25,-48],[-20,-40],[-15,-38],[-8,-35],[-5,-35],[0,-50],[5,-60],[8,-62],[10,-63],[10,-73]],
    // Europe + Asia (simplified)
    [[35,-8],[38,-9],[40,-8],[42,-8],[43,-3],[44,0],[44,5],[46,12],[44,14],[44,15],[42,18],[40,20],[38,22],[36,22],[35,28],[36,30],[40,35],[38,40],[40,40],[42,45],[45,50],[48,50],[50,55],[52,58],[52,60],[55,60],[55,58],[52,50],[52,45],[55,40],[56,36],[58,36],[58,28],[62,26],[64,26],[68,28],[72,30],[74,55],[72,80],[70,95],[65,100],[60,110],[55,115],[50,120],[48,135],[46,135],[42,135],[35,135],[32,130],[28,120],[22,114],[20,110],[15,108],[12,109],[10,100],[8,100],[5,103],[2,104],[0,110],[5,100],[5,80],[8,77],[10,76],[12,75],[22,68],[25,65],[20,58],[15,45],[15,42],[12,45],[12,48],[10,42],[12,38],[12,32],[15,37],[20,38],[22,37],[30,32],[30,34],[32,35],[35,36],[35,30],[36,28],[36,26],[36,22],[38,22],[38,12],[36,12],[35,8],[35,-8]],
    // Africa
    [[35,-5],[35,-2],[30,0],[25,0],[20,-17],[15,-17],[10,-15],[5,-8],[0,-8],[-5,-12],[-10,-14],[-15,-12],[-20,-12],[-25,-14],[-30,-16],[-35,-18],[-35,18],[-30,30],[-25,33],[-20,35],[-15,40],[-10,42],[-5,40],[0,42],[5,42],[10,45],[12,44],[15,40],[20,38],[25,38],[30,32],[32,28],[35,25],[37,12],[35,8],[35,-5]],
    // Australia
    [[-15,130],[-18,122],[-25,114],[-32,115],[-35,118],[-38,140],[-38,148],[-30,152],[-25,152],[-20,148],[-15,145],[-12,137],[-12,130],[-15,130]],
    // Greenland
    [[60,-45],[62,-42],[65,-38],[68,-22],[72,-18],[76,-18],[80,-22],[82,-30],[82,-45],[78,-55],[75,-58],[70,-55],[65,-52],[60,-45]],
    // Japan islands (simplified)
    [[42,140],[40,140],[35,136],[33,130],[34,132],[36,136],[38,140],[40,142],[42,140]],
  ];

  land.forEach(shape => {
    ctx.beginPath();
    shape.forEach(([lat, lon], i) => {
      const p = project3D(lat, lon, earthAngle, cx, cy, R);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = '#2d5a1b';
    ctx.fill();
    ctx.strokeStyle = '#1a3a0e';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // ── Current arrows by tab ──
  if (tab === 'currents' || tab === 'quiz') {
    const allCurrents = [...WARM_CURRENTS, ...COLD_CURRENTS];
    allCurrents.forEach((curr, idx) => {
      const animOffset = playing ? Math.sin(frame * 0.04 + idx * 0.7) * 3 : 0;
      const p1 = project3D(curr.lat, curr.lon, earthAngle, cx, cy, R);
      const p2 = project3D(
        curr.lat + curr.dlat * 0.5 + animOffset * 0.1,
        curr.lon + curr.dlon * 0.5 + animOffset * 0.08,
        earthAngle, cx, cy, R
      );

      if (!p1.visible || !p2.visible) return;

      const color = curr.warm ? '#ef4444' : '#22d3ee';
      const glow = curr.warm ? '#ef4444' : '#06b6d4';
      const brightness = 0.6 + 0.4 * Math.abs(Math.sin(frame * 0.03 + idx));
      drawCurvedArrow(ctx, p1.x, p1.y, p2.x, p2.y, color, curr.warm ? 2.5 : 2, brightness);

      if (showLabels && curr.label) {
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        ctx.save();
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = curr.warm ? '#fca5a5' : '#67e8f9';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(curr.label, mx, my - 5);
        ctx.restore();
      }
    });
  }

  // ── Ideal model: simple gyre arrows ──
  if (tab === 'ideal') {
    const gyreColors = ['#f97316', '#22d3ee', '#a78bfa', '#34d399'];
    const gyres = [
      // N Atlantic gyre (CW)
      { lats: [50, 30, 10, 30], lons: [-20, -10, -30, -60], warm: [true, false, false, true] },
      // S Atlantic gyre (CCW)
      { lats: [-10, -30, -50, -30], lons: [-35, -15, -30, -55], warm: [true, false, false, true] },
      // N Pacific gyre (CW)
      { lats: [50, 25, 5, 25], lons: [175, 180, 150, 140], warm: [true, false, false, true] },
      // S Pacific gyre (CCW)
      { lats: [-10, -35, -50, -30], lons: [-100, -80, -120, -115], warm: [true, false, false, true] },
    ];

    gyres.forEach((gyre, gi) => {
      for (let i = 0; i < gyre.lats.length; i++) {
        const next = (i + 1) % gyre.lats.length;
        const p1 = project3D(gyre.lats[i], gyre.lons[i], earthAngle, cx, cy, R);
        const p2 = project3D(gyre.lats[next], gyre.lons[next], earthAngle, cx, cy, R);
        if (!p1.visible || !p2.visible) continue;
        const col = gyre.warm[i] ? '#ef4444' : '#22d3ee';
        drawCurvedArrow(ctx, p1.x, p1.y, p2.x, p2.y, col, 2.5, 0.85);
      }
    });

    // Wind labels
    const windLabels = [
      { lat: 10, lon: -30, label: '← Gió mậu dịch' },
      { lat: 45, lon: -30, label: '→ Gió Tây ôn đới' },
      { lat: -15, lon: -60, label: '← Gió mậu dịch Nam' },
    ];
    windLabels.forEach(w => {
      const p = project3D(w.lat, w.lon, earthAngle, cx, cy, R);
      if (!p.visible) return;
      ctx.save();
      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText(w.label, p.x, p.y);
      ctx.restore();
    });
  }

  // ── Deep water: animate polar sinking ──
  if (tab === 'deepwater') {
    // Thermohaline circulation belt (simplified path)
    const beltPath: Array<[number, number]> = [
      [60, -35], [65, -45], [70, -50], [65, -20], [60, -5],
      [55, 10], [50, 0], [40, -20], [30, -40],
      [20, -60], [0, -40], [-20, -30], [-40, -20],
      [-55, 20], [-60, 70], [-55, 120], [-40, 150],
      [-20, 165], [0, 165], [20, 150],
      [40, 140], [55, 155], [60, 175], [55, -170],
      [40, -160], [30, -120], [20, -100], [10, -80], [30, -60], [45, -50], [60, -35],
    ];

    for (let i = 0; i < beltPath.length - 1; i++) {
      const [lat1, lon1] = beltPath[i];
      const [lat2, lon2] = beltPath[i + 1];
      const p1 = project3D(lat1, lon1, earthAngle, cx, cy, R);
      const p2 = project3D(lat2, lon2, earthAngle, cx, cy, R);
      if (!p1.visible || !p2.visible) continue;

      // Color: warm in tropics, cold in polar
      const isWarm = Math.abs(lat1) < 30;
      const col = isWarm ? '#f97316' : '#38bdf8';
      const animAlpha = 0.55 + 0.35 * Math.abs(Math.sin(frame * 0.02 + i * 0.3));
      drawCurvedArrow(ctx, p1.x, p1.y, p2.x, p2.y, col, 2, animAlpha);
    }

    // Polar sinking zones pulsing circles
    const sinkZones = [
      { lat: 70, lon: -30, label: 'Chìm sâu\nBắc Đại Tây Dương' },
      { lat: -65, lon: -30, label: 'Chìm sâu\nNam Đại Dương' },
    ];
    sinkZones.forEach(z => {
      const p = project3D(z.lat, z.lon, earthAngle, cx, cy, R);
      if (!p.visible) return;
      const pulse = 5 + 4 * Math.sin(frame * 0.08);
      ctx.save();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.arc(p.x, p.y, pulse * 1.8, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = '#c4b5fd';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      z.label.split('\n').forEach((line, li) => {
        ctx.fillText(line, p.x, p.y + 14 + li * 9);
      });
      ctx.restore();
    });
  }

  ctx.restore(); // end globe clip

  // Globe rim
  ctx.strokeStyle = 'rgba(14,165,233,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();

  // Specular highlight
  const spec = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 0, cx, cy, R);
  spec.addColorStop(0, 'rgba(255,255,255,0.12)');
  spec.addColorStop(0.4, 'rgba(255,255,255,0.03)');
  spec.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // Legend
  if (tab === 'currents' || tab === 'quiz') {
    const lx = 14, ly = H - 50;
    ctx.save();
    ctx.font = 'bold 9px sans-serif';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(lx, ly, 22, 4);
    ctx.fillText('Hải lưu nóng', lx + 26, ly + 4);

    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(lx, ly + 16, 22, 4);
    ctx.fillText('Hải lưu lạnh', lx + 26, ly + 20);
    ctx.restore();
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
const OceanCurrentSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const activeRef = useRef(true);
  const frameRef = useRef(0);

  const [tab, setTab] = useState('currents');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [activityOpen, setActivityOpen] = useState(true);
  const [deepStep, setDeepStep] = useState('evap');
  const [infoOpen, setInfoOpen] = useState(false);

  // Globe drag state
  const dragRef = useRef({ dragging: false, lastX: 0, angle: 0.5, vel: 0 });

  const tabRef = useRef(tab);
  const playRef = useRef(playing);
  const speedRef = useRef(speed);
  const deepStepRef = useRef(deepStep);
  const labelsRef = useRef(showLabels);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { deepStepRef.current = deepStep; }, [deepStep]);
  useEffect(() => { labelsRef.current = showLabels; }, [showLabels]);

  // Mouse drag handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: MouseEvent) => {
      dragRef.current.dragging = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.vel = 0;
      canvas.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      dragRef.current.vel = dx * 0.003;
      dragRef.current.angle += dx * 0.003;
      dragRef.current.lastX = e.clientX;
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      canvas.style.cursor = 'grab';
    };
    const onTouchStart = (e: TouchEvent) => {
      dragRef.current.dragging = true;
      dragRef.current.lastX = e.touches[0].clientX;
      dragRef.current.vel = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.touches[0].clientX - dragRef.current.lastX;
      dragRef.current.vel = dx * 0.003;
      dragRef.current.angle += dx * 0.003;
      dragRef.current.lastX = e.touches[0].clientX;
    };
    const onTouchEnd = () => { dragRef.current.dragging = false; };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.style.cursor = 'grab';

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
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
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      if (W <= 0 || H <= 0) { rafRef.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Auto-rotate + momentum
      if (playRef.current && !dragRef.current.dragging) {
        dragRef.current.angle += 0.003 * speedRef.current;
      }
      if (!dragRef.current.dragging) {
        dragRef.current.vel *= 0.92;
        dragRef.current.angle += dragRef.current.vel;
      }

      if (playRef.current) frameRef.current += speedRef.current;

      drawGlobe(
        ctx, W, H,
        dragRef.current.angle,
        tabRef.current,
        frameRef.current,
        playRef.current,
        deepStepRef.current,
        labelsRef.current
      );

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

  const questions = TAB_QUESTIONS[tab] ?? TAB_QUESTIONS['currents'];

  const INFO_TEXT: Record<string, string> = {
    currents: 'Hải lưu đại diện cho dòng nước biển di chuyển liên tục do gió và sự khác biệt về mật độ nước. Các dòng hải lưu nóng (màu đỏ) chảy từ vùng nhiệt đới ra vùng cực, mang nhiệt lượng đến các vùng đất lạnh. Hải lưu lạnh (màu xanh cyan) chảy ngược lại từ vùng cực về nhiệt đới, làm mát khí hậu ven biển.',
    ideal: 'Nếu Trái Đất có một đại dương duy nhất và gió thổi đều, gió mậu dịch ở vùng cận xích đạo sẽ tạo ra các vòng hoàn lưu lớn. Lực Coriolis làm chúng quay theo chiều kim đồng hồ ở bán cầu Bắc và ngược chiều ở bán cầu Nam.',
    deepwater: 'Ở vùng cực, nước biển lạnh đi, muối đặc hơn do bốc hơi và đóng băng. Nước dày đặc này chìm xuống đáy đại dương, tạo ra dòng chảy ngầm kết nối tất cả các đại dương — được gọi là "băng chuyền đại dương" hay hoàn lưu nhiệt muối.',
    quiz: 'Hãy kiểm tra kiến thức của bạn về các dòng hải lưu trên thế giới qua bộ câu hỏi sau!',
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif", background: '#07091a' }}
    >
      <SimTopBar
        title="Hải lưu đại dương — Mô phỏng Mozaik3D"
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
        extraControls={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowLabels(l => !l)}
              className="px-2 py-1 rounded-full text-[9px] font-black transition-all"
              style={{
                background: showLabels ? '#0ea5e922' : 'rgba(255,255,255,0.06)',
                color: showLabels ? '#38bdf8' : '#64748b',
                border: `1px solid ${showLabels ? '#0ea5e955' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              🏷 Nhãn
            </button>
            <button
              onClick={() => setInfoOpen(o => !o)}
              className="px-2 py-1 rounded-full text-[9px] font-black transition-all"
              style={{
                background: infoOpen ? '#6366f122' : 'rgba(255,255,255,0.06)',
                color: infoOpen ? '#a5b4fc' : '#64748b',
                border: `1px solid ${infoOpen ? '#6366f155' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              ℹ Thông tin
            </button>
          </div>
        }
      />

      <div className="flex-grow relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Quiz / Activity panel */}
        {tab !== 'deepwater' && (
          <SimActivity
            title="Câu đố"
            questions={questions}
            visible={activityOpen}
            onToggle={() => setActivityOpen(o => !o)}
            themeColor="#1d4ed8"
          />
        )}

        {/* Deep water step selector panel */}
        {tab === 'deepwater' && (
          <div
            className="absolute top-2 left-2 z-30 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: '220px',
              background: 'rgba(10,16,40,0.92)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(99,102,241,0.35)',
            }}
          >
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#4f46e5' }}>
              <span className="text-white text-xs">🌀</span>
              <span className="text-white font-black text-xs tracking-wide">Các bước hình thành</span>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              {DEEP_STEPS.map(step => (
                <button
                  key={step.id}
                  onClick={() => setDeepStep(step.id)}
                  className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
                  style={{
                    background: deepStep === step.id ? `${step.color}22` : 'rgba(255,255,255,0.05)',
                    color: deepStep === step.id ? step.color : '#64748b',
                    border: `1px solid ${deepStep === step.id ? `${step.color}55` : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info panel overlay */}
        {infoOpen && (
          <div
            className="absolute top-2 right-2 z-30 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: '240px',
              background: 'rgba(10,16,40,0.94)',
              backdropFilter: 'blur(14px)',
              border: '1.5px solid rgba(14,165,233,0.35)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ background: 'rgba(14,165,233,0.25)', borderBottom: '1px solid rgba(14,165,233,0.2)' }}
            >
              <span className="text-cyan-300 font-black text-xs tracking-wide">📖 Thông tin</span>
              <button onClick={() => setInfoOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <p className="px-4 py-3 text-[11px] text-slate-300 leading-relaxed">
              {INFO_TEXT[tab]}
            </p>
          </div>
        )}

        {/* Drag hint */}
        <div
          className="absolute bottom-2 right-2 text-[9px] text-slate-600 font-bold pointer-events-none"
          style={{ textShadow: '0 0 6px #000' }}
        >
          🖱 Kéo để xoay địa cầu
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

export default OceanCurrentSim;
