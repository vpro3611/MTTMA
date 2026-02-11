
import {
    OrganizationMemberInsufficientPermissionsError
} from
        "../../../organization_members/errors/organization_members_domain_error.js";
import {OrgMemsRole} from "../../../organization_members/domain/org_members_role.js";

export class TaskPermissionPolicy {

    private static readonly ROLE_RANK: Record<OrgMemsRole, number> = {
        OWNER: 3,
        ADMIN: 2,
        MEMBER: 1,
    };

    static canChangeTaskElements(
        actorRole: OrgMemsRole,
        actorId: string,
        taskCreatedBy: string,
        assigneeRole: OrgMemsRole,
    ): void {

        // MEMBER: only own tasks
        if (actorRole === OrgMemsRole.MEMBER) {
            if (actorId !== taskCreatedBy) {
                throw new OrganizationMemberInsufficientPermissionsError();
            }
            return;
        }

        // ADMIN / OWNER: hierarchy rule
        if (
            TaskPermissionPolicy.ROLE_RANK[actorRole] <=
            TaskPermissionPolicy.ROLE_RANK[assigneeRole] &&
            actorRole !== OrgMemsRole.OWNER
        ) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
    }

}
