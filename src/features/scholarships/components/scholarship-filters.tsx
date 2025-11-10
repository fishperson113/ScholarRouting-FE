import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScholarshipFilters } from '../api';

export interface ExtendedScholarshipFilters extends ScholarshipFilters {
  fieldOfStudy?: string;
  degreeLevel?: string;
  minGPA?: number;
  minIELTS?: number;
}

interface ScholarshipFiltersProps {
  filters: ExtendedScholarshipFilters;
  onFiltersChange: (filters: ExtendedScholarshipFilters) => void;
  isVisible: boolean;
  onClose: () => void;
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

export const ScholarshipFiltersComponent = ({
  filters,
  onFiltersChange,
  isVisible,
  onClose,
  filterOptions
}: ScholarshipFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<ExtendedScholarshipFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    countries: true,
    fieldsOfStudy: true,
    requirements: true,
    fundingLevel: true,
    type: true,
    status: true
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof ExtendedScholarshipFilters, value: string | string[] | number | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const emptyFilters: ExtendedScholarshipFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== undefined && value !== '' && value !== 0 && (Array.isArray(value) ? value.length > 0 : true)
  );

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
    'Medicine',
    'Law',
    'Psychology',
    'Environmental Science',
    'International Relations'
  ];

  // Default degree levels
  const defaultDegreeLevels = filterOptions?.degreeLevels || [
    "Bachelor's degree",
    "Master's degree",
    "PhD",
    "Postdoctoral"
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Filter Scholarships</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-4">
          {/* Countries Section */}
          <div className="border-b pb-4">
            <button
              onClick={() => toggleSection('countries')}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Countries</h4>
                <p className="text-xs text-gray-500 mt-0.5">Select preferred study destinations</p>
              </div>
              {expandedSections.countries ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.countries && (
              <div className="mt-3">
                <select
                  value={localFilters.country || ''}
                  onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Fields of Study Section */}
          <div className="border-b pb-4">
            <button
              onClick={() => toggleSection('fieldsOfStudy')}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Fields of Study</h4>
                <p className="text-xs text-gray-500 mt-0.5">Filter by academic disciplines</p>
              </div>
              {expandedSections.fieldsOfStudy ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.fieldsOfStudy && (
              <div className="mt-3">
                <select
                  value={localFilters.fieldOfStudy || ''}
                  onChange={(e) => handleFilterChange('fieldOfStudy', e.target.value || undefined)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Fields of Study</option>
                  {defaultFieldsOfStudy.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Scholarship Requirements Section */}
          <div className="border-b pb-4">
            <button
              onClick={() => toggleSection('requirements')}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Scholarship Requirements</h4>
                <p className="text-xs text-gray-500 mt-0.5">Filter by minimum conditions to be met</p>
              </div>
              {expandedSections.requirements ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.requirements && (
              <div className="mt-3 space-y-4">
                {/* Degree Level */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Degree Level
                  </label>
                  <select
                    value={localFilters.degreeLevel || ''}
                    onChange={(e) => handleFilterChange('degreeLevel', e.target.value || undefined)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Degree Level</option>
                    {defaultDegreeLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Min GPA Required */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Min GPA Required
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="4.0"
                      placeholder="3.2"
                      value={localFilters.minGPA || ''}
                      onChange={(e) => handleFilterChange('minGPA', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Min IELTS Required */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Min IELTS Required
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9.0"
                      placeholder="6.5"
                      value={localFilters.minIELTS || ''}
                      onChange={(e) => handleFilterChange('minIELTS', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type Filter */}
          {filterOptions?.types && filterOptions.types.length > 0 && (
            <div className="border-b pb-4">
              <button
                onClick={() => toggleSection('type')}
                className="flex items-center justify-between w-full text-left"
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Scholarship Type</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Filter by scholarship provider type</p>
                </div>
                {expandedSections.type ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {expandedSections.type && (
                <div className="mt-3">
                  <select
                    value={localFilters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {filterOptions.types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Status Filter */}
          {filterOptions?.statuses && filterOptions.statuses.length > 0 && (
            <div className="border-b pb-4">
              <button
                onClick={() => toggleSection('status')}
                className="flex items-center justify-between w-full text-left"
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Status</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Filter by application status</p>
                </div>
                {expandedSections.status ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {expandedSections.status && (
                <div className="mt-3">
                  <select
                    value={localFilters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    {filterOptions.statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Funding Level Filter */}
          {filterOptions?.fundingLevels && filterOptions.fundingLevels.length > 0 && (
            <div className="pb-4">
              <button
                onClick={() => toggleSection('fundingLevel')}
                className="flex items-center justify-between w-full text-left"
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Funding Level</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Filter by scholarship funding amount</p>
                </div>
                {expandedSections.fundingLevel ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {expandedSections.fundingLevel && (
                <div className="mt-3">
                  <select
                    value={localFilters.fundingLevel || ''}
                    onChange={(e) => handleFilterChange('fundingLevel', e.target.value || undefined)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Funding Levels</option>
                    {filterOptions.fundingLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear All
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};