import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';
import { Play, Pause, RotateCcw, Calendar, Eye } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'orbit',     label: '🌍 Vị trí quỹ đạo',       color: '#f59e0b' },
  { id: 'viewpoint', label: '👁️ Góc nhìn cực',        color: '#8b5cf6' },
  { id: 'rotation',  label: '🔄 Tự quay 24h',          color: '#34d399' },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  orbit: [
    {
      id: 'pd1',
      hint: 'Vào ngày Hạ chí (22/6), cực Bắc nghiêng về phía Mặt Trời nên khu vực này sẽ trải qua hiện tượng gì?',
      answer: 'Ngày cực (sáng suốt 24h)',
      options: ['Ngày cực (sáng suốt 24h)', 'Đêm cực (tối suốt 24h)', '12h sáng, 12h tối', 'Nhật thực'],
    },
  ],
  viewpoint: [
    {
      id: 'pd2',
      hint: 'Vào ngày Đông chí (22/12), khu vực nào trên Trái Đất sẽ trải qua Đêm cực?',
      answer: 'Từ vòng cực Bắc đến cực Bắc',
      options: ['Từ vòng cực Bắc đến cực Bắc', 'Từ vòng cực Nam đến cực Nam', 'Xích đạo', 'Chí tuyến'],
    },
  ],
  rotation: [
    {
      id: 'pd3',
      hint: 'Dù Trái Đất có tự quay một vòng (24h), vùng có hiện tượng "Ngày cực" vẫn nằm trọn trong phần được chiếu sáng.',
      answer: 'Đúng',
      options: ['Đúng', 'Sai'],
    },
  ],
};

const MONTHS = ['Xuân Phân (21/3)', 'Hạ Chí (22/6)', 'Thu Phân (23/9)', 'Đông Chí (22/12)'];

// ─── Math & Geometry ──────────────────────────────────────────────────────────
const STARS = Array.from({ length: 100 }, (_, i) => ({
  x: ((i * 137.5 + 23) % 100) / 100,
  y: ((i * 73.1 + 11) % 100) / 100,
  r: 0.5 + (i % 3) * 0.5,
}));

function projectSide(latDeg: number, lonDeg: number, rot: number, cx: number, cy: number, R: number) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180 + rot;
  const x = R * Math.cos(lat) * Math.sin(lon);
  const y = -R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.cos(lon);
  return { x: cx + x, y: cy + y, z };
}

function projectTop(latDeg: number, lonDeg: number, rot: number, cx: number, cy: number, R: number) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180 + rot;
  // Map latitude 90 -> center (r=0), 0 -> edge (r=R)
  const r = R * (90 - latDeg) / 90;
  const x = r * Math.sin(lon);
  const y = r * Math.cos(lon);
  // Z doesn't matter much for top down occlusion since we only see Northern hemisphere (lat > 0)
  return { x: cx + x, y: cy + y, z: latDeg > -10 ? 1 : -1 };
}

const CONTINENTS: Array<[number, number][]> = [
  // North America
  [[70,-140],[60,-140],[55,-130],[48,-124],[35,-120],[22,-100],[15,-87],[8,-77],[10,-63],[18,-68],[28,-80],[40,-70],[46,-64],[52,-56],[58,-64],[64,-68],[70,-90],[72,-110],[72,-130],[70,-140]],
  // Europe + Asia (simplified)
  [[35,-8],[44,0],[46,12],[42,18],[36,22],[35,28],[40,35],[42,45],[50,55],[52,60],[55,58],[58,28],[62,26],[68,28],[72,30],[74,55],[70,95],[60,110],[50,120],[48,135],[35,135],[28,120],[22,114],[12,109],[5,103],[0,110],[5,80],[8,77],[22,68],[25,65],[15,42],[12,45],[15,37],[22,37],[30,32],[36,26],[36,22],[38,12],[35,8],[35,-8]],
  // Greenland
  [[80,-20],[82,-40],[80,-60],[75,-60],[65,-50],[60,-45],[65,-35],[70,-20],[80,-20]]
];

// ─── Drawing logic ────────────────────────────────────────────────────────────
function drawScene(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  rot: number, orbitAngle: number, viewTop: boolean
) {
  ctx.clearRect(0, 0, W, H);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#020617');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (const s of STARS) {
    ctx.globalAlpha = 0.3 + 0.7 * (Math.sin(rot * 2 + s.x * 10) * 0.5 + 0.5);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const cx = viewTop ? W / 2 : W * 0.65;
  const cy = H / 2;
  const R = Math.min(W, H) * 0.35;
  
  const sunX = viewTop ? W / 2 : W * 0.15;
  const sunY = viewTop ? H * 0.1 : cy;
  
  // Tilt logic
  // orbitAngle: 0 = Spring (Sun straight on equator), 90 = Summer (North pole towards sun), 180 = Autumn, 270 = Winter
  const tiltDeg = 23.5 * Math.sin((orbitAngle * Math.PI) / 180); 
  const tiltRad = (tiltDeg * Math.PI) / 180;

  // Draw Sun & Rays
  ctx.save();
  if (viewTop) {
    const rayG = ctx.createLinearGradient(sunX, sunY, cx, cy);
    rayG.addColorStop(0, 'rgba(252, 211, 77, 0.4)');
    rayG.addColorStop(0.5, 'rgba(252, 211, 77, 0.1)');
    rayG.addColorStop(1, 'rgba(252, 211, 77, 0)');
    ctx.fillStyle = rayG;
    ctx.fillRect(0, 0, W, cy);
    
    // Sun text
    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☀️ MẶT TRỜI', sunX, sunY + 40);
  } else {
    // Sun
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, R*2);
    sunGrad.addColorStop(0, 'rgba(253, 224, 71, 0.6)');
    sunGrad.addColorStop(0.2, 'rgba(253, 230, 138, 0.2)');
    sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(sunX, sunY, R*2, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(sunX, sunY, 40, 0, Math.PI*2); ctx.fill();
    ctx.shadowColor = '#fde047'; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mặt Trời', sunX, sunY + 5);

    // Rays
    ctx.fillStyle = 'rgba(253,224,71,0.05)';
    ctx.beginPath();
    ctx.moveTo(sunX, sunY - 40);
    ctx.lineTo(cx, cy - R);
    ctx.lineTo(cx, cy + R);
    ctx.lineTo(sunX, sunY + 40);
    ctx.fill();
  }
  ctx.restore();

  // Draw Earth
  ctx.save();
  ctx.translate(cx, cy);
  if (!viewTop) ctx.rotate(tiltRad);

  // Ocean
  const oceanG = ctx.createRadialGradient(-R*0.3, -R*0.3, R*0.1, 0, 0, R);
  oceanG.addColorStop(0, '#0ea5e9');
  oceanG.addColorStop(1, '#0284c7');
  ctx.fillStyle = oceanG;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI*2); ctx.fill();

  // Continents
  ctx.fillStyle = '#22c55e';
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 1;
  const project = viewTop ? projectTop : projectSide;
  
  for (const poly of CONTINENTS) {
    ctx.beginPath();
    let drawn = false;
    for (const [latD, lonD] of poly) {
      const p = project(latD, lonD, rot, 0, 0, R);
      if (p.z >= 0) {
        if (!drawn) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
        drawn = true;
      }
    }
    if (drawn) { ctx.fill(); ctx.stroke(); }
  }

  // Latitudes (Equator, Tropics, Polar circles)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  const drawLat = (latD: number, dashed: boolean) => {
    ctx.beginPath();
    if (dashed) ctx.setLineDash([4, 4]); else ctx.setLineDash([]);
    ctx.lineWidth = latD === 0 ? 1.5 : 0.8;
    for (let l = 0; l <= 180; l += 5) {
      const lonD = (l * Math.PI) / 180;
      let p;
      if (viewTop) {
        p = projectTop(latD, l * 2, 0, 0, 0, R);
      } else {
        const rad = (latD * Math.PI) / 180;
        const x = R * Math.cos(rad) * Math.cos(lonD);
        const y = -R * Math.sin(rad);
        p = { x, y, z: R * Math.cos(rad) * Math.sin(lonD) };
      }
      if (l === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  };

  if (!viewTop) {
    drawLat(0, false);
    drawLat(23.5, true); drawLat(-23.5, true);
    drawLat(66.5, true); drawLat(-66.5, true);
  } else {
    // top view lats are just circles
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(0, 0, R * (90 - 66.5)/90, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R * (90 - 23.5)/90, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI*2); ctx.stroke();
  }

  // Axis line (only in side view)
  if (!viewTop) {
    ctx.strokeStyle = '#fbbf24';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -R * 1.3);
    ctx.lineTo(0, R * 1.3);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // N / S labels
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bắc', 0, -R * 1.35);
    ctx.fillText('Nam', 0, R * 1.45);
  }

  // Shadow overlay (Night)
  ctx.save();
  if (viewTop) {
    // In top view, terminator is a straight horizontal line if tilt=0. 
    // If tilt > 0 (Summer), terminator moves down, revealing more of north pole.
    // If tilt < 0 (Winter), terminator moves up, covering north pole.
    const termY = -tiltDeg / 90 * R; // Approximate projection for night shadow
    
    ctx.beginPath();
    ctx.rect(-R, termY, R*2, R*2); // lower half is night? Wait, sun is at y=0 or top.
    // Actually if Sun is top (Y < 0), then Y > termY is night.
    ctx.clip();
    
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(-R, -R, R*2, R*2);
    ctx.restore();
  } else {
    // Undo tilt rotation for the shadow because shadow is relative to sun
    ctx.rotate(-tiltRad);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); // Right half is night (sun is left)
    ctx.fill();
    ctx.restore();
  }

  // Globe edge glow
  ctx.shadowColor = 'rgba(255,255,255,0.3)';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI*2); ctx.stroke();
  ctx.restore();

  // Draw overlay labels
  ctx.fillStyle = '#fff';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  if (!viewTop) {
    ctx.fillText(`Góc nghiêng: ${tiltDeg.toFixed(1)}°`, 20, 30);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PolarDaySim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState('orbit');
  const [playing, setPlaying] = useState(true);
  
  const [orbitAngle, setOrbitAngle] = useState(90); // 90 = Summer Solstice (Polar day in North)
  const [rotation, setRotation] = useState(0);

  const reqRef = useRef<number>();
  const lastTime = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      const dt = time - lastTime.current;
      lastTime.current = time;

      if (playing) {
        if (activeTab === 'rotation') {
          setRotation(r => (r + dt * 0.001) % (Math.PI * 2));
        } else if (activeTab === 'orbit') {
          setOrbitAngle(a => (a + dt * 0.05) % 360);
          setRotation(r => (r + dt * 0.005) % (Math.PI * 2));
        }
      }

      // Resize
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W; canvas.height = H;
      }

      drawScene(ctx, W, H, rotation, orbitAngle, activeTab === 'viewpoint');
      reqRef.current = requestAnimationFrame(render);
    };
    reqRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing, rotation, orbitAngle, activeTab]);

  return (
    <SimActivity id="polar-day">
      <SimTopBar title="Mô phỏng: Ngày Cực - Đêm Cực" />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
        <div className="flex-1 relative flex flex-col">
          {/* Controls Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
            <button
              onClick={() => setPlaying(!playing)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-teal-500 hover:bg-teal-400 text-white transition-colors"
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="w-px h-8 bg-white/20" />
            
            <div className="flex flex-col gap-1 w-48">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Xuân</span>
                <span>Hạ</span>
                <span>Thu</span>
                <span>Đông</span>
              </div>
              <input
                type="range" min="0" max="360" step="1"
                value={orbitAngle}
                onChange={(e) => { setOrbitAngle(Number(e.target.value)); setPlaying(false); }}
                className="w-full accent-teal-500"
              />
            </div>
            
            <div className="text-teal-300 font-bold text-sm bg-teal-500/20 px-3 py-1 rounded-lg">
              {MONTHS[Math.floor(((orbitAngle + 45) % 360) / 90)]}
            </div>
          </div>

          <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center max-w-lg shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-1">
              {activeTab === 'orbit' && 'Chuyển động trên quỹ đạo'}
              {activeTab === 'viewpoint' && 'Góc nhìn từ cực Bắc'}
              {activeTab === 'rotation' && 'Tự quay quanh trục'}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {orbitAngle >= 45 && orbitAngle < 135 && "Hạ chí: Nửa cầu Bắc ngả về phía Mặt Trời. Vòng cực Bắc trở lên có ngày kéo dài 24h (Ngày cực)."}
              {orbitAngle >= 225 && orbitAngle < 315 && "Đông chí: Nửa cầu Bắc chếch xa Mặt Trời. Vòng cực Bắc trở lên chìm trong bóng tối 24h (Đêm cực)."}
              {(orbitAngle < 45 || (orbitAngle >= 135 && orbitAngle < 225) || orbitAngle >= 315) && "Xuân phân / Thu phân: Ánh sáng chiếu thẳng góc xích đạo. Không có hiện tượng ngày/đêm cực."}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 flex flex-col bg-slate-900 border-l border-white/10 z-20">
          <SimTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div className="flex-1 overflow-y-auto p-5">
            {TAB_QUESTIONS[activeTab].map(q => (
              <div key={q.id} className="mb-6"><SimActivity.Question q={q} /></div>
            ))}
          </div>
        </div>
      </div>
    </SimActivity>
  );
}
