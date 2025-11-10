# Scholarships Feature

This feature provides scholarship search and filtering functionality using Firebase Firestore as the data source.

## API Endpoints

### Search Scholarships
- **Function**: `searchScholarships()`
- **Description**: Search scholarships with text query and filters
- **Parameters**:
  - `searchQuery`: Text to search in title, organization, country, description, and tags
  - `filters`: Optional filters (country, type, status, fundingLevel, tags)
  - `sortBy`: Sort field ('deadline', 'createdAt', 'title', 'relevance')
  - `sortOrder`: Sort direction ('asc', 'desc')
  - `pageSize`: Number of results per page

### Filter Scholarships
- **Function**: `filterScholarships()`
- **Description**: Filter scholarships by specific criteria
- **Parameters**:
  - `filters`: Filter criteria (country, type, status, fundingLevel, tags)
  - `sortBy`: Sort field ('deadline', 'createdAt', 'title')
  - `sortOrder`: Sort direction ('asc', 'desc')
  - `pageSize`: Number of results per page

### Get Filter Options
- **Function**: `getFilterOptions()`
- **Description**: Get available filter options from the database
- **Returns**: Available countries, types, statuses, funding levels, and tags

## Data Source

All data is fetched from the `scholarships_en` collection in Firebase Firestore.

## Components

- **ScholarshipFiltersComponent**: Modal component for filtering scholarships with collapsible sections
- **ScholarshipSidebarFilters**: Sidebar component that displays active filters
- **ScholarshipRoute**: Main page component with search and display functionality

## Filter Features

The filter system includes:

### Countries
- Dropdown menu for selecting preferred study destination
- Includes 15 popular countries: United States, United Kingdom, Canada, Australia, Germany, Netherlands, Sweden, Norway, Denmark, Switzerland, France, Japan, South Korea, Singapore, New Zealand
- Displays in both modal and sidebar when active

### Fields of Study
- Dropdown menu for selecting academic discipline
- Includes: Computer Science, Data Science, Engineering, Business Administration, Economics, Medicine, Law, Psychology, Environmental Science, International Relations

### Scholarship Requirements
- **Degree Level**: Dropdown to select required degree (Bachelor's, Master's, PhD, Postdoctoral)
- **Min GPA Required**: Numeric input for minimum GPA (0-4.0 scale)
- **Min IELTS Required**: Numeric input for minimum IELTS score (0-9.0 scale)

### Additional Filters
- **Scholarship Type**: Government, University, Private, etc.
- **Status**: Active, Expired, Upcoming, Closed
- **Funding Level**: Full Funding, Partial Funding, Tuition Waiver, etc.

All filter sections are collapsible in the modal view for better organization.

## Usage

```typescript
import { 
  useSearchScholarships, 
  useFilterScholarships, 
  useFilterOptions 
} from '@/features/scholarships/api';

// Search scholarships
const searchMutation = useSearchScholarships();
const results = await searchMutation.mutateAsync({
  searchQuery: 'computer science',
  filters: { country: 'Germany' },
  sortBy: 'relevance'
});

// Filter scholarships
const filterMutation = useFilterScholarships();
const filtered = await filterMutation.mutateAsync({
  filters: { type: 'Government', status: 'Active' },
  sortBy: 'deadline'
});
```