import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'sim', label: '🌡️ Hiệu ứng nhà kính', color: '#f59e0b' },
  { id: 'impact', label: '🌍 Tác động', color: '#ef4444' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Khí nhà kính nào đóng vai trò lớn nhất gây ra biến đổi khí hậu do con người?',
    answer: 'CO2 (Carbon dioxide)',
    options: ['CO2 (Carbon dioxide)', 'O2 (Oxy)', 'N2 (Nito)', 'H2 (Hydro)'],
  },
  {
    id: 'q2',
    hint: 'Hiệu ứng nhà kính giữ lại loại bức xạ nào của Trái Đất?',
    answer: 'Bức xạ nhiệt (Hồng ngoại)',
    options: ['Bức xạ nhiệt (Hồng ngoại)', 'Ánh sáng khả kiến', 'Tia cực tím (UV)', 'Tia X'],
  },
  {
    id: 'q3',
    hint: 'Hoạt động nào của con người phát thải nhiều khí nhà kính nhất?',
    answer: 'Đốt nhiên liệu hóa thạch (than đá, dầu mỏ)',
    options: ['Đốt nhiên liệu hóa thạch (than đá, dầu mỏ)', 'Sử dụng năng lượng mặt trời', 'Trồng rừng', 'Đánh bắt cá'],
  },
];

interface ClimateChangeSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function ClimateChangeSim({ customParams, customQuestions, onComplete }: ClimateChangeSimProps) {
  const [activeTab, setActiveTab] = useState('sim');
  const [co2Level, setCo2Level] = useState(0); // 0 (1850s) to 1 (Extreme Future)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : ALL_QUESTIONS;

  // Render loop
  useEffect(() => {
    let animationId: number;
    let time = 0;
    
    // Photons: {x, y, vx, vy, type: 'sun' (yellow) | 'heat' (red), active: boolean}
    const photons: Array<{x: number, y: number, vx: number, vy: number, type: string, active: boolean, life: number}> = [];

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      
      // Calculate temperature based on CO2 (0 to 1 -> +0 to +4 degrees)
      const tempIncrease = co2Level * 4;
      
      // Clear sky
      ctx.fillStyle = '#0f172a'; // Space / Upper atmosphere
      ctx.fillRect(0, 0, w, h);
      
      // Draw Sun
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(w * 0.15, h * 0.15, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ─── EARTH SURFACE (Bottom arc) ───
      const earthCenterY = h * 1.5;
      const earthRadius = h;
      
      // Earth color changes from healthy green/blue to dried brown based on temp
      // Healthy: #22c55e, Hot: #b45309
      const r = Math.floor(34 + co2Level * 146);
      const g = Math.floor(197 - co2Level * 114);
      const b = Math.floor(94 - co2Level * 85);
      const earthColor = `rgb(${r}, ${g}, ${b})`;
      
      ctx.fillStyle = earthColor;
      ctx.beginPath();
      ctx.arc(w / 2, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw cities / factories
      ctx.fillStyle = '#475569';
      const cityX = w * 0.7;
      const cityY = h * 0.5 - 10;
      ctx.fillRect(cityX, cityY, 80, 20); // base
      ctx.fillRect(cityX + 10, cityY - 30, 20, 30);
      ctx.fillRect(cityX + 50, cityY - 50, 15, 50);
      
      // Factory smoke increases with CO2 slider
      if (co2Level > 0) {
          ctx.fillStyle = `rgba(100, 100, 100, ${co2Level * 0.8})`;
          for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              ctx.arc(cityX + 20 + i * 5 + Math.sin(time*0.1+i)*10, cityY - 40 - i*15 - (time % 20), 10 + i*3, 0, Math.PI*2);
              ctx.fill();
              
              ctx.beginPath();
              ctx.arc(cityX + 57 + Math.sin(time*0.12+i)*15, cityY - 60 - i*20 - (time % 25), 15 + i*4, 0, Math.PI*2);
              ctx.fill();
          }
      }

      // ─── GREENHOUSE GAS LAYER ───
      const ghgY = h * 0.25;
      const ghgThickness = 10 + co2Level * 40; // Layer gets thicker and more opaque
      
      ctx.fillStyle = `rgba(163, 230, 53, ${0.1 + co2Level * 0.3})`;
      ctx.fillRect(0, ghgY, w, ghgThickness);
      
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '14px Arial';
      ctx.fillText('Lớp khí nhà kính (CO2, CH4...)', 20, ghgY - 10);

      // ─── PHOTON ANIMATION ───
      // Spawn new sun photons
      if (time % 10 === 0) {
          photons.push({
              x: w * 0.15 + (Math.random() - 0.5) * 40,
              y: h * 0.15 + (Math.random() - 0.5) * 40,
              vx: 2 + Math.random(),
              vy: 3 + Math.random(),
              type: 'sun',
              active: true,
              life: 0
          });
      }
      
      for (let i = photons.length - 1; i >= 0; i--) {
          const p = photons[i];
          if (!p.active) {
              photons.splice(i, 1);
              continue;
          }
          
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          
          // Draw photon
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = p.type === 'sun' ? '#fde047' : '#ef4444';
          ctx.shadowColor = p.type === 'sun' ? '#fef08a' : '#fca5a5';
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Sun photons hit Earth and turn into Heat (Infrared)
          if (p.type === 'sun' && p.y > h * 0.5) {
              p.type = 'heat';
              // Bounce back up
              p.vy = - (2 + Math.random() * 2);
              p.vx = (Math.random() - 0.5) * 4;
          }
          
          // Heat photons interact with Greenhouse gas layer
          if (p.type === 'heat' && p.y < ghgY + ghgThickness && p.vy < 0) {
              // Probability to get trapped (bounce back down) depends on CO2 level
              const trapProbability = 0.2 + co2Level * 0.6; // 20% to 80%
              if (Math.random() < trapProbability) {
                  p.vy = Math.abs(p.vy); // bounce down
              }
          }
          
          // Remove if off screen or too old
          if (p.y < -50 || p.y > h + 50 || p.x < -50 || p.x > w + 50 || p.life > 400) {
              p.active = false;
          }
      }

      // ─── THERMOMETER UI ───
      const thermX = w - 60;
      const thermY = h * 0.7;
      
      // Glass
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(thermX, thermY, 15, 0, Math.PI * 2);
      ctx.moveTo(thermX - 8, thermY - 10);
      ctx.lineTo(thermX - 8, thermY - 150);
      ctx.arc(thermX, thermY - 150, 8, Math.PI, 0);
      ctx.lineTo(thermX + 8, thermY - 10);
      ctx.fill();
      ctx.stroke();
      
      // Liquid
      const liquidH = 30 + tempIncrease * 25; // max ~ 130
      ctx.fillStyle = tempIncrease > 2 ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(thermX, thermY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(thermX - 5, thermY - 10 - liquidH, 10, liquidH + 10);
      
      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`+${tempIncrease.toFixed(1)}°C`, thermX - 25, thermY - 10 - liquidH);
      ctx.textAlign = 'left';

      // Overlay Dashboard
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(10, h - 80, 250, 70);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      
      let year = Math.floor(1850 + co2Level * (2050 - 1850));
      let ppm = Math.floor(280 + co2Level * (550 - 280));
      
      ctx.fillText(`Năm mô phỏng: ~${year}`, 20, h - 55);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(`Nồng độ CO2: ${ppm} ppm`, 20, h - 30);

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [co2Level, activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Biến Đổi Khí Hậu" />
      
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL: Canvas & Info */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ flex: 1, position: 'relative' }}>
             <canvas
                ref={canvasRef}
                width={800}
                height={500}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             />
             
             {/* Legend */}
             <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
                   <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fde047', marginRight: 8 }}></div>
                   <span>Bức xạ Mặt Trời (Tia ngắn)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                   <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', marginRight: 8 }}></div>
                   <span>Bức xạ nhiệt (Tia dài / Hồng ngoại)</span>
                </div>
             </div>
          </div>

          {/* BOTTOM CONTROLS: Slider */}
          <div style={{ padding: '20px 30px', background: '#1e293b', borderTop: '1px solid #334155' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>Lượng khí thải CO2 (Hoạt động của con người)</span>
             </div>
             
             <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={co2Level}
                onChange={(e) => setCo2Level(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', height: 8, accentColor: '#f59e0b' }}
             />
             
             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: '#94a3b8' }}>
                <span>Thế kỷ 19 (Tiền công nghiệp)</span>
                <span>Hiện nay</span>
                <span>Tương lai cực đoan</span>
             </div>
          </div>

        </div>

        {/* RIGHT PANEL: Info & Quiz */}
        <div style={{ width: 340, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <SimTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {activeTab === 'sim' ? (
                <div>
                    <h3 style={{ color: '#f59e0b', marginTop: 0 }}>Hiệu ứng nhà kính là gì?</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        Trái Đất hấp thụ năng lượng từ Mặt Trời và phát ngược lại không gian dưới dạng <b>bức xạ nhiệt (tia hồng ngoại)</b>.
                    </p>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        Các khí nhà kính (CO2, CH4, hơi nước...) hoạt động như một lớp kính. Chúng để ánh sáng Mặt Trời đi qua dễ dàng, nhưng lại <b>giữ lại bức xạ nhiệt</b>, ngăn không cho thoát ra ngoài không gian.
                    </p>
                    <div style={{ marginTop: 15, padding: 15, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8 }}>
                        <div style={{ fontWeight: 'bold', color: '#fbbf24', marginBottom: 5 }}>Thực hành:</div>
                        <div style={{ fontSize: 13, color: '#fcd34d' }}>
                            Kéo thanh trượt CO2 để làm dày lớp khí nhà kính. Quan sát số lượng <b>hạt màu đỏ (nhiệt)</b> bị dội ngược trở lại Trái Đất ngày càng nhiều, làm tăng nhiệt độ toàn cầu.
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
