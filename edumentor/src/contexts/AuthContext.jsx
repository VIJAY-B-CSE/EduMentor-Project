import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check active session on mount
  useEffect(() => {
    let isInitialized = false;
    let timeoutId = null;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        await checkUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      } finally {
        if (!isInitialized) {
          setLoading(false);
          isInitialized = true;
        }
      }
    };

    // Add timeout to prevent infinite loading only for initial load
    timeoutId = setTimeout(() => {
      if (!isInitialized) {
        console.warn('Auth initialization timeout - setting loading to false');
        setLoading(false);
        isInitialized = true;
      }
    }, 8000); // Increased to 8 seconds

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        try {
          if (session?.user) {
            // Clear any existing timeout when user signs in
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
          isInitialized = true;
        }
      }
    );

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      console.log('AuthContext: Checking user session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('AuthContext: Session data:', session);
      if (session?.user) {
        console.log('AuthContext: User found, fetching profile...');
        await fetchUserProfile(session.user);
      } else {
        console.log('AuthContext: No user session found');
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking user:', error.message);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    }
  };

  const fetchUserProfile = async (authUser) => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      
      // Add timeout to profile fetching
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data: profileData, error } = await Promise.race([profilePromise, timeoutPromise]);

      if (error) {
        console.log('Profile fetch error (likely no profile exists):', error.message);
        // If profile doesn't exist, create a basic profile structure
        // This ensures the user can still navigate and complete setup
        const basicProfile = {
          id: authUser.id,
          email: authUser.email,
          role: 'student', // Default role
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Creating basic profile for user:', basicProfile);
        setUser(authUser);
        setProfile(basicProfile);
        setIsAuthenticated(true);
        return;
      }

      console.log('Profile fetched successfully:', profileData);
      setUser(authUser);
      setProfile(profileData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      // Even if profile fetch fails, create a basic profile structure
      const basicProfile = {
        id: authUser.id,
        email: authUser.email,
        role: 'student', // Default role
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Creating fallback profile for user:', basicProfile);
      setUser(authUser);
      setProfile(basicProfile);
      setIsAuthenticated(true);
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      // Step 1: Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Step 2: Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Create role-specific profile
        try {
          if (role === 'student') {
            const { error: studentError } = await supabase
              .from('student_profiles')
              .insert([{ 
                user_id: authData.user.id,
                education_level: '',
                institution: '',
                major: '',
                bio: ''
              }]);
            
            if (studentError) {
              console.error('Error creating student profile:', studentError);
            } else {
              console.log('Student profile created successfully');
            }
          } else if (role === 'mentor') {
            const { error: mentorError } = await supabase
              .from('mentor_profiles')
              .insert([{ 
                user_id: authData.user.id,
                title: '',
                experience_years: 0,
                verification_status: 'unverified',
                bio: ''
              }]);
            
            if (mentorError) {
              console.error('Error creating mentor profile:', mentorError);
            } else {
              console.log('Mentor profile created successfully');
            }
          }
        } catch (profileError) {
          console.error('Error in profile creation:', profileError);
        }

        return {
          success: true,
          message: 'Signup successful! Please check your email to verify your account.',
          user: authData.user,
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.message || 'Signup failed. Please try again.',
      };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return {
          success: false,
          message: error.message || 'Login failed. Please check your credentials.',
        };
      }

      if (data.user) {
        console.log('Login successful, user authenticated');
        // Don't wait for profile fetching here - let the auth state change handler handle it
        // This prevents the login from timing out while profile is being fetched
        return {
          success: true,
          message: 'Login successful!',
          user: data.user,
        };
      }

      return {
        success: false,
        message: 'Login failed. No user data received.',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error.message);
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send reset email.',
      };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password updated successfully!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update password.',
      };
    }
  };

  const value = {
    user,
    profile,
    isAuthenticated,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};