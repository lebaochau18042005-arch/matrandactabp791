import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'sim', label: '🌧️ Mô phỏng Lũ', color: '#3b82f6' },
  { id: 'forest', label: '🌲 Vai trò của rừng', color: '#22c55e' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Nguyên nhân chính gây ra lũ lụt ở đồng bằng là gì?',
    answer: 'Mưa lớn kéo dài ở thượng nguồn',
    options: ['Mưa lớn kéo dài ở thượng nguồn', 'Triều cường', 'Gió mùa mùa đông', 'Động đất'],
  },
  {
    id: 'q2',
    hint: 'Rừng phòng hộ đầu nguồn có tác dụng gì trong việc chống lũ?',
    answer: 'Giữ nước, làm giảm tốc độ dòng chảy',
    options: ['Giữ nước, làm giảm tốc độ dòng chảy', 'Ngăn chặn hoàn toàn mưa rơi xuống đất', 'Hút hết nước của dòng sông', 'Không có tác dụng gì'],
  },
  {
    id: 'q3',
    hint: 'Ở đồng bằng sông Cửu Long, lũ thường mang lại lợi ích gì nổi bật?',
    answer: 'Bồi đắp phù sa, thau chua rửa mặn',
    options: ['Bồi đắp phù sa, thau chua rửa mặn', 'Tạo ra nhiều nhà máy thủy điện', 'Ngăn chặn xâm nhập mặn vĩnh viễn', 'Làm mát không khí mùa hè'],
  },
  {
    id: 'q4',
    hint: 'Hiện tượng nước dâng lên đột ngột, chảy xiết ở vùng đồi núi gọi là gì?',
    answer: 'Lũ quét',
    options: ['Lũ quét', 'Lũ lụt', 'Triều cường', 'Sóng thần'],
  }
];

interface FloodSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function FloodSim({ customParams, customQuestions, onComplete }: FloodSimProps) {
  const [activeTab, setActiveTab] = useState('sim');
  const [rainIntensity, setRainIntensity] = useState(0); // 0 (Không mưa) to 100 (Mưa to)
  const [forestCover, setForestCover] = useState(50); // 0 (Đồi trọc) to 100 (Rừng rậm)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : ALL_QUESTIONS;

  // Render loop
  useEffect(() => {
    let animationId: number;
    let time = 0;
    
    // Physics states
    let riverWaterLevel = 0; // 0 to 100
    let soilWater = 0; // Water absorbed in soil
    
    // Raindrops: {x, y, vy, active}
    const raindrops: Array<{x: number, y: number, vy: number, active: boolean}> = [];

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      
      // Update Physics
      // Rain adds water. Forest increases soil absorption capacity and slows runoff.
      const rainInflow = rainIntensity * 0.05;
      const absorptionRate = (forestCover / 100) * 0.03 + 0.01;
      
      if (rainIntensity > 0) {
          soilWater += rainInflow * absorptionRate;
          const runoff = rainInflow * (1 - absorptionRate);
          riverWaterLevel += runoff;
      }
      
      // River drains over time
      riverWaterLevel -= 0.5; // Natural drainage
      if (riverWaterLevel < 0) riverWaterLevel = 0;
      if (riverWaterLevel > 100) riverWaterLevel = 100; // Max flood level
      
      // Evaporation from soil
      soilWater -= 0.1;
      if (soilWater < 0) soilWater = 0;

      // ─── BACKGROUND ───
      // Sky gets darker with rain
      const skyDarkness = 1 - (rainIntensity / 200);
      ctx.fillStyle = `rgb(${Math.floor(135 * skyDarkness)}, ${Math.floor(206 * skyDarkness)}, ${Math.floor(235 * skyDarkness)})`;
      ctx.fillRect(0, 0, w, h);

      // Clouds
      if (rainIntensity > 0) {
          ctx.fillStyle = `rgba(80, 90, 100, ${0.5 + rainIntensity/200})`;
          ctx.beginPath();
          ctx.arc(w*0.2, 30, 40, 0, Math.PI*2);
          ctx.arc(w*0.4, 40, 50, 0, Math.PI*2);
          ctx.arc(w*0.6, 30, 60, 0, Math.PI*2);
          ctx.arc(w*0.8, 50, 45, 0, Math.PI*2);
          ctx.fill();
      }

      // ─── MOUNTAINS & TERRAIN ───
      // Mountain (Left)
      ctx.fillStyle = '#4d7c0f'; // Dark green base
      ctx.beginPath();
      ctx.moveTo(0, h * 0.8);
      ctx.lineTo(w * 0.4, h * 0.8);
      ctx.lineTo(0, h * 0.2);
      ctx.fill();
      
      // Plain (Right)
      ctx.fillStyle = '#65a30d'; // Lighter green
      ctx.fillRect(w * 0.4, h * 0.8, w * 0.6, h * 0.2);

      // ─── TREES (Forest Cover) ───
      // Draw trees based on forestCover
      const numTrees = Math.floor(forestCover);
      // Fixed pseudo-random positions for trees
      for (let i = 0; i < numTrees; i++) {
          const tx = (i * 73) % (w * 0.45);
          let ty = 0;
          if (tx < w * 0.4) {
              // On mountain slope: y = mx + b
              ty = h * 0.2 + (tx / (w * 0.4)) * (h * 0.6);
          } else {
              // On plain
              ty = h * 0.8;
          }
          drawTree(ctx, tx, ty - 10, 0.6);
      }

      // ─── RIVER ───
      // The river flows from mountain down to plain
      const riverBaseY = h * 0.82;
      const floodHeight = (riverWaterLevel / 100) * (h * 0.15); // Max flood is 15% of screen height
      
      // Draw river bed (Background)
      ctx.fillStyle = '#78350f'; // Mud
      ctx.fillRect(0, h * 0.82, w, h * 0.18);
      
      // Draw Water
      ctx.fillStyle = `rgba(14, 165, 233, 0.8)`;
      // If flood is high and forest is low, water gets muddy (brown)
      if (riverWaterLevel > 40 && forestCover < 40) {
          ctx.fillStyle = `rgba(146, 64, 14, 0.9)`; // Muddy flood water
      }
      
      ctx.beginPath();
      ctx.moveTo(0, riverBaseY - floodHeight);
      
      // Wave animation on river
      for(let x = 0; x <= w; x += 20) {
         const yOffset = Math.sin(time * 0.1 + x * 0.05) * 3;
         ctx.lineTo(x, riverBaseY - floodHeight + yOffset);
      }
      
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // ─── CITY / HOUSES ───
      // Houses on the plain
      const cityStartX = w * 0.55;
      const cityY = h * 0.8;
      
      drawHouse(ctx, cityStartX, cityY, 40, 40, '#cbd5e1');
      drawHouse(ctx, cityStartX + 60, cityY, 50, 45, '#94a3b8');
      drawHouse(ctx, cityStartX + 130, cityY, 45, 35, '#cbd5e1');

      // Check if flooded
      const isFlooded = (riverBaseY - floodHeight) < cityY;
      
      if (isFlooded) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'red';
          ctx.shadowBlur = 10;
          ctx.fillText('CẢNH BÁO: Thành phố bị ngập lụt!', w * 0.7, h * 0.4);
          ctx.shadowBlur = 0;
          ctx.textAlign = 'left';
          
          if (forestCover < 30) {
              ctx.fillStyle = '#fca5a5';
              ctx.font = '16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('Lũ quét: Đồi trọc không giữ được nước!', w * 0.7, h * 0.4 + 30);
              ctx.textAlign = 'left';
          }
      }

      // ─── RAIN ANIMATION ───
      if (rainIntensity > 0) {
          // Spawn raindrops
          for(let i=0; i < rainIntensity / 10; i++) {
              raindrops.push({
                  x: Math.random() * w,
                  y: Math.random() * 50,
                  vy: 10 + Math.random() * 5,
                  active: true
              });
          }
      }
      
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = raindrops.length - 1; i >= 0; i--) {
          const drop = raindrops[i];
          if (!drop.active) {
              raindrops.splice(i, 1);
              continue;
          }
          
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + 10);
          
          drop.y += drop.vy;
          drop.x -= 2; // Wind blowing left
          
          if (drop.y > h) drop.active = false;
      }
      ctx.stroke();

      // ─── DASHBOARD ───
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(10, 10, 240, 100);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Mức nước sông: ${Math.floor(riverWaterLevel)}%`, 20, 35);
      
      // Progress bar for river level
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, 45, 200, 10);
      ctx.fillStyle = riverWaterLevel > 75 ? '#ef4444' : '#3b82f6';
      ctx.fillRect(20, 45, riverWaterLevel * 2, 10);
      
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px Arial';
      ctx.fillText(`Khả năng giữ nước của đất: ${Math.floor(absorptionRate * 1000)}%`, 20, 75);
      ctx.fillText(forestCover < 30 ? 'Cảnh báo: Dễ xảy ra lũ quét!' : 'Rừng đang bảo vệ tốt.', 20, 95);

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [rainIntensity, forestCover, activeTab]);

  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#78350f'; // Trunk
    ctx.fillRect(-4, -20, 8, 20);
    ctx.fillStyle = '#15803d'; // Leaves
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(-15, -10);
    ctx.lineTo(15, -10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.fill();
    ctx.restore();
  };
  
  const drawHouse = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x, y - h, w, h);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(x, y - h, w, h);
      
      // Roof
      ctx.fillStyle = '#b91c1c'; // Red roof
      ctx.beginPath();
      ctx.moveTo(x - 5, y - h);
      ctx.lineTo(x + w / 2, y - h - 20);
      ctx.lineTo(x + w + 5, y - h);
      ctx.fill();
      ctx.stroke();
      
      // Door
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + w/2 - 8, y - 20, 16, 20);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Lũ lụt & Vai trò của Rừng" />
      
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
          <div style={{ padding: '20px 30px', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: 40 }}>
             
             {/* Slider 1: Rain */}
             <div style={{ flex: 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 'bold', color: '#38bdf8' }}>Lượng mưa</span>
                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{rainIntensity}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" max="100" step="1" 
                    value={rainIntensity}
                    onChange={(e) => setRainIntensity(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', height: 8, accentColor: '#38bdf8' }}
                 />
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
                    <span>Trời nắng</span>
                    <span>Mưa vừa</span>
                    <span>Bão lớn</span>
                 </div>
             </div>

             {/* Slider 2: Forest Cover */}
             <div style={{ flex: 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 'bold', color: '#4ade80' }}>Độ che phủ rừng</span>
                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{forestCover}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" max="100" step="1" 
                    value={forestCover}
                    onChange={(e) => setForestCover(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', height: 8, accentColor: '#4ade80' }}
                 />
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
                    <span>Đồi trọc (Chặt phá)</span>
                    <span>Bình thường</span>
                    <span>Rừng nguyên sinh</span>
                 </div>
             </div>

          </div>

        </div>

        {/* RIGHT PANEL: Info & Quiz */}
        <div style={{ width: 340, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <SimTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {activeTab === 'sim' ? (
                <div>
                    <h3 style={{ color: '#3b82f6', marginTop: 0 }}>Cách tương tác</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        1. Kéo thanh <b>Lượng mưa</b> lên tối đa (100%) để tạo ra một trận bão lớn. Quan sát mực nước sông dâng lên.
                    </p>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        2. Kéo thanh <b>Độ che phủ rừng</b> về 0% (Đồi trọc). Nước không được giữ lại sẽ đổ ập xuống sông gây ra <b>lũ quét và ngập lụt</b> nghiêm trọng (nước chuyển màu bùn đất).
                    </p>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        3. Kéo thanh <b>Độ che phủ rừng</b> lên 100%. Cây xanh giữ lại lượng lớn nước mưa, làm nước sông lên từ từ, bảo vệ thành phố an toàn dù mưa to.
                    </p>
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
