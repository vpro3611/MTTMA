import {OrganizationRepositoryPG} from "../repository_realization/organization_repository.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";
import {Organization} from "../domain/organiztion_domain.js";
import {OrganizationNotFoundError} from "../errors/organization_repository_errors.js";
import {CannotDeleteOrganizationError} from "../errors/application_errors.js";
import {OrganizationResponseDto} from "../DTO/organization_response_dto.js";


export class DeleteOrganizationUseCase {
    constructor(private readonly organizationRepository: OrganizationRepositoryPG,
                private readonly orgMembers: OrganizationMembersRepository
    ) {};

    private async memberExists(actorId: string, orgId: string): Promise<OrganizationMember> {
        const member = await this.orgMembers.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError();
        }
        return member;
    }

    private checkDeleted(org: Organization | null) {
        if (!org) {
            throw new OrganizationNotFoundError();
        }
        return org;
    }

    private validateDeletion(members: OrganizationMember[], actor: OrganizationMember) {
        if (actor.getRole() !== OrgMemsRole.OWNER) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
        if (members.length !== 1) {
            throw new CannotDeleteOrganizationError();
        }
    }
    execute = async (actorId: string, orgId: string) => {
        const member = await this.memberExists(actorId, orgId);


        const allMembers = await this.orgMembers.getAllMembers(orgId);

        this.validateDeletion(allMembers, member);

        const deleted = await this.organizationRepository.delete(orgId);

        const evaluated = this.checkDeleted(deleted);

        const organizationResponse: OrganizationResponseDto = {
            id: evaluated.id,
            name: evaluated.getName().getValue(),
            createdAt: evaluated.getCreatedAt(),
        }

        return organizationResponse;
    }
}