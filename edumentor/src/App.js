import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import StudentProfileSetup from './pages/StudentProfileSetup';
import MentorProfileSetup from './pages/MentorProfileSetup';
import StudentProfileEdit from './pages/StudentProfileEdit';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';

// Loading component with timeout
const LoadingScreen = ({ timeout = 10000 } = {}) => {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowError(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (showError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[#101827] mb-2">Loading Timeout</h2>
          <p className="text-[#A6B4C8] mb-4">The page is taking longer than expected to load.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#1F6FEB] text-white rounded-lg hover:bg-[#1557c0] transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F6FEB] mx-auto mb-4"></div>
        <p className="text-[#A6B4C8]">Loading...</p>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    if (profile?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (profile?.role === 'mentor') {
      return <Navigate to="/mentor/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Auth Redirect Component - handles post-login redirects
const AuthRedirect = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect authenticated users to appropriate dashboard
  if (profile?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  } else if (profile?.role === 'mentor') {
    return <Navigate to="/mentor/dashboard" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

// Wrapper component for pages that need navigation
const PageWrapper = ({ children }) => {
  const location = useLocation();
  const currentPage = location.pathname;

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} />
      {children}
    </div>
  );
};

function AppContent() {
  const { loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PageWrapper>
            <HomePage />
          </PageWrapper>
        } />
        <Route path="/login" element={
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        } />
        <Route path="/signup/student" element={
          <PageWrapper>
            <SignupPage initialRole="student" />
          </PageWrapper>
        } />
        <Route path="/signup/mentor" element={
          <PageWrapper>
            <SignupPage initialRole="mentor" />
          </PageWrapper>
        } />
        <Route path="/reset-password" element={
          <PageWrapper>
            <ResetPasswordPage />
          </PageWrapper>
        } />

        {/* Protected Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRole="student">
            <PageWrapper>
              <StudentDashboard />
            </PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/student/profile-setup" element={
          <ProtectedRoute requiredRole="student">
            <PageWrapper>
              <StudentProfileSetup />
            </PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/student/profile-edit" element={
          <ProtectedRoute requiredRole="student">
            <PageWrapper>
              <StudentProfileEdit />
            </PageWrapper>
          </ProtectedRoute>
        } />

        {/* Protected Mentor Routes */}
        <Route path="/mentor/dashboard" element={
          <ProtectedRoute requiredRole="mentor">
            <PageWrapper>
              <MentorDashboard />
            </PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/mentor/profile-setup" element={
          <ProtectedRoute requiredRole="mentor">
            <PageWrapper>
              <MentorProfileSetup />
            </PageWrapper>
          </ProtectedRoute>
        } />

        {/* General Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <PageWrapper>
              <ProfilePage />
            </PageWrapper>
          </ProtectedRoute>
        } />

        {/* Redirect authenticated users to appropriate dashboard */}
        <Route path="/dashboard" element={<AuthRedirect />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;