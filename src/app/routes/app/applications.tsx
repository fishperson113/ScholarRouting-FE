import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, MoreHorizontal, Calendar, AlertTriangle, X } from 'lucide-react';
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
  notes: string;
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

// Helper function to format ISO 8601 date to dd/mm/yyyy
function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return 'Invalid date';
  }
}

const ApplicationsRoute = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('All Status');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get current user
  const user = useUser();
  const uid = user.data?.uid;

  // Debug logging
  useEffect(() => {
    console.log('User data:', user.data);
    console.log('UID:', uid);
  }, [user.data, uid]);

  // Fetch applications from API - only when uid is available
  const { data: applicationsData, isLoading, error, refetch } = useScholarshipApplications(uid);
  const updateApplicationMutation = useUpdateScholarshipApplication();

  // Debug logging for API response
  useEffect(() => {
    if (applicationsData) {
      console.log('Applications data received:', applicationsData);
    }
    if (error) {
      console.error('Error fetching applications:', error);
    }
  }, [applicationsData, error]);

  // Transform API data to UI format
  const applications = useMemo(() => {
    if (!applicationsData?.applications) return [];
    
    return applicationsData.applications.map((app: any) => {
      // Format applied_date to dd/mm/yyyy for deadline column
      const formattedDeadline = app.applied_date ? formatDate(app.applied_date) : 'No deadline';
      
      // Check if deadline is urgent (within 30 days) using applied_date
      const isUrgent = app.applied_date ? isDeadlineUrgent(app.applied_date) : false;
      
      // Ensure status is one of the valid values, default to 'submitted'
      const validStatus: ApplicationStatus = 
        app.status && ['submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'].includes(app.status)
          ? (app.status as ApplicationStatus)
          : 'submitted';
      
      // The API returns 'name' not 'scholarship_name'
      const scholarshipName = app.name || app.scholarship_name || 'Unknown Scholarship';
      
      return {
        id: app.scholarship_id,
        scholarshipName: scholarshipName,
        institution: app.institution || 'Unknown Institution',
        location: app.location || 'Unknown Location',
        status: validStatus,
        deadline: formattedDeadline,
        isUrgent,
        notes: app.notes || '',
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

  // Not authenticated state
  if (!user.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your applications.</p>
        </div>
      </div>
    );
  }

  // Error state with detailed information
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to load applications</h2>
            <p className="text-red-800 mb-4">{errorMessage}</p>
            <div className="space-y-2 text-sm text-red-700">
              <p><strong>User ID:</strong> {uid || 'Not available'}</p>
              <p><strong>API URL:</strong> Check your .env file for VITE_APP_API_URL</p>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
          
          {/* Debug information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Check if your backend API is running</li>
              <li>Verify VITE_APP_API_URL in your .env file</li>
              <li>Ensure you're logged in with a valid account</li>
              <li>Check browser console for detailed error messages</li>
              <li>Verify Firebase configuration is correct</li>
            </ol>
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
                    Notes
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
                          
                          {openStatusDropdown === app.id && statusDropdownRefs.current[app.id] && (
                            <div 
                              className="fixed mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-2xl z-[100]"
                              style={{
                                top: `${statusDropdownRefs.current[app.id]!.getBoundingClientRect().bottom + 4}px`,
                                left: `${statusDropdownRefs.current[app.id]!.getBoundingClientRect().left}px`
                              }}
                            >
                              <div className="py-1 bg-white">
                                {allStatusOptions.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(app.id, status)}
                                    className={cn(
                                      'w-full text-left px-4 py-2 text-sm transition-colors bg-white',
                                      'hover:bg-purple-50 hover:text-purple-700',
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

                      {/* Notes */}
                      <td className="px-6 py-4">
                        {app.notes ? (
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setNotesDialogOpen(true);
                            }}
                            className="text-sm text-gray-900 hover:text-purple-600 transition-colors text-left max-w-xs truncate block"
                          >
                            {app.notes.length > 50 ? `${app.notes.substring(0, 50)}...` : app.notes}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No notes</span>
                        )}
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

      {/* Notes Dialog */}
      {notesDialogOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedApplication.scholarshipName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedApplication.institution} • {selectedApplication.location}
                </p>
              </div>
              <button
                onClick={() => {
                  setNotesDialogOpen(false);
                  setSelectedApplication(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              {selectedApplication.notes ? (
                <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.notes}</p>
              ) : (
                <p className="text-gray-400 italic">No notes available for this application.</p>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setNotesDialogOpen(false);
                  setSelectedApplication(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsRoute;
