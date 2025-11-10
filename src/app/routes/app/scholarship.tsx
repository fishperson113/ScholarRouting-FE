import { useState } from 'react';
import { Search, Filter, ChevronDown, Calendar, DollarSign, GraduationCap, ExternalLink, Bookmark } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';

// Mock scholarship data
const scholarships = [
  {
    id: 1,
    title: 'Master Mind Scholarship (Government of Flanders)',
    organization: 'Government',
    country: 'Belgium',
    type: 'Government',
    status: 'Expired',
    description: 'The Master Mind Scholarship is a prestigious program offered by the Flemish Ministry of Education and Training, under the Government of Flanders. Its primary objective is to attract outstanding international students to pursue Master\'s degrees in Flanders and Brussels, thereby promoting the region as a top study destination.',
    fundingLevel: 'Tuition Waiver + Stipend',
    deadline: '15/03/2025',
    requiredDegree: 'Bachelor\'s degree',
    tags: ['Government']
  },
  {
    id: 2,
    title: 'Erasmus Mundus Joint Master Degrees',
    organization: 'European Commission',
    country: 'Europe',
    type: 'Government',
    status: 'Active',
    description: 'Erasmus Mundus Joint Master Degrees are prestigious, integrated, international study programmes, jointly delivered by an international consortium of higher education institutions.',
    fundingLevel: 'Full Funding',
    deadline: '31/01/2025',
    requiredDegree: 'Bachelor\'s degree',
    tags: ['Government', 'International']
  },
  {
    id: 3,
    title: 'DAAD Scholarships for Development-Related Postgraduate Courses',
    organization: 'DAAD',
    country: 'Germany',
    type: 'Government',
    status: 'Active',
    description: 'DAAD offers scholarships for development-related postgraduate courses in German universities for students from developing countries.',
    fundingLevel: 'Full Funding',
    deadline: '30/09/2025',
    requiredDegree: 'Bachelor\'s degree',
    tags: ['Government', 'Development']
  }
];

const ScholarshipRoute = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Best Match');
  const [showFilters, setShowFilters] = useState(false);

  const filteredScholarships = scholarships.filter(scholarship =>
    scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scholarship.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scholarship.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ContentLayout title="">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search scholarships by name, university, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filters and Results Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
              >
                <span>{selectedFilter}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <strong>{filteredScholarships.length}</strong> scholarships found
          </div>
        </div>

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
                {scholarship.tags.map((tag) => (
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
        {filteredScholarships.length > 0 && (
          <div className="text-center">
            <Button variant="outline" className="px-8">
              Load More Scholarships
            </Button>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ScholarshipRoute;