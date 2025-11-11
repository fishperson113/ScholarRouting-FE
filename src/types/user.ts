// User related types
export type UserProfile = {
  uid: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  created_at?: string;
  desired_countries?: string[];
  desired_funding_level?: string[];
  desired_field_of_study?: string[];
  field_of_study?: string;
  gpa_range_4?: number;
  years_of_experience?: number;
  notes?: string;
  tags?: string[];
  [key: string]: any;
};
