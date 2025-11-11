import type { ScholarshipFilters } from '@/types/scholarship';

interface ScholarshipSidebarFiltersProps {
  filters: ScholarshipFilters;
  onFiltersChange: (filters: ScholarshipFilters) => void;
  filterOptions?: {
    countries: string[];
    types: string[];
    statuses: string[];
    fundingLevels: string[];
    tags: string[];
    fieldsOfStudy?: string[];
    degreeLevels?: string[];
  };
}

export const ScholarshipSidebarFilters = ({
  filters,
  onFiltersChange,
  filterOptions
}: ScholarshipSidebarFiltersProps) => {
  const handleFilterChange = (key: keyof ScholarshipFilters, value: string | string[] | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  // Default countries list
  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Switzerland",
    "France",
    "Japan",
    "South Korea",
    "Singapore",
    "New Zealand"
  ];

  // Default field of study options
  const defaultFieldsOfStudy = filterOptions?.fieldsOfStudy || [
    'Computer Science',
    'Data Science',
    'Engineering',
    'Business Administration',
    'Economics',
    'Medicine'
  ];

  // Default degree levels
  const defaultDegreeLevels = filterOptions?.degreeLevels || [
    "Bachelor's degree",
    "Master's degree",
    "PhD"
  ];

  return (
    <div className="w-72 bg-white border border-gray-200 rounded-lg p-4 space-y-6 h-fit sticky top-6">
      {/* Filters Header */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">Filters</h3>
      </div>

      {/* Scholarship Requirements */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Scholarship Requirements</h4>
        <p className="text-xs text-gray-500 mb-3">Filter by minimum conditions to be met</p>
        
        <div className="space-y-3">
          {/* Degree Level */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Degree Level
            </label>
            <select
              value={filters.degreeLevel || ''}
              onChange={(e) => handleFilterChange('degreeLevel', e.target.value || undefined)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Degree Level</option>
              {defaultDegreeLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Min GPA and IELTS */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Min GPA Required
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                placeholder="3.2"
                value={filters.minGPA || ''}
                onChange={(e) => handleFilterChange('minGPA', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Min IELTS Required
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="9.0"
                placeholder="6.5"
                value={filters.minIELTS || ''}
                onChange={(e) => handleFilterChange('minIELTS', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Countries */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Countries</h4>
        <select
          value={filters.country || ''}
          onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      {/* Fields of Study */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Fields of Study</h4>
        <p className="text-xs text-gray-500 mb-2">Filter by academic disciplines</p>
        <select
          value={filters.fieldOfStudy || ''}
          onChange={(e) => handleFilterChange('fieldOfStudy', e.target.value || undefined)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Fields of Study</option>
          {defaultFieldsOfStudy.map(field => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>
      </div>
    </div>
  );
};