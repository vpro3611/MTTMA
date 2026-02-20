

export type TaskDto = {
    id: string,
    organizationId: string,
    title: string,
    description: string,
    status: string,
    assignedTo: string,
    createdBy: string,
    createdAt: Date,
}