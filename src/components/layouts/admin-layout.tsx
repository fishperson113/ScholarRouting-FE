import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { paths } from '@/config/paths';
import { useUser, useLogout } from '@/lib/auth';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: paths.admin.dashboard.getHref() },
    { name: 'Conversations', path: paths.admin.conversations.getHref() },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav className="mt-6">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-6 py-3 hover:bg-gray-800 transition ${
              location.pathname === item.path ? 'bg-gray-800 border-l-4 border-blue-500' : ''
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

const Topbar = () => {
  const navigate = useNavigate();
  const user = useUser();
  const logout = useLogout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    const email = user.data?.email || '';
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to={paths.home.getHref()} className="flex items-center space-x-2">
          <img src="/Logo.png" alt="ScholarshipRouting Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-semibold text-gray-900">ScholarshipRouting</span>
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{getInitials()}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user.data?.email?.split('@')[0]}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  logout.mutate(undefined, {
                    onSuccess: () => navigate(paths.home.getHref())
                  });
                  setIsDropdownOpen(false);
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
    </header>
  );
};

export const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
