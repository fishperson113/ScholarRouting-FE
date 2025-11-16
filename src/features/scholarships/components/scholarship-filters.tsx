import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ScholarshipFilters } from '@/types/scholarship';

// Default degree levels
const defaultDegreeLevels = [
  "Bachelor",
  "Master",
  "PhD",
  "Associate Degree",
  "Professional Degree"
];

interface ScholarshipFiltersProps {
  filters: ScholarshipFilters;
  onFiltersChange: (filters: ScholarshipFilters) => void;
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
  const [localFilters, setLocalFilters] = useState<ScholarshipFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    countries: true,
    fieldsOfStudy: true,
    degreeLevel: true,
    fundingLevel: true,
    type: true,
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof ScholarshipFilters, value: string | string[] | number | undefined) => {
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
    const emptyFilters: ScholarshipFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== undefined && value !== '' && value !== 0 && (Array.isArray(value) ? value.length > 0 : true)
  );

  // Default countries list
  const countries = [
   "Afghanistan", "Albania", "Algeria", "Antigua", "Australia", "Austria", "Azerbaijan",
"Bahamas", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
"Bosnia", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
"Cameroon", "Canada", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
"Croatia", "Cuba", "Cyprus", "Denmark", "Djibouti", "Dominica", "Ecuador", "Egypt", "El Salvador",
"Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
"Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras",
"Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
"Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
"Lebanon", "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
"Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova",
"Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
"Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan",
"Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
"Rwanda", "Samoa", "Senegal", "Serbia", "Seychelles", "Singapore", "Slovakia", "Slovenia",
"Somalia", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
"Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Tunisia", "Turkey", "Turkmenistan",
"Tuvalu", "Uganda", "Ukraine", "UAE", "UK", "USA", "Uzbekistan", "Vanuatu", "Venezuela",
"Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  // Default field of study options
  const defaultFieldsOfStudy = filterOptions?.fieldsOfStudy || [
    'Education & Training',
    'Arts, Design & Media',
    'Humanities & Social Sciences',
    'Economics & Business',
    'Law & Public Policy',
    'Natural Sciences',
    'IT & Data Science',
    'Engineering & Technology',
    'Construction & Planning',
    'Agriculture & Environment',
    'Healthcare & Medicine',
    'Social Services & Care',
    'Personal Services & Tourism',
    'Security & Defense',
    'Library & Information Management',
    'Transportation & Logistics',
    'All fields'
  ];

  // Default degree levels
  const defaultDegreeLevels = filterOptions?.degreeLevels || [
    "Bachelor",
    "Master",
    "PhD",

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

          {/* Degree Level Section */}
          <div className="border-b pb-4">
            <button
              onClick={() => toggleSection('degreeLevel')}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Degree Level</h4>
                <p className="text-xs text-gray-500 mt-0.5">Filter by required degree level</p>
              </div>
              {expandedSections.degreeLevel ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.degreeLevel && (
              <div className="mt-3">
                <select
                  value={localFilters.degreeLevel || ''}
                  onChange={(e) => handleFilterChange('degreeLevel', e.target.value || undefined)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Degree Levels</option>
                  {defaultDegreeLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Scholarship Type Section */}
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
                  <option value="Government">Government</option>
                  <option value="University">University</option>
                  <option value="Organization/Foundation">Organization/Foundation</option>
                </select>
              </div>
            )}
          </div>

          {/* Funding Level Filter */}
          <div className="pb-4">
            <button
              onClick={() => toggleSection('fundingLevel')}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Funding Level</h4>
                <p className="text-xs text-gray-500 mt-0.5">Filter by scholarship funding coverage</p>
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
                  <option value="Full scholarship">Full Scholarship</option>
                  <option value="Tuition Waiver">Tuition Waiver</option>
                  <option value="Stipend">Stipend</option>
                  <option value="Partial">Partial Funding</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Other Costs">Other Costs</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Partial Funding">Partial Funding</option>
                </select>
              </div>
            )}
          </div>
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