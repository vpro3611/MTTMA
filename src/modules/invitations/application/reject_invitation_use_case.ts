import {InvitationRepoInterface} from "../domain/ports/invitation_repo_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {InvitationStatus} from "../domain/invitation_status.js";
import {InvitationDto} from "../DTO/invitation_dto.js";
import {Invitation} from "../domain/invitation_domain.js";
import {InvitationNotFound, InvitationOfDiffUser, UserAlreadyMember} from "../errors/application_errors.js";
import {UserNotFound} from "../../user/errors/user_repository_errors.js";


export class RejectInvitationUseCase {
    constructor(private readonly invitationRepoWrite: InvitationRepoInterface,
                private readonly memberRepo: OrganizationMembersRepository,
                private readonly userRepo: UserRepository
    ) {}

    private async invitationExists(invitationId: string) {
        const invitation = await this.invitationRepoWrite.getInvitationById(invitationId);
        if (!invitation) {
            throw new InvitationNotFound()
        }
        return invitation;
    }

    private async userExists(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new UserNotFound();
        }
        return user;
    }

    private async ensureNotAMember(actorId: string, orgId: string) {
        const member = await this.memberRepo.findById(actorId, orgId);
        if (member) {
            throw new UserAlreadyMember();
        }
    }

    private checkActorAndInvitedAreSame(actorId: string, invitedUserId: string) {
        if (actorId !== invitedUserId) {
            throw new InvitationOfDiffUser();
        }
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
        }
    }

    async execute(actorId: string, invitationId: string) {
        const invitation = await this.invitationExists(invitationId);

        invitation.ensureIsPending();

        const user = await this.userExists(actorId);

        user.ensureIsActive();

        await this.ensureNotAMember(actorId, invitation.getOrganizationId());

        this.checkActorAndInvitedAreSame(actorId, invitation.getInvitedUserId());

        invitation.setStatus(InvitationStatus.REJECTED);

        await this.invitationRepoWrite.save(invitation);

        const forReturn: InvitationDto = this.mapToDTO(invitation);

        return forReturn;
    }
}