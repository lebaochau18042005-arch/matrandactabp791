import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'day',   label: '☀️ Ban Ngày (Gió biển)', color: '#0ea5e9' },
  { id: 'night', label: '🌙 Ban Đêm (Gió đất)',   color: '#6366f1' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Bề mặt nào hấp thụ và tỏa nhiệt nhanh hơn?',
    answer: 'Đất liền',
    options: ['Đất liền', 'Đại dương', 'Cả hai như nhau', 'Không bề mặt nào'],
  },
  {
    id: 'q2',
    hint: 'Gió luôn thổi từ nơi áp suất...',
    answer: 'Cao về thấp',
    options: ['Cao về thấp', 'Thấp về cao', 'Nóng về lạnh', 'Trái sang phải'],
  },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  day: [
    { id: 'd1', hint: 'Ban ngày, gió thổi từ đâu sang đâu?', answer: 'Từ biển vào đất liền', options: ['Từ biển vào đất liền', 'Từ đất liền ra biển', 'Từ trên trời xuống', 'Từ dưới đất lên'] },
    { id: 'd2', hint: 'Ban ngày, áp thấp hình thành ở đâu?', answer: 'Trên đất liền', options: ['Trên đất liền', 'Trên mặt biển', 'Cả hai nơi', 'Không có áp thấp'] },
  ],
  night: [
    { id: 'n1', hint: 'Ban đêm, bề mặt nào tỏa nhiệt nhanh hơn và trở nên lạnh hơn?', answer: 'Đất liền', options: ['Đất liền', 'Đại dương', 'Bầu trời', 'Cây cối'] },
    { id: 'n2', hint: 'Vì sao ban đêm gió lại thổi từ đất liền ra biển?', answer: 'Đất liền áp cao, biển áp thấp', options: ['Đất liền áp cao, biển áp thấp', 'Đất liền áp thấp, biển áp cao', 'Sóng biển đẩy gió ra', 'Mặt trăng hút gió'] },
  ],
};

// ─── Stage info panels ────────────────────────────────────────────────────────
const STAGE_INFO: Record<string, { title: string; tempLand: string; tempSea: string; pressLand: string; pressSea: string; desc: string; color: string }> = {
  day: {
    title: 'Ban Ngày (Gió Biển)',
    tempLand: 'Cao (Nóng nhanh)',
    tempSea: 'Thấp (Nóng chậm)',
    pressLand: 'Áp Thấp (L)',
    pressSea: 'Áp Cao (H)',
    desc: 'Đất liền hấp thụ nhiệt nhanh hơn biển. Không khí trên đất liền nóng lên, nở ra và bay lên cao tạo thành Áp Thấp. Không khí mát mẻ từ biển (Áp Cao) tràn vào thay thế, tạo thành Gió Biển.',
    color: '#0ea5e9',
  },
  night: {
    title: 'Ban Đêm (Gió Đất)',
    tempLand: 'Thấp (Nguội nhanh)',
    tempSea: 'Cao (Nguội chậm)',
    pressLand: 'Áp Cao (H)',
    pressSea: 'Áp Thấp (L)',
    desc: 'Đất liền tỏa nhiệt nhanh nên lạnh đi nhanh chóng. Nước biển giữ nhiệt lâu hơn nên ấm hơn đất liền. Không khí trên biển bay lên (Áp Thấp), không khí lạnh từ đất liền (Áp Cao) tràn ra biển tạo thành Gió Đất.',
    color: '#6366f1',
  },
};

interface SeaLandBreezeSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function SeaLandBreezeSim({ customParams, customQuestions, onComplete }: SeaLandBreezeSimProps) {
  const [activeTab, setActiveTab] = useState('day');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Combine ALL questions if we want a mix, or just current tab
  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : [...ALL_QUESTIONS, ...TAB_QUESTIONS[activeTab]];

  // Animation Loop
  useEffect(() => {
    let animationId: number;
    let time = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const isDay = activeTab === 'day';

      // 1. Background Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (isDay) {
        skyGrad.addColorStop(0, '#38bdf8'); // Day sky
        skyGrad.addColorStop(1, '#e0f2fe');
      } else {
        skyGrad.addColorStop(0, '#0f172a'); // Night sky
        skyGrad.addColorStop(1, '#1e1b4b');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars (Night only)
      if (!isDay) {
        ctx.save();
        for (let i = 0; i < 50; i++) {
          const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * w;
          const y = (Math.cos(i * 321.65) * 0.5 + 0.5) * h * 0.5;
          const r = Math.abs(Math.sin(time * 0.05 + i)) * 1.5;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Sun or Moon
      ctx.save();
      const celestialX = w * 0.5;
      const celestialY = h * 0.15;
      
      if (isDay) {
        // Sun rays
        ctx.translate(celestialX, celestialY);
        ctx.rotate(time * 0.005);
        for(let i=0; i<8; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -60 - Math.sin(time*0.1)*5);
            ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.rotate(Math.PI / 4);
        }
        ctx.resetTransform();
        
        // Sun body
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#fde047'; 
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 40;
        ctx.fill();
      } else {
        // Moon
        ctx.beginPath();
        ctx.arc(celestialX - 10, celestialY, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#e2e8f0'; 
        ctx.shadowColor = '#f1f5f9';
        ctx.shadowBlur = 20;
        ctx.fill();
        // Moon craters
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath(); ctx.arc(celestialX - 15, celestialY - 10, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(celestialX - 5, celestialY + 10, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(celestialX - 22, celestialY + 5, 3, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();

      // 3. Terrain (Sea on Left, Land on Right)
      const landStartX = w * 0.5;
      
      // Ocean (Left half)
      ctx.beginPath();
      ctx.moveTo(0, h * 0.6);
      for(let x=0; x<=landStartX; x+=20) {
        const yOffset = Math.sin(time * 0.05 + x * 0.02) * 5;
        ctx.lineTo(x, h * 0.6 + yOffset);
      }
      ctx.lineTo(landStartX, h);
      ctx.lineTo(0, h);
      
      const oceanGrad = ctx.createLinearGradient(0, h*0.6, 0, h);
      if (isDay) {
        oceanGrad.addColorStop(0, '#0284c7');
        oceanGrad.addColorStop(1, '#0c4a6e');
      } else {
        oceanGrad.addColorStop(0, '#0f172a');
        oceanGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = oceanGrad;
      ctx.fill();
      
      // Beach & Land (Right half)
      // Beach
      ctx.beginPath();
      ctx.moveTo(landStartX, h * 0.6);
      ctx.quadraticCurveTo(w * 0.6, h * 0.6, w * 0.7, h * 0.55);
      ctx.lineTo(w, h * 0.55);
      ctx.lineTo(w, h);
      ctx.lineTo(landStartX, h);
      ctx.fillStyle = isDay ? '#fcd34d' : '#92400e'; // sand
      ctx.fill();
      
      // Grass Land
      ctx.beginPath();
      ctx.moveTo(w * 0.6, h * 0.58);
      ctx.quadraticCurveTo(w * 0.7, h * 0.53, w, h * 0.5);
      ctx.lineTo(w, h);
      ctx.lineTo(w * 0.6, h);
      ctx.fillStyle = isDay ? '#22c55e' : '#14532d'; // grass
      ctx.fill();

      // Trees
      drawTree(ctx, w * 0.7, h * 0.55, 0.8, isDay);
      drawTree(ctx, w * 0.85, h * 0.52, 1, isDay);
      drawTree(ctx, w * 0.95, h * 0.51, 0.7, isDay);

      // 4. Heat / Temperature indicators
      // Thermometers
      drawThermometer(ctx, w * 0.25, h * 0.8, isDay ? 0.4 : 0.6, 'Nước Biển');
      drawThermometer(ctx, w * 0.75, h * 0.8, isDay ? 0.8 : 0.3, 'Đất Liền');
      
      // Heating / Cooling arrows (Up red, Down blue)
      if (isDay) {
        // Land heating up
        drawVerticalArrows(ctx, w * 0.8, h * 0.45, -1, 'rgba(239, 68, 68, 0.6)'); 
      } else {
        // Sea still warm, air rising
        drawVerticalArrows(ctx, w * 0.3, h * 0.45, -1, 'rgba(239, 68, 68, 0.6)');
        // Land cooling
        drawVerticalArrows(ctx, w * 0.8, h * 0.45, 1, 'rgba(59, 130, 246, 0.6)');
      }

      // 5. Air Pressure (H and L)
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      
      // Sea Pressure
      ctx.fillStyle = isDay ? '#3b82f6' : '#ef4444'; // H is blue/dense, L is red/light
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(isDay ? 'H' : 'L', w * 0.25, h * 0.4);
      ctx.font = '16px Arial';
      ctx.fillText(isDay ? '(Áp Cao)' : '(Áp Thấp)', w * 0.25, h * 0.45);
      
      // Land Pressure
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = isDay ? '#ef4444' : '#3b82f6';
      ctx.fillText(isDay ? 'L' : 'H', w * 0.75, h * 0.4);
      ctx.font = '16px Arial';
      ctx.fillText(isDay ? '(Áp Thấp)' : '(Áp Cao)', w * 0.75, h * 0.45);
      ctx.shadowBlur = 0;

      // 6. Wind Circulation Arrows
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = -time * 2; // animate dashed line
      
      ctx.beginPath();
      // Draw rectangular circulation loop with rounded corners
      const rLeft = w * 0.25;
      const rRight = w * 0.75;
      const rTop = h * 0.2;
      const rBottom = h * 0.55;
      const radius = 40;
      
      // Bottom path (Surface wind)
      ctx.moveTo(rLeft + radius, rBottom);
      ctx.lineTo(rRight - radius, rBottom);
      ctx.quadraticCurveTo(rRight, rBottom, rRight, rBottom - radius);
      
      // Right path (Up/Down draft)
      ctx.lineTo(rRight, rTop + radius);
      ctx.quadraticCurveTo(rRight, rTop, rRight - radius, rTop);
      
      // Top path (High altitude wind)
      ctx.lineTo(rLeft + radius, rTop);
      ctx.quadraticCurveTo(rLeft, rTop, rLeft, rTop + radius);
      
      // Left path (Up/Down draft)
      ctx.lineTo(rLeft, rBottom - radius);
      ctx.quadraticCurveTo(rLeft, rBottom, rLeft + radius, rBottom);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw arrowhead for direction
      // Surface wind arrow
      const surfaceArrowX = w * 0.5;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      drawArrowHead(ctx, surfaceArrowX, rBottom, isDay ? 0 : Math.PI);
      
      // Top wind arrow
      drawArrowHead(ctx, surfaceArrowX, rTop, isDay ? Math.PI : 0);

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [activeTab]);

  // Canvas drawing helpers
  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, isDay: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    // Trunk
    ctx.fillStyle = isDay ? '#78350f' : '#451a03';
    ctx.fillRect(-4, 0, 8, 20);
    // Leaves
    ctx.fillStyle = isDay ? '#15803d' : '#064e3b';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(15, 5);
    ctx.lineTo(-15, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(12, 12);
    ctx.lineTo(-12, 12);
    ctx.fill();
    ctx.restore();
  };
  
  const drawVerticalArrows = (ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, color: string) => {
    // dir: -1 is up, 1 is down
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for(let i=0; i<3; i++) {
        const offset = (i - 1) * 20;
        ctx.moveTo(x + offset, y + 20 * dir);
        ctx.lineTo(x + offset, y - 20 * dir);
        
        // Arrow head
        ctx.lineTo(x + offset - 5, y - 10 * dir);
        ctx.moveTo(x + offset, y - 20 * dir);
        ctx.lineTo(x + offset + 5, y - 10 * dir);
    }
    ctx.stroke();
  };

  const drawThermometer = (ctx: CanvasRenderingContext2D, x: number, y: number, level: number, label: string) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Label
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, 45);
    
    // Glass
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 20, 12, 0, Math.PI * 2);
    ctx.moveTo(-6, 12);
    ctx.lineTo(-6, -30);
    ctx.arc(0, -30, 6, Math.PI, 0);
    ctx.lineTo(6, 12);
    ctx.fill();
    ctx.stroke();
    
    // Liquid
    const liquidColor = level > 0.5 ? '#ef4444' : '#3b82f6';
    ctx.fillStyle = liquidColor;
    ctx.beginPath();
    ctx.arc(0, 20, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Level
    const h = 40 * level;
    ctx.fillRect(-3, 15 - h, 6, h);
    
    ctx.restore();
  };

  const drawArrowHead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-10, -10);
    ctx.fill();
    ctx.restore();
  };

  const info = STAGE_INFO[activeTab];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Gió Đất & Gió Biển" />
      
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
            position: 'absolute', top: 20, left: 20, width: 340,
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
            padding: 20, borderRadius: 16, border: `1px solid ${info.color}`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            transform: 'translateY(0)', transition: 'all 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 22, color: info.color }}>
              {info.title}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 'bold', marginBottom: 6 }}>NƯỚC BIỂN</div>
                <div style={{ fontSize: 12, color: '#cbd5e1' }}>🌡️ Nhiệt độ: <b>{info.tempSea}</b></div>
                <div style={{ fontSize: 12, color: '#cbd5e1' }}>💨 Khí áp: <b>{info.pressSea}</b></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: '#86efac', fontWeight: 'bold', marginBottom: 6 }}>ĐẤT LIỀN</div>
                <div style={{ fontSize: 12, color: '#cbd5e1' }}>🌡️ Nhiệt độ: <b>{info.tempLand}</b></div>
                <div style={{ fontSize: 12, color: '#cbd5e1' }}>💨 Khí áp: <b>{info.pressLand}</b></div>
              </div>
            </div>
            
            <p style={{ margin: 0, fontSize: 14, color: '#f8fafc', lineHeight: 1.6 }}>
              {info.desc}
            </p>
          </div>
          
          <div style={{
            position: 'absolute', bottom: 20, right: 20,
            background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
            padding: '12px 16px', borderRadius: 12, border: '1px solid #334155',
            textAlign: 'right'
          }}>
             <div style={{ fontSize: 13, color: '#cbd5e1' }}>Gió thổi từ <b>ÁP CAO (H)</b> về <b>ÁP THẤP (L)</b></div>
             <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Nguyên lý nhiệt động lực học</div>
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
