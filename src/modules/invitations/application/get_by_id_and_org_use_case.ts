import {InvitationByIdAndOrgRepoPg} from "../repository_realization/invitation_by_id_and_org_repo_pg.js";
import {OrganizationRepository} from "../../organization/domain/ports/organization_repo_interface.js";
import {OrganizationNotFoundError} from "../../organization/errors/organization_repository_errors.js";
import {InvitationNotFound} from "../errors/application_errors.js";
import {Invitation} from "../domain/invitation_domain.js";
import {InvitationDto} from "../DTO/invitation_dto.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {ActorNotAMemberError} from "../../organization_members/errors/organization_members_domain_error.js";


export class GetByIdAndOrgUseCase {
    constructor(private readonly invitationRepoGetter: InvitationByIdAndOrgRepoPg,
                private readonly organizationRepo: OrganizationRepository,
                private readonly memberRepo: OrganizationMembersRepository) {}

    private async organizationExists(orgId: string) {
        const organization = await this.organizationRepo.findById(orgId);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }
        return organization;
    }

    private async actorIsMember(actorId: string, orgId: string) {
        const member = await this.memberRepo.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError();
        }
        return member;
    }

    private async invitationExists(invitationId: string, orgId: string) {
        const invitation = await this.invitationRepoGetter.getByIdAndOrgId(invitationId, orgId);
        if (!invitation) {
            throw new InvitationNotFound();
        }
        return invitation;
    }

    private mapToDTO(invitation: Invitation): InvitationDto {
        return {
            id: invitation.id,
            organizationId: invitation.getOrganizationId(),
            invitedUserId: invitation.getInvitedUserId(),
            invitedByUserId: invitation.getInvitedByUserId(),
            role: invitation.getAssignedRole(),
            status: invitation.getStatus(),
            createdAt: invitation.getCreatedAt(),
            expiredAt: invitation.getExpiredAt(),
        };
    }


    async execute(invitationId: string, orgId: string, actorId: string) {
        const member = await this.actorIsMember(actorId, orgId);

        member.isMember(member.getRole());

        const organization = await this.organizationExists(orgId);

        const invitation = await this.invitationExists(invitationId, orgId);

        return this.mapToDTO(invitation);
    }
}