export type MemberType = {
    organizationId: string;
    userId: string;
    role: string;
    /** ISO date string from API */
    joinedAt: string;
}