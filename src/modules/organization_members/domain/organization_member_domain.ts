import {OrganizationMemberInsufficientPermissionsError} from "../errors/organization_members_domain_error.js";
import {OrgMemsRole} from "./org_members_role.js";




export class OrganizationMember {
    constructor(
        public readonly organizationId: string,
        public readonly userId: string,
        private role: OrgMemsRole,
        private readonly joinedAt: Date
    ){}


    private canChangeRole(actorRole: OrgMemsRole, targetRole: OrgMemsRole): boolean {
        const hierarchy = [OrgMemsRole.MEMBER, OrgMemsRole.ADMIN, OrgMemsRole.OWNER];

        const actorIndex = hierarchy.indexOf(actorRole);
        const targetIndex = hierarchy.indexOf(this.role);
        const newRoleIdx = hierarchy.indexOf(targetRole);

        return (
            actorIndex > targetIndex && actorIndex >= newRoleIdx
        )
    }

    static hire(organizationId: string, userId: string, role?: OrgMemsRole) {
        return new OrganizationMember(
            organizationId,
            userId,
            role ?? OrgMemsRole.MEMBER,
            new Date()
        )
    }


    assertCanBeFiredBy = (actorRole: OrgMemsRole) => {
        if (actorRole !== OrgMemsRole.OWNER) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
    }

    changeRole = (actorRole: OrgMemsRole, newRole: OrgMemsRole) => {
        if (!this.canChangeRole(actorRole, newRole)) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
        this.role = newRole;
    }

    getRole = () => this.role;

    getJoinedAt = () => this.joinedAt;
}