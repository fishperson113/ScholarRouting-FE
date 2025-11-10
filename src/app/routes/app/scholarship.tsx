import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Calendar, DollarSign, GraduationCap, ExternalLink, Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  useSearchScholarships, 
  useFilterScholarships, 
  useFilterOptions,
  ScholarshipFilters,
  Scholarship
} from '@/features/scholarships/api';
import { ScholarshipFiltersComponent } from '@/features/scholarships/components/scholarship-filters';

const ScholarshipRoute = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Best Match');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ScholarshipFilters>({});
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<any>(null);

  // API hooks
  const searchMutation = useSearchScholarships();
  const filterMutation = useFilterScholarships();
  const filterOptionsMutation = useFilterOptions();

  // Load initial scholarships and filter options
  useEffect(() => {
    loadScholarships();
    loadFilterOptions();
  }, []);

  const loadScholarships = async () => {
    setIsLoading(true);
    try {
      if (searchQuery.trim()) {
        const result = await searchMutation.mutateAsync({
          searchQuery,
          filters,
          sortBy: selectedFilter === 'Best Match' ? 'relevance' : 'createdAt',
          pageSize: 20
        });
        setScholarships(result.scholarships);
      } else {
        const result = await filterMutation.mutateAsync({
          filters,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          pageSize: 20
        });
        setScholarships(result.scholarships);
      }
    } catch (error) {
      console.error('Error loading scholarships:', error);
      setScholarships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const options = await filterOptionsMutation.mutateAsync();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // Trigger search when query or filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadScholarships();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, selectedFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFiltersChange = (newFilters: ScholarshipFilters) => {
    setFilters(newFilters);
  };

  const filteredScholarships = scholarships;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search scholarships by name, university, country..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Filters and Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-2 min-w-[120px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Filter className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Filters</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 px-6 py-2 min-w-[140px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <span className="whitespace-nowrap">{selectedFilter}</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <strong>{filteredScholarships.length}</strong> scholarships found
        </div>
      </div>

      {/* Loading State */}
      {isLoading && scholarships.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Loading scholarships...</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && scholarships.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No scholarships found</div>
          <div className="text-sm text-gray-400">
            Try adjusting your search terms or filters
          </div>
        </div>
      )}

      {/* Scholarship Cards */}
      <div className="space-y-4">
        {filteredScholarships.map((scholarship) => (
          <div key={scholarship.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {scholarship.title}
                  </h3>
                  {scholarship.status === 'Expired' && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                      Expired
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <span>{scholarship.organization}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🇧🇪 {scholarship.country}</span>
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>

            {/* Tags */}
            <div className="flex items-center space-x-2 mb-4">
              {scholarship.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 line-clamp-2">
              {scholarship.description}
            </p>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-xs text-gray-500">Funding Level</div>
                  <div className="text-sm font-medium">{scholarship.fundingLevel}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-500">Deadline</div>
                  <div className="text-sm font-medium">{scholarship.deadline}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-500">Required Degree</div>
                  <div className="text-sm font-medium">{scholarship.requiredDegree}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                View Details
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Save</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Official Site</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredScholarships.length > 0 && !isLoading && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="px-8"
            onClick={loadScholarships}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Scholarships'
            )}
          </Button>
        </div>
      )}

      {/* Filter Modal */}
      <ScholarshipFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
        filterOptions={filterOptions}
      />
    </div>
  );
};

export default ScholarshipRoute;