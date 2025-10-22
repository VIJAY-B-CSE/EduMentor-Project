import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Award, ArrowRight, ArrowLeft, CheckCircle, Upload, AlertCircle } from 'lucide-react';

const MentorProfileSetup = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Step 1: Professional Info
    display_name: '',
    professional_title: '',
    organization: '',
    years_of_experience: '',
    
    // Step 2: Expertise
    industries: [],
    specializations: [],
    mentorship_focus: [],
    
    // Step 3: Availability
    session_types: [],
    session_durations: [],
    availability_slots: '',
    
    // Step 4: Additional
    short_bio: '',
    languages: [],
    linkedin_url: '',
    portfolio_url: '',
    phone: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const experienceOptions = ['0-2 years', '3-5 years', '6-10 years', '10+ years'];

  const industryOptions = [
    'Information Technology',
    'Finance & Banking',
    'Healthcare',
    'Education',
    'Marketing & Advertising',
    'Manufacturing',
    'Consulting',
    'E-commerce',
    'Government',
    'Non-Profit',
    'Media & Entertainment',
    'Real Estate'
  ];

  const specializationOptions = [
    'Software Development',
    'Data Science',
    'AI/Machine Learning',
    'UI/UX Design',
    'Product Management',
    'DevOps',
    'Cybersecurity',
    'Cloud Computing',
    'Mobile Development',
    'Digital Marketing',
    'Business Strategy',
    'Financial Analysis',
    'Human Resources',
    'Sales'
  ];

  const mentorshipFocusOptions = [
    'Career Guidance',
    'Interview Preparation',
    'Resume Building',
    'Skill Development',
    'Project Guidance',
    'Networking Tips',
    'Work-Life Balance',
    'Leadership Skills',
    'Entrepreneurship',
    'Technical Skills'
  ];

  const sessionTypeOptions = [
    '1-on-1 Session',
    'Group Session',
    'Chat-Only',
    'Video Call',
    'Phone Call'
  ];

  const durationOptions = ['30 minutes', '45 minutes', '60 minutes', '90 minutes'];

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'];

  const handleMultiSelect = (field, value) => {
    const current = formData[field];
    if (current.includes(value)) {
      setFormData({
        ...formData,
        [field]: current.filter(item => item !== value)
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...current, value]
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.display_name || profile.full_name,
          display_name: formData.display_name,
          phone: formData.phone,
          timezone: formData.timezone
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update mentor_profiles table
      const { error: mentorError } = await supabase
        .from('mentor_profiles')
        .upsert({
          user_id: user.id,
          title: formData.professional_title,
          organization: formData.organization,
          experience_years: formData.years_of_experience,
          industries: formData.industries.join(', '),
          skills: formData.specializations.join(', '),
          focus_areas: formData.mentorship_focus.join(', '),
          session_types: formData.session_types.join(', '),
          session_duration_options: formData.session_durations.join(', '),
          languages: formData.languages.join(', '),
          bio: formData.short_bio,
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
          verification_status: 'pending',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (mentorError) throw mentorError;

      // Navigate to dashboard
      navigate('/mentor/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Award className="h-12 w-12 text-[#00C38A] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#101827] mb-2">
            Complete Your Mentor Profile
          </h1>
          <p className="text-[#A6B4C8]">
            Share your expertise to help students achieve their goals
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-[#00C38A]' : 'bg-[#E6EEF8]'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-[#A6B4C8]">
            <span>Professional</span>
            <span>Expertise</span>
            <span>Availability</span>
            <span>Additional</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Professional Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#101827] mb-6">
                Professional Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                  placeholder="How should students address you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Professional Title *
                </label>
                <input
                  type="text"
                  value={formData.professional_title}
                  onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                  placeholder="e.g., Senior Software Engineer, Product Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Organization / Company *
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                  placeholder="e.g., Google, Microsoft, Startup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Years of Experience *
                </label>
                <select
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                >
                  <option value="">Select experience level</option>
                  {experienceOptions.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          )}

          {/* Step 2: Expertise */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#101827] mb-6">
                Your Expertise
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Industries * (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {industryOptions.map(industry => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => handleMultiSelect('industries', industry)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm text-left ${
                        formData.industries.includes(industry)
                          ? 'border-[#00C38A] bg-[#00C38A] bg-opacity-10 text-[#00C38A]'
                          : 'border-[#E6EEF8] text-[#101827] hover:border-[#00C38A]'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Specializations * (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {specializationOptions.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleMultiSelect('specializations', spec)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm text-left ${
                        formData.specializations.includes(spec)
                          ? 'border-[#1F6FEB] bg-[#1F6FEB] bg-opacity-10 text-[#1F6FEB]'
                          : 'border-[#E6EEF8] text-[#101827] hover:border-[#1F6FEB]'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Mentorship Focus Areas * (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {mentorshipFocusOptions.map(focus => (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => handleMultiSelect('mentorship_focus', focus)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm text-left ${
                        formData.mentorship_focus.includes(focus)
                          ? 'border-[#FF6B6B] bg-[#FF6B6B] bg-opacity-10 text-[#FF6B6B]'
                          : 'border-[#E6EEF8] text-[#101827] hover:border-[#FF6B6B]'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#101827] mb-6">
                Availability & Session Preferences
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Preferred Session Types * (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {sessionTypeOptions.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleMultiSelect('session_types', type)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        formData.session_types.includes(type)
                          ? 'border-[#00C38A] bg-[#00C38A] bg-opacity-10 text-[#00C38A]'
                          : 'border-[#E6EEF8] text-[#101827] hover:border-[#00C38A]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Session Duration Options * (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {durationOptions.map(duration => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => handleMultiSelect('session_durations', duration)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        formData.session_durations.includes(duration)
                          ? 'border-[#1F6FEB] bg-[#1F6FEB] bg-opacity-10 text-[#1F6FEB]'
                          : 'border-[#E6EEF8] text-[#101827] hover:border-[#1F6FEB]'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  General Availability
                </label>
                <textarea
                  value={formData.availability_slots}
                  onChange={(e) => setFormData({ ...formData, availability_slots: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                  placeholder="e.g., Weekdays 6 PM - 9 PM IST, Weekends flexible"
                />
                <p className="text-xs text-[#A6B4C8] mt-1">
                  You can set specific slots later in your dashboard
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#101827] mb-6">
                Additional Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Short Bio *
                </label>
                <textarea
                  value={formData.short_bio}
                  onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                  placeholder="Tell students about your journey, what you can help with, and your mentoring style..."
                />
                <p className="text-xs text-[#A6B4C8] mt-1">
                  This will be displayed on your mentor card
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Languages Spoken * (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleMultiSelect('languages', lang)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        formData.languages.includes(lang)
                          ? 'border-[#FF6B6B] bg-[#FF6B6B] bg-opacity-10 text-[#FF6B6B]'
                          : 'border-[#E6EEF8] text-[#101827] hover:border-[#FF6B6B]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  LinkedIn Profile *
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Portfolio / Website
                </label>
                <input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Verification Required
                    </p>
                    <p className="text-sm text-yellow-700">
                      After completing your profile, an admin will review and verify your credentials. You'll be notified once approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#E6EEF8]">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-[#E6EEF8] text-[#101827] rounded-lg hover:bg-[#F7F9FB] transition flex items-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-[#00C38A] text-white rounded-lg hover:bg-[#00a872] transition flex items-center ml-auto"
              >
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-[#00C38A] text-white rounded-lg hover:bg-[#00a872] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            )}
          </div>
        </div>

        {/* Skip for now */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/mentor/dashboard')}
            className="text-[#A6B4C8] hover:text-[#00C38A] transition text-sm"
          >
            Skip for now, I'll complete this later
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorProfileSetup;