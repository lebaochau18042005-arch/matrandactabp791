import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import AppLayout from "../layouts/AppLayout";
import { useLessonStore } from "../store/lessonStore";
import { useAssignmentStore } from "../store/assignmentStore";
import { SIMULATIONS } from "../data/simulations";
import jsPDF from "jspdf";
import { aiService } from "../services/aiService";
import { Sparkles, Target, FileText, Video, Beaker } from "lucide-react";
import { exportBlocksToWord } from "../lib/wordExport";
import { exportLessonToWord } from "../lib/cv5512Export";
import Swal from 'sweetalert2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LessonBlock {
  id: string;
  type: string;
  content: string;
}

interface PaletteItem {
  type: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

// ─── Palette data ─────────────────────────────────────────────────────────────
const PALETTE: PaletteItem[] = [
  { type: "title", label: "📌 Tiêu đề bài học", icon: "H1", color: "#a78bfa", bg: "#4c1d95" },
  { type: "objective", label: "🎯 Mục tiêu", icon: "🎯", color: "#60a5fa", bg: "#1e3a8a" },
  { type: "simulation", label: "🎨 Mô phỏng 3D", icon: "▶", color: "#2dd4bf", bg: "#134e4a" },
  { type: "text", label: "📝 Văn bản", icon: "T", color: "#94a3b8", bg: "#1e293b" },
  { type: "image", label: "🖼️ Hình ảnh", icon: "🖼", color: "#fbbf24", bg: "#451a03" },
  { type: "question", label: "❓ Câu hỏi", icon: "?", color: "#fb7185", bg: "#4c0519" },
  { type: "worksheet", label: "📋 Phiếu học tập", icon: "📋", color: "#fb923c", bg: "#431407" },
  { type: "group-task", label: "👥 Nhiệm vụ nhóm", icon: "👥", color: "#818cf8", bg: "#1e1b4b" },
  { type: "quiz", label: "✅ Kiểm tra nhanh", icon: "✅", color: "#34d399", bg: "#064e3b" },
];

const GRADES = ["Lớp 10", "Lớp 11", "Lớp 12"];

const getIconForType = (type: string): string => PALETTE.find((p) => p.type === type)?.icon ?? "📄";
const getColorForType = (type: string): string => PALETTE.find((p) => p.type === type)?.color ?? "#94a3b8";
const getBgForType = (type: string): string => PALETTE.find((p) => p.type === type)?.bg ?? "#1e293b";
const getLabelForType = (type: string): string => PALETTE.find((p) => p.type === type)?.label ?? type;

// ─── Draggable Palette Item ───────────────────────────────────────────────────
function DraggablePaletteItem({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { type: item.type, isPalette: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="palette-item"
      style={{
        ...styles.paletteItem,
        borderColor: isDragging ? item.color : "#334155",
        background: isDragging ? `${item.bg}cc` : "#1e293b",
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: `${item.bg}cc`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: item.color,
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 500 }}>
        {item.label}
      </span>
    </div>
  );
}

// ─── Sortable Canvas Block ───────────────────────────────────────────────────
function SortableCanvasBlock({
  block,
  onDelete,
  onEdit,
}: {
  block: LessonBlock;
  onDelete: (id: string) => void;
  onEdit: (id: string, value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, data: { ...block, isCanvas: true } });
  
  const [hovered, setHovered] = useState(false);
  const color = getColorForType(block.type);
  const bg = getBgForType(block.type);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...styles.canvasBlock,
    borderColor: hovered || isDragging ? color : "#334155",
    boxShadow: hovered ? `0 0 0 1px ${color}40, 0 4px 16px ${color}20` : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...styles.blockHeader, background: `${bg}cc` }}>
        <div {...attributes} {...listeners} style={{ display: "flex", alignItems: "center", gap: 8, cursor: 'grab', flex: 1 }}>
          <span style={{ fontSize: 16 }}>{getIconForType(block.type)}</span>
          <span style={{ color, fontSize: 12, fontWeight: 600 }}>
            {getLabelForType(block.type)}
          </span>
          <span style={{color: '#475569', fontSize: 10, marginLeft: 8}}>(Kéo để di chuyển)</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            style={{ ...styles.blockBtn, color: "#fb7185" }}
            onClick={() => onDelete(block.id)}
            title="Xóa"
          >
            ×
          </button>
        </div>
      </div>
      {block.type === 'simulation' ? (
        <select
          style={{...styles.blockTextarea, padding: "12px 14px", height: "46px"}}
          value={block.content}
          onChange={(e) => onEdit(block.id, e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <option value="" disabled>-- Chọn mô phỏng --</option>
          {SIMULATIONS.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.groupLabel})</option>
          ))}
        </select>
      ) : block.type === 'image' ? (
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="url"
            style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid #334155", borderRadius: 6, padding: "8px 12px", color: "#f1f5f9", outline: "none" }}
            value={block.content}
            onChange={(e) => onEdit(block.id, e.target.value)}
            placeholder="Nhập đường dẫn URL của hình ảnh..."
            onPointerDown={(e) => e.stopPropagation()}
          />
          {block.content && (
            <img src={block.content} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 6, border: "1px solid #334155" }} onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
          )}
        </div>
      ) : (
        <textarea
          style={{ ...styles.blockTextarea, overflow: "hidden" }}
          value={block.content}
          onChange={(e) => onEdit(block.id, e.target.value)}
          placeholder={`Nhập nội dung ${getLabelForType(block.type)}...`}
          rows={Math.max(block.type === "title" ? 1 : 3, (block.content || "").split("\n").length)}
          onPointerDown={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LessonBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [lessonTitle, setLessonTitle] = useState("Bài giảng mới");
  const [grade, setGrade] = useState("Lớp 10");
  const [preview, setPreview] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);
  const [isAILoading, setIsAILoading] = useState<string | null>(null);
  const canvasEndRef = useRef<HTMLDivElement>(null);
  
  // Assign Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignClass, setAssignClass] = useState("10A1");
  const [assignDeadline, setAssignDeadline] = useState("");
  
  const { addLesson, updateLesson, lessons } = useLessonStore();
  const { assignTask } = useAssignmentStore();

  useEffect(() => {
    if (id) {
      const existing = lessons.find(l => l.id === id);
      if (existing) {
        setLessonTitle(existing.title);
        setGrade(existing.grade);
        setBlocks(existing.blocks.map((b: any) => ({
          id: b.id || `b${Math.random()}`,
          type: b.type,
          content: b.content || ""
        })));
      } else {
        toast.error("Không tìm thấy bài giảng!");
        navigate('/teacher');
      }
    } else {
      setBlocks([
        { id: "b0", type: "title", content: "Bài 12: Hoàn lưu khí quyển" },
        { id: "b1", type: "objective", content: "1. Trình bày hệ thống gió hành tinh\n2. Giải thích lực Coriolis" },
        { id: "b2", type: "simulation", content: "atmospheric-circulation" },
      ]);
    }
  }, [id, lessons, navigate]);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: 'canvas-droppable',
    data: { isCanvasDropArea: true }
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const isPaletteItem = active.data.current?.isPalette;
    
    if (isPaletteItem) {
      // Handle drop from palette to canvas
      const type = active.data.current?.type;
      if (type && (over.id === 'canvas-droppable' || over.data.current?.isCanvas)) {
        const newBlock: LessonBlock = {
          id: `b${Date.now()}`,
          type,
          content: "",
        };
        
        // Insert at the dropped position or at the end
        if (over.id !== 'canvas-droppable') {
          const overIndex = blocks.findIndex(b => b.id === over.id);
          setBlocks(prev => {
            const newBlocks = [...prev];
            newBlocks.splice(overIndex, 0, newBlock);
            return newBlocks;
          });
        } else {
          setBlocks(prev => [...prev, newBlock]);
        }
      }
    } else {
      // Reordering within canvas
      if (active.id !== over.id) {
        setBlocks((items) => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const deleteBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));
  const editBlock = (id: string, value: string) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: value } : b)));

  const handleSave = async (silent = false) => {
    if (blocks.length === 0) { toast.error("Bài giảng trống!"); return null; }
    
    let savedId = id;
    if (id) {
      await updateLesson(id, {
        title: lessonTitle || 'Bài dạy chưa đặt tên',
        grade,
        blocks: blocks.map(b => ({ id: b.id, type: b.type as any, content: b.content })),
      });
      if (!silent) toast.success("Đã cập nhật bài giảng!");
    } else {
      savedId = crypto.randomUUID();
      await addLesson({
        id: savedId,
        title: lessonTitle || 'Bài dạy chưa đặt tên',
        grade,
        topic: 'Địa lí',
        authorId: '', // will be assigned by store/supabase
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: blocks.map(b => ({ id: b.id, type: b.type as any, content: b.content })),
      });
      toast.success("Đã lưu bài dạy thành công!");
      navigate(`/lesson-builder/${savedId}`, { replace: true });
    }
    return savedId;
  };

  const handleAssignSubmit = async () => {
    if (!assignDeadline) { toast.error("Vui lòng chọn ngày hạn chót!"); return; }
    
    const savedId = await handleSave(true);
    if (!savedId) return;

    await assignTask({
      class_name: assignClass,
      lesson_id: savedId,
      simulation_id: null,
      deadline: assignDeadline,
    });
    
    setShowAssignModal(false);
    toast.success("Đã giao bài giảng cho lớp thành công!");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(lessonTitle || 'Bai giang', 14, 20);
    doc.setFont("helvetica", "normal");
    
    let y = 30;
    blocks.forEach((block, i) => {
      doc.text(`[${getLabelForType(block.type)}]`, 14, y);
      y += 7;
      const splitText = doc.splitTextToSize(block.content || '(Trong)', 180);
      doc.text(splitText, 14, y);
      y += (splitText.length * 7) + 10;
    });
    
    doc.save(`${lessonTitle.replace(/ /g, '_')}.pdf`);
    toast.success("Đã xuất PDF bài giảng!");
  };

  const handleExportWord = async () => {
    const result = await Swal.fire({
      title: 'Tùy chọn xuất Word',
      text: 'Bạn muốn xuất nhanh nội dung hiện tại hay dùng AI tổng hợp thành giáo án chuẩn Công văn 5512?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✨ AI Chuẩn hóa (CV5512)',
      cancelButtonText: 'Xuất nhanh',
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#334155'
    });

    if (result.isConfirmed) {
      if (blocks.length === 0) {
        toast.error("Bài giảng trống!");
        return;
      }
      setIsAILoading("export_word");
      toast.info("AI đang tổng hợp và chuẩn hóa giáo án. Có thể mất 10-15 giây...");
      try {
        const output = await aiService.generateAIContent({
          grade,
          lessonTitle,
          topic: "Địa lí",
          objectives: "export",
          contentType: "export_word",
          blocks: blocks
        });
        
        if (output.rawData) {
           await exportLessonToWord(output.rawData);
           toast.success("Đã xuất giáo án CV5512 thành công!");
        } else {
           throw new Error("Không nhận được dữ liệu chuẩn từ AI.");
        }
      } catch (e: any) {
        toast.error(e.message || "Lỗi khi tổng hợp CV5512!");
        console.error(e);
      } finally {
        setIsAILoading(null);
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      try {
        await exportBlocksToWord(blocks, lessonTitle);
        toast.success("Đã xuất File Word bài giảng!");
      } catch (e) {
        toast.error("Lỗi xuất file Word!");
        console.error(e);
      }
    }
  };

  const handleAIGenerate = async (contentType: string, blockType: "objective" | "worksheet" | "text") => {
    if (!lessonTitle) {
      toast.error("Vui lòng đặt tên bài giảng trước khi dùng AI!");
      return;
    }
    setIsAILoading(contentType);
    toast.info("AI đang phân tích và tạo nội dung...");
    try {
      const output = await aiService.generateAIContent({
        grade,
        lessonTitle,
        topic: "Địa lí",
        objectives: "",
        contentType
      });
      
      const newBlock: LessonBlock = {
        id: `b${Date.now()}`,
        type: blockType,
        content: output.resultContent || output.content
      };
      
      setBlocks(prev => [...prev, newBlock]);
      toast.success("AI đã tạo nội dung và chèn vào bài giảng!");
      setTimeout(() => {
        canvasEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      toast.error(error.message || "Lỗi AI");
    } finally {
      setIsAILoading(null);
    }
  };

  const handleAICheck = async () => {
    if (blocks.length === 0) {
      toast.error("Bài giảng trống, không có gì để kiểm định!");
      return;
    }
    setIsAILoading("scientific_check");
    toast.info("AI đang kiểm định khoa học bài giảng...");
    try {
      const output = await aiService.generateAIContent({
        grade,
        lessonTitle,
        topic: "Địa lí",
        objectives: blocks.map(b => b.content).join("\n"),
        contentType: "scientific_check"
      });
      // Just alert for MVP
      alert(output.resultContent || output.content);
      toast.success("Đã hoàn tất kiểm định!");
    } catch (error: any) {
      toast.error(error.message || "Lỗi AI");
    } finally {
      setIsAILoading(null);
    }
  };

  return (
    <AppLayout>
      <style>{`
        .palette-item:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important; }
        .lb-btn:hover { opacity: 0.85 !important; }
        .canvas-area::-webkit-scrollbar { width: 4px; }
        .canvas-area::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>

      <div style={styles.page}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <input
              style={styles.titleInput}
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Tiêu đề bài dạy..."
            />
            <select style={styles.gradeSelect} value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADES.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="lb-btn" style={{ ...styles.topBtn, background: "#1e3a8a", color: "#93c5fd" }} onClick={() => setPreview(!preview)}>
              {preview ? "✏️ Chỉnh sửa" : "👁️ Xem trước"}
            </button>
            <button className="lb-btn" style={{ ...styles.topBtn, background: "#1e3a5f", color: "#60a5fa" }} onClick={() => setShowAssignModal(true)}>
              📤 Giao cho lớp
            </button>
            <button className="lb-btn" style={{ ...styles.topBtn, background: "#1e293b", color: "#94a3b8" }} onClick={handleExportPDF}>
              📥 Xuất PDF
            </button>
            <button className="lb-btn" style={{ ...styles.topBtn, background: "#0f172a", color: "#38bdf8" }} onClick={handleExportWord}>
              📄 Xuất Word
            </button>
            <button className="lb-btn" style={{ ...styles.topBtn, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", fontWeight: 600 }} onClick={() => navigate('/quiz/create')}>
              🧠 Tạo Quiz AI
            </button>
            <button className="lb-btn" style={{ ...styles.topBtn, background: "linear-gradient(135deg, #0d9488, #0891b2)", color: "#fff", fontWeight: 600 }} onClick={handleSave}>
              💾 Lưu
            </button>
          </div>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div style={styles.workspace}>
            {/* Palette */}
            <aside style={styles.palette}>
              <p style={styles.paletteTitle}>🧩 Thành phần</p>
              <p style={styles.paletteSub}>Kéo vào khung bài dạy</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {PALETTE.map((item) => (
                  <DraggablePaletteItem key={item.type} item={item} />
                ))}
              </div>
            </aside>

            {/* Canvas */}
            <div
              ref={setDroppableRef}
              className="canvas-area"
              style={{
                ...styles.canvas,
                ...(isOver ? { borderColor: "#0d9488", background: "rgba(13,148,136,0.05)" } : {}),
              }}
            >
              <div style={styles.canvasHeader}>
                <div>
                  <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {lessonTitle || "Bài dạy chưa đặt tên"}
                  </h2>
                  <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0" }}>
                    {grade} · {blocks.length} thành phần
                  </p>
                </div>
              </div>

              {/* AI Quick Actions Toolbar */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "24px", padding: "12px", background: "rgba(13, 148, 136, 0.1)", borderRadius: "12px", border: "1px dashed rgba(13, 148, 136, 0.3)", flexWrap: "wrap" }}>
                 <div style={{ color: "#5eead4", fontSize: "12px", fontWeight: "bold", width: "100%", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                   <Sparkles size={14} /> AI Trợ giảng Nhanh:
                 </div>
                 <button 
                   onClick={() => handleAIGenerate("lesson_objectives", "objective")}
                   disabled={isAILoading !== null}
                   style={{ background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.2s" }}
                 >
                   {isAILoading === "lesson_objectives" ? "..." : <><Target size={14} className="text-blue-400" /> Tạo Mục tiêu</>}
                 </button>
                 <button 
                   onClick={() => handleAIGenerate("worksheet", "worksheet")}
                   disabled={isAILoading !== null}
                   style={{ background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.2s" }}
                 >
                   {isAILoading === "worksheet" ? "..." : <><FileText size={14} className="text-orange-400" /> Tạo Phiếu học tập</>}
                 </button>
                 <button 
                   onClick={() => handleAIGenerate("simulation_script", "text")}
                   disabled={isAILoading !== null}
                   style={{ background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.2s" }}
                 >
                   {isAILoading === "simulation_script" ? "..." : <><Video size={14} className="text-teal-400" /> Tạo Lời thuyết minh</>}
                 </button>
                 <button 
                   onClick={handleAICheck}
                   disabled={isAILoading !== null}
                   style={{ background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.2s" }}
                 >
                   {isAILoading === "scientific_check" ? "..." : <><Beaker size={14} className="text-purple-400" /> Kiểm định khoa học</>}
                 </button>
              </div>

              {blocks.length === 0 ? (
                <div style={styles.emptyCanvas}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
                    Kéo thành phần từ bảng trái vào đây để bắt đầu
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {preview ? (
                    blocks.map((block) => (
                      <div key={block.id} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "16px 20px" }}>
                        <div style={{ color: getColorForType(block.type), fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                          {getIconForType(block.type)} {getLabelForType(block.type)}
                        </div>
                        <p style={{ color: "#f1f5f9", fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                          {block.content || "(Chưa có nội dung)"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                      {blocks.map((block) => (
                        <SortableCanvasBlock
                          key={block.id}
                          block={block}
                          onDelete={deleteBlock}
                          onEdit={editBlock}
                        />
                      ))}
                    </SortableContext>
                  )}
                  <div ref={canvasEndRef} />
                </div>
              )}
            </div>
          </div>
          
          <DragOverlay>
            {activeDragItem?.isPalette ? (
               <div style={{
                ...styles.paletteItem,
                borderColor: getColorForType(activeDragItem.type),
                background: `${getBgForType(activeDragItem.type)}cc`,
                opacity: 0.8,
              }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: `${getBgForType(activeDragItem.type)}cc`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: getColorForType(activeDragItem.type) }}>
                  {getIconForType(activeDragItem.type)}
                </span>
                <span style={{ color: "#cbd5e1", fontSize: 12 }}>{getLabelForType(activeDragItem.type)}</span>
              </div>
            ) : activeDragItem?.isCanvas ? (
              <div style={{ ...styles.canvasBlock, opacity: 0.8, borderColor: getColorForType(activeDragItem.type) }}>
                 <div style={{ ...styles.blockHeader, background: `${getBgForType(activeDragItem.type)}cc` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{getIconForType(activeDragItem.type)}</span>
                      <span style={{ color: getColorForType(activeDragItem.type), fontSize: 12, fontWeight: 600 }}>{getLabelForType(activeDragItem.type)}</span>
                    </div>
                  </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setShowAssignModal(false)} />
          <div style={{ position: "relative", background: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Giao bài giảng cho lớp</h3>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Chọn lớp</label>
              <select 
                value={assignClass}
                onChange={e => setAssignClass(e.target.value)}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", outline: "none", fontSize: "14px" }}
              >
                <option value="10A1">Lớp 10A1</option>
                <option value="11B2">Lớp 11B2</option>
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Hạn chót</label>
              <input 
                type="date"
                value={assignDeadline}
                onChange={e => setAssignDeadline(e.target.value)}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", outline: "none", fontSize: "14px", colorScheme: "dark" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{ padding: "8px 16px", background: "transparent", color: "#94a3b8", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
              >
                Hủy
              </button>
              <button 
                onClick={handleAssignSubmit}
                style={{ padding: "8px 16px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
              >
                Xác nhận Giao
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: "#0f172a", overflow: "hidden" },
  topBar: { display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", background: "#1e293b", borderBottom: "1px solid #334155", flexShrink: 0 },
  titleInput: { flex: 1, background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px", color: "#f1f5f9", fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "inherit", maxWidth: 400 },
  gradeSelect: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px", color: "#f1f5f9", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" },
  topBtn: { border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s", whiteSpace: "nowrap" },
  workspace: { display: "flex", flex: 1, overflow: "hidden" },
  palette: { width: 220, minWidth: 200, background: "#1e293b", borderRight: "1px solid #334155", padding: "20px 12px", overflowY: "auto", flexShrink: 0 },
  paletteTitle: { color: "#f1f5f9", fontSize: 14, fontWeight: 700, margin: "0 0 4px", paddingLeft: 4 },
  paletteSub: { color: "#475569", fontSize: 11, margin: "0 0 14px", paddingLeft: 4 },
  paletteItem: { display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, border: "1px solid #334155", cursor: "grab", transition: "all 0.2s ease", userSelect: "none" },
  canvas: { flex: 1, overflowY: "auto", padding: "24px", transition: "background 0.2s, border-color 0.2s", border: "2px solid transparent" },
  canvasHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #334155" },
  emptyCanvas: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, border: "2px dashed #334155", borderRadius: 16, padding: 40, textAlign: "center" },
  canvasBlock: { background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden", transition: "all 0.2s ease" },
  blockHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #334155" },
  blockBtn: { background: "#0f172a", border: "1px solid #334155", borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: "#94a3b8", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" },
  blockTextarea: { width: "100%", background: "transparent", border: "none", color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, padding: "12px 14px", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
};
