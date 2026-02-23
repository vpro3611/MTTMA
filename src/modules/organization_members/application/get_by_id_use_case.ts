import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {OrganizationRepository} from "../../organization/domain/ports/organization_repo_interface.js";
import {OrganizationDoesNotExistError} from "../../organization_task/errors/repository_errors.js";
import {OrganizationMember} from "../domain/organization_member_domain.js";
import {OrgMemberDTO} from "../DTO/org_member_dto.js";
import {ActorNotAMemberError} from "../errors/organization_members_domain_error.js";


export class GetMemberByIdUseCase {
    constructor(private readonly membersRepo: OrganizationMembersRepository,
                private readonly organizationRepo: OrganizationRepository
    ) {}

    private async organizationExists(orgId: string) {
        const organization = await this.organizationRepo.findById(orgId);
        if (!organization) {
            throw new OrganizationDoesNotExistError();
        }
        return organization;
    }

    private async memberExists(memberId: string, orgId: string) {
        const memberExists = await this.membersRepo.findById(memberId, orgId);
        if (!memberExists) {
            throw new Error();
        }
        return memberExists;
    }

    private async actorIsMember(actorId: string, orgId: string) {
        const actorExists = await this.membersRepo.findById(actorId, orgId);
        if (!actorExists) {
            throw new ActorNotAMemberError();
        }
        return actorExists;
    }

    private mapToDTO(member: OrganizationMember): OrgMemberDTO {
        return {
            userId: member.userId,
            organizationId: member.organizationId,
            role: member.getRole(),
            joinedAt: member.getJoinedAt(),
        }
    }

    async execute(actorId: string, targetId: string, orgId: string) {
        const organization = await this.organizationExists(orgId);

        const actorMember = await this.actorIsMember(actorId, orgId);

        const member = await this.memberExists(targetId, orgId);

        return this.mapToDTO(member);
    }
}