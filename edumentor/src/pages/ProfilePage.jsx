import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import TagInput from '../components/TagInput';
import MultiSelect from '../components/MultiSelect';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Target,
  Globe,
  Upload,
  Edit3,
  Save,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  MapPin,
  GraduationCap,
  Award
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});

  // Options for dropdowns
  const experienceOptions = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    '11-15 years',
    '16-20 years',
    'More than 20 years'
  ];

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Design',
    'Engineering',
    'Consulting',
    'Non-profit',
    'Government',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Other'
  ];

  const sessionTypeOptions = [
    'One-on-One Mentoring',
    'Group Sessions',
    'Workshop Facilitation',
    'Career Counseling',
    'Skill Assessment',
    'Project Review',
    'Interview Preparation',
    'Resume Review',
    'Networking Guidance',
    'Goal Setting'
  ];

  const durationOptions = [
    '30 minutes',
    '45 minutes',
    '1 hour',
    '1.5 hours',
    '2 hours',
    'Half day (4 hours)',
    'Full day (8 hours)'
  ];

  const educationLevelOptions = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate/PhD',
    'Professional Certification',
    'Other'
  ];

  const learningModeOptions = [
    'Online',
    'In-person',
    'Hybrid',
    'Self-paced',
    'Structured Program',
    'Mentorship',
    'Workshop',
    'Bootcamp'
  ];

  // Helper function to convert data to arrays (handles both JSONB and TEXT)
  const convertToArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim()) {
      return data.split(',').map(s => s.trim()).filter(s => s);
    }
    if (typeof data === 'object' && data !== null) {
      // Handle JSONB objects
      try {
        return Object.values(data).filter(v => v);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // Helper function to format multiple options for better display
  const formatMultipleOptions = (data) => {
    if (!data) return 'Not specified';
    if (Array.isArray(data)) {
      // Filter out empty strings and check if array has valid items
      const validItems = data.filter(item => item && item.trim && item.trim() !== '');
      if (validItems.length === 0) return 'Not specified';
      return validItems;
    }
    if (typeof data === 'string' && data.trim()) {
      const items = data.split(',').map(s => s.trim()).filter(s => s);
      if (items.length === 0) return 'Not specified';
      return items;
    }
    return 'Not specified';
  };

  useEffect(() => {
    if (user && profile) {
      fetchProfileData();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, profile]); // Add profile as dependency

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // First, get the latest profile data from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        // If profile doesn't exist, use the profile from AuthContext
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found in database, using AuthContext profile');
          setProfileData(profile || {});
          setLoading(false);
          return;
        }
        throw profileError;
      }
      
      console.log('Raw profile data from database:', profileData);
      console.log('Profile data fields check:', {
        display_name: profileData?.display_name,
        pronouns: profileData?.pronouns,
        date_of_birth: profileData?.date_of_birth,
        phone: profileData?.phone,
        full_name: profileData?.full_name
      });
      
      // Merge main profile data with role-specific data
      let mergedData = { 
        ...profileData,
        // Ensure we have fallback values for personal info
        display_name: profileData?.display_name || 'Not provided',
        pronouns: profileData?.pronouns || 'Not specified',
        date_of_birth: profileData?.date_of_birth || null,
        phone: profileData?.phone || 'Not provided'
      }; // Start with main profile data
      
      console.log('Initial merged data:', {
        display_name: mergedData.display_name,
        pronouns: mergedData.pronouns,
        date_of_birth: mergedData.date_of_birth,
        phone: mergedData.phone,
        full_name: mergedData.full_name
      });
      
      if (profileData?.role === 'student') {
        console.log('Fetching student profile data for user:', user.id);
        const { data, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Student profile fetch error:', error);
          throw error;
        }
        
        console.log('Student profile raw data:', data);
        
        if (data) {
          // Convert data to arrays and handle both JSONB and TEXT formats
          const processedData = {
            ...data,
            primary_interests: convertToArray(data.primary_interests),
            top_skills: convertToArray(data.top_skills),
            languages: convertToArray(data.languages),
            preferred_learning_mode: convertToArray(data.preferred_learning_mode)
          };
          
          console.log('Student processed data:', processedData);
          
          // Merge student-specific data but preserve main profile data for personal info
          mergedData = { 
            ...mergedData, 
            ...processedData,
            // Ensure personal info from main profile takes precedence
            display_name: profileData.display_name || mergedData.display_name,
            pronouns: profileData.pronouns || mergedData.pronouns,
            date_of_birth: profileData.date_of_birth || mergedData.date_of_birth,
            phone: profileData.phone || mergedData.phone,
            full_name: profileData.full_name || mergedData.full_name
          };
          
          console.log('Student merged data after processing:', {
            display_name: mergedData.display_name,
            pronouns: mergedData.pronouns,
            date_of_birth: mergedData.date_of_birth,
            phone: mergedData.phone,
            full_name: mergedData.full_name
          });
        } else {
          console.log('No student profile data found');
        }
      } else if (profileData?.role === 'mentor') {
        const { data, error } = await supabase
          .from('mentor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
        if (data) {
          // Convert data to arrays and handle both JSONB and TEXT formats
          const processedData = {
            ...data,
            industries: convertToArray(data.industries),
            skills: convertToArray(data.skills),
            focus_areas: convertToArray(data.focus_areas),
            session_types: convertToArray(data.session_types),
            session_duration_options: convertToArray(data.session_duration_options),
            languages: convertToArray(data.languages),
            // Fix experience_years to handle string values properly
            experience_years: data.experience_years ? 
              (typeof data.experience_years === 'string' ? 
               data.experience_years : 
               typeof data.experience_years === 'number' ? 
               data.experience_years.toString() : 
               data.experience_years) : ''
          };
          // Merge mentor-specific data but preserve main profile data for personal info
          mergedData = { 
            ...mergedData, 
            ...processedData,
            // Ensure personal info from main profile takes precedence
            display_name: profileData.display_name || mergedData.display_name,
            pronouns: profileData.pronouns || mergedData.pronouns,
            date_of_birth: profileData.date_of_birth || mergedData.date_of_birth,
            phone: profileData.phone || mergedData.phone,
            full_name: profileData.full_name || mergedData.full_name
          };
        }
      }
      
      setProfileData(mergedData || {});
      
      // Debug logging to help identify data fetching issues
      console.log('Profile data fetched:', {
        mainProfile: profileData,
        mergedData: mergedData,
        role: profileData?.role,
        displayName: mergedData?.display_name,
        pronouns: mergedData?.pronouns,
        dateOfBirth: mergedData?.date_of_birth,
        phone: mergedData?.phone,
        fullName: mergedData?.full_name
      });
      
      // Validate role consistency
      if (mergedData?.role && mergedData.role !== profile?.role) {
        console.warn('Role mismatch detected:', mergedData.role, 'vs', profile?.role);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    // Removed timeout to prevent hanging issues

    try {
      // Validate required fields
      if (!profileData.full_name?.trim()) {
        throw new Error('Full name is required');
      }

      // Check for unique display name if provided
      if (profileData.display_name?.trim()) {
        try {
          const { data: existingUsers, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('display_name', profileData.display_name.trim())
            .neq('id', user.id);
          
          if (checkError) {
            console.error('Error checking display name uniqueness:', checkError);
            // Don't throw error for this check, just log it and continue
          } else if (existingUsers && existingUsers.length > 0) {
            // If display name is taken, show error and stop save
            setError('Display name is already taken. Please choose a different one.');
            setSaving(false);
            return;
          }
        } catch (error) {
          console.error('Display name check failed:', error);
          // If check fails due to network error, continue with save
          if (error.message?.includes('already taken')) {
            setError(error.message);
            setSaving(false);
            return;
          }
        }
      }

      // Update main profile with only profile table fields
      const mainProfileUpdates = {
        full_name: profileData.full_name?.trim(),
        display_name: profileData.display_name?.trim() || null,
        pronouns: profileData.pronouns || null,
        date_of_birth: profileData.date_of_birth || null,
        phone: profileData.phone?.trim() || null,
        avatar_url: profileData.avatar_url,
        timezone: profileData.timezone || profile?.timezone,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(mainProfileUpdates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role-specific profile - separate the fields correctly
      const tableName = profile?.role === 'student' ? 'student_profiles' : 'mentor_profiles';
      
      let roleProfileData = {
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (profile?.role === 'student') {
        // Student-specific fields - convert arrays to comma-separated strings
        roleProfileData = {
          ...roleProfileData,
          education_level: profileData.education_level,
          institution: profileData.institution,
          major: profileData.major,
          program: profileData.program,
          year_of_study: profileData.year_of_study,
          primary_interests: Array.isArray(profileData.primary_interests) ? 
            profileData.primary_interests.join(', ') : (profileData.primary_interests || ''),
          top_skills: Array.isArray(profileData.top_skills) ? 
            profileData.top_skills.join(', ') : (profileData.top_skills || ''),
          learning_goals: profileData.learning_goals || '',
          preferred_learning_mode: Array.isArray(profileData.preferred_learning_mode) ? 
            profileData.preferred_learning_mode.join(', ') : (profileData.preferred_learning_mode || ''),
          languages: Array.isArray(profileData.languages) ? 
            profileData.languages.join(', ') : (profileData.languages || ''),
          bio: profileData.bio,
          resume_url: profileData.resume_url,
          linkedin_url: profileData.linkedin_url,
          github_url: profileData.github_url,
          portfolio_url: profileData.portfolio_url
        };
      } else {
        // Mentor-specific fields - convert arrays to comma-separated strings
        roleProfileData = {
          ...roleProfileData,
          title: profileData.title,
          organization: profileData.organization,
          experience_years: profileData.experience_years || null, // Keep as string for ranges like "3-5"
          industries: Array.isArray(profileData.industries) ? 
            profileData.industries.join(', ') : (profileData.industries || ''),
          skills: Array.isArray(profileData.skills) ? 
            profileData.skills.join(', ') : (profileData.skills || ''),
          focus_areas: Array.isArray(profileData.focus_areas) ? 
            profileData.focus_areas.join(', ') : (profileData.focus_areas || ''),
          session_types: Array.isArray(profileData.session_types) ? 
            profileData.session_types.join(', ') : (profileData.session_types || ''),
          session_duration_options: Array.isArray(profileData.session_duration_options) ? 
            profileData.session_duration_options.join(', ') : (profileData.session_duration_options || ''),
          languages: Array.isArray(profileData.languages) ? 
            profileData.languages.join(', ') : (profileData.languages || ''),
          bio: profileData.bio,
          verification_docs_url: profileData.verification_docs_url,
          linkedin_url: profileData.linkedin_url,
          portfolio_url: profileData.portfolio_url
        };
      }

      const { error: roleError } = await supabase
        .from(tableName)
        .upsert(roleProfileData, {
          onConflict: 'user_id'
        });

      if (roleError) throw roleError;

      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Refresh profile data
      setTimeout(() => {
        fetchProfileData();
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      // Always ensure saving state is reset, even if there's an error
      setSaving(false);
    }
  };

  const handleFileUpload = async (field, file) => {
    setUploadProgress({ ...uploadProgress, [field]: 'uploading' });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${field}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileData({ ...profileData, [field]: publicUrl });
      setUploadProgress({ ...uploadProgress, [field]: 'success' });
      
      setTimeout(() => {
        setUploadProgress({ ...uploadProgress, [field]: null });
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setUploadProgress({ ...uploadProgress, [field]: null });
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
    
    // Clear any existing errors when user makes changes
    if (error) {
      setError('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-[#1F6FEB] mx-auto mb-4" />
          <p className="text-[#A6B4C8]">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isStudent = profile?.role === 'student';
  const isMentor = profile?.role === 'mentor';

  // Debug logging for role detection
  console.log('Profile role:', profile?.role, 'isStudent:', isStudent, 'isMentor:', isMentor);

  return (
    <div className="min-h-screen bg-[#F7F9FB] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-[#1F6FEB] bg-[#F7F9FB] flex items-center justify-center">
                {profileData?.avatar_url || profile?.avatar_url ? (
                  <img 
                    src={profileData?.avatar_url || profile?.avatar_url} 
                    alt={profile?.full_name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-[#1F6FEB]" />
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#101827]">
                  {profileData?.full_name || profile?.full_name || 'User Profile'}
                </h1>
                <p className="text-[#A6B4C8] capitalize">
                  {profile?.role === 'student' ? 'Student' : 'Mentor'}
                </p>
                <p className="text-sm text-[#A6B4C8]">
                  {profileData?.institution || profileData?.organization || 'EduMentor Platform'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(isStudent ? '/student/dashboard' : '/mentor/dashboard')}
              className="px-4 py-2 border border-[#E6EEF8] text-[#101827] rounded-lg hover:bg-[#F7F9FB] transition w-full sm:w-auto"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User className="h-5 w-5 text-[#1F6FEB] mr-3" />
                <h2 className="text-lg font-semibold text-[#101827]">Personal Information</h2>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center px-4 py-2 bg-[#1F6FEB] text-white rounded-lg hover:bg-[#1557c0] transition"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Full Name *
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profileData?.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                    {profileData?.full_name || profile?.full_name || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Display Name / Username *
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profileData?.display_name || ''}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                    placeholder="e.g., AlexJ, Learner123"
                  />
                ) : (
                  <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                    {profileData?.display_name || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Pronouns
                </label>
                {editing ? (
                  <select
                    value={profileData?.pronouns || ''}
                    onChange={(e) => handleInputChange('pronouns', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  >
                    <option value="">Select pronouns</option>
                    <option value="He/Him">He/Him</option>
                    <option value="She/Her">She/Her</option>
                    <option value="They/Them">They/Them</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                    {profileData?.pronouns || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Date of Birth
                </label>
                {editing ? (
                  <input
                    type="date"
                    value={profileData?.date_of_birth || ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  />
                ) : (
                  <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827] flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {profileData?.date_of_birth || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Email Address
                </label>
                <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#A6B4C8] flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {profile?.email || 'Not provided'}
                </p>
                <p className="text-xs text-[#A6B4C8] mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={profileData?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                    placeholder="+91 9876543210"
                  />
                ) : (
                  <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827] flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {profileData?.phone || profile?.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Profile Picture *
                </label>
                {editing ? (
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleFileUpload('avatar_url', e.target.files[0])}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center px-4 py-2 border border-[#E6EEF8] rounded-lg hover:bg-[#F7F9FB] transition cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadProgress.avatar_url === 'uploading' ? 'Uploading...' : 'Upload Photo'}
                    </label>
                    {uploadProgress.avatar_url === 'success' && (
                      <CheckCircle className="h-5 w-5 text-[#00C38A]" />
                    )}
                  </div>
                ) : (
                  <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#A6B4C8]">
                    {profileData?.avatar_url || profile?.avatar_url ? 'Profile picture uploaded' : 'No profile picture'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101827] mb-2">
                  Timezone *
                </label>
                {editing ? (
                  <select
                    value={profile?.timezone || 'UTC'}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                  >
                    <option value="UTC">UTC</option>
                    <option value="GMT+5:30">GMT+5:30 (India)</option>
                    <option value="GMT-5">GMT-5 (EST)</option>
                    <option value="GMT-8">GMT-8 (PST)</option>
                    <option value="GMT+1">GMT+1 (CET)</option>
                    <option value="GMT+9">GMT+9 (JST)</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827] flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {profile?.timezone || 'UTC'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Education/Professional Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              {isStudent ? (
                <>
                  <GraduationCap className="h-5 w-5 text-[#1F6FEB] mr-3" />
                  <h2 className="text-lg font-semibold text-[#101827]">Education Information</h2>
                </>
              ) : (
                <>
                  <Briefcase className="h-5 w-5 text-[#00C38A] mr-3" />
                  <h2 className="text-lg font-semibold text-[#101827]">Professional Information</h2>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {isStudent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Education Level
                    </label>
                    {editing ? (
                      <select
                        value={profileData?.education_level || ''}
                        onChange={(e) => handleInputChange('education_level', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                      >
                        <option value="">Select education level</option>
                        <option value="K-12">K-12</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Postgraduate">Postgraduate</option>
                        <option value="Vocational">Vocational</option>
                        <option value="Working Professional">Working Professional</option>
                      </select>
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.education_level || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Institution/College
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profileData?.institution || ''}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                        placeholder="Enter institution name"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.institution || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Program/Major
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profileData?.major || profileData?.program || ''}
                        onChange={(e) => handleInputChange(isStudent ? 'major' : 'program', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                        placeholder="Enter program/major"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.major || profileData?.program || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Year of Study *
                    </label>
                    {editing ? (
                      <select
                        value={profileData?.year_of_study || ''}
                        onChange={(e) => handleInputChange('year_of_study', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                      >
                        <option value="">Select year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.year_of_study || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Preferred Learning Mode
                    </label>
                    {editing ? (
                      <MultiSelect
                        options={learningModeOptions}
                        selectedValues={Array.isArray(profileData?.preferred_learning_mode) ? profileData.preferred_learning_mode : []}
                        onChange={(values) => handleInputChange('preferred_learning_mode', values)}
                        placeholder="Select learning modes"
                        maxSelections={3}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {(() => {
                          const learningMode = formatMultipleOptions(profileData?.preferred_learning_mode);
                          if (Array.isArray(learningMode) && learningMode.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {learningMode.map((mode, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#9333EA] text-white text-sm rounded-full"
                                  >
                                    {mode}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return <span>{learningMode}</span>;
                        })()}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Languages Known
                    </label>
                    {editing ? (
                      <TagInput
                        tags={Array.isArray(profileData?.languages) ? profileData.languages : []}
                        onChange={(tags) => handleInputChange('languages', tags)}
                        placeholder="English, Tamil, Hindi, French"
                        maxTags={10}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {(() => {
                          const languages = formatMultipleOptions(profileData?.languages);
                          if (Array.isArray(languages) && languages.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {languages.map((lang, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#1F6FEB] text-white text-sm rounded-full"
                                  >
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return <span>{languages}</span>;
                        })()}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Professional Title
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profileData?.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                        placeholder="e.g., Senior Software Engineer"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.title || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Organization/Company
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profileData?.organization || ''}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                        placeholder="e.g., Google, Microsoft"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.organization || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Years of Experience
                    </label>
                    {editing ? (
                      <select
                        value={profileData?.experience_years || ''}
                        onChange={(e) => handleInputChange('experience_years', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                      >
                        <option value="">Select experience</option>
                        {experienceOptions.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.experience_years || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Verification Status
                    </label>
                    <p className={`px-4 py-3 rounded-lg flex items-center ${
                      profileData?.verification_status === 'verified' 
                        ? 'bg-green-50 text-green-800' 
                        : profileData?.verification_status === 'pending'
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'bg-gray-50 text-gray-800'
                    }`}>
                      <Award className="h-4 w-4 mr-2" />
                      {profileData?.verification_status === 'verified' ? 'Verified' : 
                       profileData?.verification_status === 'pending' ? 'Pending Review' : 'Unverified'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Career Interests & Skills (Students) / Expertise (Mentors) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Target className="h-5 w-5 text-[#FF6B6B] mr-3" />
              <h2 className="text-lg font-semibold text-[#101827]">
                {isStudent ? 'Career Interests & Skills' : 'Areas of Expertise'}
              </h2>
            </div>

            <div className="space-y-6">
              {isStudent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Primary Career Interests *
                    </label>
                    {editing ? (
                      <TagInput
                        tags={Array.isArray(profileData?.primary_interests) ? profileData.primary_interests : []}
                        onChange={(tags) => handleInputChange('primary_interests', tags)}
                        placeholder="Software Development, UI/UX, Data Science, AI, Marketing"
                        maxTags={10}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {(() => {
                          const interests = formatMultipleOptions(profileData?.primary_interests);
                          if (Array.isArray(interests) && interests.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {interests.map((interest, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#FF6B6B] text-white text-sm rounded-full"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return <span>{interests}</span>;
                        })()}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Top Skills *
                    </label>
                    {editing ? (
                      <TagInput
                        tags={Array.isArray(profileData?.top_skills) ? profileData.top_skills : []}
                        onChange={(tags) => handleInputChange('top_skills', tags)}
                        placeholder="Java, Python, HTML/CSS, React, Communication, Leadership"
                        maxTags={15}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {(() => {
                          const skills = formatMultipleOptions(profileData?.top_skills);
                          if (Array.isArray(skills) && skills.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#00C38A] text-white text-sm rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return <span>{skills}</span>;
                        })()}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Learning Goals / Career Objective *
                    </label>
                    {editing ? (
                      <textarea
                        value={profileData?.bio || profileData?.learning_goals || ''}
                        onChange={(e) => handleInputChange('learning_goals', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                        placeholder="Describe your career goals and learning objectives..."
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827] min-h-[100px]">
                        {profileData?.bio || profileData?.learning_goals || 'No goals specified'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Industry / Domain Expertise *
                    </label>
                    {editing ? (
                      <MultiSelect
                        options={industryOptions}
                        selectedValues={Array.isArray(profileData?.industries) ? profileData.industries : []}
                        onChange={(values) => handleInputChange('industries', values)}
                        placeholder="Select industries"
                        maxSelections={5}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {(() => {
                          const industries = formatMultipleOptions(profileData?.industries);
                          if (Array.isArray(industries) && industries.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {industries.map((industry, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#00C38A] text-white text-sm rounded-full"
                                  >
                                    {industry}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return <span>{industries}</span>;
                        })()}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Specializations / Skills *
                    </label>
                    {editing ? (
                      <TagInput
                        tags={Array.isArray(profileData?.skills) ? profileData.skills : []}
                        onChange={(tags) => handleInputChange('skills', tags)}
                        placeholder="React, Data Analytics, Cybersecurity, Product Design"
                        maxTags={20}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {(() => {
                          const skills = formatMultipleOptions(profileData?.skills);
                          if (Array.isArray(skills) && skills.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#1F6FEB] text-white text-sm rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return <span>{skills}</span>;
                        })()}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Mentorship Focus Areas *
                    </label>
                    {editing ? (
                      <TagInput
                        tags={Array.isArray(profileData?.focus_areas) ? profileData.focus_areas : []}
                        onChange={(tags) => handleInputChange('focus_areas', tags)}
                        placeholder="Career Guidance, Interview Prep, Resume Building, Skill Upskilling"
                        maxTags={10}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {(() => {
                          const focusAreas = formatMultipleOptions(profileData?.focus_areas);
                          if (Array.isArray(focusAreas) && focusAreas.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {focusAreas.map((area, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#FF6B6B] text-white text-sm rounded-full"
                                  >
                                    {area}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return <span>{focusAreas}</span>;
                        })()}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Professional Bio *
                    </label>
                    {editing ? (
                      <textarea
                        value={profileData?.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                        placeholder="Tell students about your expertise and mentoring style..."
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827] min-h-[100px]">
                        {profileData?.bio || 'No bio provided'}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Globe className="h-5 w-5 text-[#00C38A] mr-3" />
              <h2 className="text-lg font-semibold text-[#101827]">Additional Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {isStudent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Resume Upload
                    </label>
                    {editing ? (
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => e.target.files[0] && handleFileUpload('resume_url', e.target.files[0])}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="flex items-center px-4 py-2 border border-[#E6EEF8] rounded-lg hover:bg-[#F7F9FB] transition cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadProgress.resume_url === 'uploading' ? 'Uploading...' : 'Upload Resume (PDF)'}
                        </label>
                        {uploadProgress.resume_url === 'success' && (
                          <CheckCircle className="h-5 w-5 text-[#00C38A]" />
                        )}
                      </div>
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#A6B4C8]">
                        {profileData?.resume_url ? 'Resume uploaded' : 'No resume uploaded'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      LinkedIn Profile
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={profileData?.linkedin_url || ''}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.linkedin_url ? (
                          <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#1F6FEB] hover:underline">
                            {profileData.linkedin_url}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      GitHub Profile
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={profileData?.github_url || ''}
                        onChange={(e) => handleInputChange('github_url', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                        placeholder="https://github.com/yourusername"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.github_url ? (
                          <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className="text-[#1F6FEB] hover:underline">
                            {profileData.github_url}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Portfolio Website
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={profileData?.portfolio_url || ''}
                        onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.portfolio_url ? (
                          <a href={profileData.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-[#1F6FEB] hover:underline">
                            {profileData.portfolio_url}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Verification Document Upload *
                    </label>
                    {editing ? (
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files[0] && handleFileUpload('verification_docs_url', e.target.files[0])}
                          className="hidden"
                          id="verification-upload"
                        />
                        <label
                          htmlFor="verification-upload"
                          className="flex items-center px-4 py-2 border border-[#E6EEF8] rounded-lg hover:bg-[#F7F9FB] transition cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadProgress.verification_docs_url === 'uploading' ? 'Uploading...' : 'Upload Verification Docs'}
                        </label>
                        {uploadProgress.verification_docs_url === 'success' && (
                          <CheckCircle className="h-5 w-5 text-[#00C38A]" />
                        )}
                      </div>
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#A6B4C8]">
                        {profileData?.verification_docs_url ? 'Verification documents uploaded' : 'No verification documents'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      LinkedIn Profile
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={profileData?.linkedin_url || ''}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.linkedin_url ? (
                          <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#00C38A] hover:underline">
                            {profileData.linkedin_url}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Portfolio Website
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={profileData?.portfolio_url || ''}
                        onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C38A]"
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {profileData?.portfolio_url ? (
                          <a href={profileData.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-[#00C38A] hover:underline">
                            {profileData.portfolio_url}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#101827] mb-2">
                      Languages Spoken *
                    </label>
                    {editing ? (
                      <TagInput
                        tags={Array.isArray(profileData?.languages) ? profileData.languages : []}
                        onChange={(tags) => handleInputChange('languages', tags)}
                        placeholder="English, Tamil, Hindi"
                        maxTags={10}
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[#F7F9FB] rounded-lg text-[#101827]">
                        {(() => {
                          const languages = formatMultipleOptions(profileData?.languages);
                          if (Array.isArray(languages) && languages.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {languages.map((lang, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#00C38A] text-white text-sm rounded-full"
                                  >
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return <span>{languages}</span>;
                        })()}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => {
                  setEditing(false);
                  fetchProfileData(); // Reset changes
                }}
                className="px-6 py-2 border border-[#E6EEF8] text-[#101827] rounded-lg hover:bg-[#F7F9FB] transition flex items-center justify-center w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[#1F6FEB] text-white rounded-lg hover:bg-[#1557c0] transition flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
