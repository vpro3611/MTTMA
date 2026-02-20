import {InvitationRepoInterface} from "../domain/ports/invitation_repo_interface.js";
import {InvitationDto} from "../DTO/invitation_dto.js";
import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {ActorNotAMemberError} from "../../organization_members/errors/organization_members_domain_error.js";
import {Invitation} from "../domain/invitation_domain.js";
import {User} from "../../user/domain/user_domain.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {UserDoesNotExistError} from "../../organization_task/errors/repository_errors.js";
import {InvalidRoleInInvitation, UserAlreadyMember} from "../errors/application_errors.js";


export class CreateInvitationUseCase {
    constructor(
        private readonly invitationRepo: InvitationRepoInterface,
        private readonly memberRepo: OrganizationMembersRepository,
        private readonly userRepo: UserRepository,
    ) {}

    private parseRole(role?: OrgMemsRole): OrgMemsRole {
        if (role === OrgMemsRole.OWNER) {
            throw new InvalidRoleInInvitation(role);
        }
        return role ?? OrgMemsRole.MEMBER;
    }

    private async ensureActorIsOwner(actorId: string, orgId: string) {
        const member = await this.memberRepo.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError();
        }

        member.ensureIsOwner(member.getRole());
        return member;
    }

    private async ensureTargetIsNotMember(userId: string, orgId: string) {
        const member = await this.memberRepo.findById(userId, orgId);
        if (member) {
            throw new UserAlreadyMember();
        }
    }

    private async ensureUserExistsAndActive(userId: string): Promise<User> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new UserDoesNotExistError();
        }

        user.checkUserStatus(user.getStatus());
        return user;
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

    async execute(dto: {
        organizationId: string;
        invitedUserId: string;
        actorId: string;
        role?: OrgMemsRole;
    }): Promise<InvitationDto> {

        const parsedRole = this.parseRole(dto.role);

        await this.ensureActorIsOwner(dto.actorId, dto.organizationId);

        await this.ensureTargetIsNotMember(dto.invitedUserId, dto.organizationId);

        await this.ensureUserExistsAndActive(dto.invitedUserId);

        const invitation = Invitation.createInvitation({
            organization_id: dto.organizationId,
            invited_user_id: dto.invitedUserId,
            invited_by_user_id: dto.actorId,
            role: parsedRole,
        });

        await this.invitationRepo.save(invitation);

        return this.mapToDTO(invitation);
    }
}