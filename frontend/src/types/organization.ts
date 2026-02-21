export interface OrganizationResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface OrganizationSearchResult {
  id: string;
  name: string;
  createdAt: string;
  membersCount: number;
}

export interface SearchOrganizationsQuery {
  query: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'createdAt' | 'membersCount';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
