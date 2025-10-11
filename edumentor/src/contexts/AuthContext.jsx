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
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
    } catch (error) {
      console.error('Error checking user:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (authUser) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      setUser(authUser);
      setProfile(profileData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching profile:', error.message);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user);
        return {
          success: true,
          message: 'Login successful!',
          user: data.user,
        };
      }
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