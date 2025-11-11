import { useScholarships, useScholarshipCard } from '@/hooks';
import { ScholarshipCard } from '@/features/scholarships/components';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Complete example showing scholarships in a grid layout
 * This handles the API response structure with items[].source
 */
export const ScholarshipGrid = () => {
  // Fetch scholarships using the search/filter hook
  const { 
    scholarships: rawScholarships, 
    isLoading, 
    total,
    hasMore,
    loadMore,
  } = useScholarships({
    collection: 'scholarships_212',
    initialPageSize: 20,
  });

  // Transform data for display - handles both direct array and items[].source structure
  const { scholarships, handleSave, handleViewDetails } = useScholarshipCard(rawScholarships);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (scholarships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No scholarships found.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Scholarships</h2>
          <p className="text-gray-600 mt-1">
            {total} scholarship{total !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.map((scholarship) => (
          <ScholarshipCard
            key={scholarship.id}
            {...scholarship}
            onSave={handleSave}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
            className="px-8"
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
      {!hasMore && scholarships.length > 0 && (
        <div className="text-center pt-6">
          <p className="text-gray-500 text-sm">
            All {total} scholarships loaded
          </p>
        </div>
      )}
    </div>
  );
};
