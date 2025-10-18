import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  uploadFile,
  validatePhone,
  validateURL,
  calculateProfileCompletion,
  debounce,
  updateProfileField,
  updateMainProfile
} from '../utils/profileUtils';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Target,
  Globe,
  Upload,
  Check,
  X,
  Loader,
  AlertCircle,
  Save
} from 'lucide-react';

const StudentProfileEdit = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Fetch student profile
  useEffect(() => {
    if (user) {
      fetchStudentProfile();
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setStudentProfile(data || {});
      
      // Calculate profile completion
      const completion = calculateProfileCompletion(
        { ...profile, ...data },
        'student'
      );
      setProfileCompletion(completion);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-save function
  const autoSave = useCallback(
    debounce(async (field, value) => {
      setSaving({ ...saving, [field]: true });
      
      const table = field === 'phone' || field === 'avatar_url' ? 'profiles' : 'student_profiles';
      const func = table === 'profiles' ? updateMainProfile : updateProfileField;
      
      // Handle field mapping for student profiles
      let mappedField = field;
      if (table === 'student_profiles') {
        if (field === 'program') {
          mappedField = 'major'; // Map program to major in database
        } else if (field === 'bio') {
          mappedField = 'learning_goals'; // Map bio to learning_goals for students
        }
      }
      
      const result = table === 'profiles'
        ? await func(user.id, { [field]: value })
        : await func(user.id, table, mappedField, value);

      if (result.success) {
        // Recalculate profile completion
        const newProfile = { ...studentProfile, [field]: value };
        const completion = calculateProfileCompletion(
          { ...profile, ...newProfile },
          'student'
        );
        setProfileCompletion(completion);
        
        // Update main profile completion in users table
        await updateMainProfile(user.id, { profile_complete_pct: completion });
      } else {
        setErrors({ ...errors, [field]: result.error });
      }

      setSaving({ ...saving, [field]: false });
    }, 1000),
    [user, studentProfile, profile]
  );

  // Handle field change
  const handleFieldChange = (field, value) => {
    setStudentProfile({ ...studentProfile, [field]: value });
    setErrors({ ...errors, [field]: null });
    autoSave(field, value);
  };

  // Handle file upload
  const handleFileUpload = async (field, file, bucket) => {
    setUploadProgress({ ...uploadProgress, [field]: 'uploading' });
    
    const { url, error } = await uploadFile(
      file,
      bucket,
      `${user.id}/${field}`
    );

    if (error) {
      setErrors({ ...errors, [field]: error });
      setUploadProgress({ ...uploadProgress, [field]: null });
      return;
    }

    setUploadProgress({ ...uploadProgress, [field]: 'success' });
    handleFieldChange(field, url);
    
    setTimeout(() => {
      setUploadProgress({ ...uploadProgress, [field]: null });
    }, 2000);
  };

  // Handle multi-select
  const toggleArrayItem = (field, item) => {
    const current = studentProfile[field] || [];
    const newValue = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    handleFieldChange(field, newValue);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#1F6FEB]" />
      </div>
    );
  }

  const educationLevels = [
    'K-12',
    'Diploma',
    'Undergraduate',
    'Postgraduate',
    'Vocational',
    'Working Professional'
  ];

  const yearOptions = ['1', '2', '3', '4', 'Completed'];

  const careerInterests = [
    'Software Development',
    'Data Science',
    'UI/UX Design',
    'Product Management',
    'Finance',
    'Education',
    'Design',
    'Research',
    'Marketing',
    'Healthcare'
  ];

  const skills = [
    'Python',
    'JavaScript',
    'Java',
    'React',
    'Node.js',
    'SQL',
    'Machine Learning',
    'Communication',
    'Leadership',
    'Problem Solving'
  ];

  const learningModes = ['1-on-1', 'Group', 'Self-paced', 'Hybrid'];

  const languages = [
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Bengali',
    'Spanish',
    'French'
  ];

  const pronounOptions = [
    'He/Him',
    'She/Her',
    'They/Them',
    'Prefer not to say',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FB] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#101827]">
                Edit Your Profile
              </h1>
              <p className="text-[#A6B4C8] mt-1">
                Keep your information up to date
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#A6B4C8] mb-1">Profile Completion</div>
              <div className="flex items-center">
                <div className="w-32 bg-[#E6EEF8] rounded-full h-2 mr-3">
                  <div
                    className="bg-[#00C38A] h-2 rounded-full transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <span className="font-semibold text-[#101827]">
                  {profileCompletion}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Basic Information */}
          <FormSection title="Basic Information" icon={<User className="h-5 w-5" />}>
            <FormField
              label="Full Name"
              required
              value={studentProfile.full_name || profile?.full_name || ''}
              onChange={(e) => handleFieldChange('full_name', e.target.value)}
              saving={saving.full_name}
              error={errors.full_name}
              maxLength={100}
            />

            <FormField
              label="Display Name / Username"
              required
              value={studentProfile.display_name || ''}
              onChange={(e) => handleFieldChange('display_name', e.target.value)}
              saving={saving.display_name}
              error={errors.display_name}
              maxLength={50}
              helper="How you'll appear to mentors"
            />

            <FormField
              label="Email"
              type="email"
              value={profile?.email || ''}
              disabled
              icon={<Mail className="h-4 w-4" />}
              helper="Email cannot be changed. Contact support if needed."
            />

            <SelectField
              label="Pronouns"
              value={studentProfile.pronouns || ''}
              onChange={(e) => handleFieldChange('pronouns', e.target.value)}
              options={pronounOptions}
              saving={saving.pronouns}
            />

            <FormField
              label="Phone Number"
              type="tel"
              value={studentProfile.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              saving={saving.phone}
              error={errors.phone}
              placeholder="+919876543210"
              helper="E.164 format (e.g., +919876543210)"
              onBlur={(e) => {
                if (e.target.value && !validatePhone(e.target.value)) {
                  setErrors({ ...errors, phone: 'Invalid phone format' });
                }
              }}
            />

            <FormField
              label="Date of Birth"
              type="date"
              value={studentProfile.dob || ''}
              onChange={(e) => handleFieldChange('dob', e.target.value)}
              saving={saving.dob}
            />
          </FormSection>

          {/* Education */}
          <FormSection title="Education" icon={<Briefcase className="h-5 w-5" />}>
            <SelectField
              label="Education Level"
              required
              value={studentProfile.education_level || ''}
              onChange={(e) => handleFieldChange('education_level', e.target.value)}
              options={educationLevels}
              saving={saving.education_level}
            />

            <FormField
              label="Institution / College"
              value={studentProfile.institution || ''}
              onChange={(e) => handleFieldChange('institution', e.target.value)}
              saving={saving.institution}
              maxLength={150}
            />

            <FormField
              label="Program / Major"
              value={studentProfile.program || ''}
              onChange={(e) => handleFieldChange('program', e.target.value)}
              saving={saving.program}
              maxLength={150}
            />

            <SelectField
              label="Year of Study"
              required
              value={studentProfile.year_of_study || ''}
              onChange={(e) => handleFieldChange('year_of_study', e.target.value)}
              options={yearOptions}
              saving={saving.year_of_study}
            />
          </FormSection>

          {/* Career & Goals */}
          <FormSection title="Career & Goals" icon={<Target className="h-5 w-5" />}>
            <MultiSelectField
              label="Primary Career Interests"
              required
              helper="Select 1-3 interests"
              options={careerInterests}
              selected={studentProfile.primary_interests || []}
              onToggle={(item) => toggleArrayItem('primary_interests', item)}
              max={3}
              saving={saving.primary_interests}
            />

            <MultiSelectField
              label="Top Skills"
              required
              helper="Select 1-8 skills"
              options={skills}
              selected={studentProfile.top_skills || []}
              onToggle={(item) => toggleArrayItem('top_skills', item)}
              max={8}
              saving={saving.top_skills}
            />

            <TextAreaField
              label="Learning Goals / Career Objective"
              required
              value={studentProfile.learning_goals || ''}
              onChange={(e) => handleFieldChange('learning_goals', e.target.value)}
              saving={saving.learning_goals}
              maxLength={1000}
              rows={4}
            />

            <SelectField
              label="Preferred Learning Mode"
              value={studentProfile.preferred_mode || ''}
              onChange={(e) => handleFieldChange('preferred_mode', e.target.value)}
              options={learningModes}
              saving={saving.preferred_mode}
            />
          </FormSection>

          {/* Additional Info */}
          <FormSection title="Additional Information" icon={<Globe className="h-5 w-5" />}>
            <MultiSelectField
              label="Languages Known"
              options={languages}
              selected={studentProfile.languages || []}
              onToggle={(item) => toggleArrayItem('languages', item)}
              saving={saving.languages}
            />

            <FormField
              label="LinkedIn Profile"
              type="url"
              value={studentProfile.linkedin_url || ''}
              onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
              saving={saving.linkedin_url}
              placeholder="https://linkedin.com/in/yourprofile"
              onBlur={(e) => {
                if (e.target.value && !validateURL(e.target.value)) {
                  setErrors({ ...errors, linkedin_url: 'Invalid URL format' });
                }
              }}
            />

            <FormField
              label="GitHub Profile"
              type="url"
              value={studentProfile.github_url || ''}
              onChange={(e) => handleFieldChange('github_url', e.target.value)}
              saving={saving.github_url}
              placeholder="https://github.com/yourusername"
            />

            <FormField
              label="Portfolio Website"
              type="url"
              value={studentProfile.portfolio_url || ''}
              onChange={(e) => handleFieldChange('portfolio_url', e.target.value)}
              saving={saving.portfolio_url}
              placeholder="https://yourportfolio.com"
            />
          </FormSection>

          {/* Files */}
          <FormSection title="Profile Media" icon={<Upload className="h-5 w-5" />}>
            <FileUploadField
              label="Profile Picture"
              required
              accept="image/jpeg,image/png,image/webp"
              maxSize="2MB"
              currentUrl={profile?.avatar_url}
              onUpload={(file) => handleFileUpload('avatar_url', file, 'avatars')}
              uploading={uploadProgress.avatar_url === 'uploading'}
              success={uploadProgress.avatar_url === 'success'}
              error={errors.avatar_url}
            />

            <FileUploadField
              label="Resume (PDF)"
              accept="application/pdf"
              maxSize="5MB"
              currentUrl={studentProfile.resume_url}
              onUpload={(file) => handleFileUpload('resume_url', file, 'documents')}
              uploading={uploadProgress.resume_url === 'uploading'}
              success={uploadProgress.resume_url === 'success'}
              error={errors.resume_url}
            />
          </FormSection>

          {/* Actions */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-6">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-6 py-2 border border-[#E6EEF8] text-[#101827] rounded-lg hover:bg-[#F7F9FB] transition"
            >
              Back to Dashboard
            </button>
            <div className="text-sm text-[#00C38A] flex items-center">
              <Check className="h-4 w-4 mr-2" />
              All changes saved automatically
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Form Components

const FormSection = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center mb-6 pb-4 border-b border-[#E6EEF8]">
      <div className="text-[#1F6FEB] mr-3">{icon}</div>
      <h2 className="text-lg font-semibold text-[#101827]">{title}</h2>
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

const FormField = ({
  label,
  required,
  value,
  onChange,
  type = 'text',
  disabled,
  saving,
  error,
  helper,
  placeholder,
  maxLength,
  icon,
  onBlur
}) => (
  <div>
    <label className="block text-sm font-medium text-[#101827] mb-2">
      {label} {required && <span className="text-[#FF6B6B]">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-3 text-[#A6B4C8]">{icon}</div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full px-4 py-3 ${icon ? 'pl-10' : ''} border rounded-lg focus:outline-none focus:ring-2 transition ${
          disabled
            ? 'bg-[#F7F9FB] text-[#A6B4C8] cursor-not-allowed border-[#E6EEF8]'
            : error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-[#E6EEF8] focus:ring-[#1F6FEB] focus:border-transparent'
        }`}
      />
      {saving && (
        <div className="absolute right-3 top-3">
          <Loader className="h-5 w-5 animate-spin text-[#1F6FEB]" />
        </div>
      )}
    </div>
    {helper && !error && (
      <p className="text-xs text-[#A6B4C8] mt-1">{helper}</p>
    )}
    {error && (
      <p className="text-xs text-red-600 mt-1 flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" />
        {error}
      </p>
    )}
    {maxLength && value && (
      <p className="text-xs text-[#A6B4C8] mt-1 text-right">
        {value.length} / {maxLength}
      </p>
    )}
  </div>
);

const SelectField = ({ label, required, value, onChange, options, saving }) => (
  <div>
    <label className="block text-sm font-medium text-[#101827] mb-2">
      {label} {required && <span className="text-[#FF6B6B]">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] appearance-none bg-white"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {saving && (
        <div className="absolute right-10 top-3">
          <Loader className="h-5 w-5 animate-spin text-[#1F6FEB]" />
        </div>
      )}
    </div>
  </div>
);

const TextAreaField = ({ label, required, value, onChange, saving, maxLength, rows = 3 }) => (
  <div>
    <label className="block text-sm font-medium text-[#101827] mb-2">
      {label} {required && <span className="text-[#FF6B6B]">*</span>}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      maxLength={maxLength}
      className="w-full px-4 py-3 border border-[#E6EEF8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
    />
    {maxLength && value && (
      <p className="text-xs text-[#A6B4C8] mt-1 text-right">
        {value.length} / {maxLength}
      </p>
    )}
    {saving && (
      <p className="text-xs text-[#1F6FEB] mt-1 flex items-center">
        <Loader className="h-3 w-3 animate-spin mr-1" />
        Saving...
      </p>
    )}
  </div>
);

const MultiSelectField = ({ label, required, helper, options, selected, onToggle, max, saving }) => (
  <div>
    <label className="block text-sm font-medium text-[#101827] mb-2">
      {label} {required && <span className="text-[#FF6B6B]">*</span>}
    </label>
    {helper && <p className="text-xs text-[#A6B4C8] mb-3">{helper}</p>}
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          disabled={max && selected.length >= max && !selected.includes(option)}
          className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
            selected.includes(option)
              ? 'border-[#1F6FEB] bg-[#1F6FEB] bg-opacity-10 text-[#1F6FEB]'
              : 'border-[#E6EEF8] text-[#101827] hover:border-[#1F6FEB]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {option}
        </button>
      ))}
    </div>
    {saving && (
      <p className="text-xs text-[#1F6FEB] mt-2 flex items-center">
        <Loader className="h-3 w-3 animate-spin mr-1" />
        Saving...
      </p>
    )}
  </div>
);

const FileUploadField = ({ label, required, accept, maxSize, currentUrl, onUpload, uploading, success, error }) => (
  <div>
    <label className="block text-sm font-medium text-[#101827] mb-2">
      {label} {required && <span className="text-[#FF6B6B]">*</span>}
    </label>
    <div className="flex items-center space-x-4">
      {currentUrl && (
        <div className="flex-shrink-0">
          {accept.includes('image') ? (
            <img
              src={currentUrl}
              alt={label}
              className="h-20 w-20 rounded-lg object-cover"
            />
          ) : (
            <div className="h-20 w-20 bg-[#F7F9FB] rounded-lg flex items-center justify-center">
              <Upload className="h-8 w-8 text-[#A6B4C8]" />
            </div>
          )}
        </div>
      )}
      <div className="flex-1">
        <input
          type="file"
          accept={accept}
          onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
          className="hidden"
          id={`upload-${label}`}
        />
        <label
          htmlFor={`upload-${label}`}
          className="inline-flex items-center px-4 py-2 border border-[#E6EEF8] rounded-lg hover:bg-[#F7F9FB] transition cursor-pointer"
        >
          <Upload className="h-4 w-4 mr-2" />
          {currentUrl ? 'Change' : 'Upload'} {label}
        </label>
        <p className="text-xs text-[#A6B4C8] mt-1">
          Max size: {maxSize}
        </p>
        {uploading && (
          <p className="text-xs text-[#1F6FEB] mt-1 flex items-center">
            <Loader className="h-3 w-3 animate-spin mr-1" />
            Uploading...
          </p>
        )}
        {success && (
          <p className="text-xs text-[#00C38A] mt-1 flex items-center">
            <Check className="h-3 w-3 mr-1" />
            Uploaded successfully
          </p>
        )}
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <X className="h-3 w-3 mr-1" />
            {error}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default StudentProfileEdit;