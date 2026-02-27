

export const OrgMemsRole = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
} as const;

export type OrgMemsRole = typeof OrgMemsRole[keyof typeof OrgMemsRole];