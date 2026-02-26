

export type TaskFilters = {
    title?: string,
    description?: string,
    status?: string,
    assigneeId?: string,
    creatorId?: string,
    createdFrom?: Date,
    createdTo?: Date,
    limit?: number,
    offset?: number,
};