import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { NotificationDropdown } from '@/components/notifications/notifications-dropdown';
import { Link, useNavigate, useLocation } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';


import { paths } from '@/config/paths';
import { useUser, useLogout } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

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
  return 'G'; // G for Guest
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
  return 'Guest';
};

// Helper to check if user is guest
const isGuestUser = (uid?: string) => {
  return uid?.startsWith('guest_') || false;
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
    enabled: !!userId && !isGuestUser(userId), // Don't fetch for guest users
  });
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const logout = useLogout();
  const isGuest = isGuestUser(user.data?.uid);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { warning } = useToast();

  // Get user profile data from Firestore (skip for guests)
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if current path is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  // Redirect guest users away from protected routes
  useEffect(() => {
    if (isGuest && (
      location.pathname === paths.app.applications.getHref() ||
      location.pathname === paths.app.profile.getHref()
    )) {
      navigate(paths.app.scholarships.getHref(), { replace: true });
    }
  }, [isGuest, location.pathname, navigate]);

  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={paths.home.getHref()} className="flex items-center space-x-2">
              <img src="/Logo.png" alt="ScholarshipRouting Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-semibold text-gray-900">
                ScholarshipRouting
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center justify-center flex-1 gap-12">
              <Link
                to={paths.app.scholarships.getHref()}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveLink(paths.app.scholarships.getHref())
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                🔍 Scholarships
              </Link>
              <Link
                to={paths.app.applications.getHref()}
                onClick={(e) => {
                  if (isGuest) {
                    e.preventDefault();
                    warning({
                      title: 'Authentication Required',
                      message: 'Please sign in to access My Applications',
                    });
                  }
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveLink(paths.app.applications.getHref())
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                📄 My Applications
              </Link>
              <Link
                to={paths.app.profile.getHref()}
                onClick={(e) => {
                  if (isGuest) {
                    e.preventDefault();
                    warning({
                      title: 'Authentication Required',
                      message: 'Please sign in to access your Profile',
                    });
                  }
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveLink(paths.app.profile.getHref())
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                👤 Profile
              </Link>
            </div>

            {/* Right Side - User Profile */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              {isGuest ? (
                <button
                  onClick={() => {
                    warning({
                      title: 'Authentication Required',
                      message: 'Please sign in to view notifications',
                    });
                  }}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors opacity-50"
                >
                  <Bell className="w-5 h-5" />
                </button>
              ) : (
                <NotificationDropdown />
              )}

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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to={paths.app.profile.getHref()}
                      onClick={(e) => {
                        if (isGuest) {
                          e.preventDefault();
                          warning({
                            title: 'Authentication Required',
                            message: 'Please sign in to access your Profile',
                          });
                        }
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};