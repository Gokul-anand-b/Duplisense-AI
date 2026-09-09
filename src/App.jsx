import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import SplashScreen from './components/common/SplashScreen';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Projects
import ProjectList from './pages/projects/ProjectList';
import ProjectSubmit from './pages/projects/ProjectSubmit';
import ProjectDetails from './pages/projects/ProjectDetails';

// Similarity
import SimilarityResults from './pages/similarity/SimilarityResults';
import SimilarityDetail from './pages/similarity/SimilarityDetail';

// Recommendations
import Recommendations from './pages/recommendations/Recommendations';

// Analytics
import Analytics from './pages/analytics/Analytics';

// Approvals
import ApprovalList from './pages/approvals/ApprovalList';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Profile
import Profile from './pages/profile/Profile';

import './App.css';

/**
 * ProtectedRoute — redirects to login if not authenticated.
 * Optionally checks user role.
 */
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * PublicRoute — redirects to dashboard if already authenticated.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected Routes inside DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/submit" element={<ProjectSubmit />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />

        {/* Similarity */}
        <Route path="/similarity" element={<SimilarityResults />} />
        <Route path="/similarity/:id" element={<SimilarityDetail />} />

        {/* Recommendations */}
        <Route path="/recommendations" element={<Recommendations />} />

        {/* Analytics */}
        <Route path="/analytics" element={<Analytics />} />

        {/* Approvals (Manager+) */}
        <Route
          path="/approvals"
          element={
            <ProtectedRoute requiredRole="manager">
              <ApprovalList />
            </ProtectedRoute>
          }
        />

        {/* Admin (Admin only) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}
