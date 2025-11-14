import { Bell, ChevronDown, LogOut, User, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth';
import { paths } from '@/config/paths';
import { useUser, useLogout } from '@/lib/auth';
import { db } from '@/lib/firebase';

// Helper functions
const getInitials = (firstName?: string, lastName?: string, displayName?: string, email?: string) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (displayName) {
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return 'U';
};

const getDisplayName = (firstName?: string, lastName?: string, displayName?: string, email?: string) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (displayName) {
    return displayName;
  }
  if (email) {
    return email.split('@')[0];
  }
  return 'User';
};

// Hook to get user profile data
const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    },
    enabled: !!userId,
  });
};

export const LandingNav = () => {
  const navigate = useNavigate();
  const user = useUser();
  const logout = useLogout();
  const isAuthenticated = !!user.data;
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user profile data from Firestore
  const userProfile = useUserProfile(user.data?.uid);

  // Combine Firebase user data with Firestore profile data
  const userData = {
    firstName: userProfile.data?.firstName,
    lastName: userProfile.data?.lastName,
    displayName: user.data?.displayName,
    email: user.data?.email,
    photoURL: user.data?.photoURL || userProfile.data?.photoURL,
  };

  const userInitials = getInitials(userData.firstName, userData.lastName, userData.displayName || undefined, userData.email || undefined);
  const displayName = getDisplayName(userData.firstName, userData.lastName, userData.displayName || undefined, userData.email || undefined);

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      // Close mobile menu when clicking outside
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/Logo.png" alt="ScholarshipRouting Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-semibold text-gray-900">
              ScholarshipRouting
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-12">
            {isAuthenticated ? (
              <>
                <Link
                  to={paths.app.scholarships.getHref()}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  🔍 Scholarships
                </Link>
                <Link
                  to={paths.app.applications.getHref()}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  📄 My Applications
                </Link>
                <Link
                  to={paths.app.profile.getHref()}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  👤 Profile
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthDialogOpen(true);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  🔍 Scholarships
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthDialogOpen(true);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  📄 My Applications
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthDialogOpen(true);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  👤 Profile
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Right side - Auth buttons or User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    {userData.photoURL ? (
                      <img
                        src={userData.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{userInitials}</span>
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {displayName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to={paths.app.profile.getHref()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout.mutate(undefined, {
                            onSuccess: () => {
                              navigate(paths.home.getHref());
                            }
                          });
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Sign In Button */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthDialogOpen(true);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Button>

                {/* Sign Up Button */}
                <Button
                  onClick={() => {
                    setAuthMode('register');
                    setIsAuthDialogOpen(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 mobile-menu-container">
          <div className="px-4 py-2 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={paths.app.scholarships.getHref()}
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🔍 Scholarships
                </Link>
                <Link
                  to={paths.app.applications.getHref()}
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📄 My Applications
                </Link>
                <Link
                  to={paths.app.profile.getHref()}
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  👤 Profile
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthDialogOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  🔍 Scholarships
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthDialogOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  📄 My Applications
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthDialogOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  👤 Profile
                </button>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAuthMode('login');
                      setIsAuthDialogOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthDialogOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Sign up
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        defaultMode={authMode}
      />
    </nav>
  );
};
