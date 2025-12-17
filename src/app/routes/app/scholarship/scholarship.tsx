import { useState } from 'react';
import { Search, Menu, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScholarships, useScholarshipCard } from '@/hooks';
import type { ScholarshipFilters } from '@/types';
import { ScholarshipSidebarFilters } from '@/features/scholarships/components/scholarship-sidebar-filters';
import { ScholarshipCard } from '@/features/scholarships/components';
import { Chatbot } from '@/components/chatbot';

const ScholarshipRoute = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
      <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Search Bar */}
      <div className="relative mb-4 md:mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search scholarships by name, university, country..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Filters Toggle and Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <Button
          variant="outline"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-full sm:w-auto"
        >
          <span className="inline-flex items-center gap-2">
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>{isSidebarOpen ? 'Hide' : 'Show'} Filters</span>
          </span>
        </Button>
        
        <div className="text-sm text-gray-600 text-center sm:text-left">
          <strong>{total}</strong> scholarships found
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters - Desktop: sticky sidebar, Mobile: full width */}
        {isSidebarOpen && (
          <div className="w-full lg:w-auto lg:flex-shrink-0">
            <ScholarshipSidebarFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 space-y-6 min-w-0">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
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
      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default ScholarshipRoute;