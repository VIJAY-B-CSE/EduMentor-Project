import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, ArrowRight, ArrowLeft, CheckCircle, Upload } from 'lucide-react';

const StudentProfileSetup = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    display_name: '',
    pronouns: '',
    phone: '',
    date_of_birth: '',
    
    // Step 2: Education
    education_level: '',
    institution: '',
    major: '',
    year_of_study: '',
    
    // Step 3: Career & Goals
    career_interests: [],
    skills: [],
    learning_goals: '',
    preferred_mode: '',
    
    // Step 4: Additional
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: [],
    linkedin_url: '',
    github_url: '',
    portfolio_url: ''
  });

  const educationLevels = [
    'K-12 (Middle School)',
    'K-12 (High School)',
    'Diploma',
    'Undergraduate',
    'Postgraduate',
    'Vocational/Trade',
    'Working Professional'
  ];

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Completed'];

  const careerInterestOptions = [
    'Software Development',
    'Data Science',
    'AI/Machine Learning',
    'UI/UX Design',
    'Product Management',
    'Digital Marketing',
    'Business Development',
    'Finance',
    'Healthcare',
    'Education/Teaching',
    'Research',
    'Entrepreneurship'
  ];

  const skillOptions = [
    'Python',
    'JavaScript',
    'Java',
    'React',
    'Node.js',
    'HTML/CSS',
    'SQL',
    'Data Analysis',
    'Communication',
    'Leadership',
    'Problem Solving',
    'Design Thinking',
    'Project Management'
  ];

  const preferredModes = [
    '1-on-1 Mentorship',
    'Group Learning',
    'Self-paced',
    'Hybrid'
  ];

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'];

  const pronounOptions = ['He/Him', 'She/Her', 'They/Them', 'Prefer not to say'];

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
      const profileUpdateData = {
        full_name: formData.display_name || profile.full_name,
        display_name: formData.display_name,
        pronouns: formData.pronouns,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        timezone: formData.timezone
      };
      
      console.log('Updating profile with data:', profileUpdateData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
      
      console.log('Profile updated successfully');

      // Update student_profiles table
      const studentUpdateData = {
        user_id: user.id,
        education_level: formData.education_level,
        institution: formData.institution,
        major: formData.major,
        year_of_study: formData.year_of_study,
        primary_interests: formData.career_interests.join(', '),
        top_skills: formData.skills.join(', '),
        learning_goals: formData.learning_goals,
        preferred_learning_mode: formData.preferred_mode,
        languages: formData.languages.join(', '),
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        portfolio_url: formData.portfolio_url,
        bio: formData.learning_goals,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating student profile with data:', studentUpdateData);
      
      const { error: studentError } = await supabase
        .from('student_profiles')
        .upsert(studentUpdateData, {
          onConflict: 'user_id'
        });

      if (studentError) {
        console.error('Student profile update error:', studentError);
        throw studentError;
      }
      
      console.log('Student profile updated successfully');

      // Navigate to dashboard
      navigate('/student/dashboard');
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
          <BookOpen className="h-12 w-12 text-[#1F6FEB] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#101827] mb-2">
            Complete Your Profile
          </h1>
          <p className="text-[#A6B4C8]">
            Tell us about yourself to get personalized mentor recommendations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-[#1F6FEB]' : 'bg-[#E6EEF8]'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-[#A6B4C8]">
            <span>Basic Info</span>
            <span>Education</span>
            <span>Career Goals</span>
            <span>Additional</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#101827] mb-6">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Display Name / Username *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  placeholder="How should we call you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Pronouns
                </label>
                <select
                  value={formData.pronouns}
                  onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                >
                  <option value="">Select pronouns</option>
                  {pronounOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
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
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                />
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#101827] mb-6">
                Education Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Education Level *
                </label>
                <select
                  value={formData.education_level}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                >
                  <option value="">Select your education level</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Institution / College Name
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  placeholder="e.g., Anna University"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Program / Major
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  placeholder="e.g., B.E. Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Year of Study
                </label>
                <select
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                >
                  <option value="">Select year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Career & Goals */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#101827] mb-6">
                Career Goals & Interests
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Primary Career Interests * (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {careerInterestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleMultiSelect('career_interests', interest)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        formData.career_interests.includes(interest)
                          ? 'border-[#1F6FEB] bg-[#1F6FEB] bg-opacity-10 text-[#1F6FEB]'
                          : 'border-[#E6EEF8] text-[#101827] hover:border-[#1F6FEB]'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Top Skills * (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleMultiSelect('skills', skill)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        formData.skills.includes(skill)
                          ? 'border-[#00C38A] bg-[#00C38A] bg-opacity-10 text-[#00C38A]'
                          : 'border-[#E6EEF8] text-[#101827] hover:border-[#00C38A]'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Learning Goals / Career Objective *
                </label>
                <textarea
                  value={formData.learning_goals}
                  onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  placeholder="e.g., Become a full-stack developer in 2 years, land an internship at a tech company..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Preferred Learning Mode
                </label>
                <select
                  value={formData.preferred_mode}
                  onChange={(e) => setFormData({ ...formData, preferred_mode: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                >
                  <option value="">Select mode</option>
                  {preferredModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-[#101827] mb-3">
                  Languages Known
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
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div className="bg-[#F7F9FB] rounded-lg p-4 mt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#00C38A] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#101827] mb-1">
                      Almost done!
                    </p>
                    <p className="text-sm text-[#A6B4C8]">
                      Click "Complete Profile" to start connecting with mentors
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
                className="px-6 py-3 bg-[#1F6FEB] text-white rounded-lg hover:bg-[#1557c0] transition flex items-center ml-auto"
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
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>

        {/* Skip for now */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="text-[#A6B4C8] hover:text-[#1F6FEB] transition text-sm"
          >
            Skip for now, I'll complete this later
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileSetup;