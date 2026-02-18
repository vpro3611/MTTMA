

export type SearchOrganizationCriteria = {
    query: string,
    createdFrom?: Date,
    createdTo?: Date,
    sortBy?: "createdAt" | "membersCount",
    order?: "asc" | "desc",
    limit?: number,
    offset?: number,
}

export type OrganizationSearchResultDto = {
    id: string;
    name: string;
    createdAt: Date;
    membersCount: number;
};