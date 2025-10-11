import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Award, 
  Calendar, 
  Users, 
  Star,
  TrendingUp,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const MentorDashboard = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorProfile();
  }, [user]);

  const fetchMentorProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setMentorProfile(data);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C38A] mx-auto mb-4"></div>
          <p className="text-[#A6B4C8]">Loading your dashboard...</p>
        </div>
      </div>
    );
  };

  const verificationStatus = mentorProfile?.verification_status || 'unverified';

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#00C38A] to-[#1F6FEB] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome, {profile?.full_name || 'Mentor'}! 🌟
              </h1>
              <p className="text-lg opacity-90">
                Help shape the future of students through your expertise
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <Award className="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status Banner */}
        {verificationStatus !== 'verified' && (
          <div className={`mb-6 rounded-xl p-4 flex items-start ${
            verificationStatus === 'unverified' 
              ? 'bg-yellow-50 border border-yellow-200' 
              : verificationStatus === 'pending'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle className={`h-6 w-6 mr-3 flex-shrink-0 ${
              verificationStatus === 'unverified' 
                ? 'text-yellow-600' 
                : verificationStatus === 'pending'
                ? 'text-blue-600'
                : 'text-red-600'
            }`} />
            <div>
              <h3 className={`font-semibold mb-1 ${
                verificationStatus === 'unverified' 
                  ? 'text-yellow-800' 
                  : verificationStatus === 'pending'
                  ? 'text-blue-800'
                  : 'text-red-800'
              }`}>
                {verificationStatus === 'unverified' && 'Complete Your Verification'}
                {verificationStatus === 'pending' && 'Verification Pending'}
                {verificationStatus === 'rejected' && 'Verification Rejected'}
              </h3>
              <p className={`text-sm ${
                verificationStatus === 'unverified' 
                  ? 'text-yellow-700' 
                  : verificationStatus === 'pending'
                  ? 'text-blue-700'
                  : 'text-red-700'
              }`}>
                {verificationStatus === 'unverified' && 'Submit your credentials to start accepting students'}
                {verificationStatus === 'pending' && 'Your profile is under review. We\'ll notify you once approved.'}
                {verificationStatus === 'rejected' && 'Please resubmit with updated documents'}
              </p>
              {verificationStatus === 'unverified' && (
                <button className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm">
                  Submit Documents
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6 text-[#00C38A]" />}
            title="Total Students"
            value="0"
            change="+0 this week"
            color="green"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6 text-[#1F6FEB]" />}
            title="Sessions"
            value="0"
            change="0 upcoming"
            color="blue"
          />
          <StatCard
            icon={<Star className="h-6 w-6 text-[#FF6B6B]" />}
            title="Avg Rating"
            value="N/A"
            change="Be the first rated"
            color="coral"
          />
          <StatCard
            icon={<Award className="h-6 w-6 text-[#00C38A]" />}
            title="Badges"
            value="0"
            change="Earn more"
            color="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#101827]">
                  Session Requests
                </h2>
                <span className="bg-[#FF6B6B] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  0 New
                </span>
              </div>
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-[#E6EEF8] mx-auto mb-4" />
                <p className="text-[#A6B4C8] mb-2">No pending requests</p>
                <p className="text-sm text-[#A6B4C8]">
                  Students will be able to request sessions once you're verified
                </p>
              </div>
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
                <p className="text-[#A6B4C8]">No sessions scheduled</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#101827] mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <ActivityItem
                  icon={<CheckCircle className="h-5 w-5 text-[#00C38A]" />}
                  title="Profile Created"
                  description="Welcome to EduMentor!"
                  time="Just now"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#101827] mb-4">
                Profile Completion
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#A6B4C8]">Progress</span>
                  <span className="font-semibold text-[#101827]">30%</span>
                </div>
                <div className="w-full bg-[#E6EEF8] rounded-full h-2">
                  <div className="bg-[#00C38A] h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <ProfileTask completed={true} text="Create account" />
                <ProfileTask completed={false} text="Add professional details" />
                <ProfileTask completed={false} text="Set expertise areas" />
                <ProfileTask completed={false} text="Define availability" />
                <ProfileTask completed={false} text="Upload verification docs" />
              </ul>
              <button className="w-full mt-4 py-2 border border-[#00C38A] text-[#00C38A] rounded-lg hover:bg-[#00C38A] hover:text-white transition">
                Complete Profile
              </button>
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#101827] mb-4">
                This Week
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#A6B4C8] text-sm">Sessions Completed</span>
                  <span className="font-semibold text-[#101827]">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A6B4C8] text-sm">Response Time</span>
                  <span className="font-semibold text-[#101827]">N/A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A6B4C8] text-sm">New Students</span>
                  <span className="font-semibold text-[#101827]">0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#00C38A] to-[#1F6FEB] rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">
                Get Started
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Complete your profile and verification to start accepting students
              </p>
              <button className="w-full py-2 bg-white text-[#00C38A] rounded-lg hover:bg-opacity-90 transition font-semibold">
                Complete Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, change, color }) => {
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
      <div className="text-sm text-[#A6B4C8] mb-1">{title}</div>
      <div className="text-xs text-[#A6B4C8]">{change}</div>
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

// Activity Item Component
const ActivityItem = ({ icon, title, description, time }) => (
  <div className="flex items-start">
    <div className="mr-3 mt-1">{icon}</div>
    <div className="flex-1">
      <h4 className="text-sm font-medium text-[#101827]">{title}</h4>
      <p className="text-sm text-[#A6B4C8]">{description}</p>
      <span className="text-xs text-[#A6B4C8]">{time}</span>
    </div>
  </div>
);

export default MentorDashboard;