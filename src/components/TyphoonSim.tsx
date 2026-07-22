import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'formation',  label: '🌡️ Hình Thành',       color: '#f59e0b' },
  { id: 'structure',  label: '🌀 Cấu Tạo Bão',      color: '#3b82f6' },
  { id: 'movement',   label: '🗺️ Đường Đi',         color: '#10b981' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Bão nhiệt đới hình thành ở đâu?',
    answer: 'Trên vùng biển nhiệt đới ấm',
    options: ['Trên vùng biển nhiệt đới ấm', 'Trên đất liền', 'Gần hai cực', 'Trên sa mạc'],
  },
  {
    id: 'q2',
    hint: 'Khu vực nào ở trung tâm bão có gió rất yếu và trời quang mây tạnh?',
    answer: 'Mắt bão',
    options: ['Mắt bão', 'Thành mắt bão', 'Dải mây xoắn ốc', 'Rìa ngoài'],
  },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  formation: [
    { id: 'f1', hint: 'Nhiệt độ nước biển cần đạt mức tối thiểu bao nhiêu để hình thành bão?', answer: '26.5°C', options: ['26.5°C', '20°C', '15°C', '30°C'] },
    { id: 'f2', hint: 'Khí áp ở trung tâm bão như thế nào so với xung quanh?', answer: 'Rất thấp', options: ['Rất thấp', 'Rất cao', 'Bằng nhau', 'Thay đổi liên tục'] },
  ],
  structure: [
    { id: 's1', hint: 'Khu vực nào có gió giật mạnh nhất và mưa to nhất trong cơn bão?', answer: 'Thành mắt bão', options: ['Thành mắt bão', 'Mắt bão', 'Dải mây rìa', 'Tâm bão'] },
    { id: 's2', hint: 'Ở bán cầu Bắc, gió trong bão thổi theo chiều nào?', answer: 'Ngược chiều kim đồng hồ', options: ['Ngược chiều kim đồng hồ', 'Cùng chiều kim đồng hồ', 'Từ trên xuống', 'Từ dưới lên'] },
  ],
  movement: [
    { id: 'm1', hint: 'Khi đổ bộ vào đất liền, sức gió của bão thường như thế nào?', answer: 'Giảm dần', options: ['Giảm dần', 'Tăng lên', 'Không đổi', 'Mạnh gấp đôi'] },
    { id: 'm2', hint: 'Tại sao bão lại suy yếu khi vào đất liền?', answer: 'Thiếu nguồn cung cấp hơi nước', options: ['Thiếu nguồn cung cấp hơi nước', 'Do cây cối cản lại', 'Do đất hút gió', 'Do nhiệt độ giảm mạnh'] },
  ],
};

// ─── Stage info panels ────────────────────────────────────────────────────────
const STAGE_INFO: Record<string, { title: string; desc: string; detail: string; color: string }> = {
  formation: {
    title: 'Cơ Chế Hình Thành',
    desc: 'Bão hình thành trên các vùng biển nhiệt đới ấm (trên 26.5°C).',
    detail: 'Nước biển bay hơi mạnh tạo thành một khối không khí nóng ẩm, bốc lên cao tạo thành áp thấp. Lực Coriolis làm khối không khí này xoáy tròn, mạnh dần lên thành bão.',
    color: '#f59e0b',
  },
  structure: {
    title: 'Cấu Tạo Cơn Bão',
    desc: 'Gồm 3 phần chính: Mắt bão, Thành mắt bão, và Dải mây xoắn ốc.',
    detail: 'Mắt bão nằm ở tâm (trời quang, gió nhẹ). Bao quanh là Thành mắt bão (nơi có gió giật dữ dội và mưa lớn nhất). Bên ngoài cùng là các dải mây mưa xoắn ốc.',
    color: '#3b82f6',
  },
  movement: {
    title: 'Di Chuyển & Đổ Bộ',
    desc: 'Bão di chuyển theo các dòng không khí lớn và suy yếu khi vào đất liền.',
    detail: 'Do mất nguồn năng lượng chính là hơi nước từ mặt biển và chịu lực ma sát với địa hình bề mặt, bão sẽ tan dần sau khi đổ bộ vào đất liền.',
    color: '#10b981',
  },
};

interface TyphoonSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function TyphoonSim({ customParams, customQuestions, onComplete }: TyphoonSimProps) {
  const [activeTab, setActiveTab] = useState('structure');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : [...ALL_QUESTIONS, ...(TAB_QUESTIONS[activeTab] || [])];

  // Animation Loop
  useEffect(() => {
    let animationId: number;
    let time = 0;
    
    // Cloud particles
    const particles: Array<{r: number, theta: number, size: number, speed: number, alpha: number}> = [];
    for(let i=0; i<800; i++) {
        const r = 20 + Math.random() * 300; // Dist from center
        particles.push({
            r: r,
            theta: Math.random() * Math.PI * 2,
            size: Math.random() * 8 + 2,
            speed: (350 - r) * 0.0003 + 0.01, // Faster near center
            alpha: Math.random() * 0.5 + 0.1
        });
    }

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      
      const centerX = w / 2;
      const centerY = h / 2;

      // 1. Background (Ocean)
      const isMovement = activeTab === 'movement';
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      
      if (isMovement) {
          // Draw coast line
          ctx.beginPath();
          ctx.moveTo(w * 0.7, 0);
          ctx.quadraticCurveTo(w * 0.6, h * 0.5, w * 0.8, h);
          ctx.lineTo(w, h);
          ctx.lineTo(w, 0);
          ctx.fillStyle = '#14532d'; // Dark green land
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(w * 0.7, 0);
          ctx.quadraticCurveTo(w * 0.6, h * 0.5, w * 0.8, h);
          ctx.lineTo(0, h);
          ctx.fillStyle = '#0c4a6e'; // Dark blue ocean
          ctx.fill();
      } else {
          ctx.fillStyle = '#0c4a6e';
          ctx.fillRect(0, 0, w, h);
      }

      // 2. Draw Typhoon
      ctx.save();
      
      let stormX = centerX;
      let stormY = centerY;
      
      if (isMovement) {
          // Animate storm moving towards land
          const moveProgress = (time % 800) / 800; // 0 to 1
          stormX = w * 0.2 + moveProgress * w * 0.6;
          stormY = h * 0.8 - moveProgress * h * 0.6;
      }
      
      ctx.translate(stormX, stormY);
      
      // Draw background swirl
      const swirlGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
      swirlGrad.addColorStop(0, 'rgba(255,255,255,0)');
      swirlGrad.addColorStop(0.1, 'rgba(255,255,255,0.8)'); // Eyewall
      swirlGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.5)'); // Spiral bands
      swirlGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      
      ctx.fillStyle = swirlGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 350, 0, Math.PI * 2);
      ctx.fill();

      // Draw particles (Clouds)
      particles.forEach(p => {
          // Update position
          p.theta -= p.speed; // Counter-clockwise in Northern Hemisphere
          
          // Inward spiral slightly
          if (activeTab === 'formation') {
             p.r -= 0.1;
             if (p.r < 20) p.r = 300 + Math.random() * 50;
          }
          
          // Fade storm over land
          let stormIntensity = 1;
          if (isMovement && stormX > w * 0.65) {
              stormIntensity = Math.max(0, 1 - (stormX - w * 0.65) / 150);
          }
          
          // Spiral equation: r = a + b * theta
          // To make it look like a hurricane, we add an offset to radius based on angle
          const spiralOffset = Math.sin(p.theta * 4) * 20; 
          const actualR = p.r + spiralOffset;
          
          const px = actualR * Math.cos(p.theta);
          const py = actualR * Math.sin(p.theta);
          
          ctx.beginPath();
          ctx.arc(px, py, p.size * stormIntensity, 0, Math.PI * 2);
          
          // Eyewall is brightest
          let color = `rgba(226, 232, 240, ${p.alpha * stormIntensity})`;
          if (p.r < 40) color = `rgba(255, 255, 255, ${p.alpha * 1.5 * stormIntensity})`;
          else if (p.r > 200) color = `rgba(148, 163, 184, ${p.alpha * 0.5 * stormIntensity})`;
          
          ctx.fillStyle = color;
          ctx.fill();
      });
      
      // Draw Eye (Clear center)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      ctx.restore();

      // 3. Annotations based on tab
      if (activeTab === 'formation') {
          // Show evaporation arrows
          for(let i=0; i<8; i++) {
              const ax = w/2 + Math.cos(i * Math.PI/4 + time*0.01) * 200;
              const ay = h/2 + Math.sin(i * Math.PI/4 + time*0.01) * 200;
              drawArrow(ctx, ax, ay, w/2, h/2, 'rgba(248, 113, 113, 0.6)', 20 + Math.sin(time*0.1)*10);
          }
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '16px Arial';
          ctx.fillText('Hơi nước bốc lên từ đại dương ấm (>26.5°C)', w/2 - 150, h - 50);
      } 
      else if (activeTab === 'structure') {
          // Labels
          drawLineLabel(ctx, centerX, centerY, centerX + 150, centerY - 150, 'Mắt Bão (Quang mây, gió nhẹ)');
          drawLineLabel(ctx, centerX + 30, centerY, centerX + 200, centerY - 50, 'Thành Mắt Bão (Gió giật mạnh nhất)');
          drawLineLabel(ctx, centerX + 180, centerY + 180, centerX + 300, centerY + 250, 'Dải mây xoắn ốc (Mưa diện rộng)');
      }
      else if (activeTab === 'movement') {
          // Track
          ctx.beginPath();
          ctx.moveTo(w * 0.2, h * 0.8);
          ctx.lineTo(w * 0.8, h * 0.2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 10]);
          ctx.stroke();
          ctx.setLineDash([]);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '16px Arial';
          ctx.fillText('Đất liền (Bão suy yếu do ma sát & thiếu hơi nước)', w * 0.65, h * 0.15);
      }

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [activeTab]);

  // Canvas drawing helpers
  const drawArrow = (ctx: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number, color: string, length: number = 20) => {
    const headlen = 10; 
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    const endX = fromx + length * Math.cos(angle);
    const endY = fromy + length * Math.sin(angle);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const drawLineLabel = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, text: string) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 + 100, y2);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x1, y1, 3, 0, Math.PI*2);
      ctx.fillStyle = 'white';
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(text, x2, y2 - 10);
  };

  const info = STAGE_INFO[activeTab];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Bão Nhiệt Đới" />
      
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
             <div style={{ fontSize: 13, color: '#cbd5e1' }}>Bão ở Bán cầu Bắc xoay <b>ngược chiều kim đồng hồ</b></div>
             <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Do tác động của lực Coriolis</div>
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
