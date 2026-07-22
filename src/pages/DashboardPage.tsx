import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      // Auto-login as teacher demo - no login screen needed
      loginAsDemo('teacher');
      return;
    }
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'teacher') navigate('/teacher');
    else if (user.role === 'student') navigate('/student');
    else navigate('/simulations'); // guest
  }, [user, navigate, loginAsDemo]);
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
