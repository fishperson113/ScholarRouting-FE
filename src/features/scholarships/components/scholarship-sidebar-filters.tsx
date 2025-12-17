import type { ScholarshipFilters } from '@/types/scholarship';
import { useMemo } from 'react';

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

  // Memoize large country list to prevent recreation on every render
  const countries = useMemo(() => [
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
  ], []); // Memoize to prevent recreation

  // Memoize field of study options
  const defaultFieldsOfStudy = useMemo(() => filterOptions?.fieldsOfStudy || [
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
  ], [filterOptions?.fieldsOfStudy]);

  // Memoize degree levels
  const defaultDegreeLevels = useMemo(() => [
    "Bachelor",
    "Master",
    "PhD",
  ], []);

  return (
    <div className="w-full lg:w-72 bg-white border border-gray-200 rounded-lg p-4 space-y-6 h-fit lg:sticky lg:top-6">
      {/* Filters Header */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">Filters</h3>
      </div>

      {/* Countries */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Country</h4>
        <p className="text-xs text-gray-500 mb-2">Filter by destination country</p>
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
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Field of Study</h4>
        <p className="text-xs text-gray-500 mb-2">Filter by academic discipline</p>
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

      {/* Degree Level */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Degree Level</h4>
        <p className="text-xs text-gray-500 mb-2">Filter by required degree level</p>
        <select
          value={filters.degreeLevel || ''}
          onChange={(e) => handleFilterChange('degreeLevel', e.target.value || undefined)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Degree Levels</option>
          {defaultDegreeLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {/* Scholarship Type */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Scholarship Type</h4>
        <p className="text-xs text-gray-500 mb-2">Filter by provider type</p>
        <select
          value={filters.type || ''}
          onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="Government">Government</option>
          <option value="University">University</option>
          <option value="Organization">Organization</option>
        </select>
      </div>

      {/* Funding Level */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Funding Level</h4>
        <p className="text-xs text-gray-500 mb-2">Filter by funding coverage</p>
        <select
          value={filters.fundingLevel || ''}
          onChange={(e) => handleFilterChange('fundingLevel', e.target.value || undefined)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Funding Levels</option>
          <option value="Full scholarship">Full Scholarship</option>
          <option value="Tuition Waiver">Tuition Waiver</option>
          <option value="Stipend">Stipend</option>
          <option value="Partial">Partial Funding</option>
        </select>
      </div>
    </div>
  );
};