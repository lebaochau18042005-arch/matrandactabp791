import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import './index.css';
import { Toaster } from 'sonner';

// ─── Lazy-load pages for better performance ────────────────────────────────────
const App            = lazy(() => import('./App'));
const LoginPage      = lazy(() => import('./pages/LoginPage'));
const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const StudentDash    = lazy(() => import('./pages/StudentDashboard'));
const TeacherDash    = lazy(() => import('./pages/TeacherDashboard'));
const AdminDash      = lazy(() => import('./pages/AdminDashboard'));
const SimLibrary     = lazy(() => import('./pages/SimLibraryPage'));
const SimViewer      = lazy(() => import('./pages/SimViewerPage'));
const AIAssistant    = lazy(() => import('./pages/AIAssistantPage'));
const LessonBuilder  = lazy(() => import('./pages/LessonBuilderPage'));
const LessonViewer   = lazy(() => import('./pages/LessonViewerPage'));
const QuizLive       = lazy(() => import('./pages/QuizLivePage'));
const MapLab         = lazy(() => import('./pages/MapLabPage'));
const Community      = lazy(() => import('./pages/CommunityPage'));
const Reports        = lazy(() => import('./pages/ReportsPage'));
const Settings       = lazy(() => import('./pages/SettingsPage'));
const QuizCreate     = lazy(() => import('./pages/quiz/QuizCreatePage'));
const QuizAnswer     = lazy(() => import('./pages/quiz/QuizAnswerPage'));
const QuizResult     = lazy(() => import('./pages/quiz/QuizResultPage'));

// ─── Full-screen loading fallback ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🌍</span>
      </div>
      <p className="text-slate-400 text-sm animate-pulse">Đang tải GeoHub...</p>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth */}
              <Route path="/login"         element={<LoginPage />} />

              {/* Dashboard redirect */}
              <Route path="/dashboard"     element={<DashboardPage />} />

              {/* Role dashboards */}
              <Route path="/student"       element={<StudentDash />} />
              <Route path="/teacher"       element={<TeacherDash />} />
              <Route path="/admin"         element={<AdminDash />} />

              {/* Simulation library */}
              <Route path="/simulations"   element={<SimLibrary />} />
              <Route path="/simulations/:id" element={<SimViewer />} />

              {/* Tools */}
              <Route path="/ai-assistant"  element={<AIAssistant />} />
              <Route path="/lesson-builder" element={<LessonBuilder />} />
              <Route path="/lesson-builder/:id" element={<LessonBuilder />} />
              <Route path="/lesson-viewer/:id" element={<LessonViewer />} />
              
              <Route path="/quiz/create"   element={<QuizCreate />} />
              <Route path="/quiz/:id"      element={<QuizAnswer />} />
              <Route path="/quiz/:id/result" element={<QuizResult />} />
              <Route path="/quiz-live"     element={<QuizLive />} />
              <Route path="/map-lab"       element={<MapLab />} />

              {/* Community & admin */}
              <Route path="/community"     element={<Community />} />
              <Route path="/reports"       element={<Reports />} />
              <Route path="/settings"      element={<Settings />} />

              {/* Original GeoHub workspace at /workspace */}
              <Route path="/workspace"     element={<App />} />

              {/* Root: redirect to new LMS login */}
              <Route path="/"              element={<Navigate to="/login" replace />} />

              {/* Fallback */}
              <Route path="*"             element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);
