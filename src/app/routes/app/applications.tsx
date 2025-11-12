import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, MoreHorizontal, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

type ApplicationStatus = 'Interview' | 'Submitted' | 'In Progress' | 'Not Started' | 'Result';
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

const mockApplications: Application[] = [
  {
    id: '1',
    scholarshipName: 'Cambridge Trust Scholarship',
    institution: 'University of Cambridge',
    location: 'United Kingdom',
    status: 'Interview',
    deadline: '1/31/2024',
    isUrgent: true,
    amount: 'Full funding + living expenses',
  },
  {
    id: '2',
    scholarshipName: 'MIT Graduate Fellowship',
    institution: 'Massachusetts Institute of Technology',
    location: 'United States',
    status: 'Submitted',
    deadline: '2/1/2024',
    isUrgent: true,
    amount: 'Full tuition + $40,000/year',
  },
  {
    id: '3',
    scholarshipName: 'University of Oxford Graduate Scholarship',
    institution: 'University of Oxford',
    location: 'United Kingdom',
    status: 'In Progress',
    deadline: '3/15/2024',
    isUrgent: true,
    amount: 'Full tuition + £15,000/year',
  },
  {
    id: '4',
    scholarshipName: 'DAAD Study Scholarship',
    institution: 'German Academic Exchange Service',
    location: 'Germany',
    status: 'Not Started',
    deadline: '4/30/2024',
    isUrgent: true,
    amount: '€850/month + tuition',
  },
  {
    id: '5',
    scholarshipName: 'Fulbright Foreign Student Program',
    institution: 'Fulbright Commission',
    location: 'United States',
    status: 'Result',
    deadline: '5/15/2024',
    isUrgent: true,
    amount: 'Full funding + living expenses',
  },
];

const statusColors: Record<ApplicationStatus, string> = {
  'Interview': 'bg-blue-50 text-blue-700 border-blue-200',
  'Submitted': 'bg-green-50 text-green-700 border-green-200',
  'In Progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Not Started': 'bg-gray-50 text-gray-700 border-gray-200',
  'Result': 'bg-purple-50 text-purple-700 border-purple-200',
};

const allStatusOptions: ApplicationStatus[] = ['Interview', 'Submitted', 'In Progress', 'Not Started', 'Result'];

const ApplicationsRoute = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('All Status');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    setApplications(apps => 
      apps.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    );
    setOpenStatusDropdown(null);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.scholarshipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.institution.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                <div className="absolute top-full mt-1 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
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
                        {status}
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
          <div className="overflow-x-auto">
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
                {filteredApplications.map((app) => (
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
                    <td className="px-6 py-4">
                      <div className="relative" ref={el => statusDropdownRefs.current[app.id] = el}>
                        <button 
                          onClick={() => setOpenStatusDropdown(openStatusDropdown === app.id ? null : app.id)}
                          className={cn(
                            'inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium border',
                            statusColors[app.status]
                          )}
                        >
                          {app.status}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {openStatusDropdown === app.id && (
                          <div className="absolute top-full mt-1 left-0 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="py-1">
                              {allStatusOptions.map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(app.id, status)}
                                  className={cn(
                                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                                    app.status === status && 'bg-gray-50 font-medium'
                                  )}
                                >
                                  {status}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsRoute;