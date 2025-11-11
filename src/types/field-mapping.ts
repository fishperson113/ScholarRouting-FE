// Field mapping between frontend filter keys and Elasticsearch field names
// This ensures consistency across the application when filtering scholarships

export const SCHOLARSHIP_FIELD_MAPPING = {
  country: 'Country',
  type: 'Scholarship_Type',
  fundingLevel: 'Funding_Level',
  degreeLevel: 'Required_Degree',
  fieldOfStudy: 'Eligible_Field_Group',
} as const;

// Type-safe keys
export type FrontendFilterKey = keyof typeof SCHOLARSHIP_FIELD_MAPPING;
export type ElasticsearchFieldName = typeof SCHOLARSHIP_FIELD_MAPPING[FrontendFilterKey];

// Helper function to get Elasticsearch field name
export const getElasticsearchFieldName = (frontendKey: string): string => {
  return SCHOLARSHIP_FIELD_MAPPING[frontendKey as FrontendFilterKey] || frontendKey;
};
