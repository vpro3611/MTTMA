import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {OrgMemRole} from "../domain/organization_member_domain.js";
import {
    ActorNotAMemberError, CannotPerformActionOnYourselfError,
    InvalidOrganizationMemberRoleError,
    TargetNotAMemberError
} from "../errors/organization_members_domain_error.js";


export class ChangeOrgMemberRoleUseCase {
    constructor(private readonly orgMemberRepo: OrganizationMembersRepository) {}

    private parseRole(role: string): OrgMemRole {
        if (role === "OWNER" || role === "ADMIN" || role === "MEMBER") {
            return role;
        }
        throw new InvalidOrganizationMemberRoleError()
    }


    execute = async (actorUserId: string, targetUserId: string, orgId: string, targetRole: string) => {
        if (actorUserId === targetUserId) throw new CannotPerformActionOnYourselfError();
        const targetRoleParsed = this.parseRole(targetRole);

        const actorMember = await this.orgMemberRepo.findById(actorUserId, orgId);
        if (!actorMember) throw new ActorNotAMemberError()

        const targetMember = await this.orgMemberRepo.findById(targetUserId, orgId);
        if (!targetMember) throw new TargetNotAMemberError()

        targetMember.changeRole(actorMember.getRole(), targetRoleParsed);

        await this.orgMemberRepo.save(targetMember);
    }
}