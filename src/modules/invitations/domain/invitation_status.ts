


export const InvitationStatus = {
    PENDING: 'PENDING',
    REJECTED: 'REJECTED',
    ACCEPTED: 'ACCEPTED',
    EXPIRED: 'EXPIRED',
    CANCELED: 'CANCELED',
} as const;

export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];