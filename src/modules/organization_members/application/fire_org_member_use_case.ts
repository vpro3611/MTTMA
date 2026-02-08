import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {
    ActorNotAMemberError,
    CannotPerformActionOnYourselfError,
    TargetNotAMemberError
} from "../errors/organization_members_domain_error.js";


export class FireOrgMemberUseCase {
    constructor(private readonly orgMemberRepo: OrganizationMembersRepository) {}

    execute = async (actorUserId: string, organizationId: string, targetUserId: string) => {
        if (actorUserId === targetUserId) {
            throw new CannotPerformActionOnYourselfError();
        }

        const actorMember = await this.orgMemberRepo.findById(actorUserId, organizationId);
        if (!actorMember) {
            throw new ActorNotAMemberError();
        }

        const targetMember = await this.orgMemberRepo.findById(targetUserId, organizationId);
        if (!targetMember) {
            throw new TargetNotAMemberError();
        }

        targetMember.assertCanBeFiredBy(actorMember.getRole());

        return await this.orgMemberRepo.delete(targetUserId, organizationId);
    }
}