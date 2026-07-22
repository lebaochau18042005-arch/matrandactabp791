import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'sim', label: '🌡️ Mô phỏng Tương tác', color: '#0ea5e9' },
  { id: 'impact', label: '🌊 Tác động', color: '#f43f5e' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Nguyên nhân chính gây ra hiện tượng băng tan ở hai cực là gì?',
    answer: 'Trái Đất nóng lên do hiệu ứng nhà kính',
    options: ['Trái Đất nóng lên do hiệu ứng nhà kính', 'Do các dòng biển nóng', 'Do lượng mưa tăng', 'Do núi lửa hoạt động'],
  },
  {
    id: 'q2',
    hint: 'Hậu quả trực tiếp nhất của việc băng tan trên lục địa là gì?',
    answer: 'Nước biển dâng cao',
    options: ['Nước biển dâng cao', 'Động đất', 'Sóng thần', 'Gió mùa hoạt động mạnh'],
  },
  {
    id: 'q3',
    hint: 'Ở Việt Nam, khu vực nào chịu ảnh hưởng nặng nề nhất khi nước biển dâng?',
    answer: 'Đồng bằng sông Cửu Long',
    options: ['Đồng bằng sông Cửu Long', 'Đồng bằng sông Hồng', 'Tây Nguyên', 'Vùng núi Tây Bắc'],
  },
  {
    id: 'q4',
    hint: 'Chỉ loại băng nào khi tan mới làm mực nước biển dâng lên?',
    answer: 'Băng trên lục địa (Nam Cực, Greenland)',
    options: ['Băng trên lục địa (Nam Cực, Greenland)', 'Băng trôi nổi trên đại dương (Bắc Cực)', 'Cả hai loại băng', 'Không có loại nào'],
  }
];

interface GlacierMeltSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function GlacierMeltSim({ customParams, customQuestions, onComplete }: GlacierMeltSimProps) {
  const [activeTab, setActiveTab] = useState('sim');
  const [temperature, setTemperature] = useState(0); // 0 to 5 degrees increase
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : ALL_QUESTIONS;

  // Render loop
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
      
      // Calculate melt factor (0 to 1)
      const meltFactor = temperature / 5;
      
      // Clear
      ctx.fillStyle = '#87CEEB'; // Sky blue
      ctx.fillRect(0, 0, w, h);

      // Draw Sun
      ctx.save();
      ctx.translate(w * 0.15, h * 0.2);
      ctx.rotate(time * 0.01);
      
      // Sun glow gets redder and bigger with temperature
      const sunGlow = 40 + meltFactor * 20;
      const sunGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, sunGlow);
      const sunColor = meltFactor > 0.6 ? '#ef4444' : (meltFactor > 0.3 ? '#f97316' : '#facc15');
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.5, sunColor);
      sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      
      ctx.fillStyle = sunGrad;
      ctx.beginPath(); ctx.arc(0, 0, sunGlow, 0, Math.PI * 2); ctx.fill();
      
      ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a'; ctx.fill();
      ctx.restore();

      // Draw distant mountains
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.6);
      ctx.lineTo(w * 0.2, h * 0.4);
      ctx.lineTo(w * 0.5, h * 0.6);
      ctx.fill();

      // ─── ICE / GLACIER (Left Side) ───
      // The glacier shrinks as meltFactor increases
      const iceHeight = h * 0.6 + meltFactor * h * 0.2; // goes down
      const iceWidth = w * 0.4 - meltFactor * w * 0.15; // shrinks left
      
      // Draw bedrock under ice
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.6);
      ctx.lineTo(iceWidth + 20, h * 0.8);
      ctx.lineTo(0, h);
      ctx.fill();
      
      // Draw Ice
      ctx.fillStyle = '#e0f2fe';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, iceHeight);
      ctx.lineTo(iceWidth, iceHeight + 20);
      ctx.lineTo(iceWidth + 10, h * 0.8);
      ctx.lineTo(0, h * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Meltwater drops if temperature > 0
      if (meltFactor > 0) {
          ctx.fillStyle = '#38bdf8';
          for(let i=0; i<5; i++) {
              const dropY = h * 0.8 + ((time * (3 + i) * meltFactor) % 50);
              const dropX = iceWidth + 5 + i * 2;
              ctx.beginPath();
              ctx.arc(dropX, dropY, 2 * meltFactor + 1, 0, Math.PI*2);
              ctx.fill();
          }
      }

      // ─── COASTAL CITY (Right Side) ───
      const coastX = w * 0.6;
      
      // Land
      ctx.fillStyle = '#a3e635'; // Grass
      ctx.beginPath();
      ctx.moveTo(coastX, h * 0.8);
      ctx.quadraticCurveTo(coastX + 50, h * 0.75, w, h * 0.75);
      ctx.lineTo(w, h);
      ctx.lineTo(coastX, h);
      ctx.fill();
      
      // Buildings
      const bY = h * 0.75;
      drawBuilding(ctx, coastX + 30, bY, 40, 80, '#cbd5e1');
      drawBuilding(ctx, coastX + 80, bY, 60, 120, '#94a3b8');
      drawBuilding(ctx, coastX + 150, bY, 50, 100, '#64748b');
      drawTree(ctx, coastX + 10, bY, 0.5);
      drawTree(ctx, coastX + 220, bY, 0.7);

      // ─── OCEAN (Middle) ───
      // Sea level rises as meltFactor increases
      const baseSeaLevel = h * 0.85;
      const seaLevelRiseAmount = meltFactor * h * 0.15; // Max 15% of screen height
      const currentSeaLevel = baseSeaLevel - seaLevelRiseAmount;
      
      // Ocean wave animation
      ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, currentSeaLevel);
      
      for(let x = 0; x <= w; x += 20) {
         const yOffset = Math.sin(time * 0.05 + x * 0.02) * 5;
         ctx.lineTo(x, currentSeaLevel + yOffset);
      }
      
      ctx.lineTo(w, h);
      ctx.fill();

      // Visual Sea Level Indicators
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, baseSeaLevel);
      ctx.lineTo(w, baseSeaLevel);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'red';
      ctx.font = '12px Arial';
      ctx.fillText('Mực nước biển gốc', w - 120, baseSeaLevel + 15);
      
      if (meltFactor > 0) {
          ctx.beginPath();
          ctx.moveTo(w - 150, baseSeaLevel);
          ctx.lineTo(w - 150, currentSeaLevel);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(w - 150, currentSeaLevel);
          ctx.lineTo(w - 155, currentSeaLevel + 5);
          ctx.lineTo(w - 145, currentSeaLevel + 5);
          ctx.fillStyle = 'red';
          ctx.fill();
          
          ctx.fillText(`+${(temperature * 0.8).toFixed(1)}m`, w - 145, currentSeaLevel + (baseSeaLevel - currentSeaLevel)/2);
      }

      // Warning text if flooded
      if (meltFactor > 0.6) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'red';
          ctx.shadowBlur = 10;
          ctx.fillText('CẢNH BÁO: Thành phố ven biển bị ngập lụt!', w/2, h * 0.3);
          ctx.shadowBlur = 0;
          ctx.textAlign = 'left';
      }

      // Overlay text
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(10, 10, 220, 70);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`🌡️ Tăng nhiệt độ: +${temperature.toFixed(1)}°C`, 20, 35);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText(`🌊 Mực nước dâng: +${(temperature * 0.8).toFixed(1)} m`, 20, 60);

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [temperature, activeTab]);

  const drawBuilding = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y - h, w, h);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(x, y - h, w, h);
      
      // Windows
      ctx.fillStyle = '#fef08a'; // lit window
      for(let wx = x + 5; wx < x + w - 10; wx += 12) {
          for(let wy = y - h + 10; wy < y - 10; wy += 15) {
              if (Math.random() > 0.2) ctx.fillRect(wx, wy, 8, 10);
              else {
                  ctx.fillStyle = '#475569'; // dark window
                  ctx.fillRect(wx, wy, 8, 10);
                  ctx.fillStyle = '#fef08a'; 
              }
          }
      }
  };

  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-4, -20, 8, 20);
    ctx.fillStyle = '#15803d';
    ctx.beginPath(); ctx.arc(0, -25, 15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(-10, -15, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -15, 10, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Băng tan & Nước biển dâng" />
      
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
          </div>

          {/* BOTTOM CONTROLS: Slider */}
          <div style={{ padding: '20px 30px', background: '#1e293b', borderTop: '1px solid #334155' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>Nhiệt độ toàn cầu tăng (Hiệu ứng nhà kính)</span>
                <span style={{ fontSize: 18, color: '#ef4444', fontWeight: 'bold' }}>+{temperature.toFixed(1)}°C</span>
             </div>
             
             <input 
                type="range" 
                min="0" max="5" step="0.1" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', height: 8, accentColor: '#ef4444' }}
             />
             
             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: '#94a3b8' }}>
                <span>Hiện tại (0°C)</span>
                <span>Báo động (+2°C)</span>
                <span>Thảm họa (+5°C)</span>
             </div>
          </div>

        </div>

        {/* RIGHT PANEL: Info & Quiz */}
        <div style={{ width: 340, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <SimTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {activeTab === 'sim' ? (
                <div>
                    <h3 style={{ color: '#0ea5e9', marginTop: 0 }}>Hướng dẫn tương tác</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        Kéo thanh trượt nhiệt độ bên dưới để quan sát tác động của sự nóng lên toàn cầu:
                    </p>
                    <ul style={{ fontSize: 14, color: '#f8fafc', paddingLeft: 20, lineHeight: 1.6 }}>
                        <li><b>Băng trên đất liền</b> (Nam Cực, Greenland) tan chảy, đổ nước vào đại dương.</li>
                        <li><b>Thể tích nước biển</b> nở ra do nhiệt độ tăng.</li>
                        <li><b>Hậu quả:</b> Mực nước biển dâng cao, nhấn chìm các vùng đồng bằng và thành phố ven biển.</li>
                    </ul>
                    
                    <div style={{ marginTop: 20, padding: 15, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8 }}>
                        <div style={{ fontWeight: 'bold', color: '#f87171', marginBottom: 5 }}>Lưu ý:</div>
                        <div style={{ fontSize: 13, color: '#fca5a5' }}>
                            Băng trôi nổi trên biển (như ở Bắc Cực) khi tan <b>không</b> làm tăng mực nước biển (theo nguyên lý Archimedes). Chỉ băng trên lục địa tan mới làm nước biển dâng.
                        </div>
                    </div>
                </div>
            ) : (
                <SimActivity 
                  questions={currentQuestions}
                  onComplete={onComplete}
                  title="Ôn tập kiến thức"
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
