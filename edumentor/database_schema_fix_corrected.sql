-- =====================================================
-- EduMentor Database Schema Fix - CORRECTED VERSION
-- Run this in Supabase SQL Editor to fix all issues
-- =====================================================

-- =====================================================
-- 1. ADD MISSING FIELDS TO PROFILES TABLE
-- =====================================================

-- Add missing fields to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- =====================================================
-- 2. ADD MISSING FIELDS TO STUDENT_PROFILES TABLE
-- =====================================================

-- Add missing fields to student_profiles table
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS year_of_study TEXT,
ADD COLUMN IF NOT EXISTS program TEXT,
ADD COLUMN IF NOT EXISTS primary_interests TEXT,
ADD COLUMN IF NOT EXISTS top_skills TEXT,
ADD COLUMN IF NOT EXISTS learning_goals TEXT,
ADD COLUMN IF NOT EXISTS preferred_learning_mode TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- =====================================================
-- 3. ADD MISSING FIELDS TO MENTOR_PROFILES TABLE
-- =====================================================

-- Add missing fields to mentor_profiles table
ALTER TABLE public.mentor_profiles 
ADD COLUMN IF NOT EXISTS organization TEXT,
ADD COLUMN IF NOT EXISTS industries TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS focus_areas TEXT,
ADD COLUMN IF NOT EXISTS session_types TEXT,
ADD COLUMN IF NOT EXISTS session_duration_options TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT;

-- =====================================================
-- 4. FIX EXPERIENCE_YEARS FIELD TYPE
-- =====================================================

-- Change experience_years from INTEGER to TEXT to handle string ranges
-- This is safe because we're not changing the data, just the type
ALTER TABLE public.mentor_profiles 
ALTER COLUMN experience_years TYPE TEXT USING experience_years::TEXT;

-- =====================================================
-- 5. CONVERT JSONB FIELDS TO TEXT (if they exist as JSONB)
-- =====================================================

-- Check if fields are JSONB and convert them to TEXT
-- This handles the case where some fields might be JSONB from previous schema

-- Convert student_profiles JSONB fields to TEXT if they exist
DO $$ 
BEGIN
    -- Check if primary_interests is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_profiles' 
        AND column_name = 'primary_interests' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.student_profiles 
        ALTER COLUMN primary_interests TYPE TEXT USING primary_interests::text;
    END IF;
    
    -- Check if top_skills is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_profiles' 
        AND column_name = 'top_skills' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.student_profiles 
        ALTER COLUMN top_skills TYPE TEXT USING top_skills::text;
    END IF;
    
    -- Check if languages is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_profiles' 
        AND column_name = 'languages' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.student_profiles 
        ALTER COLUMN languages TYPE TEXT USING languages::text;
    END IF;
    
    -- Check if preferred_learning_mode is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_profiles' 
        AND column_name = 'preferred_learning_mode' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.student_profiles 
        ALTER COLUMN preferred_learning_mode TYPE TEXT USING preferred_learning_mode::text;
    END IF;
END $$;

-- Convert mentor_profiles JSONB fields to TEXT if they exist
DO $$ 
BEGIN
    -- Check if industries is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mentor_profiles' 
        AND column_name = 'industries' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.mentor_profiles 
        ALTER COLUMN industries TYPE TEXT USING industries::text;
    END IF;
    
    -- Check if skills is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mentor_profiles' 
        AND column_name = 'skills' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.mentor_profiles 
        ALTER COLUMN skills TYPE TEXT USING skills::text;
    END IF;
    
    -- Check if focus_areas is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mentor_profiles' 
        AND column_name = 'focus_areas' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.mentor_profiles 
        ALTER COLUMN focus_areas TYPE TEXT USING focus_areas::text;
    END IF;
    
    -- Check if session_types is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mentor_profiles' 
        AND column_name = 'session_types' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.mentor_profiles 
        ALTER COLUMN session_types TYPE TEXT USING session_types::text;
    END IF;
    
    -- Check if session_duration_options is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mentor_profiles' 
        AND column_name = 'session_duration_options' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.mentor_profiles 
        ALTER COLUMN session_duration_options TYPE TEXT USING session_duration_options::text;
    END IF;
    
    -- Check if languages is JSONB and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mentor_profiles' 
        AND column_name = 'languages' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.mentor_profiles 
        ALTER COLUMN languages TYPE TEXT USING languages::text;
    END IF;
END $$;

-- =====================================================
-- 6. UPDATE EXISTING DATA TO USE PROPER DEFAULTS
-- =====================================================

-- Update profiles table to set proper defaults for empty fields
UPDATE public.profiles 
SET display_name = COALESCE(display_name, 'Not provided'),
    pronouns = COALESCE(pronouns, 'Not specified'),
    date_of_birth = COALESCE(date_of_birth, NULL)
WHERE display_name IS NULL OR display_name = '' OR pronouns IS NULL OR pronouns = '';

-- Update student_profiles table to set proper defaults
UPDATE public.student_profiles 
SET education_level = COALESCE(education_level, 'Not specified'),
    institution = COALESCE(institution, 'Not specified'),
    major = COALESCE(major, 'Not specified'),
    year_of_study = COALESCE(year_of_study, 'Not specified'),
    primary_interests = COALESCE(primary_interests, 'Not specified'),
    top_skills = COALESCE(top_skills, 'Not specified'),
    learning_goals = COALESCE(learning_goals, 'Not specified'),
    preferred_learning_mode = COALESCE(preferred_learning_mode, 'Not specified'),
    languages = COALESCE(languages, 'Not specified'),
    linkedin_url = COALESCE(linkedin_url, 'Not provided'),
    github_url = COALESCE(github_url, 'Not provided'),
    portfolio_url = COALESCE(portfolio_url, 'Not provided')
WHERE education_level IS NULL OR education_level = '' 
   OR institution IS NULL OR institution = ''
   OR major IS NULL OR major = '';

-- Update mentor_profiles table to set proper defaults
UPDATE public.mentor_profiles 
SET title = COALESCE(title, 'Not specified'),
    organization = COALESCE(organization, 'Not specified'),
    experience_years = COALESCE(experience_years, 'Not specified'),
    industries = COALESCE(industries, 'Not specified'),
    skills = COALESCE(skills, 'Not specified'),
    focus_areas = COALESCE(focus_areas, 'Not specified'),
    session_types = COALESCE(session_types, 'Not specified'),
    session_duration_options = COALESCE(session_duration_options, 'Not specified'),
    languages = COALESCE(languages, 'Not specified'),
    bio = COALESCE(bio, 'Not provided'),
    linkedin_url = COALESCE(linkedin_url, 'Not provided'),
    portfolio_url = COALESCE(portfolio_url, 'Not provided')
WHERE title IS NULL OR title = '' 
   OR organization IS NULL OR organization = '';

-- =====================================================
-- 7. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_student_profiles_education_level ON public.student_profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON public.student_profiles(institution);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_title ON public.mentor_profiles(title);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_organization ON public.mentor_profiles(organization);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_experience_years ON public.mentor_profiles(experience_years);

-- =====================================================
-- 8. VERIFY SCHEMA CHANGES
-- =====================================================

-- Check the updated schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'student_profiles', 'mentor_profiles')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- SCHEMA UPDATE COMPLETE!
-- The database now matches the application expectations
-- =====================================================
