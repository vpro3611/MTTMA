

export const UserStatus = {
    ACTIVE: 'active',
    BANNED: 'banned',
    SUSPENDED: 'suspended',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];