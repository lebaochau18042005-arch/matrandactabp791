import React, { useEffect, useRef, useState } from 'react';
import { SimActivity, SimTabs, SimTopBar, ActivityQuestion, SimTab } from './SimulationShell';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: SimTab[] = [
  { id: 'divergent', label: '⬅️ Tách giãn ➡️', color: '#3b82f6' },
  { id: 'convergent', label: '➡️ Xô đẩy ⬅️', color: '#ef4444' },
  { id: 'transform', label: '⬇️ Trượt ngang ⬆️', color: '#f59e0b' },
];

// ─── Activity questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'q1',
    hint: 'Sự tiếp xúc tách giãn của hai mảng kiến tạo dưới đại dương thường tạo ra địa hình gì?',
    answer: 'Sống núi ngầm dưới đại dương',
    options: ['Sống núi ngầm dưới đại dương', 'Vực biển sâu', 'Dãy núi uốn nếp cao', 'Đồng bằng phù sa'],
  },
  {
    id: 'q2',
    hint: 'Khi hai mảng lục địa xô vào nhau, kết quả thường tạo ra:',
    answer: 'Dãy núi uốn nếp',
    options: ['Dãy núi uốn nếp', 'Sống núi ngầm', 'Vực thẳm', 'Đảo núi lửa'],
  },
  {
    id: 'q3',
    hint: 'Sự trượt ngang giữa hai mảng kiến tạo thường gây ra hiện tượng gì?',
    answer: 'Đứt gãy và động đất',
    options: ['Đứt gãy và động đất', 'Phun trào núi lửa dữ dội', 'Tạo ra đại dương mới', 'Hình thành núi cao'],
  },
];

interface TectonicSimProps {
  customParams?: Record<string, any>;
  customQuestions?: ActivityQuestion[];
  onComplete?: (score: number) => void;
}

export default function TectonicSim({ customParams, customQuestions, onComplete }: TectonicSimProps) {
  const [activeTab, setActiveTab] = useState('divergent');
  const [progress, setProgress] = useState(0); // 0 to 100
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentQuestions = customQuestions && customQuestions.length > 0 
    ? customQuestions 
    : ALL_QUESTIONS;

  // Auto-play progress
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
      
      ctx.clearRect(0, 0, w, h);
      
      const p = progress / 100; // 0.0 to 1.0

      // Sky / Water Background
      if (activeTab === 'divergent') {
          // Underwater
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(0, 0, w, h * 0.4);
      } else if (activeTab === 'convergent') {
          // Sky
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(0, 0, w, h * 0.5);
      } else {
          // Top-down view or simple sky
          ctx.fillStyle = '#cbd5e1'; // Ground color if top-down
          ctx.fillRect(0, 0, w, h);
      }

      // Asthenosphere (Magma layer)
      if (activeTab !== 'transform') {
          const magmaY = activeTab === 'divergent' ? h * 0.7 : h * 0.8;
          ctx.fillStyle = '#ea580c'; // Magma
          ctx.fillRect(0, magmaY, w, h - magmaY);
          
          // Magma convection currents (dòng đối lưu)
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 3;
          
          if (activeTab === 'divergent') {
              // Arrows pointing up and diverging
              drawArrow(ctx, w/2 - 20, magmaY + 60, w/2 - 60, magmaY + 20);
              drawArrow(ctx, w/2 + 20, magmaY + 60, w/2 + 60, magmaY + 20);
          } else {
              // Arrows pointing down and converging
              drawArrow(ctx, w/2 - 80, magmaY + 20, w/2 - 30, magmaY + 60);
              drawArrow(ctx, w/2 + 80, magmaY + 20, w/2 + 30, magmaY + 60);
          }
      }

      // ─── 1. DIVERGENT (Tách giãn) ───
      if (activeTab === 'divergent') {
          // Plates moving apart
          const plateWidth = w * 0.45;
          const shift = p * 40; // max shift 40px
          
          // Left Plate
          ctx.fillStyle = '#57534e';
          ctx.beginPath();
          ctx.moveTo(0, h * 0.4);
          ctx.lineTo(w/2 - 10 - shift, h * 0.4);
          ctx.lineTo(w/2 - 30 - shift, h * 0.7);
          ctx.lineTo(0, h * 0.7);
          ctx.fill();
          
          // Right Plate
          ctx.fillStyle = '#57534e';
          ctx.beginPath();
          ctx.moveTo(w, h * 0.4);
          ctx.lineTo(w/2 + 10 + shift, h * 0.4);
          ctx.lineTo(w/2 + 30 + shift, h * 0.7);
          ctx.lineTo(w, h * 0.7);
          ctx.fill();
          
          // Magma rising to form mid-ocean ridge (sống núi ngầm)
          ctx.fillStyle = '#ef4444'; // Red hot magma
          ctx.beginPath();
          ctx.moveTo(w/2 - 30 - shift, h * 0.7);
          ctx.lineTo(w/2 - 5 - shift*0.5, h * 0.4 - p*30); // Ridge peak left
          ctx.lineTo(w/2 + 5 + shift*0.5, h * 0.4 - p*30); // Ridge peak right
          ctx.lineTo(w/2 + 30 + shift, h * 0.7);
          ctx.fill();
          
          // Cooled magma (new crust)
          ctx.fillStyle = '#78716c';
          ctx.beginPath();
          ctx.moveTo(w/2 - 30 - shift, h * 0.7);
          ctx.lineTo(w/2 - 10 - shift, h * 0.4);
          ctx.lineTo(w/2 - 5 - shift*0.5, h * 0.4 - p*30);
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(w/2 + 30 + shift, h * 0.7);
          ctx.lineTo(w/2 + 10 + shift, h * 0.4);
          ctx.lineTo(w/2 + 5 + shift*0.5, h * 0.4 - p*30);
          ctx.fill();
          
          // Labels
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Mảng đại dương', w*0.2, h*0.55);
          ctx.fillText('Mảng đại dương', w*0.8, h*0.55);
          
          if (p > 0.5) {
             ctx.fillStyle = 'white';
             ctx.fillText('Sống núi ngầm', w/2, h*0.4 - p*30 - 15);
          }
          
          // Arrows
          drawArrow(ctx, w*0.3, h*0.45, w*0.2, h*0.45, 'white', 4);
          drawArrow(ctx, w*0.7, h*0.45, w*0.8, h*0.45, 'white', 4);
      }
      
      // ─── 2. CONVERGENT (Xô đẩy) ───
      else if (activeTab === 'convergent') {
          // Plates moving together
          const shift = p * 60;
          
          // Left Plate (Continental)
          ctx.fillStyle = '#65a30d'; // Green surface
          ctx.fillRect(0, h * 0.5, w/2 + shift*0.5, h * 0.05);
          ctx.fillStyle = '#854d0e'; // Brown crust
          ctx.beginPath();
          ctx.moveTo(0, h * 0.55);
          ctx.lineTo(w/2 + shift*0.5, h * 0.55);
          ctx.lineTo(w/2 - 20, h * 0.8);
          ctx.lineTo(0, h * 0.8);
          ctx.fill();
          
          // Right Plate (Continental) - Colliding and folding up
          ctx.fillStyle = '#4d7c0f';
          ctx.beginPath();
          ctx.moveTo(w/2 + 50 - shift*0.5, h * 0.5);
          ctx.lineTo(w, h * 0.5);
          ctx.lineTo(w, h * 0.55);
          ctx.lineTo(w/2 + 50 - shift*0.5, h * 0.55);
          ctx.fill();
          
          ctx.fillStyle = '#713f12';
          ctx.beginPath();
          ctx.moveTo(w/2 + 50 - shift*0.5, h * 0.55);
          ctx.lineTo(w, h * 0.55);
          ctx.lineTo(w, h * 0.8);
          ctx.lineTo(w/2 + 20, h * 0.8);
          ctx.fill();
          
          // Mountain Folding (Uốn nếp)
          ctx.fillStyle = '#854d0e';
          ctx.beginPath();
          ctx.moveTo(w/2 - 30 + shift*0.3, h * 0.5);
          
          // Draw jagged mountain peaks growing with p
          const mWidth = 80 - shift*0.2;
          const mHeight = p * 80;
          ctx.lineTo(w/2, h * 0.5 - mHeight);
          ctx.lineTo(w/2 + 15, h * 0.5 - mHeight * 0.7);
          ctx.lineTo(w/2 + 30, h * 0.5 - mHeight * 1.1);
          ctx.lineTo(w/2 + 50 - shift*0.3, h * 0.5);
          ctx.fill();
          
          // Snow on peaks
          if (p > 0.6) {
              ctx.fillStyle = 'white';
              ctx.beginPath();
              ctx.moveTo(w/2 - 10, h * 0.5 - mHeight*0.6);
              ctx.lineTo(w/2, h * 0.5 - mHeight);
              ctx.lineTo(w/2 + 10, h * 0.5 - mHeight*0.75);
              ctx.fill();
              
              ctx.beginPath();
              ctx.moveTo(w/2 + 20, h * 0.5 - mHeight*0.8);
              ctx.lineTo(w/2 + 30, h * 0.5 - mHeight * 1.1);
              ctx.lineTo(w/2 + 40, h * 0.5 - mHeight*0.75);
              ctx.fill();
          }

          // Labels
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Mảng lục địa', w*0.2, h*0.7);
          ctx.fillText('Mảng lục địa', w*0.8, h*0.7);
          
          if (p > 0.5) {
             ctx.fillStyle = '#1e293b';
             ctx.fillText('Dãy núi uốn nếp', w/2 + 15, h*0.5 - mHeight - 15);
          }
          
          // Arrows
          drawArrow(ctx, w*0.2, h*0.6, w*0.3, h*0.6, 'white', 4);
          drawArrow(ctx, w*0.8, h*0.6, w*0.7, h*0.6, 'white', 4);
      }
      
      // ─── 3. TRANSFORM (Trượt ngang) Top-Down View ───
      else if (activeTab === 'transform') {
          // Top down view of a landscape with a river/road crossing a fault
          const shift = p * 80;
          
          // Left Plate
          ctx.fillStyle = '#a3e635'; // Grass
          ctx.fillRect(0, 0, w/2, h);
          
          // Right Plate
          ctx.fillStyle = '#84cc16';
          ctx.fillRect(w/2, 0, w/2, h);
          
          // The Fault Line
          ctx.strokeStyle = '#1c1917';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(w/2, 0);
          ctx.lineTo(w/2, h);
          ctx.stroke();
          
          // River crossing the fault
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 20;
          
          // River on left plate (moves DOWN relative to right)
          ctx.beginPath();
          ctx.moveTo(0, h/2 + shift);
          ctx.lineTo(w/2, h/2 + shift);
          ctx.stroke();
          
          // River on right plate (moves UP relative to left)
          ctx.beginPath();
          ctx.moveTo(w/2, h/2 - shift);
          ctx.lineTo(w, h/2 - shift);
          ctx.stroke();
          
          // Highlight the offset
          if (p > 0.2) {
              ctx.strokeStyle = '#ef4444'; // Red dotted line showing offset
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.beginPath();
              ctx.moveTo(w/2, h/2 + shift);
              ctx.lineTo(w/2, h/2 - shift);
              ctx.stroke();
              ctx.setLineDash([]);
          }
          
          // Earthquake effects (shake) at fault
          if (p > 0 && p < 1) {
              ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
              ctx.beginPath();
              ctx.arc(w/2, h/2, (time*5) % 100, 0, Math.PI*2);
              ctx.fill();
          }

          // Labels
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Mảng A (Trượt xuống)', w*0.25, h*0.2);
          ctx.fillText('Mảng B (Trượt lên)', w*0.75, h*0.2);
          
          ctx.fillStyle = 'white';
          ctx.fillText('Đứt gãy trượt ngang', w/2, h*0.9);
          
          // Arrows
          drawArrow(ctx, w*0.25, h*0.3, w*0.25, h*0.4, '#1e293b', 4);
          drawArrow(ctx, w*0.75, h*0.4, w*0.75, h*0.3, '#1e293b', 4);
      }
      
      ctx.textAlign = 'left';
      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [progress, activeTab]);

  const drawArrow = (ctx: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number, color = 'rgba(255,255,255,0.7)', width = 3) => {
    const headlen = 10; // length of head in pixels
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const currentInfo = () => {
    switch(activeTab) {
        case 'divergent': return {
            title: 'Tách giãn (Divergent Boundary)',
            desc: 'Hai mảng kiến tạo di chuyển xa nhau. Dưới đại dương, magma từ lớp manti trào lên điền vào khoảng trống, nguội đi tạo thành lớp vỏ mới. Quá trình này hình thành nên các sống núi ngầm giữa đại dương.'
        };
        case 'convergent': return {
            title: 'Xô đẩy (Convergent Boundary)',
            desc: 'Hai mảng kiến tạo va chạm vào nhau. Khi hai mảng lục địa xô đẩy, lớp vỏ bị dồn ép, uốn nếp và nhô cao tạo thành các dãy núi đồ sộ (như dãy Himalaya). Nếu mảng đại dương xô vào mảng lục địa, nó sẽ bị hút chìm tạo thành vực biển sâu.'
        };
        case 'transform': return {
            title: 'Trượt ngang (Transform Boundary)',
            desc: 'Hai mảng kiến tạo trượt cọ xát ngang qua nhau. Sự cọ xát này gây ra ma sát khổng lồ, khi áp lực được giải phóng sẽ tạo ra những trận động đất kinh hoàng (ví dụ: đứt gãy San Andreas).'
        };
    }
  };

  const info = currentInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0f172a', color: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <SimTopBar title="Mô phỏng Thuyết Kiến tạo mảng" />
      
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
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc' }}>Thời gian địa chất (Hàng triệu năm)</span>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#3b82f6' }}>{progress}%</span>
             </div>
             <input 
                type="range" 
                min="0" max="100" step="1" 
                value={progress}
                onChange={(e) => setProgress(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', height: 8, accentColor: '#3b82f6' }}
             />
          </div>

        </div>

        {/* RIGHT PANEL: Info & Quiz */}
        <div style={{ width: 340, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <SimTabs tabs={TABS} activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setProgress(0); }} />
          
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            <h3 style={{ color: TABS.find(t=>t.id===activeTab)?.color || '#fff', marginTop: 0 }}>
                {info?.title}
            </h3>
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 20 }}>
                {info?.desc}
            </p>
            
            <div style={{ padding: 15, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 8, marginBottom: 20 }}>
                <div style={{ fontWeight: 'bold', color: '#93c5fd', marginBottom: 5 }}>Hướng dẫn tương tác:</div>
                <div style={{ fontSize: 13, color: '#bfdbfe' }}>
                    Kéo thanh trượt <b>Thời gian địa chất</b> để quan sát sự di chuyển của các mảng kiến tạo qua hàng triệu năm và kết quả địa hình mà nó để lại.
                </div>
            </div>

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
