import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {OrganizationMember, OrgMemRole} from "../domain/organization_member_domain.js";
import {
    ActorNotAMemberError,
    CannotAssignRole, CannotPerformActionOnYourselfError,
    InvalidOrganizationMemberRoleError, OnlyOwnerCanAssign, OrganizationMemberInsufficientPermissionsError
} from "../errors/organization_members_domain_error.js";
import {OrgMemberDTO} from "../DTO/org_member_dto.js";


export class HireOrgMemberUseCase {
    constructor(private readonly orgMemberRepo: OrganizationMembersRepository) {}

    private parseRole(role?: string): OrgMemRole | undefined {
        if (!role) return undefined;

        if (role === "OWNER" || role === "ADMIN" || role === "MEMBER") {
            return role;
        }

        throw new InvalidOrganizationMemberRoleError();
    }

    execute = async (actorUserId: string, organizationId: string, targetUserId: string, role?: OrgMemRole) => {
        const parsedRole = this.parseRole(role);

        if (actorUserId === targetUserId) {
            throw new CannotPerformActionOnYourselfError()
        }

        const actorMember = await this.orgMemberRepo.findById(actorUserId, organizationId);
        if (!actorMember) {
            throw new ActorNotAMemberError();
        }

        if (parsedRole === "OWNER") {
            throw new CannotAssignRole(parsedRole);
        }

        if (parsedRole === "ADMIN" && actorMember.getRole() !== "OWNER") {
            throw new OnlyOwnerCanAssign();
        }

        if(parsedRole === "MEMBER" && actorMember.getRole() === "MEMBER") {
            throw new OrganizationMemberInsufficientPermissionsError();
        }

        const newMember = OrganizationMember.hire(organizationId, targetUserId, parsedRole);

        await this.orgMemberRepo.save(newMember);

        const forReturn: OrgMemberDTO = {
            userId: newMember.userId,
            organizationId: newMember.organizationId,
            role: newMember.getRole(),
            joinedAt: newMember.getJoinedAt(),
        };

        return forReturn;
    }
}