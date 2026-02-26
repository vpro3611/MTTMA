export type InvitationViewType = {
    id: string;
    organizationId: string;
    organizationName: string;
    invitedByUserId: string;
    role: string;
    status: string;
    membersCount: number;
    createdAt: string;
    expiredAt: string;
}