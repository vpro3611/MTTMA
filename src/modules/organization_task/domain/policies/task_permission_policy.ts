
import { OrgMemRole } from "../../../organization_members/domain/organization_member_domain.js"
import {
    OrganizationMemberInsufficientPermissionsError
} from
        "../../../organization_members/errors/organization_members_domain_error.js";

export class TaskPermissionPolicy {

    private static readonly ROLE_RANK: Record<OrgMemRole, number> = {
        OWNER: 3,
        ADMIN: 2,
        MEMBER: 1,
    };

    static canChangeTaskElements(
        actorRole: OrgMemRole,
        actorId: string,
        taskCreatedBy: string,
        assigneeRole: OrgMemRole,
    ): void {

        // MEMBER: only own tasks
        if (actorRole === "MEMBER") {
            if (actorId !== taskCreatedBy) {
                throw new OrganizationMemberInsufficientPermissionsError();
            }
            return;
        }

        // ADMIN / OWNER: hierarchy rule
        if (
            TaskPermissionPolicy.ROLE_RANK[actorRole] <=
            TaskPermissionPolicy.ROLE_RANK[assigneeRole] &&
            actorRole !== "OWNER"
        ) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
    }

}
