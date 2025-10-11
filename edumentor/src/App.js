import React, { useState, useEffect } from 'react';
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

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F6FEB] mx-auto mb-4"></div>
      <p className="text-[#A6B4C8]">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  // Handle navigation based on authentication and profile completion
  useEffect(() => {
    if (!loading && isAuthenticated && profile) {
      // If user just logged in and is on login/signup pages, redirect to appropriate dashboard
      if (currentPage === 'login' || currentPage === 'signup-student' || currentPage === 'signup-mentor' || currentPage === 'home') {
        // Redirect to appropriate dashboard based on role
        if (profile.role === 'student') {
          setCurrentPage('student-dashboard');
        } else if (profile.role === 'mentor') {
          setCurrentPage('mentor-dashboard');
        } else if (profile.role === 'admin') {
          setCurrentPage('admin-dashboard');
        }
      }
    }
  }, [isAuthenticated, profile, loading, currentPage]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  const renderPage = () => {
    // Protected routes - redirect to login if not authenticated
    const protectedRoutes = [
      'student-dashboard',
      'mentor-dashboard',
      'admin-dashboard',
      'student-profile-setup',
      'student-profile-edit',
      'mentor-profile-setup',
      'profile'
    ];

    if (protectedRoutes.includes(currentPage) && !isAuthenticated) {
      return <LoginPage onNavigate={setCurrentPage} />;
    }

    // Role-based access control
    if (isAuthenticated && profile) {
      // Students can only access student pages
      if (profile.role === 'student' && currentPage === 'mentor-dashboard') {
        setCurrentPage('student-dashboard');
        return <StudentDashboard onNavigate={setCurrentPage} />;
      }
      
      // Mentors can only access mentor pages
      if (profile.role === 'mentor' && currentPage === 'student-dashboard') {
        setCurrentPage('mentor-dashboard');
        return <MentorDashboard onNavigate={setCurrentPage} />;
      }
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'signup-student':
        return <SignupPage onNavigate={setCurrentPage} initialRole="student" />;
      case 'signup-mentor':
        return <SignupPage onNavigate={setCurrentPage} initialRole="mentor" />;
      case 'reset-password':
        return <ResetPasswordPage onNavigate={setCurrentPage} />;
      case 'student-dashboard':
        return <StudentDashboard onNavigate={setCurrentPage} />;
      case 'mentor-dashboard':
        return <MentorDashboard onNavigate={setCurrentPage} />;
      case 'student-profile-setup':
        return <StudentProfileSetup onNavigate={setCurrentPage} />;
      case 'student-profile-edit':
        return <StudentProfileEdit onNavigate={setCurrentPage} />;
      case 'mentor-profile-setup':
        return <MentorProfileSetup onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={setCurrentPage} currentPage={currentPage} />
      {renderPage()}
    </div>
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