/** Matches backend OrgMemsRole */
export const ORG_ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const;
export type OrgRole = (typeof ORG_ROLES)[number];
