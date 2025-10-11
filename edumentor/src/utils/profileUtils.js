import { supabase } from '../lib/supabase';

// File upload to Supabase Storage
export const uploadFile = async (file, bucket, path) => {
  try {
    // Validate file size
    const maxSize = bucket === 'avatars' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for images, 5MB for PDFs
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validDocTypes = ['application/pdf'];
    
    if (bucket === 'avatars' && !validImageTypes.includes(file.type)) {
      throw new Error('Only JPG, PNG, and WebP images are allowed');
    }
    
    if (bucket === 'documents' && !validDocTypes.includes(file.type)) {
      throw new Error('Only PDF files are allowed');
    }

    // Upload file
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};

// Validate phone number (E.164 format)
export const validatePhone = (phone) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// Validate URL
export const validateURL = (url) => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Calculate profile completion percentage
export const calculateProfileCompletion = (profile, role) => {
  if (!profile) return 0;

  let total = 0;
  let completed = 0;

  const checkField = (field) => {
    total++;
    if (field && field !== '' && field !== null && field !== undefined) {
      if (Array.isArray(field)) {
        if (field.length > 0) completed++;
      } else if (typeof field === 'object') {
        if (Object.keys(field).length > 0) completed++;
      } else {
        completed++;
      }
    }
  };

  if (role === 'student') {
    // Required fields for students
    checkField(profile.full_name);
    checkField(profile.display_name);
    checkField(profile.education_level);
    checkField(profile.year_of_study);
    checkField(profile.primary_interests);
    checkField(profile.top_skills);
    checkField(profile.learning_goals);
    checkField(profile.timezone);
    checkField(profile.avatar_url);
    
    // Optional but important
    checkField(profile.institution);
    checkField(profile.program);
    checkField(profile.phone);
    checkField(profile.languages);
    checkField(profile.resume_url);
  } else if (role === 'mentor') {
    // Required fields for mentors
    checkField(profile.full_name);
    checkField(profile.display_name);
    checkField(profile.title);
    checkField(profile.organization);
    checkField(profile.experience);
    checkField(profile.industries);
    checkField(profile.skills);
    checkField(profile.focus_areas);
    checkField(profile.availability);
    checkField(profile.session_types);
    checkField(profile.bio);
    checkField(profile.timezone);
    checkField(profile.languages);
    checkField(profile.avatar_url);
    
    // Optional
    checkField(profile.phone);
    checkField(profile.verification_docs_url);
  }

  return Math.round((completed / total) * 100);
};

// Debounce function for auto-save
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Update profile field with optimistic UI
export const updateProfileField = async (userId, table, field, value) => {
  try {
    // Handle different field names for different tables
    let updateData = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    // Map common field names to correct database columns
    const fieldMappings = {
      'student_profiles': {
        'full_name': 'full_name',
        'display_name': 'display_name', 
        'phone': 'phone',
        'education_level': 'education_level',
        'institution': 'institution',
        'major': 'major',
        'program': 'major', // map program to major
        'year_of_study': 'year_of_study',
        'primary_interests': 'primary_interests',
        'top_skills': 'top_skills',
        'learning_goals': 'learning_goals',
        'bio': 'learning_goals', // map bio to learning_goals for students
        'avatar_url': 'avatar_url',
        'linkedin_url': 'linkedin_url',
        'github_url': 'github_url',
        'portfolio_url': 'portfolio_url',
        'languages': 'languages'
      },
      'mentor_profiles': {
        'full_name': 'full_name',
        'display_name': 'display_name',
        'phone': 'phone',
        'title': 'title',
        'organization': 'organization',
        'experience_years': 'experience_years',
        'industries': 'industries',
        'expertise': 'expertise',
        'bio': 'bio',
        'avatar_url': 'avatar_url',
        'linkedin_url': 'linkedin_url',
        'portfolio_url': 'portfolio_url',
        'languages': 'languages'
      }
    };

    const mappedField = fieldMappings[table]?.[field] || field;
    updateData[mappedField] = value;

    const { error } = await supabase
      .from(table)
      .upsert(updateData, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update main profile (profiles table)
export const updateMainProfile = async (userId, updates) => {
  try {
    // Ensure updated_at is always set
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};