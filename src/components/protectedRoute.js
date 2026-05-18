// src/components/ProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#6750a5]/30 border-t-[#6750a5] animate-spin"></div>
          <p className="text-[#6750a5] font-medium text-sm tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Redirect to auth page, but remember where user was trying to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}