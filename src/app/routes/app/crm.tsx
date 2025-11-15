import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router';
import { ChevronDown, LogOut } from 'lucide-react';
import { isAdmin } from '@/lib/authorization';
import { useUser, useLogout } from '@/lib/auth';
import { paths } from '@/config/paths';
import { useCrmStats, useCrmThreads, useCrmThread } from '@/hooks/use-crm';
import type { ConversationStatus } from '@/types/crm';

export const CrmRoute = () => {
  const navigate = useNavigate();
  const user = useUser();
  const logout = useLogout();

  // All hooks must be called before any conditional returns
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stats } = useCrmStats();
  const { data: threads = [] } = useCrmThreads(statusFilter);
  const { data: conversation } = useCrmThread(selectedThreadId);

  // Show nothing while loading
  if (user.isLoading) {
    return null;
  }

  // Redirect if not authenticated
  if (!user.data) {
    return <Navigate to={paths.home.getHref()} replace />;
  }

  // Redirect if not admin
  if (!isAdmin(user.data)) {
    return <Navigate to={paths.app.scholarships.getHref()} replace />;
  }

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

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: ConversationStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'old': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = () => {
    const email = user.data?.email || '';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={paths.home.getHref()} className="flex items-center space-x-2">
              <img src="/Logo.png" alt="ScholarshipRouting Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-semibold text-gray-900">ScholarshipRouting</span>
            </Link>
            
            {/* Profile Avatar with Dropdown */}
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

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Dashboard Title */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">CRM Dashboard</h2>
              <p className="text-sm text-gray-500">Monitor chatbot conversations</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-200">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-medium">Total Threads</div>
                <div className="text-2xl font-bold text-blue-700 mt-1">{stats?.totalThreads || 0}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-600 font-medium">Active Threads</div>
                <div className="text-2xl font-bold text-green-700 mt-1">{stats?.activeThreads || 0}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-purple-600 font-medium">Total Messages</div>
                <div className="text-2xl font-bold text-purple-700 mt-1">{stats?.totalMessages || 0}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xs text-orange-600 font-medium">Avg Response</div>
                <div className="text-lg font-bold text-orange-700 mt-1">{stats?.avgResponseTime || 0} min</div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-4 py-3 border-b border-gray-200">
              {['all', 'active', 'inactive', 'old'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                    statusFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Thread List */}
            <div className="flex-1 overflow-y-auto">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition ${
                    selectedThreadId === thread.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium text-gray-900">{thread.userName}</div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(thread.status)}`}>
                      {thread.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">ID: {thread.userId}</div>
                  <div className="text-sm text-gray-600 truncate mb-2">{thread.lastMessage}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>🕒 {thread.lastActivity}</span>
                    <span>💬 {thread.messageCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedThreadId && conversation ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{conversation.thread.userName}</h2>
                  <p className="text-sm text-gray-500">ID: {conversation.thread.userId}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {conversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-md ${
                        message.sender === 'user' 
                          ? 'bg-gray-100' 
                          : message.sender === 'bot'
                          ? 'bg-blue-100'
                          : 'bg-green-100'
                      } rounded-lg px-4 py-2`}>
                        <div className="text-xs font-medium mb-1 text-gray-600">
                          {message.sender === 'user' ? 'User' : message.sender === 'bot' ? 'Bot' : 'Admin'}
                        </div>
                        <div className="text-sm text-gray-900">{message.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thread Info Footer */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        <strong>Status:</strong> 
                        <span className={`px-2 py-1 rounded-full text-xs ml-2 ${getStatusColor(conversation.thread.status)}`}>
                          {conversation.thread.status}
                        </span>
                      </span>
                      <span className="text-gray-600">
                        <strong>Last Active:</strong> {conversation.thread.lastActivity}
                      </span>
                      <span className="text-gray-600">
                        <strong>Messages:</strong> {conversation.thread.messageCount}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-lg">No conversation selected</div>
                  <div className="text-sm mt-2">Select a thread from the sidebar to view the conversation</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default CrmRoute;
