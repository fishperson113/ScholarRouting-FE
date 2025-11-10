import { Scholarship } from '../api';

/**
 * Format deadline date for display
 */
export const formatDeadline = (deadline: string): string => {
  try {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return deadline; // Return original if parsing fails
  }
};

/**
 * Check if scholarship deadline has passed
 */
export const isDeadlinePassed = (deadline: string): boolean => {
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return deadlineDate < today;
  } catch {
    return false;
  }
};

/**
 * Get days remaining until deadline
 */
export const getDaysUntilDeadline = (deadline: string): number | null => {
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
};

/**
 * Get scholarship status badge color
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-600';
    case 'expired':
      return 'bg-red-100 text-red-600';
    case 'upcoming':
      return 'bg-blue-100 text-blue-600';
    case 'closed':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

/**
 * Get funding level badge color
 */
export const getFundingLevelColor = (fundingLevel: string): string => {
  switch (fundingLevel.toLowerCase()) {
    case 'full funding':
      return 'bg-green-100 text-green-600';
    case 'partial funding':
      return 'bg-yellow-100 text-yellow-600';
    case 'tuition waiver':
      return 'bg-blue-100 text-blue-600';
    case 'tuition waiver + stipend':
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

/**
 * Filter scholarships by search query (client-side)
 */
export const filterScholarshipsByQuery = (
  scholarships: Scholarship[],
  query: string
): Scholarship[] => {
  if (!query.trim()) return scholarships;

  const searchLower = query.toLowerCase();
  const searchTerms = searchLower.split(' ').filter(term => term.length > 0);

  return scholarships.filter(scholarship => {
    const searchableText = [
      scholarship.title,
      scholarship.organization,
      scholarship.country,
      scholarship.description,
      ...(scholarship.tags || [])
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
};

/**
 * Sort scholarships by various criteria
 */
export const sortScholarships = (
  scholarships: Scholarship[],
  sortBy: 'title' | 'deadline' | 'createdAt' | 'organization',
  sortOrder: 'asc' | 'desc' = 'asc'
): Scholarship[] => {
  return [...scholarships].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'organization':
        comparison = a.organization.localeCompare(b.organization);
        break;
      case 'deadline':
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        break;
      case 'createdAt':
        if (a.createdAt && b.createdAt) {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
};