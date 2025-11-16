import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { ScholarshipCardProps } from '@/features/scholarships/components/scholarship-card';
import { paths } from '@/config/paths';
import { useScholarshipApplications } from '@/lib/scholarship-api';
import { useUser } from '@/lib/auth';

interface RawScholarship {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  location?: string;
  country?: string;
  Country?: string;
  type?: string;
  scholarship_type?: string;
  Scholarship_Type?: string;
  tags?: string[];
  description?: string;
  Scholarship_Info?: string;
  amount?: string;
  funding_level?: string;
  Funding_Level?: string;
  Funding_Details?: string;
  deadline?: string;
  End_Date?: string;
  requirements?: string[];
  degree_level?: string;
  Required_Degree?: string;
  Wanted_Degree?: string;
  min_gpa?: number;
  Min_Gpa?: number;
  min_ielts?: number;
  Min_IELTS?: number;
  Language_Certificate?: string;
  is_urgent?: boolean;
  official_url?: string;
  Url?: string;
  url?: string;
  Scholarship_Name?: string;
  For_Vietnamese?: boolean;
  [key: string]: any;
}

export const useScholarshipCard = (scholarships: RawScholarship[]) => {
  const navigate = useNavigate();
  const user = useUser();
  const uid = user.data?.uid;
  
  // Fetch user's applications to check which scholarships are saved
  const { data: applicationsData } = useScholarshipApplications(uid);
  
  // Create a Set of saved scholarship IDs for quick lookup
  const savedScholarshipIds = useMemo(() => {
    if (!applicationsData?.applications) return new Set<string>();
    return new Set(applicationsData.applications.map(app => app.scholarship_id));
  }, [applicationsData]);
  
  // Transform raw scholarship data to card props
  const transformedScholarships = useMemo(() => {
    if (!scholarships || !Array.isArray(scholarships)) {
      console.warn('Invalid scholarships data:', scholarships);
      return [];
    }
    
    console.log('Transforming scholarships:', scholarships.length, 'items');
    
    const results: ScholarshipCardProps[] = [];
    
    scholarships.forEach((item, index) => {
      try {
        // Extract the actual scholarship data (handle both direct and nested structure)
        // The API might return: { id, source: {...} } or just {...}
        const scholarship = item?.source || item;
        
        if (!scholarship) {
          console.warn('Empty scholarship at index:', index);
          return;
        }
        
        // Extract ID
        const id = scholarship.id || scholarship._id || item.id || `scholarship-${index}`;
        
        // Extract title
        const title = scholarship.Scholarship_Name || scholarship.title || scholarship.name || 'Untitled Scholarship';
        
        // Extract location/country
        const location = scholarship.Country || scholarship.location || scholarship.country;
        
        // Extract type
        const type = scholarship.Scholarship_Type || scholarship.type || scholarship.scholarship_type;
        
        // Build tags from various fields (but NOT from Funding_Level)
        const tags: string[] = [];
        if (scholarship.For_Vietnamese) {
          tags.push('For Vietnamese');
        }
        if (Array.isArray(scholarship.tags)) {
          tags.push(...scholarship.tags);
        }
        
        // Extract description
        const description = scholarship.Scholarship_Info || scholarship.description || '';
        
        // Extract amount/funding - prioritize Funding_Level over Funding_Details
        const fundingInfo = scholarship.Funding_Level || scholarship.Funding_Details || scholarship.amount || scholarship.funding_level;
        // Truncate if too long
        const amount = fundingInfo 
          ? fundingInfo.length > 80 
            ? fundingInfo.substring(0, 77) + '...' 
            : fundingInfo
          : undefined;
        
        // Format deadline
        const deadline = scholarship.End_Date || scholarship.deadline 
          ? formatDeadline(scholarship.End_Date || scholarship.deadline)
          : undefined;
        
        // Extract wanted degree for the badge
        const wantedDegree = scholarship.Wanted_Degree;
        
        // Build requirements array
        const requirements: string[] = [];
        const requiredDegree = scholarship.Required_Degree || scholarship.degree_level;
        if (requiredDegree) {
          // Take first degree if multiple
          const firstDegree = requiredDegree.split(',')[0].trim();
          if (firstDegree) requirements.push(firstDegree);
        }
        if (scholarship.Min_Gpa || scholarship.min_gpa) {
          const gpa = scholarship.Min_Gpa || scholarship.min_gpa;
          requirements.push(`Min GPA: ${gpa}`);
        }
        if (scholarship.Language_Certificate) {
          // Take first language cert if multiple
          const firstLang = scholarship.Language_Certificate.split(',')[0].trim();
          if (firstLang) requirements.push(firstLang);
        }
        if (scholarship.min_ielts) {
          requirements.push(`Min IELTS: ${scholarship.min_ielts}`);
        }
        if (scholarship.requirements && Array.isArray(scholarship.requirements)) {
          requirements.push(...scholarship.requirements.slice(0, 2)); // Limit to avoid overflow
        }
        
        // Extract urgent flag
        const isUrgent = scholarship.is_urgent || checkIfUrgent(scholarship.End_Date || scholarship.deadline);
        
        // Extract official URL
        const officialUrl = scholarship.Url || scholarship.official_url || scholarship.url;
        
        results.push({
          id,
          title,
          location,
          type,
          tags: tags.slice(0, 3), // Limit to 3 tags
          description,
          amount,
          deadline,
          requirements: requirements.slice(0, 3), // Limit to 3 requirements
          isUrgent,
          isSaved: savedScholarshipIds.has(id), // Check if this scholarship is saved
          officialUrl,
          wantedDegree,
        });
      } catch (error) {
        console.error('Error transforming scholarship at index:', index, error);
      }
    });
    
    console.log('Transformed result:', results.length, 'scholarships');
    return results;
  }, [scholarships, savedScholarshipIds]);

  // Handle save action
  const handleSave = useCallback((scholarshipId: string) => {
    // TODO: Implement save to favorites/bookmarks
    console.log('Saving scholarship:', scholarshipId);
    // This would typically call an API or update local state
  }, []);

  // Handle view details action
  const handleViewDetails = useCallback((scholarshipId: string) => {
    console.log('Viewing details for:', scholarshipId);
    // Navigate to detail page using React Router
    navigate(paths.app.scholarshipDetail.getHref(scholarshipId));
  }, [navigate]);

  return {
    scholarships: transformedScholarships,
    handleSave,
    handleViewDetails,
  };
};

// Helper function to format deadline
const formatDeadline = (deadline: string): string => {
  try {
    const date = new Date(deadline);
    if (isNaN(date.getTime())) {
      return deadline;
    }
    
    // Format as DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch {
    return deadline;
  }
};

// Helper function to check if deadline is urgent (within 30 days)
const checkIfUrgent = (deadline?: string): boolean => {
  if (!deadline) return false;
  
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntilDeadline > 0 && daysUntilDeadline <= 30;
  } catch {
    return false;
  }
};
