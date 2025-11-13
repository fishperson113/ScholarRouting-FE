import { useState } from 'react';
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScholarships, useScholarshipCard } from '@/hooks';
import type { ScholarshipFilters } from '@/types';
import { ScholarshipFiltersComponent } from '@/features/scholarships/components/scholarship-filters';
import { ScholarshipSidebarFilters } from '@/features/scholarships/components/scholarship-sidebar-filters';
import { ScholarshipCard } from '@/features/scholarships/components';
import { Chatbot } from '@/components/chatbot';

const ScholarshipRoute = () => {
  const [selectedFilter, setSelectedFilter] = useState('Best Match');
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    scholarships: rawScholarships,
    isLoading,
    searchQuery,
    filters,
    total,
    hasMore,
    setSearch,
    updateFilters,
    loadMore,
  } = useScholarships();

  const { scholarships, handleSave, handleViewDetails } = useScholarshipCard(rawScholarships);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFiltersChange = (newFilters: ScholarshipFilters) => {
    updateFilters(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== 0 && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
      {/* Search Bar */}
      <div className="relative mb-6">
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
      <div className="flex items-center justify-between mb-6">
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
          <strong>{scholarships.length}</strong> scholarships found
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex gap-6">
        {/* Sidebar Filters - Show when filters are active */}
        {hasActiveFilters && (
          <div className="flex-shrink-0">
            <ScholarshipSidebarFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                {...scholarship}
                onSave={handleSave}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Load More */}
          {scholarships.length > 0 && hasMore && (
            <div className="text-center">
              <Button 
                variant="outline" 
                className="px-8"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading More...
                  </>
                ) : (
                  `Load More (${scholarships.length} of ${total})`
                )}
              </Button>
            </div>
          )}
          
          {/* All loaded message */}
          {scholarships.length > 0 && !hasMore && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                All {total} scholarships loaded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <ScholarshipFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
      />
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default ScholarshipRoute;