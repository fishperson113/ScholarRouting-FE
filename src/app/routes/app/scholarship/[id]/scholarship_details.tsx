import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { env } from '@/config/env';

type TabType = 'overview' | 'eligibility' | 'documents' | 'funding' | 'requirements';

interface ScholarshipData {
  [key: string]: any;
}

const ScholarshipDetailsRoute = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [scholarship, setScholarship] = useState<ScholarshipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scholarship data from API
  useEffect(() => {
    const fetchScholarship = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const collection = 'scholarships_212'; // Default collection
        const url = `${env.API_URL}/firestore/${collection}/${id}`;
        console.log('Fetching scholarship from:', url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch scholarship: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        // Handle nested structure: { id: "...", data: {...} }
        const scholarshipData = result.data || result;
        console.log('Scholarship data:', scholarshipData);
        setScholarship(scholarshipData);
      } catch (err) {
        console.error('Error fetching scholarship:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scholarship');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

  // Helper function to get field value with fallbacks
  const getField = (field: string, fallback: string = 'N/A'): string => {
    if (!scholarship) return fallback;
    return scholarship[field] || fallback;
  };

  // Format deadline
  const formatDeadline = (deadline: string): string => {
    if (!deadline || deadline === 'N/A') return 'No deadline';
    try {
      const date = new Date(deadline);
      if (isNaN(date.getTime())) return deadline;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return deadline;
    }
  };

  // Check if urgent (within 30 days)
  const isUrgent = (): boolean => {
    const deadline = getField('End_Date', '');
    if (!deadline) return false;
    try {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    } catch {
      return false;
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility Fields' },
    { id: 'documents', label: 'Scholarship Documents' },
    { id: 'funding', label: 'Funding Details' },
    { id: 'requirements', label: 'Other Requirements' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-gray-600 text-lg">Loading scholarship details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Search</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to load scholarship</h2>
            <p className="text-red-800">{error || 'Scholarship not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Search</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {getField('Scholarship_Name', 'Untitled Scholarship')}
                </h1>
                <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {getField('Country', 'Unknown')}
                  </span>
                  {getField('Scholarship_Type') !== 'N/A' && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {getField('Scholarship_Type')}
                    </span>
                  )}
                  {getField('For_Vietnamese') === 'true' && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      For Vietnamese
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {isUrgent() && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded">
                    Urgent
                  </span>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-600">Scholarship Amount</div>
                  <div className="font-semibold text-gray-900 truncate">
                    {getField('Funding_Level') || getField('Funding_Details', 'Not specified')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-600">Application Deadline</div>
                  <div className="font-semibold text-gray-900 truncate">
                    {formatDeadline(getField('End_Date', ''))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-600">Degree Level</div>
                  <div className="font-semibold text-gray-900 truncate">
                    {getField('Required_Degree', 'Not specified')}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors font-medium',
                  isSaved
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                <Bookmark className={cn('w-5 h-5', isSaved && 'fill-purple-700')} />
                {isSaved ? 'Saved' : 'Save'}
              </button>

              {getField('Url') !== 'N/A' && (
                <a
                  href={getField('Url')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <ExternalLink className="w-5 h-5" />
                  Official Site
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'pb-4 px-2 font-medium transition-colors relative whitespace-nowrap',
                    activeTab === tab.id
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="prose max-w-none">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Scholarship</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {getField('Scholarship_Info', 'No description available.')}
                </div>
                
                {getField('Field_of_Study') !== 'N/A' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Field of Study</h3>
                    <p className="text-gray-700">{getField('Field_of_Study')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'eligibility' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Eligibility Requirements</h2>
                <div className="space-y-4">
                  {getField('Eligible_Fields') !== 'N/A' && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <span className="font-medium">Degree Level: </span>
                        <span className="text-gray-700">{getField('Eligible_Fields')}</span>
                      </div>
                    </div>
                  )}
                  {getField('Min_Gpa') !== 'N/A' && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <span className="font-medium">Minimum GPA: </span>
                        <span className="text-gray-700">{getField('Min_Gpa')}</span>
                      </div>
                    </div>
                  )}
                  {getField('Language_Certificate') !== 'N/A' && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <span className="font-medium">Language Requirements: </span>
                        <span className="text-gray-700">{getField('Language_Certificate')}</span>
                      </div>
                    </div>
                  )}
                  {getField('Min_IELTS') !== 'N/A' && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <span className="font-medium">Minimum IELTS: </span>
                        <span className="text-gray-700">{getField('Min_IELTS')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Scholarships Documents</h2>
                 <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {getField('Application_Documents', 'No description available.')}
                </div>
              </div>
            )}

            {activeTab === 'funding' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Funding Details</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {getField('Funding_Details', 'No description available.')}
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Scholarships</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {getField('Other_Requirements', 'No description available.')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailsRoute;
