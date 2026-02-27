import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {OrganizationMember} from "../domain/organization_member_domain.js";

import {
    ActorNotAMemberError, CannotPerformActionOnYourselfError,
    InvalidOrganizationMemberRoleError,
    TargetNotAMemberError
} from "../errors/organization_members_domain_error.js";
import {OrgMemsRole} from "../domain/org_members_role.js";
import {OrgMemDTO} from "../DTO/for_return/org_mem_dto.js";


export class ChangeOrgMemberRoleUseCase {
    constructor(private readonly orgMemberRepo: OrganizationMembersRepository) {}

    private parseRole(role: string): OrgMemsRole {
        if (role === OrgMemsRole.OWNER|| role === OrgMemsRole.ADMIN || role === OrgMemsRole.MEMBER) {
            return role;
        }
        throw new InvalidOrganizationMemberRoleError()
    }

    private assertAssignedRole(role: OrgMemsRole) {
        if (role === OrgMemsRole.OWNER) {
            throw new InvalidOrganizationMemberRoleError();
        }
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

        this.assertAssignedRole(targetRoleParsed);

        const actorMember = await this.actorExists(actorUserId, orgId);

        const targetMember = await this.targetExists(targetUserId, orgId);

        targetMember.changeRole(actorMember.getRole(), targetRoleParsed);

        await this.orgMemberRepo.save(targetMember);

        const forReturn: OrgMemDTO = {
            organizationId: targetMember.organizationId,
            userId: targetMember.userId,
            role: targetMember.getRole(),
            joinedAt: targetMember.getJoinedAt(),
        }

        return forReturn;
    }
}