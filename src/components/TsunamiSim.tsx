import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'earthquake', label: '💥 Động đất', color: '#f59e0b' },
  { id: 'recede', label: '🌊 Nước biển rút', color: '#3b82f6' },
  { id: 'crash', label: '🌪️ Sóng ập vào', color: '#ef4444' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Nguyên nhân chủ yếu gây ra sóng thần là gì?',
    answer: 'Động đất dưới đáy đại dương',
    options: ['Động đất dưới đáy đại dương', 'Gió bão lớn', 'Trái Đất nóng lên', 'Thủy triều lên cao'],
  },
  {
    id: 'q2',
    hint: 'Dấu hiệu nào cho thấy sóng thần sắp ập đến bờ?',
    answer: 'Nước biển đột ngột rút xa bờ',
    options: ['Nước biển đột ngột rút xa bờ', 'Trời đổ mưa to', 'Gió thổi mạnh', 'Nước biển đổi màu'],
  },
  {
    id: 'q3',
    hint: 'Tại sao sóng thần khi ở ngoài khơi xa lại khó nhận biết?',
    answer: 'Vì chiều cao sóng rất thấp nhưng bước sóng rất dài',
    options: ['Vì chiều cao sóng rất thấp nhưng bước sóng rất dài', 'Vì nước sâu nên sóng không di chuyển', 'Vì sóng thần chỉ sinh ra ở gần bờ', 'Vì sóng bị gió thổi ngược lại'],
  },
];

interface TsunamiSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function TsunamiSim({ customParams, customQuestions, onComplete }: TsunamiSimProps) {
  const [activeTab, setActiveTab] = useState('earthquake');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : ALL_QUESTIONS;

  // Render loop
  useEffect(() => {
    let animationId: number;
    let time = 0;
    
    // Wave parameters
    let waveX = 0; // Wave position
    
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      
      ctx.clearRect(0, 0, w, h);

      // Sky
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, w, h * 0.6);

      // ─── TERRAIN (Ocean floor and Coast) ───
      ctx.fillStyle = '#c2b280'; // Sand/Rock
      ctx.beginPath();
      // Coast on the right
      ctx.moveTo(w, h);
      ctx.lineTo(0, h);
      // Ocean floor (deep on left, shallowing up to right)
      ctx.lineTo(0, h * 0.9);
      ctx.lineTo(w * 0.3, h * 0.9);
      
      // Fault line crack (if earthquake)
      const faultX = w * 0.25;
      const faultY = h * 0.9;
      
      if (activeTab === 'earthquake') {
          // Fault shifts up
          ctx.lineTo(faultX - 10, faultY);
          ctx.lineTo(faultX - 10, faultY - 20);
          ctx.lineTo(w * 0.6, h * 0.85); // slope up
      } else {
          ctx.lineTo(w * 0.6, h * 0.85); // slope up
      }
      
      ctx.lineTo(w * 0.8, h * 0.7); // beach
      ctx.lineTo(w, h * 0.65); // land
      ctx.fill();

      // ─── BUILDINGS & PEOPLE ON COAST ───
      const beachX = w * 0.82;
      const landY = h * 0.68;
      
      drawHouse(ctx, beachX, landY, 30, 30, '#cbd5e1');
      drawHouse(ctx, beachX + 40, landY - 10, 40, 50, '#94a3b8');
      
      // ─── SEA LEVEL CALCULATION ───
      let baseSeaLevel = h * 0.75; // normal sea level hits the beach
      let currentSeaLevel = baseSeaLevel;
      
      // 1. EARTHQUAKE PHASE
      if (activeTab === 'earthquake') {
          // Screen shake
          const shake = Math.sin(time) * 3;
          ctx.save();
          ctx.translate(0, shake);
          
          // Fault line energy
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.arc(faultX, faultY, (time * 2 + i * 20) % 100, 0, Math.PI, true);
              ctx.stroke();
          }
          
          // Initial wave bump at surface
          ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
          ctx.beginPath();
          ctx.moveTo(0, baseSeaLevel);
          ctx.lineTo(faultX - 50, baseSeaLevel);
          ctx.quadraticCurveTo(faultX, baseSeaLevel - 30, faultX + 50, baseSeaLevel);
          ctx.lineTo(w, baseSeaLevel);
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.fill();
          
          ctx.restore(); // end shake
          
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(w/2 - 150, 20, 300, 40);
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Đứt gãy kiến tạo dưới đáy biển', w/2, 45);
      }
      
      // 2. RECEDE PHASE (Nước rút)
      else if (activeTab === 'recede') {
          // Water draws back from shore
          currentSeaLevel = baseSeaLevel + 40; // level drops, exposing beach
          
          ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
          ctx.beginPath();
          ctx.moveTo(0, baseSeaLevel); // left side stays normal
          // smooth curve down to receded level
          ctx.quadraticCurveTo(w * 0.5, baseSeaLevel, w * 0.75, currentSeaLevel);
          ctx.lineTo(w, currentSeaLevel);
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.fill();
          
          // Highlight exposed beach
          ctx.fillStyle = 'rgba(255,0,0,0.3)';
          ctx.fillRect(w * 0.7, currentSeaLevel - 30, w * 0.15, 30);
          
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(w/2 - 200, 20, 400, 60);
          ctx.fillStyle = '#93c5fd';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Dấu hiệu nhận biết: Nước biển rút đột ngột', w/2, 45);
          ctx.font = '14px Arial';
          ctx.fillText('Đáy biển trơ trọi cá tôm, báo hiệu sóng lớn sắp tới', w/2, 65);
      }
      
      // 3. CRASH PHASE (Sóng ập vào)
      else if (activeTab === 'crash') {
          // Wave moves from left to right
          waveX = (time * 5) % (w * 1.2); 
          
          ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
          ctx.beginPath();
          ctx.moveTo(0, baseSeaLevel);
          
          // Wave shape: low on left, peaking at waveX
          ctx.lineTo(waveX - 200, baseSeaLevel); // back of wave
          
          // Front of wave (steepens as it gets closer to shore)
          const waveHeight = 50 + (waveX / w) * 100; // grows taller in shallow water
          
          ctx.quadraticCurveTo(waveX - 100, baseSeaLevel - waveHeight, waveX, baseSeaLevel - waveHeight);
          ctx.quadraticCurveTo(waveX + 50, baseSeaLevel, waveX + 100, baseSeaLevel);
          
          ctx.lineTo(w, baseSeaLevel);
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.fill();
          
          // White foam at peak
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.beginPath();
          ctx.arc(waveX - 10, baseSeaLevel - waveHeight + 10, 20, 0, Math.PI*2);
          ctx.arc(waveX - 30, baseSeaLevel - waveHeight + 20, 15, 0, Math.PI*2);
          ctx.fill();
          
          // Damage check
          if (waveX > beachX) {
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.fillRect(w/2 - 150, 20, 300, 40);
              ctx.fillStyle = '#fca5a5';
              ctx.font = 'bold 18px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('Sức tàn phá khủng khiếp!', w/2, 45);
          } else {
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.fillRect(w/2 - 200, 20, 400, 60);
              ctx.fillStyle = '#fca5a5';
              ctx.font = 'bold 18px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('Sóng vươn cao khi vào vùng nước nông', w/2, 45);
              ctx.font = '14px Arial';
              ctx.fillText('Tốc độ giảm, nhưng chiều cao tăng vọt', w/2, 65);
          }
      }

      ctx.textAlign = 'left';
      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [activeTab]);

  const drawHouse = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y - h, w, h);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(x, y - h, w, h);
      
      ctx.fillStyle = '#b91c1c'; // Red roof
      ctx.beginPath();
      ctx.moveTo(x - 5, y - h);
      ctx.lineTo(x + w / 2, y - h - 15);
      ctx.lineTo(x + w + 5, y - h);
      ctx.fill();
      ctx.stroke();
  };

  const currentInfo = () => {
    switch(activeTab) {
        case 'earthquake': return {
            title: '1. Khởi nguồn dưới đáy biển',
            desc: 'Động đất, lở đất ngầm, hoặc núi lửa phun trào làm dịch chuyển một khối lượng nước khổng lồ. Sóng truyền đi với tốc độ rất nhanh (>700km/h) nhưng chiều cao sóng ngoài khơi chỉ dưới 1m, rất khó nhận biết đối với tàu thuyền.'
        };
        case 'recede': return {
            title: '2. Nước biển rút xa bờ',
            desc: 'Khi hõm của sóng thần tiến vào bờ trước, nó sẽ kéo theo nước biển lùi xa ra ngoài khơi, để lộ đáy biển. Đây là dấu hiệu cảnh báo sinh tử! Người dân tuyệt đối không được nhặt cá tôm mà phải chạy ngay lên chỗ cao.'
        };
        case 'crash': return {
            title: '3. Sóng vươn cao và ập vào',
            desc: 'Khi tiến vào vùng nước nông, tốc độ sóng giảm đi do ma sát với đáy biển, nhưng năng lượng khổng lồ bị dồn nén khiến ngọn sóng vươn cao (có thể lên tới 30-40m). Nước cuồn cuộn đổ vào đất liền với sức tàn phá khủng khiếp.'
        };
    }
  };

  const info = currentInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Sự hình thành Sóng thần (Tsunami)" />
      
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL: Canvas */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ flex: 1, position: 'relative' }}>
             <canvas
                ref={canvasRef}
                width={800}
                height={500}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             />
          </div>

          {/* BOTTOM INFO PANEL */}
          <div style={{ padding: '20px 30px', background: '#1e293b', borderTop: '1px solid #334155', minHeight: 120 }}>
             <h3 style={{ margin: '0 0 10px 0', fontSize: 20, color: '#f8fafc' }}>{info?.title}</h3>
             <p style={{ margin: 0, fontSize: 15, color: '#cbd5e1', lineHeight: 1.6 }}>{info?.desc}</p>
          </div>

        </div>

        {/* RIGHT PANEL: Controls & Quiz */}
        <div style={{ width: 340, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <SimTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            <h3 style={{ color: '#3b82f6', marginTop: 0 }}>Các giai đoạn</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
                Nhấn vào các tab ở trên theo thứ tự từ trái sang phải để quan sát sự hình thành và tấn công của sóng thần.
            </p>
            
            <SimActivity 
              questions={currentQuestions}
              onComplete={onComplete}
              title="Kiểm tra kiến thức"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
