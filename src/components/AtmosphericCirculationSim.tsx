import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, ActivityQuestion } from './SimulationShell';

// ─── Activity questions per mode ─────────────────────────────────────────────
const MODE_QUESTIONS: Record<string, ActivityQuestion[]> = {
  static: [
    { id: 'st1', hint: 'hình thành ở vùng xích đạo do nhiệt độ cao', answer: 'Áp thấp', options: ['Áp thấp', 'Áp cao', 'Bão', 'Anticyclone'] },
    { id: 'st2', hint: 'hình thành ở vùng chí tuyến do không khí lạnh chìm xuống', answer: 'Áp cao', options: ['Áp cao', 'Áp thấp', 'Gió mùa', 'Lốc xoáy'] },
  ],
  rotating: [
    { id: 'ro1', hint: 'số đới gió thường xuyên chính trên Trái Đất', answer: '3 đới gió', options: ['3 đới gió', '2 đới gió', '4 đới gió', '6 đới gió'] },
    { id: 'ro2', hint: 'gió thổi từ áp cao chí tuyến về áp thấp xích đạo', answer: 'Gió Tín phong', options: ['Gió Tín phong', 'Gió Tây ôn đới', 'Gió Đông cực', 'Gió mùa'] },
  ],
  tropical: [
    { id: 'tr1', hint: 'tên khác của gió Tín phong', answer: 'Gió mậu dịch', options: ['Gió mậu dịch', 'Gió nồm', 'Gió bắc', 'Monsoon'] },
    { id: 'tr2', hint: 'gió Tín phong ở bán cầu Bắc thổi theo hướng', answer: 'Đông Bắc', options: ['Đông Bắc', 'Tây Nam', 'Đông Nam', 'Tây Bắc'] },
  ],
  temperate: [
    { id: 'te1', hint: 'gió Tây ôn đới hoạt động ở vĩ độ', answer: '30° – 60°', options: ['30° – 60°', '0° – 30°', '60° – 90°', '15° – 45°'] },
    { id: 'te2', hint: 'gió Tây ôn đới ở bán cầu Bắc thổi chủ yếu theo hướng', answer: 'Tây Nam', options: ['Tây Nam', 'Đông Bắc', 'Tây Bắc', 'Đông Nam'] },
  ],
  polar: [
    { id: 'po1', hint: 'gió Đông cực thổi từ', answer: 'Cực về ôn đới', options: ['Cực về ôn đới', 'Xích đạo về cực', 'Chí tuyến về cực', 'Ôn đới về xích đạo'] },
    { id: 'po2', hint: 'vùng hoạt động của gió Đông cực', answer: '60° – 90°', options: ['60° – 90°', '30° – 60°', '0° – 30°', '45° – 90°'] },
  ],
  coriolis: [
    { id: 'co1', hint: 'ở bán cầu Bắc, gió bị lệch về phía', answer: 'Phải', options: ['Phải', 'Trái', 'Không lệch', 'Lệch ngẫu nhiên'] },
    { id: 'co2', hint: 'nguyên nhân gây ra lực Coriolis', answer: 'Trái Đất tự quay', options: ['Trái Đất tự quay', 'Sức hút Mặt Trăng', 'Nhiệt độ không khí', 'Áp suất khí quyển'] },
  ],
};


// ─── Types ───────────────────────────────────────────────────────────────────
type SimMode = 'static' | 'rotating' | 'tropical' | 'temperate' | 'polar' | 'coriolis';

interface WindArrow {
  lat: number;
  lon: number;
  dlat: number;
  dlon: number;
  zone: 'trade_n' | 'trade_s' | 'westerly_n' | 'westerly_s' | 'polar_n' | 'polar_s';
  progress: number;
  speed: number;
  id: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ZONE_COLORS: Record<string, string> = {
  trade_n: '#ff6b6b',
  trade_s: '#ff6b6b',
  westerly_n: '#b06bff',
  westerly_s: '#b06bff',
  polar_n: '#6bc8ff',
  polar_s: '#6bc8ff',
};

const PRESSURE_BELTS = [
  { lat: 90,  label: 'Áp cao cực',         type: 'high',  color: 'rgba(59,130,246,0.7)' },
  { lat: 60,  label: 'Áp thấp ôn đới',     type: 'low',   color: 'rgba(239,68,68,0.7)'  },
  { lat: 30,  label: 'Áp cao chí tuyến',   type: 'high',  color: 'rgba(59,130,246,0.7)' },
  { lat: 0,   label: 'Áp thấp xích đạo',   type: 'low',   color: 'rgba(239,68,68,0.7)'  },
  { lat: -30, label: 'Áp cao chí tuyến',   type: 'high',  color: 'rgba(59,130,246,0.7)' },
  { lat: -60, label: 'Áp thấp ôn đới',     type: 'low',   color: 'rgba(239,68,68,0.7)'  },
  { lat: -90, label: 'Áp cao cực',         type: 'high',  color: 'rgba(59,130,246,0.7)' },
];

const LATITUDES_LABEL = [
  { lat: 66.5,  label: 'Vòng Bắc cực',    short: 'VBc' },
  { lat: 23.5,  label: 'Chí tuyến Bắc',   short: 'CTB' },
  { lat: 0,     label: 'Xích đạo',         short: 'XĐ'  },
  { lat: -23.5, label: 'Chí tuyến Nam',    short: 'CTN' },
  { lat: -66.5, label: 'Vòng Nam cực',     short: 'VNc' },
];

// ─── Helper: create wind arrows for a given mode ──────────────────────────────
function createArrows(mode: SimMode): WindArrow[] {
  const arrows: WindArrow[] = [];
  let id = 0;

  const addZone = (
    lats: [number, number],
    dlat: number,
    dlon: number,
    zone: WindArrow['zone'],
    count = 24
  ) => {
    for (let i = 0; i < count; i++) {
      arrows.push({
        lat: lats[0] + Math.random() * (lats[1] - lats[0]),
        lon: (i / count) * 360,
        dlat,
        dlon,
        zone,
        progress: Math.random(),
        speed: 0.4 + Math.random() * 0.6,
        id: id++,
      });
    }
  };

  if (mode === 'tropical') {
    // Trade winds only
    addZone([5, 30], -0.5, -0.8, 'trade_n', 30);
    addZone([-30, -5], 0.5, -0.8, 'trade_s', 30);
  } else if (mode === 'temperate') {
    // Westerlies only
    addZone([30, 60], 0.4, 0.9, 'westerly_n', 30);
    addZone([-60, -30], -0.4, 0.9, 'westerly_s', 30);
  } else if (mode === 'polar') {
    // Polar easterlies only
    addZone([60, 85], -0.3, -0.7, 'polar_n', 24);
    addZone([-85, -60], 0.3, -0.7, 'polar_s', 24);
  } else {
    // Full circulation (static / rotating / coriolis)
    addZone([5, 30], -0.5, -0.8, 'trade_n', 24);
    addZone([-30, -5], 0.5, -0.8, 'trade_s', 24);
    addZone([30, 60], 0.4, 0.9, 'westerly_n', 20);
    addZone([-60, -30], -0.4, 0.9, 'westerly_s', 20);
    addZone([60, 85], -0.3, -0.7, 'polar_n', 16);
    addZone([-85, -60], 0.3, -0.7, 'polar_s', 16);
  }

  return arrows;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AtmosphericCirculationSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const stateRef = useRef({
    earthAngle: 0,
    dragAngle: 0,
    isDragging: false,
    startX: 0,
    baseAngle: 0,
    arrows: [] as WindArrow[],
    mode: 'rotating' as SimMode,
    playing: true,
    showPressure: true,
    showLabels: true,
    showArrows: true,
    speed: 1.5,
    frame: 0,
  });

  const [mode, setMode] = useState<SimMode>('rotating');
  const [playing, setPlaying] = useState(true);
  const [showPressure, setShowPressure] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [speed, setSpeed] = useState(1.5);

  // Sync react state → ref
  useEffect(() => { stateRef.current.mode = mode; stateRef.current.arrows = createArrows(mode); }, [mode]);
  useEffect(() => { stateRef.current.playing = playing; }, [playing]);
  useEffect(() => { stateRef.current.showPressure = showPressure; }, [showPressure]);
  useEffect(() => { stateRef.current.showLabels = showLabels; }, [showLabels]);
  useEffect(() => { stateRef.current.showArrows = showArrows; }, [showArrows]);
  useEffect(() => { stateRef.current.speed = speed; }, [speed]);

  // Initialize arrows
  useEffect(() => { stateRef.current.arrows = createArrows(mode); }, []);

  // ─── Canvas draw loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = stateRef.current;

    // Mouse / touch drag
    const onMouseDown = (e: MouseEvent) => {
      s.isDragging = true;
      s.startX = e.clientX;
      s.baseAngle = s.dragAngle;
      canvas.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!s.isDragging) return;
      s.dragAngle = s.baseAngle + (e.clientX - s.startX) * 0.012;
    };
    const onMouseUp = () => { s.isDragging = false; canvas.style.cursor = 'grab'; };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.style.cursor = 'grab';

    let active = true;

    function draw() {
      if (!active) return;
      const ctx = canvas!.getContext('2d')!;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas!.width / dpr;
      const H = canvas!.height / dpr;
      if (W <= 0 || H <= 0) { animFrameRef.current = requestAnimationFrame(draw); return; }
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.38;

      // Advance simulation
      if (s.playing) {
        if (s.mode !== 'static') s.earthAngle += 0.004 * s.speed;
        s.frame++;
        const moveSpeed = 0.25 * s.speed;

        s.arrows.forEach(a => {
          // Coriolis deflection
          let dlon = a.dlon;
          let dlat = a.dlat;
          if (s.mode === 'coriolis') {
            // exaggerate Coriolis effect
            const corFactor = a.lat > 0 ? 1 : -1;
            dlon += corFactor * 0.3;
          }

          a.lon += dlon * moveSpeed;
          a.lat += dlat * moveSpeed * 0.3;
          a.progress = (a.progress + 0.008 * s.speed) % 1;

          // wrap/reset
          if (a.lon > 360) a.lon -= 360;
          if (a.lon < 0) a.lon += 360;

          const bounds: Record<WindArrow['zone'], [number, number]> = {
            trade_n: [0, 30], trade_s: [-30, 0],
            westerly_n: [30, 65], westerly_s: [-65, -30],
            polar_n: [60, 88], polar_s: [-88, -60],
          };
          const [lo, hi] = bounds[a.zone];
          if (a.lat < lo || a.lat > hi) {
            const [rlo, rhi] = bounds[a.zone];
            a.lat = rlo + Math.random() * (rhi - rlo);
            a.lon = Math.random() * 360;
            a.progress = 0;
          }
        });
      }

      // ── Background ──
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 60; i++) {
        const sx = ((Math.sin(i * 4723) * 0.5 + 0.5) * W);
        const sy = ((Math.cos(i * 9182) * 0.5 + 0.5) * H);
        const sr = 0.5 + Math.abs(Math.sin(i * 0.7 + s.frame * 0.01)) * 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Atmosphere glow ──
      const atmosGlow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.28);
      atmosGlow.addColorStop(0, 'rgba(56,189,248,0.35)');
      atmosGlow.addColorStop(0.5, 'rgba(56,189,248,0.12)');
      atmosGlow.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = atmosGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // ── Project helper ──
      const totalAngle = s.earthAngle + s.dragAngle;
      function project(latDeg: number, lonDeg: number) {
        const lat = (latDeg * Math.PI) / 180;
        const lon = (lonDeg * Math.PI) / 180 + totalAngle;
        const x = R * Math.cos(lat) * Math.sin(lon);
        const y = -R * Math.sin(lat);
        const z = R * Math.cos(lat) * Math.cos(lon);
        return { x: cx + x, y: cy + y, z, visible: z > -R * 0.1 };
      }

      // ── Earth sphere ──
      const sphereGrad = ctx.createRadialGradient(
        cx - R * 0.25, cy - R * 0.25, R * 0.05,
        cx, cy, R
      );
      sphereGrad.addColorStop(0, '#1e4080');
      sphereGrad.addColorStop(0.45, '#1a5276');
      sphereGrad.addColorStop(0.75, '#154360');
      sphereGrad.addColorStop(1, '#0a1628');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Draw simplified continents (Africa/Europe blob for visual flair)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      const drawContinent = (lats: number[], lons: number[], color: string) => {
        ctx.beginPath();
        let first = true;
        for (let i = 0; i < lats.length; i++) {
          const p = project(lats[i], lons[i]);
          if (p.visible) {
            if (first) { ctx.moveTo(p.x, p.y); first = false; }
            else ctx.lineTo(p.x, p.y);
          } else first = true;
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };

      // Africa
      drawContinent(
        [37, 36, 32, 22, 10, -5, -20, -34, -28, -10, 5, 15, 25, 37],
        [-5, 7, 12, 15, 15, 12, 18, 26, 37, 42, 45, 42, 35, -5],
        'rgba(34,85,34,0.85)'
      );
      // Eurasia rough
      drawContinent(
        [35, 45, 55, 65, 70, 65, 55, 45, 38, 35],
        [-5, 0, 10, 20, 50, 80, 100, 90, 50, -5],
        'rgba(60,100,50,0.75)'
      );
      // Americas rough
      drawContinent(
        [50, 60, 55, 45, 35, 20, 10, -5, -15, -35, -55, -40, -20, 5, 20, 35, 50],
        [-125, -100, -80, -75, -80, -90, -80, -75, -70, -60, -70, -70, -45, -55, -80, -90, -125],
        'rgba(55,90,40,0.75)'
      );

      ctx.restore();

      // ── Pressure belt bands ──
      if (s.showPressure) {
        PRESSURE_BELTS.forEach(belt => {
          // Draw a line around the globe at this latitude
          ctx.beginPath();
          let firstPt = true;
          for (let lon = 0; lon <= 365; lon += 5) {
            const p = project(belt.lat, lon);
            if (p.visible) {
              if (firstPt) { ctx.moveTo(p.x, p.y); firstPt = false; }
              else ctx.lineTo(p.x, p.y);
            } else firstPt = true;
          }
          ctx.strokeStyle = belt.color;
          ctx.lineWidth = belt.type === 'low' ? 3.5 : 2.5;
          ctx.setLineDash(belt.type === 'low' ? [] : [6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // ── Latitude reference lines ──
      if (s.showLabels) {
        LATITUDES_LABEL.forEach(ll => {
          ctx.beginPath();
          let firstPt = true;
          for (let lon = 0; lon <= 365; lon += 3) {
            const p = project(ll.lat, lon);
            if (p.visible) {
              if (firstPt) { ctx.moveTo(p.x, p.y); firstPt = false; }
              else ctx.lineTo(p.x, p.y);
            } else firstPt = true;
          }
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Label near front
          const fp = project(ll.lat, 90 - totalAngle * (180 / Math.PI));
          if (fp.visible && fp.x > cx - R && fp.x < cx + R) {
            ctx.fillStyle = 'rgba(203,213,225,0.8)';
            ctx.font = `bold 10px sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText(ll.short, cx + R + 8, fp.y + 4);
          }
        });
      }

      // ── Wind arrows ──
      if (s.showArrows) {
        s.arrows.forEach(a => {
          const p = project(a.lat, a.lon);
          if (!p.visible) return;

          // depth fade
          const depthAlpha = 0.4 + 0.6 * Math.max(0, p.z / R);
          const color = ZONE_COLORS[a.zone];

          // Arrow direction projected onto canvas
          const p2 = project(a.lat + a.dlat * 4, a.lon + a.dlon * 8);
          if (!p2.visible) return;
          const adx = p2.x - p.x;
          const ady = p2.y - p.y;
          const len = Math.sqrt(adx * adx + ady * ady);
          if (len < 0.5) return;
          const nx = adx / len;
          const ny = ady / len;
          const arLen = 14 + 8 * Math.abs(Math.cos(a.lat * Math.PI / 180));

          // Tail
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + nx * arLen, p.y + ny * arLen);
          ctx.strokeStyle = color;
          ctx.globalAlpha = depthAlpha * 0.85;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Head
          const hx = p.x + nx * arLen;
          const hy = p.y + ny * arLen;
          const perpX = -ny * 4;
          const perpY = nx * 4;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - nx * 6 + perpX, hy - ny * 6 + perpY);
          ctx.lineTo(hx - nx * 6 - perpX, hy - ny * 6 - perpY);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.globalAlpha = depthAlpha;
          ctx.fill();

          ctx.globalAlpha = 1;
        });
      }

      // ── Sphere edge shading ──
      const edgeGrad = ctx.createRadialGradient(
        cx - R * 0.3, cy - R * 0.3, R * 0.5,
        cx, cy, R
      );
      edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
      edgeGrad.addColorStop(0.75, 'rgba(0,0,0,0.3)');
      edgeGrad.addColorStop(1, 'rgba(0,0,0,0.88)');
      ctx.fillStyle = edgeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Sphere outline
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // ── Pressure labels (T/C badges) ──
      if (s.showPressure) {
        PRESSURE_BELTS.forEach(belt => {
          const frontLon = 90 - totalAngle * (180 / Math.PI);
          const p = project(belt.lat, frontLon);
          if (!p.visible) return;
          const label = belt.type === 'low' ? 'T' : 'C';
          const bg = belt.type === 'low' ? '#dc2626' : '#1d4ed8';
          const size = 20;
          ctx.fillStyle = bg;
          const bx = p.x - size / 2, by = p.y - size / 2;
          ctx.beginPath();
          ctx.rect(bx, by, size, size);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${size - 4}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, p.x, p.y);
          ctx.textBaseline = 'alphabetic';
        });
      }

      // ── Tầng đối lưu label (side) ──
      if (s.showLabels) {
        const layerY1 = cy - R * 0.7;
        const layerY2 = cy + R * 0.7;
        // Left side
        const gradient = ctx.createLinearGradient(cx - R * 1.35, 0, cx - R * 1.1, 0);
        gradient.addColorStop(0, 'rgba(56,189,248,0)');
        gradient.addColorStop(0.5, 'rgba(56,189,248,0.6)');
        gradient.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - R * 1.4, layerY1, 6, layerY2 - layerY1);

        ctx.save();
        ctx.translate(cx - R * 1.18, (layerY1 + layerY2) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = 'rgba(148,229,255,0.9)';
        ctx.font = `bold 11px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('tầng đối lưu', 0, 0);
        ctx.restore();

        // Right side
        const gradient2 = ctx.createLinearGradient(cx + R * 1.1, 0, cx + R * 1.35, 0);
        gradient2.addColorStop(0, 'rgba(56,189,248,0)');
        gradient2.addColorStop(0.5, 'rgba(56,189,248,0.6)');
        gradient2.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = gradient2;
        ctx.fillRect(cx + R * 1.1, layerY1, 6, layerY2 - layerY1);

        ctx.save();
        ctx.translate(cx + R * 1.22, (layerY1 + layerY2) / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'rgba(148,229,255,0.9)';
        ctx.font = `bold 11px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('tầng đối lưu', 0, 0);
        ctx.restore();
      }

      // ── Top/Bottom T markers (poles) ──
      if (s.showPressure) {
        // North pole T badge
        const np = project(90, 0);
        const sp = project(-90, 0);
        const drawPoleBadge = (px: number, py: number, label: string, bg: string) => {
          const r = 14;
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${r}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, px, py);
          ctx.textBaseline = 'alphabetic';
        };
        drawPoleBadge(cx, cy - R * 1.05, 'T', '#dc2626');
        drawPoleBadge(cx, cy + R * 1.05, 'T', '#dc2626');
      }

      // ── Coriolis mode extra overlay ──
      if (s.mode === 'coriolis' && s.showArrows) {
        // Draw curved deflection lines
        ctx.save();
        ctx.globalAlpha = 0.25;
        for (let lat = 15; lat <= 75; lat += 20) {
          const p1 = project(lat, 0);
          const p2 = project(lat + 10, 15);
          if (p1.visible && p2.visible) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.quadraticCurveTo((p1.x + p2.x) / 2 + 20, (p1.y + p2.y) / 2, p2.x, p2.y);
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          const ps1 = project(-lat, 0);
          const ps2 = project(-lat - 10, -15);
          if (ps1.visible && ps2.visible) {
            ctx.beginPath();
            ctx.moveTo(ps1.x, ps1.y);
            ctx.quadraticCurveTo((ps1.x + ps2.x) / 2 - 20, (ps1.y + ps2.y) / 2, ps2.x, ps2.y);
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
        ctx.restore();

        // Info label
        ctx.fillStyle = 'rgba(250,204,21,0.9)';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⟳ Lực Coriolis lệch phải (BCB) / lệch trái (BCN)', cx, H - 12);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    // Size canvas to pixel ratio
    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth || canvas.parentElement?.clientWidth || 600;
      const h = canvas.offsetHeight || canvas.parentElement?.clientHeight || 400;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    const retryTimer = setTimeout(resizeCanvas, 80);

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      active = false;
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(retryTimer);
      observer.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // ─── Tab definitions ─────────────────────────────────────────────────────
  const tabs: { id: SimMode; label: string; color: string }[] = [
    { id: 'static',    label: 'Trái Đất đứng yên', color: '#3b82f6' },
    { id: 'rotating',  label: 'Trái Đất quay',      color: '#8b5cf6' },
    { id: 'tropical',  label: 'Vùng nhiệt đới',     color: '#ef4444' },
    { id: 'temperate', label: 'Vùng ôn đới',        color: '#10b981' },
    { id: 'polar',     label: 'Vùng lạnh',           color: '#38bdf8' },
    { id: 'coriolis',  label: 'Hiệu ứng Coriolis',  color: '#f59e0b' },
  ];

  const activeModeColor = tabs.find(t => t.id === mode)?.color ?? '#8b5cf6';

  // ─── Legend ──────────────────────────────────────────────────────────────
  const windZones = [
    { color: '#ff6b6b', label: 'Gió Tín phong (Trade winds)' },
    { color: '#b06bff', label: 'Gió Tây ôn đới (Westerlies)' },
    { color: '#6bc8ff', label: 'Gió Đông cực (Polar easterlies)' },
  ];

  const [activityOpen, setActivityOpen] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[#07091a] rounded-2xl overflow-hidden select-none"
         style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1025] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-black tracking-widest text-slate-200 uppercase">
            Hoàn lưu khí quyển — Mô phỏng 3D
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={() => setPlaying(p => !p)}
            className="px-3 py-1 rounded-full text-xs font-bold transition-all"
            style={{ background: playing ? '#f59e0b22' : '#22c55e22', color: playing ? '#f59e0b' : '#22c55e', border: `1px solid ${playing ? '#f59e0b44' : '#22c55e44'}` }}
          >
            {playing ? '⏸ Tạm dừng' : '▶ Chạy'}
          </button>
          {/* Speed */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold">Tốc độ</span>
            <input
              type="range" min="0.3" max="3" step="0.1" value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-20 accent-violet-500 cursor-pointer"
            />
            <span className="text-[10px] text-violet-400 font-black w-6">{speed.toFixed(1)}×</span>
          </div>
          {/* Toggles */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showPressure} onChange={e => setShowPressure(e.target.checked)} className="accent-red-500" />
              Khí áp
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showArrows} onChange={e => setShowArrows(e.target.checked)} className="accent-violet-500" />
              Gió
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} className="accent-blue-400" />
              Nhãn
            </label>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-grow relative min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ touchAction: 'none' }}
        />
        <SimActivity
          title="Điền vào chỗ trống"
          questions={MODE_QUESTIONS[mode] ?? MODE_QUESTIONS['rotating']}
          visible={activityOpen}
          onToggle={() => setActivityOpen(o => !o)}
          themeColor={activeModeColor}
        />

        {/* Legend overlay */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 space-y-1.5">
          {windZones.map(z => (
            <div key={z.label} className="flex items-center gap-2">
              <div className="w-6 h-0.5 rounded" style={{ background: z.color }} />
              <span className="text-[9px] font-bold text-slate-300">{z.label}</span>
            </div>
          ))}
        </div>

        {/* Drag hint */}
        <div className="absolute bottom-2 right-3 text-[9px] text-slate-500 font-bold pointer-events-none">
          💡 Kéo chuột để xoay địa cầu
        </div>
      </div>

      {/* Bottom mode tabs (like Mozaik3D) */}
      <div className="flex border-t border-white/10 bg-[#0b0f22] shrink-0 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className="flex-1 min-w-max px-3 py-3 text-xs font-black transition-all border-t-2 whitespace-nowrap"
            style={{
              borderTopColor: mode === tab.id ? tab.color : 'transparent',
              color: mode === tab.id ? tab.color : '#64748b',
              background: mode === tab.id ? `${tab.color}18` : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mode description */}
      <div className="px-4 py-2 bg-[#0a0e1c] border-t border-white/5 text-[10px] text-slate-400 font-medium leading-relaxed shrink-0">
        {mode === 'static' && '🌍 Trái Đất đứng yên — Quan sát phân bố khí áp và hướng gió cơ bản mà không có ảnh hưởng của sự tự quay.'}
        {mode === 'rotating' && '🔄 Trái Đất tự quay — Hoàn lưu khí quyển đầy đủ với cả 3 đới gió: Tín phong, Tây ôn đới và Đông cực.'}
        {mode === 'tropical' && '🌡️ Vùng nhiệt đới — Gió Tín phong (Gió mậu dịch) thổi từ áp cao chí tuyến về áp thấp xích đạo ở cả 2 bán cầu.'}
        {mode === 'temperate' && '🌿 Vùng ôn đới — Gió Tây ôn đới thổi từ áp cao chí tuyến về áp thấp ôn đới (30° - 60° vĩ độ).'}
        {mode === 'polar' && '❄️ Vùng lạnh — Gió Đông cực thổi từ áp cao cực về áp thấp ôn đới (60° - 90° vĩ độ).'}
        {mode === 'coriolis' && '🌀 Hiệu ứng Coriolis — Do Trái Đất tự quay, gió bị lệch phải ở Bán cầu Bắc và lệch trái ở Bán cầu Nam.'}
      </div>
    </div>
  );
};

export default AtmosphericCirculationSim;
