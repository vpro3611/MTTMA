import {InvitationRepoInterface} from "../domain/ports/invitation_repo_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {ActorNotAMemberError} from "../../organization_members/errors/organization_members_domain_error.js";
import {InvitationStatus} from "../domain/invitation_status.js";
import {InvitationDto} from "../DTO/invitation_dto.js";
import {InvitationNotFound} from "../errors/application_errors.js";


export class CancelInvitationUseCase {
    constructor(private readonly invitationRepoWrite: InvitationRepoInterface,
                private readonly memberRepo: OrganizationMembersRepository
    ) {}

    private async invitationExists(invitationId: string) {
        const invitation = await this.invitationRepoWrite.getInvitationById(invitationId);
        if (!invitation) {
            throw new InvitationNotFound();
        }
        return invitation;
    }


    private async memberExists(actorId: string, orgId: string) {
        const memberExists = await this.memberRepo.findById(actorId, orgId);
        if (!memberExists) {
            throw new ActorNotAMemberError();
        }
        return memberExists;
    }

    async execute(actorId: string, invitationId: string) {
        const invitation = await this.invitationExists(invitationId);

        invitation.ensureIsPending()

        const memberExists = await this.memberExists(actorId, invitation.getOrganizationId());

        memberExists.ensureIsOwner(memberExists.getRole());

        invitation.setStatus(InvitationStatus.CANCELED);

        await this.invitationRepoWrite.save(invitation);

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
}