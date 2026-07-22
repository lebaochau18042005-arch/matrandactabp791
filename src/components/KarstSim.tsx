import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'sim', label: '🦇 Mô phỏng Karst', color: '#8b5cf6' },
  { id: 'chemistry', label: '🧪 Phương trình', color: '#10b981' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Địa hình Karst phổ biến nhất ở loại đá nào?',
    answer: 'Đá vôi',
    options: ['Đá vôi', 'Đá granite', 'Đá bazan', 'Đá phiến'],
  },
  {
    id: 'q2',
    hint: 'Tác nhân chính gây ra quá trình phong hóa hóa học tạo địa hình Karst là:',
    answer: 'Nước mưa có hòa tan khí CO2',
    options: ['Nước mưa có hòa tan khí CO2', 'Gió thổi mạnh', 'Nhiệt độ thay đổi đột ngột', 'Động đất'],
  },
  {
    id: 'q3',
    hint: 'Trong hang động, dạng địa hình nhô lên từ nền hang được gọi là gì?',
    answer: 'Măng đá (Stalagmite)',
    options: ['Măng đá (Stalagmite)', 'Thạch nhũ (Stalactite)', 'Cột đá (Stalagnate)', 'Hố sụt'],
  },
  {
    id: 'q4',
    hint: 'Ví dụ tiêu biểu nhất về địa hình Karst ở Việt Nam là:',
    answer: 'Vịnh Hạ Long và Động Phong Nha',
    options: ['Vịnh Hạ Long và Động Phong Nha', 'Đồng bằng sông Cửu Long', 'Cao nguyên Lâm Viên', 'Quần đảo Trường Sa'],
  }
];

interface KarstSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function KarstSim({ customParams, customQuestions, onComplete }: KarstSimProps) {
  const [activeTab, setActiveTab] = useState('sim');
  const [timePassed, setTimePassed] = useState(0); // 0 to 100
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : ALL_QUESTIONS;

  // Render loop
  useEffect(() => {
    let animationId: number;
    let time = 0;
    
    // Droplets logic
    const droplets: Array<{x: number, y: number, fallSpeed: number}> = [];

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      
      const p = timePassed / 100; // 0 to 1
      
      // ─── BACKGROUND ───
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      
      // Surface (Forest)
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, 0, w, h * 0.15);
      
      // Surface Trees
      ctx.fillStyle = '#14532d';
      for(let i=0; i<15; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 60 + 20, h * 0.15);
          ctx.lineTo(i * 60 + 35, h * 0.05);
          ctx.lineTo(i * 60 + 50, h * 0.15);
          ctx.fill();
      }

      // Rain (Water with CO2 dissolving limestone)
      if (activeTab === 'sim' && timePassed < 100) {
          ctx.strokeStyle = 'rgba(125, 211, 252, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for(let i=0; i<20; i++) {
              const rx = (Math.random() * w);
              const ry = (time * 5 + i * 20) % (h * 0.15);
              ctx.moveTo(rx, ry);
              ctx.lineTo(rx - 2, ry + 10);
          }
          ctx.stroke();
      }

      // ─── LIMESTONE ROCK (Đá vôi) ───
      ctx.fillStyle = '#94a3b8'; // Limestone gray
      ctx.beginPath();
      ctx.moveTo(0, h * 0.15);
      ctx.lineTo(w, h * 0.15);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
      
      // Fractures/Cracks in limestone
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w*0.3, h*0.15); ctx.lineTo(w*0.35, h*0.4); ctx.lineTo(w*0.25, h*0.5);
      ctx.moveTo(w*0.7, h*0.15); ctx.lineTo(w*0.65, h*0.3); ctx.lineTo(w*0.8, h*0.6);
      ctx.stroke();

      // ─── CAVE SYSTEM ───
      // Draw the hollow cave. The size increases slightly with time as it dissolves.
      const caveX = w * 0.5;
      const caveY = h * 0.6;
      const caveW = w * 0.6 + p * 40;
      const caveH = h * 0.5 + p * 30;
      
      ctx.fillStyle = '#1e293b'; // Dark inside cave
      ctx.beginPath();
      ctx.ellipse(caveX, caveY, caveW/2, caveH/2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Underground River
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.moveTo(caveX - caveW/2 + 20, caveY + caveH/2 - 20);
      ctx.lineTo(caveX + caveW/2 - 20, caveY + caveH/2 - 20);
      ctx.lineTo(caveX + caveW/2, caveY + caveH/2);
      ctx.lineTo(caveX - caveW/2, caveY + caveH/2);
      ctx.fill();

      // ─── SPELEOTHEMS (Nhũ đá) ───
      const stalactites = [
          { x: w * 0.35, y: caveY - caveH/2 + 10, w: 20, maxH: 150 },
          { x: w * 0.5,  y: caveY - caveH/2,      w: 30, maxH: 220 }, // Will form column
          { x: w * 0.65, y: caveY - caveH/2 + 10, w: 15, maxH: 100 }
      ];

      ctx.fillStyle = '#cbd5e1'; // Calcite color
      
      stalactites.forEach((st, idx) => {
          const currentH = st.maxH * p;
          
          // Draw Stalactite (Thạch nhũ - Hanging from ceiling)
          ctx.beginPath();
          ctx.moveTo(st.x - st.w/2, st.y);
          ctx.lineTo(st.x, st.y + currentH);
          ctx.lineTo(st.x + st.w/2, st.y);
          ctx.fill();
          
          // Draw Stalagmite (Măng đá - Growing from floor)
          const floorY = caveY + caveH/2 - 25; // Just above river
          ctx.beginPath();
          ctx.moveTo(st.x - st.w/2 + 5, floorY);
          ctx.lineTo(st.x, floorY - currentH);
          ctx.lineTo(st.x + st.w/2 - 5, floorY);
          ctx.fill();
          
          // Dripping water effect
          if (timePassed < 100 && time % 30 === 0 && Math.random() > 0.5) {
              droplets.push({ x: st.x, y: st.y + currentH, fallSpeed: 0 });
          }
      });
      
      // Update and draw droplets
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = droplets.length - 1; i >= 0; i--) {
          const drop = droplets[i];
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, 2, 0, Math.PI*2);
          ctx.fill();
          
          drop.fallSpeed += 0.5; // gravity
          drop.y += drop.fallSpeed;
          
          // Remove if it hits the floor or stalagmite
          const floorY = caveY + caveH/2 - 25;
          const stalagmitePeak = floorY - stalactites[0].maxH * p; // Approx
          
          if (drop.y > floorY || (drop.y > stalagmitePeak && Math.abs(drop.x - w*0.5) < 20)) {
              droplets.splice(i, 1);
              // Small splash
              ctx.strokeStyle = 'rgba(255,255,255,0.4)';
              ctx.beginPath();
              ctx.arc(drop.x, drop.y, 5, 0, Math.PI, true);
              ctx.stroke();
          }
      }

      // Labels inside canvas
      if (activeTab === 'sim') {
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(w*0.7, h*0.3, 200, 90);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '14px Arial';
          ctx.fillText('🔻 Thạch nhũ (Stalactite)', w*0.72, h*0.35);
          ctx.fillText('🔺 Măng đá (Stalagmite)', w*0.72, h*0.4);
          if (p > 0.9) {
              ctx.fillStyle = '#fde047';
              ctx.fillText('⏳ Cột đá (Stalagnate)', w*0.72, h*0.45);
          }
      }

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [timePassed, activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Địa hình Karst (Hang động Đá vôi)" />
      
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL: Canvas & Controls */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ flex: 1, position: 'relative' }}>
             <canvas
                ref={canvasRef}
                width={800}
                height={500}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             />
          </div>

          {/* BOTTOM CONTROLS */}
          <div style={{ padding: '20px 30px', background: '#1e293b', borderTop: '1px solid #334155' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc' }}>Thời gian vạn năm</span>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#8b5cf6' }}>{timePassed}%</span>
             </div>
             <input 
                type="range" 
                min="0" max="100" step="1" 
                value={timePassed}
                onChange={(e) => setTimePassed(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', height: 8, accentColor: '#8b5cf6' }}
             />
             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: '#94a3b8' }}>
                <span>Khởi đầu</span>
                <span>Hang động mở rộng & Thạch nhũ dài ra</span>
                <span>Hình thành Cột đá</span>
             </div>
          </div>

        </div>

        {/* RIGHT PANEL: Info & Quiz */}
        <div style={{ width: 340, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <SimTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {activeTab === 'sim' ? (
                <div>
                    <h3 style={{ color: '#8b5cf6', marginTop: 0 }}>Cấu tạo Hang động</h3>
                    <ul style={{ fontSize: 14, color: '#cbd5e1', paddingLeft: 20, lineHeight: 1.6 }}>
                        <li><b>Thạch nhũ (Stalactite):</b> Hình thành từ trần hang rủ xuống. Nước mang theo khoáng chất nhỏ giọt từ trên cao và để lại một ít cặn đá vôi.</li>
                        <li><b>Măng đá (Stalagmite):</b> Nhô lên từ nền hang do các giọt nước từ trần hang rớt xuống và tích tụ cặn đá vôi trên sàn.</li>
                        <li><b>Cột đá (Stalagnate):</b> Trải qua hàng vạn năm, thạch nhũ và măng đá phát triển chạm vào nhau tạo thành một cột trụ vững chắc.</li>
                    </ul>
                    
                    <div style={{ marginTop: 20, padding: 15, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 8 }}>
                        <div style={{ fontWeight: 'bold', color: '#c4b5fd', marginBottom: 5 }}>Hướng dẫn:</div>
                        <div style={{ fontSize: 13, color: '#ddd6fe' }}>
                            Kéo thanh trượt để du hành thời gian. Bạn sẽ thấy quá trình những giọt nước kiên nhẫn kiến tạo nên các kiệt tác thiên nhiên như trong động Phong Nha hay vịnh Hạ Long.
                        </div>
                    </div>
                </div>
            ) : activeTab === 'chemistry' ? (
                <div>
                    <h3 style={{ color: '#10b981', marginTop: 0 }}>Bản chất Hóa học</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        Quá trình Karst thực chất là sự ăn mòn đá vôi (phong hóa hóa học) bởi nước mưa có hòa tan khí Carbonic (CO₂).
                    </p>
                    
                    <div style={{ margin: '20px 0', padding: '15px', background: '#022c22', borderRadius: 8, border: '1px solid #047857' }}>
                        <div style={{ fontSize: 13, color: '#6ee7b7', marginBottom: 8, fontWeight: 'bold' }}>Quá trình hòa tan (Tạo hang động):</div>
                        <div style={{ fontSize: 16, color: '#fff', textAlign: 'center', letterSpacing: 1 }}>
                            CaCO₃ + H₂O + CO₂<br/>
                            ⬇<br/>
                            Ca(HCO₃)₂
                        </div>
                        <div style={{ fontSize: 12, color: '#a7f3d0', marginTop: 8, textAlign: 'center' }}>
                            (Đá vôi cứng biến thành dung dịch dễ tan)
                        </div>
                    </div>

                    <div style={{ margin: '20px 0', padding: '15px', background: '#4c1d95', borderRadius: 8, border: '1px solid #7c3aed' }}>
                        <div style={{ fontSize: 13, color: '#c4b5fd', marginBottom: 8, fontWeight: 'bold' }}>Quá trình kết tủa (Tạo thạch nhũ):</div>
                        <div style={{ fontSize: 16, color: '#fff', textAlign: 'center', letterSpacing: 1 }}>
                            Ca(HCO₃)₂<br/>
                            ⬇<br/>
                            CaCO₃ + H₂O + CO₂
                        </div>
                        <div style={{ fontSize: 12, color: '#ddd6fe', marginTop: 8, textAlign: 'center' }}>
                            (Nước bốc hơi, CO₂ thoát ra, đá vôi kết tủa lại)
                        </div>
                    </div>
                </div>
            ) : (
                <SimActivity 
                  questions={currentQuestions}
                  onComplete={onComplete}
                  title="Kiểm tra kiến thức"
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
