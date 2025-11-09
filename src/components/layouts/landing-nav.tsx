import { Bell } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';

export const LandingNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎓</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              ScholarshipRouting
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
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
              to={paths.app.deadlines.getHref()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              📅 Deadlines
            </Link>
            <Link
              to={paths.app.profile.getHref()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              👤 Profile
            </Link>
          </div>

          {/* Right side - Notification & Profile */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">T</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                Trần Dương Tuấn
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
