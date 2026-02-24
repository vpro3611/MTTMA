

export type OrganizationSearchResult = {
    id: string,
    name: string,
    createdAt: string,
    membersCount: number,
}


export type OrganizationSearchFilters = {
    query: string
    createdFrom?: string
    createdTo?: string
    sortBy?: "createdAt" | "membersCount"
    order?: "asc" | "desc"
    limit?: number
    offset?: number
}