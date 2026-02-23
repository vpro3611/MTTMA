import {OrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {OrganizationNotFoundError} from "../errors/organization_repository_errors.js";
import {ActorNotAMemberError} from "../../organization_members/errors/organization_members_domain_error.js";
import {OrgWithRoleDto} from "../DTO/org_with_role_dto.js";
import {Organization} from "../domain/organiztion_domain.js";
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";

export class GetOrganizationWithRoleUseCase {
    constructor(private readonly organizationRepo: OrganizationRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository
    ) {}

    private async organizationExists(orgId: string) {
        const organization = await this.organizationRepo.findById(orgId);

        if (!organization) {
            throw new OrganizationNotFoundError();
        }
        return organization;
    }

    private async memberExists(actorId: string, orgId: string) {
        const member = await this.orgMemberRepo.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError();
        }
        return member;
    }

    private mapToDTO(org: Organization, member: OrganizationMember): OrgWithRoleDto {
        return {
            orgId: member.organizationId,
            name: org.getName().getValue(),
            myRole: member.getRole(),
        }
    }

    async execute(actorId: string, orgId: string) {
        const organization = await this.organizationExists(orgId)

        const member = await this.memberExists(actorId, orgId);

        return this.mapToDTO(organization, member);

    }
}