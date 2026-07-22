// ─── MapLabPage – Interactive Geography Map Lab ─────────────────────────────
import React, { useEffect, useRef, useState, useCallback } from 'react';
import AppLayout from '../layouts/AppLayout';

// ─── Layer toggle state ───────────────────────────────────────────────────────
interface Layers {
  cities: boolean;
  rivers: boolean;
  latitude: boolean;
  longitude: boolean;
  climate: boolean;
  population: boolean;
  disaster: boolean;
}

// ─── Fixed star positions (deterministic) ────────────────────────────────────
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 137.508 + 23) % 100) / 100,
  y: ((i * 73.1 + 11) % 100) / 100,
  r: 0.4 + (i % 3) * 0.4,
}));

// ─── Draw animated Globe ─────────────────────────────────────────────────────
function drawGlobe(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  angle: number,
  layers: Layers
) {
  ctx.clearRect(0, 0, W, H);

  // Space background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (const s of STARS) {
    ctx.globalAlpha = 0.5 + 0.5 * (s.r / 1.2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) * 0.38;

  // Atmosphere glow
  const atmo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.25);
  atmo.addColorStop(0, 'rgba(56,189,248,0.18)');
  atmo.addColorStop(0.5, 'rgba(56,189,248,0.06)');
  atmo.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
  ctx.fill();

  // Globe sphere gradient
  const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  grad.addColorStop(0, '#1e40af');
  grad.addColorStop(0.4, '#1d4ed8');
  grad.addColorStop(0.7, '#1e3a8a');
  grad.addColorStop(1, '#0f172a');
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Clip to globe
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // Latitude lines
  if (layers.latitude) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.8;
    for (let lat = -60; lat <= 60; lat += 30) {
      if (lat === 0) continue;
      const y = cy - R * Math.sin((lat * Math.PI) / 180);
      const cosLat = Math.cos((lat * Math.PI) / 180);
      const rx = R * cosLat;
      ctx.beginPath();
      ctx.ellipse(cx, y, rx, rx * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Equator brighter
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Longitude lines (rotating)
  if (layers.longitude) {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.8;
    for (let lon = 0; lon < 180; lon += 30) {
      const a = (lon * Math.PI) / 180 + angle;
      const cosA = Math.cos(a);
      ctx.beginPath();
      ctx.save();
      ctx.scale(cosA, 1);
      ctx.beginPath();
      ctx.ellipse(cx / cosA, cy, R * Math.abs(cosA), R, 0, 0, Math.PI * 2);
      ctx.restore();
      ctx.stroke();
    }
  }

  // Vietnam highlight dot
  const vnLat = 16.05;
  const vnLon = 108.22;
  const vnLatRad = (vnLat * Math.PI) / 180;
  const vnLonRad = (vnLon * Math.PI) / 180 + angle;
  const vnX = cx + R * Math.cos(vnLatRad) * Math.sin(vnLonRad);
  const vnY = cy - R * Math.sin(vnLatRad);
  const vnZ = R * Math.cos(vnLatRad) * Math.cos(vnLonRad);

  if (vnZ > 0) {
    // Pulsing glow
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(vnX, vnY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (layers.cities) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter,sans-serif';
      ctx.fillText('🇻🇳 Việt Nam', vnX + 8, vnY - 4);
    }
  }

  ctx.restore();

  // Globe rim highlight
  const rim = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, 0, cx, cy, R);
  rim.addColorStop(0, 'rgba(255,255,255,0.12)');
  rim.addColorStop(0.5, 'rgba(255,255,255,0.03)');
  rim.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = rim;
  ctx.fill();

  // Globe border
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(56,189,248,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ─── Vietnam map points (approximate S-shape) ─────────────────────────────────
const VN_OUTLINE: [number, number][] = [
  // North top (Móng Cái)
  [102, 22], [104, 23], [105, 23.4], [106, 22.9], [107, 22.5], [108, 21.5],
  // Northeast coast down
  [108.5, 20.8], [108.8, 20], [107.5, 19.5], [106.5, 18.5], [106, 17.5],
  // Central
  [108.2, 16.5], [108.3, 15.5], [109, 14], [109.5, 12.5], [109.2, 11.5],
  // South
  [108.5, 10.5], [107, 10.4], [106, 10], [105, 9.5], [104.7, 10],
  [105, 10.8], [105.5, 11.5], [105.2, 12], [104.8, 12.5],
  // West (Cambodia border)
  [104.5, 13], [104.2, 14.5], [104.7, 15.5], [104.5, 17],
  [103.2, 18], [103, 20], [103.5, 21], [104, 22], [102, 22],
];

// Simplified regions bounding boxes: [minX, minY, maxX, maxY]
// We'll draw regions as colored fills

function drawVietnamMap(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  layers: Layers
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // Map bounds: lon 102-110, lat 8.5-23.5
  const LonMin = 102, LonMax = 110, LatMin = 8.5, LatMax = 23.5;
  const pad = 40;
  const mapW = W - pad * 2;
  const mapH = H - pad * 2;

  const toX = (lon: number) => pad + ((lon - LonMin) / (LonMax - LonMin)) * mapW;
  const toY = (lat: number) => pad + ((LatMax - lat) / (LatMax - LatMin)) * mapH;

  // Helper: draw polygon
  const drawPoly = (points: [number, number][], fill: string, stroke: string) => {
    ctx.beginPath();
    points.forEach(([lon, lat], i) => {
      if (i === 0) ctx.moveTo(toX(lon), toY(lat));
      else ctx.lineTo(toX(lon), toY(lat));
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  // ── Bắc Bộ (North) lat > 18
  const bacBo: [number, number][] = VN_OUTLINE.filter(([_, lat]) => lat >= 17.5);
  drawPoly(bacBo, 'rgba(59,130,246,0.35)', 'rgba(59,130,246,0.6)');

  // ── Miền Trung (Central) lat 11-18
  const mienTrung: [number, number][] = VN_OUTLINE.filter(([_, lat]) => lat >= 11 && lat < 17.5);
  drawPoly(mienTrung, 'rgba(245,158,11,0.3)', 'rgba(245,158,11,0.6)');

  // ── Nam Bộ (South) lat < 11
  const namBo: [number, number][] = VN_OUTLINE.filter(([_, lat]) => lat < 11);
  drawPoly(namBo, 'rgba(34,197,94,0.3)', 'rgba(34,197,94,0.6)');

  // Full outline
  ctx.beginPath();
  VN_OUTLINE.forEach(([lon, lat], i) => {
    if (i === 0) ctx.moveTo(toX(lon), toY(lat));
    else ctx.lineTo(toX(lon), toY(lat));
  });
  ctx.closePath();
  ctx.strokeStyle = 'rgba(148,163,184,0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rivers
  if (layers.rivers) {
    // Sông Hồng (simplified: goes NW→SE in north)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(toX(103.5), toY(22));
    ctx.bezierCurveTo(toX(104.5), toY(21.5), toX(105.5), toY(21), toX(106), toY(20));
    ctx.stroke();

    // Sông Mê Kông (south)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toX(103.5), toY(13));
    ctx.bezierCurveTo(toX(104), toY(11.5), toX(105), toY(10.5), toX(106.5), toY(10));
    ctx.stroke();

    if (layers.cities) {
      ctx.fillStyle = '#ef4444';
      ctx.font = '9px Inter,sans-serif';
      ctx.fillText('Sông Hồng', toX(104.8), toY(21.2));
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Sông Mê Kông', toX(103.8), toY(12.5));
    }
  }

  // Cities
  const CITIES: { name: string; lon: number; lat: number; color: string }[] = [
    { name: 'Hà Nội', lon: 105.85, lat: 21.03, color: '#fbbf24' },
    { name: 'Hải Phòng', lon: 106.69, lat: 20.86, color: '#a78bfa' },
    { name: 'Đà Nẵng', lon: 108.22, lat: 16.05, color: '#34d399' },
    { name: 'Hồ Chí Minh', lon: 106.66, lat: 10.82, color: '#f97316' },
    { name: 'Cần Thơ', lon: 105.78, lat: 10.03, color: '#22d3ee' },
  ];

  CITIES.forEach(city => {
    const x = toX(city.lon);
    const y = toY(city.lat);
    ctx.shadowColor = city.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = city.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (layers.cities) {
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 10px Inter,sans-serif';
      ctx.fillText(city.name, x + 7, y + 4);
    }
  });

  // Region labels
  if (layers.cities) {
    const labels = [
      { text: 'Bắc Bộ', lon: 104.5, lat: 21.5, color: '#93c5fd' },
      { text: 'Miền Trung', lon: 108.5, lat: 15, color: '#fcd34d' },
      { text: 'Nam Bộ', lon: 105.5, lat: 10.4, color: '#86efac' },
    ];
    labels.forEach(l => {
      ctx.font = 'bold 11px Inter,sans-serif';
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, toX(l.lon), toY(l.lat));
    });
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MapLabPage() {
  const [activeTab, setActiveTab] = useState<'globe' | 'vietnam' | 'temp' | 'ocean'>('globe');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const angleRef = useRef(0);
  const [layers, setLayers] = useState<Layers>({
    cities: true,
    rivers: true,
    latitude: true,
    longitude: true,
    climate: false,
    population: false,
    disaster: false,
  });

  const toggleLayer = (key: keyof Layers) =>
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  // RAF animation loop
  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (activeTab === 'globe') {
        angleRef.current += 0.003;
        drawGlobe(ctx, W, H, angleRef.current, layers);
      } else if (activeTab === 'vietnam') {
        drawVietnamMap(ctx, W, H, layers);
      } else {
        // Placeholder for temp/ocean tabs
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 18px Inter,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌍 Đang phát triển...', W / 2, H / 2);
        ctx.textAlign = 'left';
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, layers]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    });
    ro.observe(canvas.parentElement!);
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    const cancel = startAnimation();
    return () => {
      cancelAnimationFrame(animRef.current);
      if (cancel) cancel();
    };
  }, [startAnimation]);

  const TABS = [
    { id: 'globe', label: '🌏 Quả địa cầu 3D' },
    { id: 'vietnam', label: '🗺️ Bản đồ Việt Nam' },
    { id: 'temp', label: '🌡️ Nhiệt độ toàn cầu' },
    { id: 'ocean', label: '🌊 Dòng biển' },
  ] as const;

  const LAYER_OPTIONS: { key: keyof Layers; label: string }[] = [
    { key: 'cities', label: '✔ Hiện tên thành phố' },
    { key: 'rivers', label: '✔ Hiện sông ngòi' },
    { key: 'latitude', label: '✔ Hiện vĩ tuyến' },
    { key: 'longitude', label: '✔ Hiện kinh tuyến' },
    { key: 'climate', label: '□ Lớp khí hậu' },
    { key: 'population', label: '□ Lớp dân cư' },
    { key: 'disaster', label: '□ Lớp thiên tai' },
  ];

  return (
    <AppLayout title="🗺️ Bản đồ số Địa lí">
      <div className="p-6 flex flex-col h-[calc(100vh-64px)]" style={{ minHeight: 0 }}>
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-black text-white">🗺️ Bản đồ số Địa lí</h1>
          <p className="text-slate-400 text-sm mt-1">Khám phá bản đồ 3D tương tác</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main content row */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Canvas */}
          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-700/50 relative bg-slate-950" style={{ minHeight: 0 }}>
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Right panel */}
          <div className="w-56 flex flex-col gap-4 flex-shrink-0">
            {/* Layers panel */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🗂️ Lớp bản đồ</p>
              <div className="space-y-2">
                {LAYER_OPTIONS.map(opt => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={layers[opt.key]}
                      onChange={() => toggleLayer(opt.key)}
                      className="accent-teal-500 w-3.5 h-3.5"
                    />
                    <span className={`text-xs transition-colors ${
                      layers[opt.key] ? 'text-slate-200' : 'text-slate-500'
                    } group-hover:text-white`}>
                      {opt.label.replace('✔ ', '').replace('□ ', '')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Coordinate panel */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📍 Tọa độ</p>
              <p className="text-xs text-teal-400 font-mono">16.05°B, 108.22°Đ</p>
              <p className="text-xs text-slate-500 mt-1">Việt Nam</p>
            </div>

            {/* Tools */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🛠️ Công cụ</p>
              <div className="space-y-2">
                {[
                  { icon: '📏', label: 'Đo khoảng cách' },
                  { icon: '🔍', label: 'Phóng to' },
                  { icon: '📤', label: 'Xuất ảnh' },
                ].map(tool => (
                  <button
                    key={tool.label}
                    onClick={() => alert('Tính năng đang phát triển')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all text-xs font-medium"
                  >
                    <span>{tool.icon}</span>
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div
              className="rounded-2xl p-4 text-xs"
              style={{
                background: 'linear-gradient(135deg,rgba(20,184,166,0.12),rgba(99,102,241,0.12))',
                border: '1px solid rgba(20,184,166,0.2)',
              }}
            >
              <p className="font-bold text-teal-400 mb-1">ℹ️ Hướng dẫn</p>
              <p className="text-slate-400 leading-relaxed">
                Chuyển tab để xem các loại bản đồ. Bật/tắt lớp bản đồ ở bảng bên trái.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
