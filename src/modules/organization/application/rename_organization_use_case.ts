import {OrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {Name} from "../domain/name.js";
import {OrganizationNotFoundError} from "../errors/organization_repository_errors.js";
import {OrganizationResponseDto} from "../DTO/organization_response_dto.js";
import {Organization} from "../domain/organiztion_domain.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";
import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../organization_members/errors/organization_members_domain_error.js";


export class RenameOrganizationUseCase {
    constructor(private readonly orgRepo: OrganizationRepository,
                private readonly memberRepo: OrganizationMembersRepository
    ) {};

    private async organizationExists(id: string): Promise<Organization> {
        const organization = await this.orgRepo.findById(id);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }
        return organization;
    }

    private async memberExists(actorId: string, orgId: string): Promise<OrganizationMember> {
        const member = await this.memberRepo.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError();
        }

        return member;
    }

    private checkMemberRole(memberRole: OrgMemsRole) {
        if (memberRole !== OrgMemsRole.OWNER) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
    }

    execute = async (id: string, newName: string, actorId: string) => {
        const member = await this.memberExists(actorId, id);

        this.checkMemberRole(member.getRole());

        const validatedNameNew = Name.validate(newName);

        const organization = await this.organizationExists(id);

        organization.rename(validatedNameNew)

        await this.orgRepo.save(organization);

        const organizationResponse: OrganizationResponseDto = {
            id: organization.id,
            name: organization.getName().getValue(),
            createdAt: organization.getCreatedAt(),
        }
        return organizationResponse;
    }
}