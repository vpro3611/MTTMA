import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {ActorNotAMemberError} from "../errors/organization_members_domain_error.js";
import {OrganizationMember} from "../domain/organization_member_domain.js";
import {OrgMemDTO} from "../DTO/for_return/org_mem_dto.js";


export class GetAllMembersUseCase {
    constructor(private readonly orgMemberRepo: OrganizationMembersRepository) {}

    private async actorIsMember(actorId: string, orgId: string) {
        const member = await this.orgMemberRepo.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError()
        }
        return member;
    }

    private mapToDTO = (members: OrganizationMember[]) => {
         const mapped : OrgMemDTO[] = members.map(member => {
            return {
                userId: member.userId,
                organizationId: member.organizationId,
                role: member.getRole(),
                joinedAt: member.getJoinedAt(),
            }
        })
        return mapped;
    }

    execute = async (actorId: string, orgId: string) => {

        const member = await this.actorIsMember(actorId, orgId);

        const members = await this.orgMemberRepo.getAllMembers(orgId);

        return this.mapToDTO(members);
    }
}