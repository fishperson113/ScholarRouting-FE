import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, MoreHorizontal, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useScholarshipApplications, useUpdateScholarshipApplication } from '@/lib/scholarship-api';
import { useUser } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import type { ScholarshipApplication } from '@/types/scholarship';

type ApplicationStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
type StatusFilterOption = 'All Status' | ApplicationStatus;

interface Application {
  id: string;
  scholarshipName: string;
  institution: string;
  location: string;
  status: ApplicationStatus;
  deadline: string;
  isUrgent?: boolean;
  amount: string;
}

const statusColors: Record<ApplicationStatus, string> = {
  'submitted': 'bg-blue-50 text-blue-700 border-blue-200',
  'under_review': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'accepted': 'bg-green-50 text-green-700 border-green-200',
  'rejected': 'bg-red-50 text-red-700 border-red-200',
  'withdrawn': 'bg-gray-50 text-gray-700 border-gray-200',
};

const statusLabels: Record<ApplicationStatus, string> = {
  'submitted': 'Submitted',
  'under_review': 'Under Review',
  'accepted': 'Accepted',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
};

const allStatusOptions: ApplicationStatus[] = ['submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'];

// Helper function to check if deadline is urgent
function isDeadlineUrgent(deadline: string): boolean {
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  } catch {
    return false;
  }
}

const ApplicationsRoute = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('All Status');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get current user
  const user = useUser();
  const uid = user.data?.uid;

  // Fetch applications from API
  const { data: applicationsData, isLoading, error } = useScholarshipApplications(uid);
  const updateApplicationMutation = useUpdateScholarshipApplication();

  // Transform API data to UI format
  const applications = useMemo(() => {
    if (!applicationsData?.applications) return [];
    
    return applicationsData.applications.map((app: ScholarshipApplication) => {
      // Check if deadline is urgent (within 30 days)
      const isUrgent = app.deadline ? isDeadlineUrgent(app.deadline) : false;
      
      // Ensure status is one of the valid values, default to 'submitted'
      const validStatus: ApplicationStatus = 
        app.status && ['submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'].includes(app.status)
          ? (app.status as ApplicationStatus)
          : 'submitted';
      
      return {
        id: app.scholarship_id,
        scholarshipName: app.scholarship_name || 'Unknown Scholarship',
        institution: app.institution || 'Unknown Institution',
        location: app.location || 'Unknown Location',
        status: validStatus,
        deadline: app.deadline || 'No deadline',
        isUrgent,
        amount: app.amount || 'Not specified',
      } as Application;
    });
  }, [applicationsData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
      
      if (openStatusDropdown) {
        const dropdownRef = statusDropdownRefs.current[openStatusDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setOpenStatusDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openStatusDropdown]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    if (!uid) return;
    
    try {
      await updateApplicationMutation.mutateAsync({
        uid,
        application: {
          scholarship_id: appId,
          status: newStatus,
        },
      });
      setOpenStatusDropdown(null);
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.scholarshipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.institution.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load applications. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Track the status of your scholarship applications.</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative" ref={filterDropdownRef}>
              <button 
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">{statusFilter}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {filterDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setStatusFilter('All Status');
                        setFilterDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                        statusFilter === 'All Status' && 'bg-gray-50 font-medium'
                      )}
                    >
                      All Status
                    </button>
                    {allStatusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setFilterDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                          statusFilter === status && 'bg-gray-50 font-medium'
                        )}
                      >
                        {statusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded transition-colors',
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded transition-colors',
                  viewMode === 'table'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scholarship
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {/* Actions */}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-gray-500">No applications found.</p>
                      {searchQuery && (
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      {/* Scholarship */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{app.scholarshipName}</div>
                          <div className="text-sm text-gray-500">
                            {app.institution} • {app.location}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 relative">
                        <div className="relative z-10" ref={el => statusDropdownRefs.current[app.id] = el}>
                          <button 
                            onClick={() => setOpenStatusDropdown(openStatusDropdown === app.id ? null : app.id)}
                            className={cn(
                              'inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium border',
                              statusColors[app.status]
                            )}
                          >
                            {statusLabels[app.status]}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          {openStatusDropdown === app.id && (
                            <div 
                              className="fixed mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-xl z-[100]"
                              style={{
                                top: `${statusDropdownRefs.current[app.id]?.getBoundingClientRect().bottom}px`,
                                left: `${statusDropdownRefs.current[app.id]?.getBoundingClientRect().left}px`
                              }}
                            >
                              <div className="py-1">
                                {allStatusOptions.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(app.id, status)}
                                    className={cn(
                                      'w-full text-left px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors',
                                      app.status === status && 'bg-purple-50 text-purple-700 font-medium'
                                    )}
                                  >
                                    {statusLabels[status]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{app.deadline}</span>
                          {app.isUrgent && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{app.amount}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsRoute;
