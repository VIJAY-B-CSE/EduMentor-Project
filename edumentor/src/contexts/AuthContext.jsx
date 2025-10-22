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
    let isProcessing = false;

    const initializeAuth = async () => {
      if (isProcessing) return;
      isProcessing = true;
      
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
        isProcessing = false;
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        // Handle token refresh errors gracefully
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing auth state');
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        if (isProcessing) {
          console.log('Already processing auth event, skipping...');
          return;
        }
        
        isProcessing = true;
        
        try {
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          // Don't clear auth state for non-critical errors
          if (error.message?.includes('refresh token') || error.message?.includes('Invalid Refresh Token')) {
            console.log('Refresh token error, clearing auth state');
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
          }
        } finally {
          setLoading(false);
          isInitialized = true;
          isProcessing = false;
        }
      }
    );

    return () => {
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
      
      // Fetch profile directly without timeout
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.log('Profile fetch error:', error.message);
        
        // If profile doesn't exist, try to create it first
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          const userRole = authUser.user_metadata?.role || 'student';
          const newProfile = {
            id: authUser.id,
            email: authUser.email,
            role: userRole,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            display_name: null,
            pronouns: null,
            date_of_birth: null,
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Try to insert the new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile]);
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            // Use fallback profile
            setUser(authUser);
            setProfile(newProfile);
            setIsAuthenticated(true);
            return;
          }
          
          console.log('Profile created successfully');
          
          // Create role-specific profile after main profile is created
          try {
            if (userRole === 'student') {
              const { error: studentError } = await supabase
                .from('student_profiles')
                .insert([{ 
                  user_id: authUser.id,
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
            } else if (userRole === 'mentor') {
              const { error: mentorError } = await supabase
                .from('mentor_profiles')
                .insert([{ 
                  user_id: authUser.id,
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
            console.error('Error creating role-specific profile:', profileError);
          }
          
          setUser(authUser);
          setProfile(newProfile);
          setIsAuthenticated(true);
          return;
        }
        
        // For other errors, create a basic profile structure
        const basicProfile = {
          id: authUser.id,
          email: authUser.email,
          role: 'student',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          display_name: null,
          pronouns: null,
          date_of_birth: null,
          phone: null,
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
        role: 'student',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        display_name: null,
        pronouns: null,
        date_of_birth: null,
        phone: null,
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
        // Profile creation will happen automatically after email verification
        // when the user logs in for the first time
        
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