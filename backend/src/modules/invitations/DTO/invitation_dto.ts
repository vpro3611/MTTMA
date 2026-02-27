export type InvitationDto = {
    id: string;
    organizationId: string;
    invitedUserId: string;
    invitedByUserId: string;
    role: string;
    status: string;
    createdAt: Date;
    expiredAt: Date;
}