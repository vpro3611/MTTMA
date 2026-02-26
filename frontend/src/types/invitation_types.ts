

export type InvitationStatus =
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELED";

export type InvitationType = {
    id: string;
    organizationId: string;
    invitedUserId: string;
    invitedByUserId: string;
    role: string;
    status: InvitationStatus;
    createdAt: string;     // ISO string с бэка
    expiredAt: string;
};