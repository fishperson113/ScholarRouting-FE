// Search and filter related types

export type FilterOperator = 'AND' | 'OR';

export type FilterItem = {
  field: string;
  values: string[];
  operator: FilterOperator;
};

export type SearchResult = {
  total: number;
  hits: any[];
  took: number;
};
