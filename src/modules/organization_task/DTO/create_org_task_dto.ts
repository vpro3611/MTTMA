

export type CreateOrgTaskDataInputDTO = {
    organizationId: string,
    title: string,
    description: string,
    assignedTo?: string,
    createdBy: string,
}