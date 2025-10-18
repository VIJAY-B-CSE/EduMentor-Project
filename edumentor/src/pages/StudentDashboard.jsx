import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Target, 
  TrendingUp,
  Search,
  Star,
  Clock,
  ArrowRight
} from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('StudentDashboard: user changed', user);
    if (user) {
      fetchStudentProfile();
    } else {
      console.log('StudentDashboard: no user, stopping loading');
      setLoading(false);
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    if (!user) {
      console.log('StudentDashboard: No user, stopping loading');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('StudentDashboard: Fetching student profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('StudentDashboard: No student profile found, this is normal for new users');
        // If profile doesn't exist, that's okay - user might need to complete setup
        setStudentProfile(null);
      } else {
        console.log('StudentDashboard: Student profile fetched successfully:', data);
        setStudentProfile(data);
      }
    } catch (error) {
      console.error('StudentDashboard: Error fetching student profile:', error);
      setStudentProfile(null);
    } finally {
      console.log('StudentDashboard: Setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F6FEB] mx-auto mb-4"></div>
          <p className="text-[#A6B4C8]">Loading dashboard...</p>
          <p className="text-xs text-[#A6B4C8] mt-2">If this takes too long, try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Show setup prompt if no student profile exists
  if (!studentProfile && !loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="bg-[#1F6FEB] bg-opacity-10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-[#1F6FEB]" />
            </div>
            <h2 className="text-2xl font-bold text-[#101827] mb-2">Complete Your Profile</h2>
            <p className="text-[#A6B4C8]">Set up your student profile to get started with personalized learning.</p>
          </div>
          <button
            onClick={() => navigate('/student/profile-setup')}
            className="w-full bg-[#1F6FEB] text-white py-3 px-6 rounded-lg hover:bg-[#1557c0] transition font-medium"
          >
            Complete Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1F6FEB] to-[#00C38A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {profile?.full_name || 'Student'}! 👋
              </h1>
              <p className="text-lg opacity-90">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <BookOpen className="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6 text-[#1F6FEB]" />}
            title="Mentors"
            value="0"
            subtitle="Connected"
            color="blue"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6 text-[#00C38A]" />}
            title="Sessions"
            value="0"
            subtitle="Scheduled"
            color="green"
          />
          <StatCard
            icon={<Target className="h-6 w-6 text-[#FF6B6B]" />}
            title="Goals"
            value="0"
            subtitle="Active"
            color="coral"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-[#1F6FEB]" />}
            title="Progress"
            value="0%"
            subtitle="Completed"
            color="blue"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Find a Mentor Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#101827] mb-4">
                Find Your Perfect Mentor
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-5 w-5 text-[#A6B4C8]" />
                <input
                  type="text"
                  placeholder="Search by skills, industry, or expertise..."
                  className="w-full pl-10 pr-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                />
              </div>
              <p className="text-[#A6B4C8] text-sm mb-4">
                Connect with experienced professionals who can guide you towards your career goals.
              </p>
              <button className="w-full py-3 bg-[#1F6FEB] text-white rounded-lg hover:bg-[#1557c0] transition font-semibold flex items-center justify-center">
                Browse All Mentors
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#101827]">
                  Upcoming Sessions
                </h2>
                <button className="text-[#1F6FEB] text-sm hover:underline">
                  View All
                </button>
              </div>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-[#E6EEF8] mx-auto mb-4" />
                <p className="text-[#A6B4C8] mb-4">No sessions scheduled yet</p>
                <button className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#ff5252] transition">
                  Schedule Your First Session
                </button>
              </div>
            </div>

            {/* Recommended Mentors */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#101827] mb-4">
                Recommended for You
              </h2>
              <div className="space-y-4">
                <MentorCard
                  name="Coming Soon"
                  title="Mentor recommendations based on your profile"
                  rating={0}
                  sessions={0}
                  skills={[]}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#101827] mb-4">
                Complete Your Profile
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#A6B4C8]">Profile Progress</span>
                  <span className="font-semibold text-[#101827]">20%</span>
                </div>
                <div className="w-full bg-[#E6EEF8] rounded-full h-2">
                  <div className="bg-[#00C38A] h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <ProfileTask completed={true} text="Create account" />
                <ProfileTask completed={false} text="Add education details" />
                <ProfileTask completed={false} text="Set career interests" />
                <ProfileTask completed={false} text="Upload resume" />
                <ProfileTask completed={false} text="Take skill assessment" />
              </ul>
              <button 
                onClick={() => navigate('/student/profile-edit')}
                className="w-full mt-4 py-2 border border-[#1F6FEB] text-[#1F6FEB] rounded-lg hover:bg-[#1F6FEB] hover:text-white transition"
              >
                Edit Profile
              </button>
            </div>

            {/* Career Goals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#101827] mb-4">
                Your Career Goals
              </h3>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-[#E6EEF8] mx-auto mb-3" />
                <p className="text-[#A6B4C8] text-sm mb-4">
                  No goals set yet
                </p>
                <button className="text-[#1F6FEB] text-sm hover:underline">
                  + Set Your First Goal
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#1F6FEB] to-[#00C38A] rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">
                Need Help?
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Chat with our AI assistant for instant career guidance
              </p>
              <button className="w-full py-2 bg-white text-[#1F6FEB] rounded-lg hover:bg-opacity-90 transition font-semibold">
                Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-[#1F6FEB] bg-opacity-10',
    green: 'bg-[#00C38A] bg-opacity-10',
    coral: 'bg-[#FF6B6B] bg-opacity-10'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-[#101827] mb-1">{value}</div>
      <div className="text-sm text-[#A6B4C8]">{title} {subtitle}</div>
    </div>
  );
};

// Profile Task Component
const ProfileTask = ({ completed, text }) => (
  <li className="flex items-center">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
      completed ? 'bg-[#00C38A]' : 'border-2 border-[#E6EEF8]'
    }`}>
      {completed && <span className="text-white text-xs">✓</span>}
    </div>
    <span className={completed ? 'text-[#A6B4C8] line-through' : 'text-[#101827]'}>
      {text}
    </span>
  </li>
);

// Mentor Card Component
const MentorCard = ({ name, title, rating, sessions, skills }) => (
  <div className="border border-[#E6EEF8] rounded-lg p-4 hover:border-[#1F6FEB] transition cursor-pointer">
    <div className="flex items-start">
      <div className="w-12 h-12 bg-[#E6EEF8] rounded-full flex items-center justify-center mr-4">
        <Users className="h-6 w-6 text-[#A6B4C8]" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-[#101827]">{name}</h4>
        <p className="text-sm text-[#A6B4C8] mb-2">{title}</p>
        <div className="flex items-center text-sm text-[#A6B4C8]">
          <Star className="h-4 w-4 text-[#FF6B6B] mr-1" />
          <span>{rating || 'New'}</span>
          <span className="mx-2">•</span>
          <span>{sessions} sessions</span>
        </div>
      </div>
    </div>
  </div>
);

export default StudentDashboard;