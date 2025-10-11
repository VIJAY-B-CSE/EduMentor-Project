import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Menu, X, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navigation = ({ onNavigate }) => {
  const { isAuthenticated, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleProfileClick = () => {
    onNavigate('profile');
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <BookOpen className="h-8 w-8 text-[#1F6FEB]" />
            <span className="ml-2 text-xl font-semibold text-[#101827]">
              EduMentor
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('home')} 
              className="text-[#101827] hover:text-[#1F6FEB] transition"
            >
              About Us
            </button>
            <button className="text-[#101827] hover:text-[#1F6FEB] transition">
              Contact
            </button>
            {!isAuthenticated ? (
              <button 
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-[#1F6FEB] border border-[#1F6FEB] rounded-lg hover:bg-[#1F6FEB] hover:text-white transition"
              >
                Login
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Avatar with Dropdown */}
                <div 
                  className="flex items-center cursor-pointer hover:opacity-80 transition p-1 rounded-lg hover:bg-[#F7F9FB]"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1F6FEB] bg-[#F7F9FB] flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-[#1F6FEB]" />
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 ml-2 text-[#A6B4C8] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-[#E6EEF8] z-50">
                    {/* Profile Summary */}
                    <div className="p-4 border-b border-[#E6EEF8]">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1F6FEB] bg-[#F7F9FB] flex items-center justify-center">
                          {profile?.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt={profile.full_name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-7 w-7 text-[#1F6FEB]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#101827] truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-[#A6B4C8] truncate">
                            {profile?.email || 'user@example.com'}
                          </p>
                          <p className="text-xs text-[#1F6FEB] capitalize font-medium">
                            {profile?.role === 'student' ? 'Student' : profile?.role === 'mentor' ? 'Mentor' : 'Member'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className="w-full px-4 py-3 text-left text-sm text-[#101827] hover:bg-[#F7F9FB] transition flex items-center"
                      >
                        <Settings className="h-4 w-4 mr-3 text-[#A6B4C8]" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-[#FF6B6B] hover:bg-[#F7F9FB] transition flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#101827]" />
            ) : (
              <Menu className="h-6 w-6 text-[#101827]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-[#E6EEF8]">
            <button 
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }} 
              className="block w-full text-left px-4 py-2 text-[#101827] hover:bg-[#F7F9FB] rounded"
            >
              About Us
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-[#101827] hover:bg-[#F7F9FB] rounded"
            >
              Contact
            </button>
            {!isAuthenticated ? (
              <button 
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-[#1F6FEB] hover:bg-[#F7F9FB] rounded font-medium"
              >
                Login
              </button>
            ) : (
              <>
                {/* Mobile Profile Summary */}
                <div className="px-4 py-3 border-t border-[#E6EEF8] mt-2 pt-3">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1F6FEB] bg-[#F7F9FB] flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-[#1F6FEB]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#101827] truncate">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-[#A6B4C8] truncate">
                        {profile?.email || 'user@example.com'}
                      </p>
                      <p className="text-xs text-[#1F6FEB] capitalize font-medium">
                        {profile?.role === 'student' ? 'Student' : profile?.role === 'mentor' ? 'Mentor' : 'Member'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Menu Items */}
                <button 
                  onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-[#101827] hover:bg-[#F7F9FB] rounded font-medium flex items-center"
                >
                  <Settings className="h-4 w-4 mr-3 text-[#A6B4C8]" />
                  Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-[#FF6B6B] hover:bg-[#F7F9FB] rounded font-medium flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;