import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'winter', label: '❄️ Gió mùa Mùa Đông', color: '#3b82f6' },
  { id: 'summer', label: '☀️ Gió mùa Mùa Hạ',   color: '#ef4444' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Gió mùa được hình thành chủ yếu do nguyên nhân nào?',
    answer: 'Sự chênh lệch nhiệt độ và khí áp giữa lục địa và đại dương',
    options: ['Sự chênh lệch nhiệt độ và khí áp giữa lục địa và đại dương', 'Do Trái Đất tự quay quanh trục', 'Do các dòng biển nóng và lạnh', 'Do địa hình đồi núi'],
  },
  {
    id: 'q2',
    hint: 'Gió mùa thường có ở khu vực nào trên thế giới?',
    answer: 'Nam Á và Đông Nam Á',
    options: ['Nam Á và Đông Nam Á', 'Bắc Âu', 'Châu Nam Cực', 'Bắc Mỹ'],
  },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  winter: [
    { id: 'w1', hint: 'Vào mùa đông, trung tâm áp cao hình thành ở đâu?', answer: 'Trên lục địa (Xibia)', options: ['Trên lục địa (Xibia)', 'Trên Ấn Độ Dương', 'Trên Thái Bình Dương', 'Ở xích đạo'] },
    { id: 'w2', hint: 'Gió mùa mùa đông ở Việt Nam chủ yếu thổi theo hướng nào?', answer: 'Đông Bắc', options: ['Đông Bắc', 'Tây Nam', 'Đông Nam', 'Tây Bắc'] },
  ],
  summer: [
    { id: 's1', hint: 'Vào mùa hạ, lục địa châu Á hình thành trung tâm áp gì?', answer: 'Áp thấp (I-ran)', options: ['Áp thấp (I-ran)', 'Áp cao (Xibia)', 'Áp cao A-xoa', 'Áp cao Ha-oai'] },
    { id: 's2', hint: 'Gió mùa mùa hạ mang lại thời tiết như thế nào cho khu vực Đông Nam Á?', answer: 'Nóng ẩm, mưa nhiều', options: ['Nóng ẩm, mưa nhiều', 'Lạnh giá, khô hanh', 'Nóng bức, không mưa', 'Trời quang, mây tạnh'] },
  ],
};

// ─── Stage info panels ────────────────────────────────────────────────────────
const STAGE_INFO: Record<string, { title: string; desc: string; detail: string; color: string; centers: any[] }> = {
  winter: {
    title: 'Gió Mùa Mùa Đông (Tháng 11 - Tháng 4)',
    desc: 'Gió thổi từ lục địa lạnh giá ra đại dương.',
    detail: 'Vào mùa đông Bắc bán cầu, lục địa Á - Âu lạnh đi nhanh chóng hình thành Áp Cao Xibia. Trong khi đó đại dương ở phía Nam ấm hơn hình thành Áp Thấp. Gió thổi từ Cao áp Xibia về các Áp thấp xích đạo và đại dương, tạo ra gió Đông Bắc lạnh và khô.',
    color: '#3b82f6',
    centers: [
      { x: 0.35, y: 0.25, type: 'H', label: 'Áp Cao Xibia', color: '#3b82f6' },
      { x: 0.45, y: 0.8, type: 'L', label: 'Áp Thấp Xích Đạo', color: '#ef4444' },
      { x: 0.85, y: 0.75, type: 'L', label: 'Áp Thấp Ô-xtrây-li-a', color: '#ef4444' },
    ]
  },
  summer: {
    title: 'Gió Mùa Mùa Hạ (Tháng 5 - Tháng 10)',
    desc: 'Gió thổi từ đại dương ẩm ướt vào lục địa.',
    detail: 'Vào mùa hạ Bắc bán cầu, lục địa Á - Âu bị đốt nóng mạnh hình thành Áp Thấp (đặc biệt là Áp thấp I-ran). Trong khi đó đại dương (Ấn Độ Dương, Thái Bình Dương) mát hơn hình thành Áp Cao. Gió thổi từ biển vào đất liền mang theo rất nhiều hơi nước gây mưa lớn.',
    color: '#ef4444',
    centers: [
      { x: 0.25, y: 0.35, type: 'L', label: 'Áp Thấp I-ran', color: '#ef4444' },
      { x: 0.35, y: 0.85, type: 'H', label: 'Áp Cao Ấn Độ Dương', color: '#3b82f6' },
      { x: 0.9, y: 0.4, type: 'H', label: 'Áp Cao Ha-oai (TBD)', color: '#3b82f6' },
      { x: 0.85, y: 0.8, type: 'H', label: 'Áp Cao Ô-xtrây-li-a', color: '#3b82f6' },
    ]
  },
};

interface MonsoonSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function MonsoonSim({ customParams, customQuestions, onComplete }: MonsoonSimProps) {
  const [activeTab, setActiveTab] = useState('winter');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : [...ALL_QUESTIONS, ...(TAB_QUESTIONS[activeTab] || [])];

  // Animation Loop
  useEffect(() => {
    let animationId: number;
    let time = 0;
    
    const windParticles: Array<{x: number, y: number, life: number, maxLife: number}> = [];

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const isWinter = activeTab === 'winter';
      const info = STAGE_INFO[activeTab];

      // 1. Draw Map Background
      ctx.fillStyle = '#0f172a'; // Ocean base color
      ctx.fillRect(0, 0, w, h);

      // Simple grid (lat/lon)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        ctx.moveTo(0, h * i / 10); ctx.lineTo(w, h * i / 10);
        ctx.moveTo(w * i / 10, 0); ctx.lineTo(w * i / 10, h);
      }
      ctx.stroke();

      // Equator
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      ctx.lineTo(w, h * 0.65);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.font = '12px Arial';
      ctx.fillText('Xích đạo (0°)', 10, h * 0.65 - 5);

      // Draw stylized Asia / Australia continents
      drawContinent(ctx, w, h, isWinter);

      // 2. Draw Pressure Centers
      info.centers.forEach(c => {
        const cx = w * c.x;
        const cy = h * c.y;
        
        // Pulsing glow
        const pulse = Math.sin(time * 0.05) * 5;
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 40 + pulse);
        grad.addColorStop(0, c.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.type, cx, cy);
        
        ctx.font = '14px Arial';
        ctx.fillText(c.label, cx, cy + 25);
      });

      // 3. Vietnam Highlight
      const vnX = w * 0.62;
      const vnY = h * 0.45;
      ctx.beginPath();
      ctx.arc(vnX, vnY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Việt Nam', vnX + 25, vnY);

      // 4. Wind Particles
      // Add new particles
      if (windParticles.length < 150) {
        if (isWinter) {
            // Spawn from Siberia (H)
            windParticles.push({
                x: w * 0.35 + (Math.random() - 0.5) * 100,
                y: h * 0.25 + (Math.random() - 0.5) * 100,
                life: 0,
                maxLife: 100 + Math.random() * 100
            });
        } else {
            // Spawn from Indian Ocean (H) & Australia (H) & Pacific (H)
            const sources = [
               {x: 0.35, y: 0.85},
               {x: 0.85, y: 0.8},
               {x: 0.9, y: 0.4}
            ];
            const src = sources[Math.floor(Math.random() * sources.length)];
            windParticles.push({
                x: w * src.x + (Math.random() - 0.5) * 100,
                y: h * src.y + (Math.random() - 0.5) * 100,
                life: 0,
                maxLife: 150 + Math.random() * 100
            });
        }
      }

      ctx.fillStyle = isWinter ? 'rgba(147, 197, 253, 0.8)' : 'rgba(248, 113, 113, 0.8)'; // Blue for winter, Red for summer
      
      for (let i = windParticles.length - 1; i >= 0; i--) {
          const p = windParticles[i];
          
          // Move particle based on wind field
          if (isWinter) {
              // Winter: Flow from NW to SE, curving right due to Coriolis (actually blows NE to SW towards equator, then curves NW in southern hemisphere)
              // Simplified: Flow from Siberia towards Equator and Australia
              const targetX = w * 0.6;
              const targetY = h * 0.8;
              const dx = targetX - p.x;
              const dy = targetY - p.y;
              const angle = Math.atan2(dy, dx);
              
              // Coriolis deflection (right in NH)
              const coriolis = p.y < h * 0.65 ? 0.3 : -0.3; // cross equator
              
              p.x += Math.cos(angle + coriolis) * 3;
              p.y += Math.sin(angle + coriolis) * 3;
              
          } else {
              // Summer: Flow from Oceans to Asia Low (Iran / India / China)
              const targetX = w * 0.3;
              const targetY = h * 0.3;
              const dx = targetX - p.x;
              const dy = targetY - p.y;
              const angle = Math.atan2(dy, dx);
              
              // Coriolis deflection (right in NH, left in SH)
              const coriolis = p.y < h * 0.65 ? 0.4 : -0.2; 
              
              p.x += Math.cos(angle + coriolis) * 3.5; // summer winds slightly faster
              p.y += Math.sin(angle + coriolis) * 3.5;
          }
          
          p.life++;
          
          // Draw particle streak
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
          
          if (p.life > p.maxLife || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
              windParticles.splice(i, 1);
          }
      }

      // 5. Major Wind Arrows (Static overlays indicating general direction)
      drawMajorWindArrow(ctx, vnX, vnY, isWinter);

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [activeTab]);

  const drawContinent = (ctx: CanvasRenderingContext2D, w: number, h: number, isWinter: boolean) => {
      ctx.fillStyle = isWinter ? '#1e293b' : '#166534'; // Grayish in winter, Greenish in summer
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;

      // Asia
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.9, 0);
      ctx.lineTo(w * 0.8, h * 0.3); // China coast
      ctx.lineTo(w * 0.65, h * 0.5); // Vietnam/SE Asia
      ctx.lineTo(w * 0.6, h * 0.45); // Gulf of Thailand
      ctx.lineTo(w * 0.55, h * 0.55); // Malaysia
      ctx.lineTo(w * 0.5, h * 0.4); // Bay of Bengal
      ctx.lineTo(w * 0.4, h * 0.45); // India tip
      ctx.lineTo(w * 0.3, h * 0.35); // Arabian sea
      ctx.lineTo(w * 0.1, h * 0.4); // Middle east
      ctx.lineTo(0, h * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Australia
      ctx.fillStyle = '#78350f'; // Desert brown
      ctx.beginPath();
      ctx.moveTo(w * 0.7, h * 0.75);
      ctx.quadraticCurveTo(w * 0.9, h * 0.7, w * 0.95, h * 0.85);
      ctx.lineTo(w * 0.8, h * 0.95);
      ctx.lineTo(w * 0.65, h * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Indonesian Islands
      ctx.fillStyle = '#166534';
      ctx.beginPath(); ctx.ellipse(w * 0.6, h * 0.6, 30, 10, Math.PI / 6, 0, Math.PI * 2); ctx.fill(); // Sumatra
      ctx.beginPath(); ctx.ellipse(w * 0.68, h * 0.65, 40, 15, -Math.PI / 8, 0, Math.PI * 2); ctx.fill(); // Java/Others
      ctx.beginPath(); ctx.ellipse(w * 0.75, h * 0.55, 20, 30, 0, 0, Math.PI * 2); ctx.fill(); // Philippines
  };

  const drawMajorWindArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, isWinter: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      
      // Rotate arrow based on monsoon direction
      // Winter: Northeast monsoon (blows FROM NE TO SW) => Angle ~ 135 deg
      // Summer: Southwest monsoon (blows FROM SW TO NE) => Angle ~ -45 deg
      const angle = isWinter ? (Math.PI * 3/4) : (-Math.PI / 4);
      ctx.rotate(angle);
      
      ctx.fillStyle = isWinter ? '#93c5fd' : '#fca5a5';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      
      // Draw big fat arrow
      ctx.beginPath();
      ctx.moveTo(-40, -10);
      ctx.lineTo(10, -10);
      ctx.lineTo(10, -25);
      ctx.lineTo(40, 0);
      ctx.lineTo(10, 25);
      ctx.lineTo(10, 10);
      ctx.lineTo(-40, 10);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      
      // Text label for the wind
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'black';
      if (isWinter) {
          ctx.fillText('Gió Đông Bắc (Lạnh, Khô)', x - 60, y - 40);
      } else {
          ctx.fillText('Gió Tây Nam (Nóng, Ẩm, Mưa nhiều)', x - 60, y + 40);
      }
      ctx.shadowBlur = 0;
  };

  const info = STAGE_INFO[activeTab];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Gió Mùa Châu Á" />
      
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL: Canvas & Info */}
        <div style={{ flex: 1, position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Overlay Info Card */}
          <div style={{
            position: 'absolute', top: 20, left: 20, width: 320,
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
            padding: 20, borderRadius: 16, border: `1px solid ${info.color}`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            transform: 'translateY(0)', transition: 'all 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 22, color: info.color }}>
              {info.title}
            </h3>
            
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 12 }}>
              {info.desc}
            </div>
            
            <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
              {info.detail}
            </p>
          </div>

          <div style={{
            position: 'absolute', bottom: 20, left: 20,
            background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
            padding: '10px 16px', borderRadius: 12, border: '1px solid #334155'
          }}>
             <div style={{ fontSize: 13, color: '#cbd5e1' }}>Quy luật chung: Gió thổi từ <b>Áp Cao (H)</b> về <b>Áp Thấp (L)</b></div>
             <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Chịu tác động của lực Coriolis làm lệch hướng</div>
          </div>
        </div>

        {/* RIGHT PANEL: Controls & Quiz */}
        <div style={{ width: 340, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <SimTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            <SimActivity 
              questions={currentQuestions}
              onComplete={onComplete}
              title={`Ôn tập: ${TABS.find(t => t.id === activeTab)?.label}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
