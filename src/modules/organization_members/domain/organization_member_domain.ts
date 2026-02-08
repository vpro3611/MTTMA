import {OrganizationMemberInsufficientPermissionsError} from "../errors/organization_members_domain_error.js";


export type OrgMemRole = "OWNER" | "ADMIN" | "MEMBER";

export class OrganizationMember {
    constructor(
        public readonly organizationId: string,
        public readonly userId: string,
        private role: OrgMemRole,
        private readonly joinedAt: Date
    ){}


    private canChangeRole(actorRole: OrgMemRole, targetRole: OrgMemRole): boolean {
        const hierarchy = ["MEMBER", "ADMIN", "OWNER"];

        const actorIndex = hierarchy.indexOf(actorRole);
        const targetIndex = hierarchy.indexOf(this.role);
        const newRoleIdx = hierarchy.indexOf(targetRole);

        return (
            actorIndex > targetIndex && actorIndex >= newRoleIdx
        )
    }

    static hire(organizationId: string, userId: string, role?: OrgMemRole) {
        return new OrganizationMember(
            organizationId,
            userId,
            role ?? "MEMBER",
            new Date()
        )
    }


    assertCanBeFiredBy = (actorRole: OrgMemRole) => {
        if (actorRole !== "OWNER") {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
    }

    changeRole = (actorRole: OrgMemRole, newRole: OrgMemRole) => {
        if (!this.canChangeRole(actorRole, newRole)) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
        this.role = newRole;
    }

    getRole = () => this.role;

    getJoinedAt = () => this.joinedAt;
}