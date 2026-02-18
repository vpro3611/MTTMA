


export const InvitationStatus = {
    PENDING: 'PENDING',
    REJECTED: 'REJECTED',
    ACCEPTED: 'ACCEPTED',
    EXPIRED: 'EXPIRED',
} as const;

export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];