import { useScholarships, useScholarshipCard } from '@/hooks';
import { ScholarshipCard } from '@/features/scholarships/components';

/**
 * Debug component to verify data fetching and transformation
 * Use this to troubleshoot if cards aren't showing correctly
 */
export const ScholarshipDebug = () => {
  const { scholarships: rawData, isLoading, total } = useScholarships({
    collection: 'scholarships_212',
    initialPageSize: 5, // Fetch just 5 for testing
  });

  const { scholarships, handleSave, handleViewDetails } = useScholarshipCard(rawData);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-2">📊 Debug Info</h2>
        <div className="space-y-1 text-sm">
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Total from API:</strong> {total}</p>
          <p><strong>Raw data items:</strong> {rawData?.length || 0}</p>
          <p><strong>Transformed cards:</strong> {scholarships?.length || 0}</p>
        </div>
      </div>

      {!isLoading && rawData && rawData.length > 0 && (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold mb-2">🔍 Raw Data Sample (First Item)</h3>
            <pre className="text-xs overflow-auto max-h-48 bg-white p-3 rounded border">
              {JSON.stringify(rawData[0], null, 2)}
            </pre>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold mb-2">✨ Transformed Card Data (First Item)</h3>
            <pre className="text-xs overflow-auto max-h-48 bg-white p-3 rounded border">
              {JSON.stringify(scholarships[0], null, 2)}
            </pre>
          </div>
        </>
      )}

      <div>
        <h3 className="font-bold text-xl mb-4">📋 Rendered Cards</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading scholarships...</p>
        ) : scholarships.length === 0 ? (
          <p className="text-red-500">❌ No scholarships to display</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {scholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                {...scholarship}
                onSave={handleSave}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
