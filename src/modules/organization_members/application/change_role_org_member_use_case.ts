import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {OrganizationMember, OrgMemRole} from "../domain/organization_member_domain.js";
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

    private checkForSelfAssign(actorUserId: string, targetUserId: string) {
        if (actorUserId === targetUserId) throw new CannotPerformActionOnYourselfError();
    }

    private async actorExists(actorId: string, orgId: string): Promise<OrganizationMember> {
        const existing = await this.orgMemberRepo.findById(actorId, orgId) ;
        if (!existing) {
            throw new ActorNotAMemberError();
        }
        return existing;
    }

    private async targetExists(targetId: string, orgId: string): Promise<OrganizationMember> {
        const existing = await this.orgMemberRepo.findById(targetId, orgId) ;
        if (!existing) {
            throw new TargetNotAMemberError();
        }
        return existing;
    }

    execute = async (actorUserId: string, targetUserId: string, orgId: string, targetRole: string) => {
        this.checkForSelfAssign(actorUserId, targetUserId);
        const targetRoleParsed = this.parseRole(targetRole);

        const actorMember = await this.actorExists(actorUserId, orgId);

        const targetMember = await this.targetExists(targetUserId, orgId);

        targetMember.changeRole(actorMember.getRole(), targetRoleParsed);

        await this.orgMemberRepo.save(targetMember);
    }
}