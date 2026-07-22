import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'overview',     label: '🌐 Tổng quan',         color: '#0ea5e9' },
  { id: 'troposphere',  label: '☁️ Tầng đối lưu',      color: '#3b82f6' },
  { id: 'stratosphere', label: '✈️ Tầng bình lưu',      color: '#8b5cf6' },
  { id: 'mesosphere',   label: '☄️ Tầng trung lưu',     color: '#d946ef' },
  { id: 'thermosphere', label: '✨ Nhiệt quyển',        color: '#f43f5e' },
  { id: 'exosphere',    label: '🛰️ Ngoại quyển',        color: '#10b981' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Tầng tập trung 80% khối lượng không khí',
    answer: 'Tầng đối lưu',
    options: ['Tầng đối lưu', 'Tầng bình lưu', 'Tầng trung lưu', 'Ngoại quyển'],
  },
  {
    id: 'q2',
    hint: 'Tầng chứa lớp ô-dôn (O3) bảo vệ Trái Đất',
    answer: 'Tầng bình lưu',
    options: ['Tầng đối lưu', 'Tầng bình lưu', 'Nhiệt quyển', 'Ngoại quyển'],
  },
  {
    id: 'q3',
    hint: 'Nơi xuất hiện hiện tượng cực quang',
    answer: 'Nhiệt quyển',
    options: ['Tầng đối lưu', 'Tầng bình lưu', 'Tầng trung lưu', 'Nhiệt quyển'],
  },
];

const TAB_QUESTIONS: Record<string, ActivityQuestion[]> = {
  overview: ALL_QUESTIONS,
  troposphere: [
    { id: 't1', hint: 'Hiện tượng thời tiết (mây, mưa) xảy ra ở tầng nào?', answer: 'Tầng đối lưu', options: ['Tầng đối lưu', 'Tầng bình lưu', 'Nhiệt quyển', 'Tầng trung lưu'] },
    { id: 't2', hint: 'Nhiệt độ ở tầng đối lưu thay đổi thế nào theo độ cao?', answer: 'Càng lên cao càng giảm', options: ['Càng lên cao càng giảm', 'Càng lên cao càng tăng', 'Không thay đổi', 'Tăng giảm thất thường'] },
  ],
  stratosphere: [
    { id: 's1', hint: 'Lớp Ô-dôn (O3) có tác dụng gì?', answer: 'Hấp thụ tia cực tím', options: ['Hấp thụ tia cực tím', 'Tạo ra mưa', 'Hút thiên thạch', 'Tạo từ trường'] },
    { id: 's2', hint: 'Đáy tầng bình lưu có nhiệt độ khoảng bao nhiêu?', answer: '-50°C', options: ['-50°C', '0°C', '20°C', '100°C'] },
  ],
  mesosphere: [
    { id: 'm1', hint: 'Hiện tượng gì thường xảy ra ở tầng trung lưu?', answer: 'Sao băng bốc cháy', options: ['Sao băng bốc cháy', 'Cực quang', 'Mây bão', 'Cầu vồng'] },
  ],
  thermosphere: [
    { id: 'th1', hint: 'Nhiệt quyển còn được gọi là gì?', answer: 'Tầng điện li', options: ['Tầng điện li', 'Tầng ô-dôn', 'Tầng sinh quyển', 'Tầng đối lưu'] },
    { id: 'th2', hint: 'Nhiệt độ ở nhiệt quyển có thể đạt đến bao nhiêu?', answer: '> 1000°C', options: ['> 1000°C', '0°C', '-100°C', '50°C'] },
  ],
  exosphere: [
    { id: 'e1', hint: 'Đặc điểm không khí ở ngoại quyển?', answer: 'Rất loãng', options: ['Rất loãng', 'Rất đặc', 'Chứa nhiều hơi nước', 'Nhiều ô-xy'] },
  ],
};

// ─── Layer info panels ────────────────────────────────────────────────────────
const LAYER_INFO: Record<string, { name: string; height: string; temp: string; feature: string; color: string; note: string }> = {
  troposphere: {
    name: 'Tầng đối lưu',
    height: '0 – 16 km',
    temp: 'Giảm dần (xuống -50°C)',
    feature: 'Thời tiết',
    color: '#3b82f6',
    note: 'Nơi diễn ra các hiện tượng thời tiết: mây, mưa, bão... Tập trung 80% không khí.',
  },
  stratosphere: {
    name: 'Tầng bình lưu',
    height: '16 – 50 km',
    temp: 'Tăng dần (lên ~0°C)',
    feature: 'Lớp Ô-dôn',
    color: '#8b5cf6',
    note: 'Chứa lớp Ô-dôn hấp thụ tia UV từ Mặt Trời. Không khí khô, máy bay thường bay ở đây.',
  },
  mesosphere: {
    name: 'Tầng trung lưu',
    height: '50 – 85 km',
    temp: 'Giảm mạnh (xuống -90°C)',
    feature: 'Sao băng',
    color: '#d946ef',
    note: 'Tầng lạnh nhất của khí quyển. Thiên thạch thường bốc cháy khi cọ xát với tầng này.',
  },
  thermosphere: {
    name: 'Nhiệt quyển',
    height: '85 – 600 km',
    temp: 'Tăng cực nhanh (> 1000°C)',
    feature: 'Cực quang',
    color: '#f43f5e',
    note: 'Còn gọi là tầng điện li. Nơi phản xạ sóng vô tuyến và diễn ra hiện tượng cực quang.',
  },
  exosphere: {
    name: 'Ngoại quyển',
    height: '> 600 km',
    temp: 'Thay đổi tùy theo ngày đêm',
    feature: 'Vệ tinh',
    color: '#10b981',
    note: 'Không khí cực kì loãng. Ranh giới chuyển tiếp vào không gian vũ trụ.',
  },
};

interface AtmosphericStructureSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function AtmosphericStructureSim({ customParams, customQuestions, onComplete }: AtmosphericStructureSimProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use custom questions if provided, otherwise default based on active tab
  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : TAB_QUESTIONS[activeTab];

  // Map tab id to layer id
  useEffect(() => {
    if (activeTab === 'overview') setActiveLayer(null);
    else setActiveLayer(activeTab);
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
      
      // Clear canvas with space background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
      bgGradient.addColorStop(0, '#020617'); // Deep space
      bgGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, w, h);

      // Draw stars (twinkling)
      ctx.save();
      for (let i = 0; i < 100; i++) {
        const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * w;
        const y = (Math.cos(i * 321.65) * 0.5 + 0.5) * h * 0.7; // mostly upper part
        const r = Math.abs(Math.sin(time * 0.05 + i)) * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }
      ctx.restore();

      // Definitions for layers (from bottom to top)
      // We will scale heights: total h is 800px. Earth surface at h - 100.
      const earthY = h - 50;
      
      const layers = [
        { id: 'troposphere', label: 'Tầng đối lưu', color1: '#bae6fd', color2: '#38bdf8', yTop: earthY - 100, yBottom: earthY, height: 16 },
        { id: 'stratosphere', label: 'Tầng bình lưu', color1: '#38bdf8', color2: '#818cf8', yTop: earthY - 250, yBottom: earthY - 100, height: 34 },
        { id: 'mesosphere', label: 'Tầng trung lưu', color1: '#818cf8', color2: '#c084fc', yTop: earthY - 400, yBottom: earthY - 250, height: 35 },
        { id: 'thermosphere', label: 'Nhiệt quyển', color1: '#c084fc', color2: '#f472b6', yTop: earthY - 600, yBottom: earthY - 400, height: 515 },
        { id: 'exosphere', label: 'Ngoại quyển', color1: '#f472b6', color2: 'transparent', yTop: 0, yBottom: earthY - 600, height: '...' },
      ];

      // Draw Earth curve at bottom
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, earthY + w * 2.5, w * 2.5, 0, Math.PI * 2);
      const earthGrad = ctx.createRadialGradient(w/2, earthY + w * 2.5, w * 2.4, w/2, earthY + w * 2.5, w * 2.5);
      earthGrad.addColorStop(0, '#22c55e');
      earthGrad.addColorStop(1, '#166534');
      ctx.fillStyle = earthGrad;
      ctx.fill();
      
      // Draw Earth glow
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();

      // Draw Layers
      layers.forEach((layer) => {
        const isHoveredOrActive = activeLayer === layer.id || (!activeLayer && activeTab === 'overview');
        const isActive = activeLayer === layer.id;
        
        ctx.save();
        
        // Layer bounds
        const layerH = layer.yBottom - layer.yTop;
        
        // Gradient
        const grad = ctx.createLinearGradient(0, layer.yBottom, 0, layer.yTop);
        grad.addColorStop(0, layer.color1);
        grad.addColorStop(1, layer.color2);
        
        ctx.fillStyle = grad;
        // Adjust opacity based on selection
        ctx.globalAlpha = isActive ? 0.35 : (activeLayer ? 0.05 : 0.2);
        
        if (layer.id === 'exosphere') {
            ctx.fillRect(0, 0, w, layer.yBottom);
        } else {
            ctx.fillRect(0, layer.yTop, w, layerH);
        }

        // Draw dividing line
        ctx.beginPath();
        ctx.moveTo(0, layer.yTop);
        ctx.lineTo(w, layer.yTop);
        ctx.strokeStyle = isActive ? layer.color2 : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isActive ? 2 : 1;
        if (!isActive && activeLayer) ctx.globalAlpha = 0.1;
        else ctx.globalAlpha = 1;
        
        // Only draw dashed line if not exosphere top
        if (layer.id !== 'exosphere') {
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        ctx.restore();
        
        // Draw animations/features for each layer
        ctx.save();
        ctx.globalAlpha = isHoveredOrActive ? 1 : (activeLayer ? 0.2 : 0.8);
        
        if (layer.id === 'troposphere') {
            // Draw clouds
            const cloudX = (time * 0.5) % (w + 100) - 50;
            drawCloud(ctx, cloudX, layer.yTop + 40, 30);
            drawCloud(ctx, w - (time * 0.3) % (w + 100) + 50, layer.yBottom - 20, 20);
            
            // Draw rain if active
            if (isActive) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                for(let i=0; i<20; i++) {
                    const rx = (cloudX - 20 + i*10 + time*5) % 60 + cloudX - 30;
                    const ry = layer.yTop + 50 + ((time * 3 + i*20) % 40);
                    if (rx > 0 && rx < w) {
                        ctx.beginPath();
                        ctx.arc(rx, ry, 1.5, 0, Math.PI*2);
                        ctx.fill();
                    }
                }
            }
        } else if (layer.id === 'stratosphere') {
            // Draw ozone layer glow
            ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
            ctx.fillRect(0, layer.yBottom - 40, w, 30);
            
            // Draw plane
            const planeX = (time * 2) % (w + 200) - 100;
            ctx.font = '24px Arial';
            ctx.fillText('✈️', planeX, layer.yBottom - 50);
            
            if (isActive) {
                ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
                ctx.font = '12px sans-serif';
                ctx.fillText('Ozone (O₃)', 20, layer.yBottom - 20);
            }
        } else if (layer.id === 'mesosphere') {
            // Meteors
            const mTime = time % 100;
            if (mTime > 50 && mTime < 80) {
                const mx = w/2 + (mTime-50)*10;
                const my = layer.yTop + (mTime-50)*8;
                ctx.beginPath();
                ctx.moveTo(mx, my);
                ctx.lineTo(mx - 20, my - 16);
                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(mx, my, 2, 0, Math.PI*2);
                ctx.fillStyle = '#fef08a';
                ctx.fill();
            }
            if (isActive) {
                ctx.font = '24px Arial';
                ctx.fillText('☄️', w*0.7, layer.yTop + 50);
            }
        } else if (layer.id === 'thermosphere') {
            // Aurora
            const ax1 = w * 0.3;
            const ay1 = layer.yBottom - 50 + Math.sin(time * 0.05) * 20;
            const ax2 = w * 0.7;
            const ay2 = layer.yBottom - 80 + Math.cos(time * 0.05) * 20;
            
            ctx.beginPath();
            ctx.moveTo(ax1 - 100, layer.yBottom - 20);
            ctx.quadraticCurveTo(ax1, ay1, w/2, layer.yBottom - 40);
            ctx.quadraticCurveTo(ax2, ay2, ax2 + 100, layer.yBottom - 10);
            ctx.strokeStyle = `rgba(52, 211, 153, ${isActive ? 0.6 : 0.3})`;
            ctx.lineWidth = 15;
            ctx.shadowColor = '#34d399';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            if (isActive) {
                // Draw space station
                const ssX = w - (time * 0.5) % (w + 100);
                ctx.font = '20px Arial';
                ctx.fillText('🛰️', ssX, layer.yTop + 100);
            }
        } else if (layer.id === 'exosphere') {
            // Satellite
            const satX = (time * 0.8) % (w + 100) - 50;
            ctx.font = '24px Arial';
            ctx.fillText('📡', satX, layer.yBottom - 100);
        }
        
        ctx.restore();
        
        // Draw labels
        ctx.save();
        ctx.fillStyle = isActive ? layer.color2 : (isHoveredOrActive ? '#e2e8f0' : 'rgba(255,255,255,0.4)');
        ctx.font = `bold ${isActive ? '20px' : '16px'} sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(layer.label, w - 20, layer.yBottom - (layer.id === 'exosphere' ? 50 : layerH/2) + 6);
        
        if (isActive || activeTab === 'overview') {
            ctx.font = '12px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText(layer.yTop === 0 ? '> 600km' : `${layer.height} km`, w - 20, layer.yBottom - (layer.id === 'exosphere' ? 50 : layerH/2) + 24);
        }
        ctx.restore();
      });
      
      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [activeTab, activeLayer]);

  // Helper function to draw clouds
  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x + size * 0.5, y - size * 0.3, size * 0.7, Math.PI * 1, Math.PI * 1.85);
    ctx.arc(x + size, y, size * 0.5, Math.PI * 1.5, Math.PI * 0.5);
    ctx.moveTo(x + size, y + size * 0.5);
    ctx.lineTo(x, y + size * 0.6);
    ctx.fill();
  };

  const info = activeLayer ? LAYER_INFO[activeLayer] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Cấu trúc Khí quyển" />
      
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL: Canvas & Info */}
        <div style={{ flex: 1, position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onMouseMove={(e) => {
              // Optional: hit testing for mouse interaction could be added here
            }}
          />

          {/* Overlay Info Card */}
          {info && (
            <div style={{
              position: 'absolute', top: 20, left: 20, width: 280,
              background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
              padding: 20, borderRadius: 16, border: `1px solid ${info.color}`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              transform: 'translateY(0)', transition: 'all 0.3s ease',
              animation: 'fadeInUp 0.4s ease-out'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 20, color: info.color, display: 'flex', alignItems: 'center', gap: 8 }}>
                {info.name}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Độ cao</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{info.height}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Nhiệt độ</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{info.temp}</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Đặc trưng</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{info.feature}</div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
                {info.note}
              </p>
            </div>
          )}

          {/* Legend */}
          {!info && (
            <div style={{
              position: 'absolute', bottom: 20, left: 20,
              background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
              padding: '10px 16px', borderRadius: 12, border: '1px solid #334155'
            }}>
              <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 4 }}>💡 <strong>Mẹo:</strong></div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Chọn các tab để xem chi tiết từng tầng khí quyển.</div>
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
