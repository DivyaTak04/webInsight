import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authcontext';
import ProtectedRoute from './components/protectedRoute';

import Landing   from './pages/Landing';
import Auth      from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Review    from './pages/Review';
import Issues    from './pages/Issues';
import AIInsights from './pages/AIInsights';
import Settings  from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"     element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes — require login */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/review"    element={<ProtectedRoute><Review /></ProtectedRoute>} />
          <Route path="/issues"    element={<ProtectedRoute><Issues /></ProtectedRoute>} />
          <Route path="/insights"  element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;