// ─── SettingsPage – User Settings & Preferences ────────────────────────────
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { GEMINI_MODEL_OPTIONS, readGeminiApiKey, readGeminiModel, saveGeminiApiKey, saveGeminiModel } from '../lib/geminiSettings';

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-300 flex-shrink-0 ${
        checked ? 'bg-teal-500' : 'bg-slate-700'
      }`}
      style={{ width: 40, height: 22 }}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all duration-300 ${
          checked ? 'left-5' : 'left-0.5'
        }`}
        style={{ width: 18, height: 18, top: 2, left: checked ? 20 : 2 }}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile state
  const [name, setName] = useState(user?.name ?? '');

  // API Key state
  const [apiKey, setApiKey] = useState(readGeminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [selectedModel, setSelectedModel] = useState(readGeminiModel);

  // Appearance
  const [animQuality, setAnimQuality] = useState<'high' | 'medium' | 'low'>('high');

  // Notifications
  const [notifLearning, setNotifLearning]   = useState(true);
  const [notifMission, setNotifMission]     = useState(true);
  const [notifUpdate, setNotifUpdate]       = useState(false);

  const handleSaveApiKey = () => {
    saveGeminiApiKey(apiKey);
    saveGeminiModel(selectedModel);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleClearData = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu học tập? Hành động này không thể hoàn tác.')) {
      localStorage.clear();
      alert('Đã xóa dữ liệu học tập. Vui lòng đăng nhập lại.');
      await logout();
      navigate('/login');
    }
  };

  const roleBadge: Record<string, { label: string; color: string }> = {
    admin:   { label: 'Quản trị viên', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
    teacher: { label: 'Giáo viên',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
    student: { label: 'Học sinh',      color: 'text-teal-400 bg-teal-400/10 border-teal-400/30' },
    guest:   { label: 'Khách',         color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
  };

  const badge = roleBadge[user?.role ?? 'guest'];

  return (
    <AppLayout title="⚙️ Cài đặt">
      <div className="p-6 space-y-5 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">⚙️ Cài đặt</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý tài khoản và tuỳ chỉnh trải nghiệm</p>
        </div>

        {/* Profile */}
        <Section title="Hồ sơ cá nhân" icon="👤">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <button
              onClick={() => alert('Tính năng đang phát triển')}
              className="relative flex-shrink-0 group"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white shadow-xl"
                style={{ background: 'linear-gradient(135deg,#14b8a6,#6366f1)' }}
              >
                {user?.avatar ?? 'KH'}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold">
                Đổi
              </div>
            </button>

            <div className="flex-1 space-y-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Tên hiển thị</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
                  <input
                    value={user?.email ?? ''}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Vai trò</label>
                  <span className={`px-3 py-2 rounded-xl text-xs font-bold border ${badge.color} block`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Tính năng đang phát triển')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}
          >
            💾 Lưu thay đổi
          </button>
        </Section>

        {/* API Key */}
        <Section title="Gemini API Key" icon="🤖">
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-xs font-bold text-amber-400">Quan trọng</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                API Key Gemini giúp kích hoạt tính năng AI trợ lý, tạo câu hỏi tự động và phân tích học tập.
                Key được lưu cục bộ trên thiết bị của bạn và không gửi đến server.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Gemini API Key
              {apiKey ? (
                <span className="ml-2 text-teal-400">✅ Đã cài đặt</span>
              ) : (
                <span className="ml-2 text-red-400">❌ Chưa cài đặt</span>
              )}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono focus:border-teal-500 focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  keySaved
                    ? 'bg-teal-500 text-white'
                    : 'text-white'
                }`}
                style={keySaved ? {} : { background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}
              >
                {keySaved ? '✅ Đã lưu' : '💾 Lưu'}
              </button>
            </div>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 mt-2 transition-colors"
            >
              🔗 Lấy API Key miễn phí tại Google AI Studio →
            </a>
          </div>

          {/* Model selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Model AI
            </label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
            >
              {GEMINI_MODEL_OPTIONS.map(model => (
                <option key={model.id} value={model.id}>{model.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Model sẽ được dùng để tạo câu hỏi và nội dung AI.</p>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Giao diện" icon="🎨">
          {/* Dark mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Chế độ tối</p>
              <p className="text-xs text-slate-500">GeoHub sử dụng dark mode mặc định</p>
            </div>
            <Toggle checked={true} onChange={() => {}} />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Ngôn ngữ</p>
              <p className="text-xs text-slate-500">Giao diện hiển thị</p>
            </div>
            <select
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-teal-500 focus:outline-none"
            >
              <option>Tiếng Việt</option>
            </select>
          </div>

          {/* Animation quality */}
          <div>
            <p className="text-sm font-medium text-white mb-2">Chất lượng hoạt hình</p>
            <div className="flex gap-3">
              {(['high', 'medium', 'low'] as const).map((q, i) => (
                <label key={q} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="animQuality"
                    value={q}
                    checked={animQuality === q}
                    onChange={() => setAnimQuality(q)}
                    className="accent-teal-500"
                  />
                  <span className="text-xs text-slate-300">
                    {q === 'high' ? 'Cao' : q === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Thông báo" icon="🔔">
          {[
            { label: 'Nhật ký học tập', sub: 'Tổng kết hoạt động hàng ngày', checked: notifLearning, toggle: () => setNotifLearning(v => !v) },
            { label: 'Thông báo nhiệm vụ mới', sub: 'Khi có nhiệm vụ học tập mới', checked: notifMission, toggle: () => setNotifMission(v => !v) },
            { label: 'Cập nhật mô phỏng mới', sub: 'Mô phỏng và tính năng mới', checked: notifUpdate, toggle: () => setNotifUpdate(v => !v) },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
              <Toggle checked={item.checked} onChange={item.toggle} />
            </div>
          ))}
        </Section>

        {/* Coming soon */}
        <Section title="Tính năng sắp ra mắt" icon="🚀">
          {[
            { label: 'Chế độ AR/VR', sub: 'Trải nghiệm thực tế tăng cường', icon: '🥽' },
            { label: 'Cài đặt PWA', sub: 'Cài ứng dụng trên thiết bị', icon: '📱' },
            { label: 'Đồng bộ Google Classroom', sub: 'Tích hợp với lớp học Google', icon: '🏫' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600 font-medium">
                Sắp ra mắt
              </span>
            </div>
          ))}
        </Section>

        {/* Danger zone */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.05)' }}
        >
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <span className="text-lg">⚠️</span>
            <h2 className="text-sm font-bold text-red-400">Vùng nguy hiểm</h2>
          </div>
          <div className="p-6 flex items-center gap-4 flex-wrap">
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors"
            >
              🗑️ Xóa dữ liệu học tập
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:border-red-500/50 hover:text-red-400 transition-colors"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        {/* Version info */}
        <p className="text-center text-xs text-slate-600 pb-2">GeoHub LMS v2.0 · Xây dựng bởi GeoHub Team · 2025</p>
      </div>
    </AppLayout>
  );
}
