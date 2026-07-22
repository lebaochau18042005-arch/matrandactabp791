import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'overview',      label: '🌐 Toàn cảnh',        color: '#0ea5e9' },
  { id: 'evaporation',   label: '☀️ Bốc hơi',          color: '#f59e0b' },
  { id: 'condensation',  label: '☁️ Ngưng tụ',         color: '#64748b' },
  { id: 'precipitation', label: '🌧️ Giáng thủy (Mưa)', color: '#3b82f6' },
  { id: 'collection',    label: '🌊 Dòng chảy',        color: '#10b981' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Nguồn năng lượng chính thúc đẩy vòng tuần hoàn nước',
    answer: 'Mặt Trời',
    options: ['Mặt Trời', 'Gió', 'Thủy triều', 'Lõi Trái Đất'],
  },
  {
    id: 'q2',
    hint: 'Quá trình nước chuyển từ thể lỏng sang thể khí',
    answer: 'Bốc hơi',
    options: ['Bốc hơi', 'Ngưng tụ', 'Đóng băng', 'Thẩm thấu'],
  },
  {
    id: 'q3',
    hint: 'Quá trình hơi nước tạo thành mây',
    answer: 'Ngưng tụ',
    options: ['Bốc hơi', 'Ngưng tụ', 'Giáng thủy', 'Thăng hoa'],
  },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  overview: ALL_QUESTIONS,
  evaporation: [
    { id: 'e1', hint: 'Nước bốc hơi nhiều nhất ở đâu?', answer: 'Đại dương', options: ['Đại dương', 'Sông hồ', 'Rừng cây', 'Mặt đất'] },
    { id: 'e2', hint: 'Thực vật tham gia vào quá trình bốc hơi qua hiện tượng gì?', answer: 'Thoát hơi nước', options: ['Thoát hơi nước', 'Quang hợp', 'Hô hấp', 'Bài tiết'] },
  ],
  condensation: [
    { id: 'c1', hint: 'Khi hơi nước bốc lên cao, nhiệt độ thay đổi thế nào khiến nó ngưng tụ?', answer: 'Lạnh đi', options: ['Lạnh đi', 'Nóng lên', 'Không đổi', 'Lúc nóng lúc lạnh'] },
    { id: 'c2', hint: 'Ngưng tụ tạo ra hiện tượng gì trên bầu trời?', answer: 'Mây', options: ['Mây', 'Gió', 'Bão cát', 'Cầu vồng'] },
  ],
  precipitation: [
    { id: 'p1', hint: 'Giáng thủy bao gồm các hiện tượng nào?', answer: 'Mưa, tuyết, mưa đá', options: ['Mưa, tuyết, mưa đá', 'Gió, sương mù', 'Bão, lốc xoáy', 'Sấm, chớp'] },
    { id: 'p2', hint: 'Mưa xảy ra khi nào?', answer: 'Hạt nước trong mây đủ nặng', options: ['Hạt nước trong mây đủ nặng', 'Có gió mạnh', 'Trời tối', 'Mây màu trắng'] },
  ],
  collection: [
    { id: 'cl1', hint: 'Nước mưa thấm xuống đất tạo thành gì?', answer: 'Nước ngầm', options: ['Nước ngầm', 'Sông ngòi', 'Băng tuyết', 'Hơi nước'] },
    { id: 'cl2', hint: 'Phần lớn dòng chảy trên mặt đất cuối cùng đổ về đâu?', answer: 'Đại dương', options: ['Đại dương', 'Hồ', 'Đồng bằng', 'Núi'] },
  ],
};

// ─── Stage info panels ────────────────────────────────────────────────────────
const STAGE_INFO: Record<string, { name: string; icon: string; desc: string; detail: string; color: string }> = {
  evaporation: {
    name: 'Bốc hơi & Thoát hơi',
    icon: '☀️',
    desc: 'Nước chuyển từ lỏng sang khí do nhiệt của Mặt Trời.',
    detail: 'Khoảng 86% lượng hơi nước toàn cầu xuất phát từ đại dương. Ngoài ra, thực vật cũng đóng góp lượng lớn qua quá trình thoát hơi nước qua lá.',
    color: '#f59e0b',
  },
  condensation: {
    name: 'Ngưng tụ',
    icon: '☁️',
    desc: 'Hơi nước bay lên cao, gặp lạnh biến thành hạt nước nhỏ.',
    detail: 'Các hạt nước nhỏ li ti kết tụ lại với nhau xung quanh các hạt bụi trong không khí để tạo thành những đám mây.',
    color: '#94a3b8',
  },
  precipitation: {
    name: 'Giáng thủy (Mưa)',
    icon: '🌧️',
    desc: 'Hạt nước lớn dần và rơi xuống do trọng lực.',
    detail: 'Khi các đám mây chứa quá nhiều nước và hạt nước đủ nặng, chúng rơi xuống bề mặt Trái Đất dưới dạng mưa, tuyết, hoặc mưa đá.',
    color: '#3b82f6',
  },
  collection: {
    name: 'Dòng chảy & Tích tụ',
    icon: '🌊',
    desc: 'Nước chảy trên bề mặt hoặc thấm xuống đất thành nước ngầm.',
    detail: 'Nước chảy ra sông, suối rồi đổ về biển, hoặc thấm sâu tạo thành các tầng chứa nước ngầm. Chu trình lại tiếp tục từ đây.',
    color: '#10b981',
  },
};

interface WaterCycleSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function WaterCycleSim({ customParams, customQuestions, onComplete }: WaterCycleSimProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use custom questions if provided, otherwise default based on active tab
  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : TAB_QUESTIONS[activeTab];

  // Map tab id to stage id
  useEffect(() => {
    if (activeTab === 'overview') setActiveStage(null);
    else setActiveStage(activeTab);
  }, [activeTab]);

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
      
      // 1. Background Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#38bdf8'); // light blue
      skyGrad.addColorStop(1, '#e0f2fe'); // very light blue near horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Sun
      const isEvap = activeStage === 'evaporation' || !activeStage;
      ctx.save();
      const sunX = w * 0.15;
      const sunY = h * 0.2;
      
      // Sun rays animation
      if (isEvap) {
        ctx.translate(sunX, sunY);
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
      }
      
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047'; // yellow
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = isEvap ? 40 : 20;
      ctx.fill();
      ctx.restore();

      // 3. Mountains & Land
      // Back mountains
      ctx.beginPath();
      ctx.moveTo(w * 0.4, h);
      ctx.lineTo(w * 0.7, h * 0.3);
      ctx.lineTo(w * 0.9, h * 0.5);
      ctx.lineTo(w, h * 0.4);
      ctx.lineTo(w, h);
      ctx.fillStyle = '#64748b'; // slate
      ctx.fill();

      // Front land
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h);
      ctx.quadraticCurveTo(w * 0.4, h * 0.65, w * 0.6, h * 0.7);
      ctx.lineTo(w, h * 0.7);
      ctx.lineTo(w, h);
      ctx.fillStyle = '#22c55e'; // green land
      ctx.fill();
      
      // River / Collection
      ctx.beginPath();
      ctx.moveTo(w * 0.55, h * 0.7);
      ctx.quadraticCurveTo(w * 0.5, h * 0.85, w * 0.4, h);
      ctx.lineTo(w * 0.25, h);
      ctx.quadraticCurveTo(w * 0.4, h * 0.8, w * 0.5, h * 0.7);
      ctx.fillStyle = '#3b82f6'; // river blue
      ctx.fill();

      // Ocean
      ctx.beginPath();
      ctx.moveTo(0, h * 0.75);
      ctx.quadraticCurveTo(w * 0.1, h * 0.75 + Math.sin(time*0.05)*5, w * 0.3, h * 0.8);
      ctx.quadraticCurveTo(w * 0.4, h * 0.85, w * 0.4, h);
      ctx.lineTo(0, h);
      const oceanGrad = ctx.createLinearGradient(0, h*0.75, 0, h);
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(1, '#0ea5e9');
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // 4. Groundwater (Underground)
      if (activeStage === 'collection' || !activeStage) {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h);
        ctx.lineTo(w * 0.6, h * 0.85);
        ctx.lineTo(w, h * 0.85);
        ctx.lineTo(w, h);
        ctx.fill();
        
        // Flow arrows for groundwater
        const gwX = w * 0.8 - (time % 100);
        drawArrow(ctx, gwX, h * 0.92, gwX - 20, h * 0.92, 'rgba(255,255,255,0.6)');
      }

      // 5. Animations based on stage

      // A. Evaporation Arrows (Ocean & Trees)
      if (activeStage === 'evaporation' || !activeStage) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        for(let i=0; i<5; i++) {
            const evX = w * 0.1 + i * 40;
            const evY = h * 0.75 - ((time * 0.5 + i * 20) % 100);
            ctx.beginPath();
            ctx.moveTo(evX, evY);
            ctx.lineTo(evX, evY - 15);
            ctx.stroke();
        }
        
        // Tree transpiration
        const trX = w * 0.7;
        const trY = h * 0.65 - ((time * 0.5) % 60);
        ctx.beginPath();
        ctx.moveTo(trX, trY);
        ctx.lineTo(trX, trY - 15);
        ctx.stroke();
        ctx.restore();
      }

      // B. Condensation (Clouds forming/moving)
      const isCond = activeStage === 'condensation';
      const isPrec = activeStage === 'precipitation';
      
      // Cloud 1 (Evaporating -> Condensing)
      drawCloud(ctx, w * 0.2 + (time * 0.2) % 50, h * 0.3, isCond ? 1.2 : 1, isCond ? '#cbd5e1' : '#ffffff');
      
      // Cloud 2 (Over land, getting dark)
      drawCloud(ctx, w * 0.5 + (time * 0.1) % 50, h * 0.25, 1.5, (isPrec || isCond) ? '#94a3b8' : '#ffffff');
      
      // Cloud 3 (Mountain top, raining)
      drawCloud(ctx, w * 0.7, h * 0.2, 1.8, isPrec ? '#64748b' : '#e2e8f0');

      // C. Precipitation (Rain)
      if (isPrec || !activeStage) {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        for(let i=0; i<30; i++) {
            const rx = w * 0.65 + Math.random() * 150; // rain under mountain cloud
            const ryStart = h * 0.25;
            const ry = ryStart + ((time * 4 + i * 15) % 200);
            
            // Only draw if above ground roughly
            if (ry < h * 0.7 - (rx - w*0.65)*0.5) {
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx - 5, ry + 10);
                ctx.stroke();
            }
        }
      }

      // D. Collection/Runoff (Arrows on river and surface)
      if (activeStage === 'collection' || !activeStage) {
        const flowY = h * 0.75 + (time % 50);
        const flowX = w * 0.48 - (time % 50)*0.5; // simple approx along river
        
        if (flowY < h) {
             drawArrow(ctx, flowX + 10, flowY - 10, flowX, flowY, 'rgba(255,255,255,0.8)');
        }
      }

      // Draw Trees
      drawTree(ctx, w * 0.65, h * 0.68, 0.8);
      drawTree(ctx, w * 0.75, h * 0.65, 1);
      drawTree(ctx, w * 0.85, h * 0.69, 0.6);

      // Labels on canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      
      const drawLabel = (text: string, x: number, y: number, highlightId: string) => {
          const isActive = activeStage === highlightId;
          ctx.save();
          if (isActive) {
              ctx.shadowColor = '#fbbf24';
              ctx.shadowBlur = 10;
              ctx.fillStyle = '#fbbf24'; // highlight
          } else {
              ctx.fillStyle = '#ffffff';
          }
          ctx.fillText(text, x, y);
          ctx.restore();
      };

      drawLabel('BỐC HƠI', w * 0.2, h * 0.6, 'evaporation');
      drawLabel('NGƯNG TỤ', w * 0.5, h * 0.18, 'condensation');
      drawLabel('GIÁNG THỦY (MƯA)', w * 0.75, h * 0.4, 'precipitation');
      drawLabel('DÒNG CHẢY', w * 0.45, h * 0.85, 'collection');

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [activeStage]);

  // Canvas drawing helpers
  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 20, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(15, -15, 25, Math.PI * 1, Math.PI * 1.85);
    ctx.arc(40, -5, 20, Math.PI * 1.3, Math.PI * 0.1);
    ctx.arc(35, 10, 15, 0, Math.PI);
    ctx.fill();
    ctx.restore();
  };

  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-4, 0, 8, 20);
    // Leaves
    ctx.fillStyle = '#15803d';
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
  
  const drawArrow = (ctx: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number, color: string) => {
    const headlen = 10; // length of head in pixels
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const info = activeStage ? STAGE_INFO[activeStage] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Vòng tuần hoàn nước" />
      
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
          {info && (
            <div style={{
              position: 'absolute', top: 20, left: 20, width: 300,
              background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
              padding: 20, borderRadius: 16, border: `1px solid ${info.color}`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              transform: 'translateY(0)', transition: 'all 0.3s ease',
              animation: 'fadeInUp 0.4s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{info.icon}</div>
                <h3 style={{ margin: 0, fontSize: 20, color: info.color }}>
                  {info.name}
                </h3>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 12 }}>
                {info.desc}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                {info.detail}
              </p>
            </div>
          )}

          {/* Legend for overview */}
          {!info && (
            <div style={{
              position: 'absolute', bottom: 20, left: 20,
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
              padding: '12px 16px', borderRadius: 12, border: '1px solid #334155'
            }}>
              <div style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 4, fontWeight: 600 }}>💡 Vòng tuần hoàn khép kín</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Nước không bao giờ mất đi, chúng chỉ di chuyển từ đại dương lên không trung, rơi xuống đất liền và lại chảy về đại dương.
                <br/><br/>
                👉 <strong>Chọn các tab bên phải</strong> để khám phá chi tiết từng giai đoạn.
              </div>
            </div>
          )}
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
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
