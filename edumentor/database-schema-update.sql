-- =====================================================
-- EduMentor Database Schema Update
-- Run this in Supabase SQL Editor to add missing fields
-- =====================================================

-- Add missing fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-US';

-- Add missing fields to student_profiles table
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS year_of_study TEXT,
ADD COLUMN IF NOT EXISTS program TEXT,
ADD COLUMN IF NOT EXISTS primary_interests JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS top_skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS learning_goals TEXT,
ADD COLUMN IF NOT EXISTS preferred_learning_mode TEXT,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Add missing fields to mentor_profiles table
ALTER TABLE public.mentor_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT,
ADD COLUMN IF NOT EXISTS industries JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS focus_areas JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS session_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS session_duration_options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

-- Update existing data to handle field mapping
-- Map bio to learning_goals for students if bio exists and learning_goals doesn't
UPDATE public.student_profiles 
SET learning_goals = bio 
WHERE bio IS NOT NULL AND learning_goals IS NULL;

-- Map program to major if program exists and major doesn't
UPDATE public.student_profiles 
SET major = program 
WHERE program IS NOT NULL AND major IS NULL;

-- Map career_interests to primary_interests if career_interests exists and primary_interests doesn't
UPDATE public.student_profiles 
SET primary_interests = career_interests 
WHERE career_interests IS NOT NULL AND primary_interests = '[]'::jsonb;

-- Map skills to top_skills if skills exists and top_skills doesn't
UPDATE public.student_profiles 
SET top_skills = skills 
WHERE skills IS NOT NULL AND top_skills = '[]'::jsonb;

-- Map expertise to skills for mentors if expertise exists and skills doesn't
UPDATE public.mentor_profiles 
SET skills = expertise 
WHERE expertise IS NOT NULL AND skills = '[]'::jsonb;

-- Map industries to industries for mentors (should already be correct)
-- Update mentor availability structure if needed
UPDATE public.mentor_profiles 
SET session_types = '["1-on-1", "Group Session", "Chat-Only", "Video Call"]'::jsonb
WHERE session_types IS NULL OR session_types = '[]'::jsonb;

UPDATE public.mentor_profiles 
SET session_duration_options = '["30", "45", "60"]'::jsonb
WHERE session_duration_options IS NULL OR session_duration_options = '[]'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_education_level ON public.student_profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON public.student_profiles(institution);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_title ON public.mentor_profiles(title);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_organization ON public.mentor_profiles(organization);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_verification_status ON public.mentor_profiles(verification_status);

-- =====================================================
-- SCHEMA UPDATE COMPLETE!
-- All required fields have been added to the database
-- =====================================================
