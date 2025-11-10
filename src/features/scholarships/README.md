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

- **ScholarshipFiltersComponent**: Modal component for filtering scholarships
- **ScholarshipRoute**: Main page component with search and display functionality

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