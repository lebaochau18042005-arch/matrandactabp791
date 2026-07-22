// ─── CommunityPage – Community Learning Resource Library ────────────────────
import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';

interface Resource {
  id: number;
  title: string;
  type: string;
  author: string;
  stars: number;
  downloads: number;
  grade: number;
  icon: string;
}

const RESOURCES: Resource[] = [
  { id: 1, title: 'Giáo án Hoàn lưu khí quyển - Lớp 10', type: 'giáo án',   author: 'Cô Nguyễn Thư',  stars: 4.8, downloads: 234, grade: 10, icon: '📄' },
  { id: 2, title: 'Phiếu học tập: Thủy triều và ảnh hưởng',  type: 'phiếu',    author: 'Thầy Lê Bình',   stars: 4.6, downloads: 189, grade: 10, icon: '📋' },
  { id: 3, title: 'Bộ câu hỏi trắc nghiệm Địa lí 10 - HK1', type: 'câu hỏi',  author: 'Cô Nguyễn Thư',  stars: 4.9, downloads: 412, grade: 10, icon: '❓' },
  { id: 4, title: 'Video: Giải thích Múi giờ',               type: 'video',    author: 'GeoHub Team',    stars: 4.7, downloads: 567, grade: 10, icon: '🎥' },
  { id: 5, title: 'Giáo án Kiến tạo mảng - Lớp 10',         type: 'giáo án',  author: 'Thầy Lê Bình',   stars: 4.5, downloads: 156, grade: 10, icon: '📄' },
  { id: 6, title: 'Mô phỏng: Vòng tuần hoàn nước',          type: 'mô phỏng', author: 'GeoHub Team',    stars: 4.8, downloads: 345, grade: 10, icon: '🎨' },
  { id: 7, title: 'Phiếu học tập: Khí hậu Việt Nam',        type: 'phiếu',    author: 'Cô Mai Anh',     stars: 4.4, downloads: 278, grade: 12, icon: '📋' },
  { id: 8, title: 'Bộ câu hỏi Địa lí 12 ôn thi THPT',      type: 'câu hỏi',  author: 'GeoHub Team',    stars: 4.9, downloads: 890, grade: 12, icon: '❓' },
];

const FILTER_TABS = ['Tất cả', 'Giáo án', 'Mô phỏng', 'Câu hỏi', 'Phiếu học tập', 'Video'];

const TYPE_COLORS: Record<string, string> = {
  'giáo án':  'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'phiếu':    'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'câu hỏi':  'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'video':    'text-rose-400 bg-rose-400/10 border-rose-400/30',
  'mô phỏng': 'text-teal-400 bg-teal-400/10 border-teal-400/30',
};

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xs ${i <= Math.round(stars) ? 'text-yellow-400' : 'text-slate-600'}`}>★</span>
      ))}
      <span className="text-xs text-slate-400 ml-1">{stars.toFixed(1)}</span>
    </span>
  );
}

function ResourceCard({ res }: { res: Resource }) {
  const typeColor = TYPE_COLORS[res.type] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  return (
    <div
      className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-3 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 group"
    >
      {/* Icon + type */}
      <div className="flex items-start justify-between">
        <span className="text-3xl">{res.icon}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${typeColor}`}>
          {res.type}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white leading-snug group-hover:text-teal-300 transition-colors line-clamp-2">
        {res.title}
      </h3>

      {/* Author + grade */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>👤 {res.author}</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
          Lớp {res.grade}
        </span>
      </div>

      {/* Stars */}
      <StarRating stars={res.stars} />

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => alert('Tính năng đang phát triển')}
          className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all duration-200"
          style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}
        >
          ⬇️ Tải về
        </button>
        <button
          onClick={() => alert('Tính năng đang phát triển')}
          className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
        >
          🔖 Lưu
        </button>
      </div>

      {/* Downloads */}
      <p className="text-xs text-slate-600 text-center">{res.downloads.toLocaleString()} lượt tải</p>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#0f172a', border: '1px solid rgba(20,184,166,0.25)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">📤 Đăng tải học liệu</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tiêu đề</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-teal-500 outline-none"
              placeholder="Nhập tiêu đề học liệu..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Loại học liệu</label>
            <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-teal-500 outline-none">
              <option>Giáo án</option>
              <option>Phiếu học tập</option>
              <option>Câu hỏi</option>
              <option>Video</option>
              <option>Mô phỏng</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Lớp</label>
            <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-teal-500 outline-none">
              <option>Lớp 10</option>
              <option>Lớp 11</option>
              <option>Lớp 12</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tệp đính kèm</label>
            <div
              className="w-full border-2 border-dashed border-slate-700 rounded-lg p-6 text-center text-slate-500 text-sm cursor-pointer hover:border-teal-500/50 hover:text-teal-400 transition-colors"
              onClick={() => alert('Tính năng đang phát triển')}
            >
              📁 Kéo thả tệp vào đây hoặc click để chọn
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700">
            Hủy
          </button>
          <button
            onClick={() => { alert('Tính năng đang phát triển'); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}
          >
            📤 Đăng tải
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const filtered = RESOURCES.filter(r => {
    const matchFilter =
      activeFilter === 'Tất cả' ||
      r.type.toLowerCase().includes(activeFilter.toLowerCase()) ||
      activeFilter.toLowerCase().includes(r.type.toLowerCase());
    const matchSearch =
      search === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <AppLayout title="📚 Kho Học Liệu Cộng Đồng">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">📚 Kho Học Liệu Cộng Đồng</h1>
            <p className="text-slate-400 text-sm mt-1">Chia sẻ và khám phá tài liệu Địa lí từ cộng đồng giáo viên</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}
          >
            📤 Đăng tải học liệu
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm học liệu, giáo án, tác giả..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeFilter === tab
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Hiển thị {filtered.length}/{RESOURCES.length} học liệu</span>
          <span>•</span>
          <span>📥 Tổng lượt tải: {RESOURCES.reduce((s, r) => s + r.downloads, 0).toLocaleString()}</span>
          <span>•</span>
          <span>⭐ Đánh giá TB: {(RESOURCES.reduce((s, r) => s + r.stars, 0) / RESOURCES.length).toFixed(1)}</span>
        </div>

        {/* Resources grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(res => (
              <ResourceCard key={res.id} res={res} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            <p className="text-4xl mb-3">📭</p>
            <p>Không tìm thấy học liệu phù hợp.</p>
          </div>
        )}

        {/* Upload modal */}
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      </div>
    </AppLayout>
  );
}
