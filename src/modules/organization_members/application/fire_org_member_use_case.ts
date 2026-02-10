import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {
    ActorNotAMemberError,
    CannotPerformActionOnYourselfError,
    TargetNotAMemberError
} from "../errors/organization_members_domain_error.js";
import {OrganizationMember} from "../domain/organization_member_domain.js";


export class FireOrgMemberUseCase {
    constructor(private readonly orgMemberRepo: OrganizationMembersRepository) {}

    private checkSelfAssign(actorUserId: string, targetUserId: string) {
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

    execute = async (actorUserId: string, organizationId: string, targetUserId: string) => {
        this.checkSelfAssign(actorUserId, targetUserId);

        const actorMember = await this.actorExists(actorUserId, organizationId);

        const targetMember = await this.targetExists(targetUserId, organizationId);

        targetMember.assertCanBeFiredBy(actorMember.getRole());

        return await this.orgMemberRepo.delete(targetUserId, organizationId);
    }
}