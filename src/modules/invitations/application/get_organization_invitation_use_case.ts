import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {Invitation} from "../domain/invitation_domain.js";
import {InvitationRepoInterface} from "../domain/ports/invitation_repo_interface.js";
import {Filters} from "../DTO/filters.js";
import {ActorNotAMemberError} from "../../organization_members/errors/organization_members_domain_error.js";
import {InvitationDto} from "../DTO/invitation_dto.js";


export class GetOrganizationInvitationUseCase {
    constructor(private readonly memberRepo: OrganizationMembersRepository,
                private readonly invitationRepo: InvitationRepoInterface) {}

    private mapToDTO(invitation: Invitation): InvitationDto {
        const forReturn: InvitationDto = {
            id: invitation.id,
            organizationId: invitation.getOrganizationId(),
            invitedUserId: invitation.getInvitedUserId(),
            invitedByUserId: invitation.getInvitedByUserId(),
            role: invitation.getAssignedRole(),
            status: invitation.getStatus(),
            createdAt: invitation.getCreatedAt(),
            expiredAt: invitation.getExpiredAt(),
        }
        return forReturn;
    }

    private async memberExists(actorId: string, orgId: string) {
        const member = await this.memberRepo.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError();
        }
        return member;
    }

    async execute(actorId: string, orgId: string, filters: Filters): Promise<InvitationDto[]> {
        const member = await this.memberExists(actorId, orgId);

        member.isMember(member.getRole()); // THROWS AN ERROR IF HIS ROLE IS 'MEMBER';

        const finalFilters: Filters = {
            ...filters,
            organization_id: orgId,
        };

        const invitationsByOrg = await this.invitationRepo.getInvitationsFiltered(finalFilters);

        const mapped = invitationsByOrg.map(inv => this.mapToDTO(inv));

        return mapped;
    }
}