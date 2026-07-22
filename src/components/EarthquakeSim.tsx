import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'sim', label: '💥 Mô phỏng Động đất', color: '#ef4444' },
  { id: 'richter', label: '📊 Thang đo Richter', color: '#f59e0b' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Nơi phát sinh ra động đất nằm sâu trong lòng đất được gọi là gì?',
    answer: 'Chấn tiêu',
    options: ['Chấn tiêu', 'Chấn tâm', 'Tâm chấn', 'Đứt gãy'],
  },
  {
    id: 'q2',
    hint: 'Nơi trên mặt đất nằm ngay phía trên chấn tiêu, chịu hậu quả nặng nề nhất gọi là gì?',
    answer: 'Chấn tâm',
    options: ['Chấn tâm', 'Chấn tiêu', 'Vành đai lửa', 'Tâm bão'],
  },
  {
    id: 'q3',
    hint: 'Thang đo phổ biến nhất dùng để đánh giá cường độ của một trận động đất là gì?',
    answer: 'Thang Richter',
    options: ['Thang Richter', 'Thang Celsius', 'Thang độ ẩm', 'Thang Beaufort'],
  },
  {
    id: 'q4',
    hint: 'Nguyên nhân chủ yếu gây ra động đất là gì?',
    answer: 'Sự dịch chuyển của các mảng kiến tạo',
    options: ['Sự dịch chuyển của các mảng kiến tạo', 'Lực hút của Mặt Trăng', 'Sự phun trào của núi lửa nhỏ', 'Biến đổi khí hậu'],
  }
];

interface EarthquakeSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function EarthquakeSim({ customParams, customQuestions, onComplete }: EarthquakeSimProps) {
  const [activeTab, setActiveTab] = useState('sim');
  const [magnitude, setMagnitude] = useState(1); // Richter scale 1 to 9
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : ALL_QUESTIONS;

  // Render loop
  useEffect(() => {
    let animationId: number;
    let time = 0;
    
    let waveRadius = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      
      // Calculate screen shake based on magnitude
      // Magnitude 1-3: unnoticeable
      // Magnitude 4-5: light shake
      // Magnitude 6-7: strong shake
      // Magnitude 8-9: violent shake
      let shakeIntensity = 0;
      if (magnitude >= 4) {
          shakeIntensity = Math.pow(magnitude - 3, 1.5) * 0.5;
      }
      
      const shakeX = (Math.random() - 0.5) * shakeIntensity * 2;
      const shakeY = (Math.random() - 0.5) * shakeIntensity * 2;

      ctx.save();
      ctx.clearRect(0, 0, w, h);
      
      // Apply camera shake if magnitude > 3 and activeTab is sim
      if (activeTab === 'sim') {
          ctx.translate(shakeX, shakeY);
      }

      // Sky
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, w, h * 0.4);

      // ─── TERRAIN CROSS-SECTION ───
      const groundY = h * 0.4;
      
      // Crust (Lớp vỏ)
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, groundY, w, h * 0.6);
      
      // Soil texture
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for(let i=0; i<100; i++) {
          ctx.beginPath();
          ctx.arc((i*87)%w, groundY + (i*53)%(h*0.6), 2, 0, Math.PI*2);
          ctx.fill();
      }

      // Fault line
      const faultCenterX = w * 0.5;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(faultCenterX + 50, groundY);
      ctx.lineTo(faultCenterX, groundY + h * 0.2);
      ctx.lineTo(faultCenterX - 20, groundY + h * 0.4);
      ctx.lineTo(faultCenterX + 30, h);
      ctx.stroke();

      // ─── SEISMIC WAVES ───
      const hypocenterX = faultCenterX - 10;
      const hypocenterY = groundY + h * 0.3; // Chấn tiêu
      const epicenterX = faultCenterX + 50;
      const epicenterY = groundY; // Chấn tâm
      
      if (magnitude > 1) {
          // Wave expands
          waveRadius += 3 + magnitude;
          if (waveRadius > w) waveRadius = 0;
          
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 - (waveRadius/w)})`;
          ctx.lineWidth = magnitude;
          
          // Draw multiple concentric waves
          for (let i = 0; i < 4; i++) {
              const r = waveRadius - i * 40;
              if (r > 0) {
                  ctx.beginPath();
                  ctx.arc(hypocenterX, hypocenterY, r, 0, Math.PI * 2);
                  ctx.stroke();
              }
          }
      } else {
          waveRadius = 0;
      }

      // Draw Hypocenter (Chấn tiêu)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(hypocenterX, hypocenterY, 10, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Chấn tiêu', hypocenterX + 15, hypocenterY + 5);

      // Draw Epicenter (Chấn tâm)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(epicenterX, epicenterY, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
      ctx.fillText('Chấn tâm', epicenterX - 30, epicenterY - 15);
      ctx.shadowBlur = 0;

      // ─── BUILDINGS & CITY ───
      // Draw city at epicenter and further away
      const buildings = [
          { x: epicenterX - 80, w: 40, h: 80, color: '#94a3b8' },
          { x: epicenterX + 20, w: 50, h: 120, color: '#cbd5e1' }, // Right on epicenter
          { x: epicenterX + 150, w: 60, h: 60, color: '#64748b' },
          { x: epicenterX - 250, w: 45, h: 90, color: '#94a3b8' }
      ];
      
      buildings.forEach(b => {
          // Calculate distance from epicenter
          const dist = Math.abs(b.x - epicenterX);
          
          // Damage logic based on magnitude and distance
          let damage = 0;
          if (magnitude >= 7) {
              damage = Math.max(0, 1 - dist/200); // 1 = destroyed, 0 = fine
          } else if (magnitude >= 5) {
              damage = Math.max(0, 0.5 - dist/300); // Partial damage
          }
          
          // Draw building
          ctx.save();
          if (damage > 0.8) {
              // Collapsed
              ctx.fillStyle = '#475569';
              ctx.beginPath();
              ctx.moveTo(b.x - 10, groundY);
              ctx.lineTo(b.x + b.w/2, groundY - b.h * 0.3);
              ctx.lineTo(b.x + b.w + 10, groundY);
              ctx.fill();
              
              ctx.fillStyle = 'red';
              ctx.font = 'bold 20px Arial';
              ctx.fillText('Đổ sập', b.x, groundY - 20);
          } else {
              // Swaying
              let sway = 0;
              if (magnitude >= 4) {
                  // Taller buildings sway more
                  sway = Math.sin(time * 0.5) * (magnitude - 3) * (b.h / 50) * (1 - dist/400);
              }
              
              ctx.translate(b.x + b.w/2, groundY);
              ctx.rotate(sway * Math.PI / 180);
              ctx.translate(-(b.x + b.w/2), -groundY);
              
              ctx.fillStyle = b.color;
              ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
              ctx.strokeStyle = '#1e293b';
              ctx.strokeRect(b.x, groundY - b.h, b.w, b.h);
              
              // Windows
              ctx.fillStyle = '#fef08a';
              for(let wx = b.x + 5; wx < b.x + b.w - 10; wx += 15) {
                  for(let wy = groundY - b.h + 10; wy < groundY - 10; wy += 20) {
                      if (damage > 0.4 && Math.random() > 0.5) {
                          ctx.fillStyle = '#000'; // Broken window
                      } else {
                          ctx.fillStyle = '#fef08a'; 
                      }
                      ctx.fillRect(wx, wy, 10, 12);
                  }
              }
              
              if (damage > 0.4) {
                  // Draw cracks
                  ctx.strokeStyle = '#000';
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(b.x + 10, groundY - b.h);
                  ctx.lineTo(b.x + b.w - 10, groundY - b.h * 0.5);
                  ctx.lineTo(b.x + 5, groundY);
                  ctx.stroke();
              }
          }
          ctx.restore();
      });
      
      ctx.restore(); // Restore camera translation

      // ─── DASHBOARD (Fixed to screen) ───
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(10, 10, 260, 90);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`Độ Richter: ${magnitude.toFixed(1)}`, 20, 35);
      
      // Magnitude Description
      let magDesc = "Không cảm nhận được";
      let magColor = "#a3e635"; // Green
      if (magnitude >= 8) { magDesc = "Thảm họa hủy diệt hoàn toàn"; magColor = "#7f1d1d"; }
      else if (magnitude >= 7) { magDesc = "Động đất lớn, thiệt hại nặng"; magColor = "#dc2626"; }
      else if (magnitude >= 6) { magDesc = "Động đất mạnh, nhà cửa nứt gãy"; magColor = "#ea580c"; }
      else if (magnitude >= 5) { magDesc = "Đồ đạc rơi vỡ, mọi người hoảng loạn"; magColor = "#f59e0b"; }
      else if (magnitude >= 4) { magDesc = "Cảm nhận rõ rung lắc như xe tải đi qua"; magColor = "#eab308"; }
      else if (magnitude >= 3) { magDesc = "Rung động nhẹ"; magColor = "#84cc16"; }
      
      ctx.fillStyle = magColor;
      ctx.font = '14px Arial';
      
      // Word wrap
      const words = magDesc.split(' ');
      let line = '';
      let y = 60;
      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 240 && n > 0) {
          ctx.fillText(line, 20, y);
          line = words[n] + ' ';
          y += 20;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 20, y);

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [magnitude, activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Động đất (Earthquake)" />
      
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

          {/* BOTTOM CONTROLS */}
          <div style={{ padding: '20px 30px', background: '#1e293b', borderTop: '1px solid #334155' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc' }}>Kéo thanh trượt để tạo Động đất (Độ Richter)</span>
                <span style={{ fontSize: 18, fontWeight: 'bold', color: magnitude >= 6 ? '#ef4444' : '#f59e0b' }}>
                    M = {magnitude.toFixed(1)}
                </span>
             </div>
             <input 
                type="range" 
                min="1" max="9" step="0.5" 
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', height: 8, accentColor: '#ef4444' }}
             />
             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: '#94a3b8' }}>
                <span>1.0 (Không cảm thấy)</span>
                <span>5.0 (Trung bình)</span>
                <span>9.0 (Hủy diệt)</span>
             </div>
          </div>

        </div>

        {/* RIGHT PANEL: Controls & Quiz */}
        <div style={{ width: 340, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <SimTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {activeTab === 'sim' ? (
                <div>
                    <h3 style={{ color: '#ef4444', marginTop: 0 }}>Cấu trúc một trận Động đất</h3>
                    <ul style={{ fontSize: 14, color: '#cbd5e1', paddingLeft: 20, lineHeight: 1.6 }}>
                        <li><b>Chấn tiêu (Hypocenter):</b> Điểm xuất phát đứt gãy nằm sâu trong vỏ Trái Đất. Tại đây phát sinh ra sóng địa chấn.</li>
                        <li><b>Chấn tâm (Epicenter):</b> Điểm trên mặt đất nằm theo phương thẳng đứng ngay phía trên chấn tiêu. Đây là nơi chịu rung lắc và tàn phá nặng nề nhất.</li>
                        <li><b>Sóng địa chấn:</b> Năng lượng truyền đi dưới dạng sóng. Càng ra xa chấn tâm, biên độ sóng càng giảm dần.</li>
                    </ul>
                    
                    <div style={{ marginTop: 20, padding: 15, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8 }}>
                        <div style={{ fontWeight: 'bold', color: '#f87171', marginBottom: 5 }}>Hướng dẫn:</div>
                        <div style={{ fontSize: 13, color: '#fca5a5' }}>
                            Kéo thanh trượt lên mức <b>7.0 - 9.0</b>. Bạn sẽ thấy nhà cửa ngay tại <b>Chấn tâm</b> bị đổ sập hoàn toàn do chịu tác động trực tiếp của lực phá hủy.
                        </div>
                    </div>
                </div>
            ) : activeTab === 'richter' ? (
                <div>
                    <h3 style={{ color: '#f59e0b', marginTop: 0 }}>Thang đo Richter</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        Thang Richter là thang logarit. Nghĩa là động đất độ 5 có biên độ chấn động lớn gấp <b>10 lần</b> so với độ 4, và tỏa ra năng lượng gấp <b>32 lần</b>.
                    </p>
                    <table style={{ width: '100%', fontSize: 13, marginTop: 15, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#334155' }}>
                                <th style={{ padding: 8, textAlign: 'left' }}>Độ</th>
                                <th style={{ padding: 8, textAlign: 'left' }}>Mức độ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: 8 }}>&lt; 3.0</td><td style={{ padding: 8 }}>Vi chấn (Khó cảm nhận)</td></tr>
                            <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: 8 }}>4.0-4.9</td><td style={{ padding: 8 }}>Nhẹ (Đồ vật rung lắc)</td></tr>
                            <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: 8 }}>5.0-5.9</td><td style={{ padding: 8 }}>Trung bình (Nhà cửa có thể nứt)</td></tr>
                            <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: 8, color: '#ea580c' }}>6.0-6.9</td><td style={{ padding: 8, color: '#ea580c' }}>Mạnh (Thiệt hại trên diện rộng)</td></tr>
                            <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: 8, color: '#dc2626' }}>7.0-7.9</td><td style={{ padding: 8, color: '#dc2626' }}>Rất mạnh (Nhà cửa sụp đổ)</td></tr>
                            <tr><td style={{ padding: 8, color: '#7f1d1d', fontWeight: 'bold' }}>&gt; 8.0</td><td style={{ padding: 8, color: '#7f1d1d', fontWeight: 'bold' }}>Hủy diệt hoàn toàn</td></tr>
                        </tbody>
                    </table>
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
