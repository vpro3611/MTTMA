import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {OrganizationMember, OrgMemRole} from "../domain/organization_member_domain.js";
import {
    ActorNotAMemberError,
    CannotAssignRole, CannotPerformActionOnYourselfError,
    InvalidOrganizationMemberRoleError, OnlyOwnerCanAssign, OrganizationMemberInsufficientPermissionsError
} from "../errors/organization_members_domain_error.js";
import {OrgMemberDTO} from "../DTO/org_member_dto.js";
import {User} from "../../user/domain/user_domain.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {UserNotFoundError} from "../errors/organization_members_repo_errors.js";
import {UserResponseDto} from "../../user/DTO/user_response_dto.js";


export class HireOrgMemberUseCase {
    constructor(private readonly orgMemberRepo: OrganizationMembersRepository,
                private readonly userRepo: UserRepository,
    ) {}

    private parseRole(role?: string): OrgMemRole | undefined {
        if (!role) return undefined;

        if (role === "OWNER" || role === "ADMIN" || role === "MEMBER") {
            return role;
        }

        throw new InvalidOrganizationMemberRoleError();
    }

    private checkForSelfAssign(actorUserId: string, targetUserId: string) {
        if (actorUserId === targetUserId) throw new CannotPerformActionOnYourselfError();
    }

    private async checkIfUserExists(targetUserId: string): Promise<UserResponseDto> {
        const user = await this.userRepo.findById(targetUserId);
        if (!user) {
            throw new UserNotFoundError();
        }

        const response: UserResponseDto = {
            id: user.id,
            email: user.getEmail(),
            status: user.getStatus(),
            created_at: user.getCreatedAt(),
        }

        return response;
    }

    private async actorMemberExists(actorUserId: string, orgId: string): Promise<OrganizationMember> {
        const actorMember = await this.orgMemberRepo.findById(actorUserId, orgId);
        if (!actorMember) {
            throw new ActorNotAMemberError();
        }
        return actorMember;
    }

    private assertRoleAndActor(parsedRole: OrgMemRole | undefined, actorMember: OrganizationMember) {
        if (parsedRole === "OWNER") {
            throw new CannotAssignRole(parsedRole);
        }
        if (parsedRole === "ADMIN" && actorMember.getRole() !== "OWNER") {
            throw new OnlyOwnerCanAssign();
        }
        if (parsedRole === "MEMBER" && actorMember.getRole() === "MEMBER") {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
    }

    execute = async (actorUserId: string, organizationId: string, targetUserId: string, role?: OrgMemRole) => {
        const parsedRole = this.parseRole(role);

        this.checkForSelfAssign(actorUserId, targetUserId);

        const userExists = await this.checkIfUserExists(targetUserId);

        const actorMember = await this.actorMemberExists(actorUserId, organizationId);

        this.assertRoleAndActor(parsedRole, actorMember);

        const newMember = OrganizationMember.hire(organizationId, userExists.id, parsedRole);

        await this.orgMemberRepo.save(newMember);

        const forReturn: OrgMemberDTO = {
            userId: newMember.userId,
            organizationId: newMember.organizationId,
            role: newMember.getRole(),
            joinedAt: newMember.getJoinedAt(),
        };

        return forReturn;
    }
}