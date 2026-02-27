import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {AuditEventReader} from "../domain/ports/audit_event_reader_interface.js";
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";
import {AuditEvent} from "../domain/audit_event_domain.js";
import {AuditNotFoundError} from "../errors/audit_repo_errors.js";
import {AuditDto} from "../DTO/for_return/audit_dto.js";
import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";


export class GetOrganizationAuditUseCase {
    constructor(private readonly auditEventReader: AuditEventReader,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ) {}

    private async actorExists(actorId: string, orgId: string): Promise<OrganizationMember> {
        const existing = await this.orgMemberRepo.findById(actorId, orgId);
        if (!existing) {
            throw new ActorNotAMemberError();
        }
        return existing;
    }
    //
    // private checkActorRole(actorRole: string) {
    //     if (actorRole === OrgMemsRole.MEMBER) {
    //         throw new OrganizationMemberInsufficientPermissionsError();
    //     }
    // }

    private mapDto(audit: AuditEvent): AuditDto {
        return {
            id: audit.id,
            actorId: audit.getActorId(),
            organizationId: audit.getOrganizationId(),
            action: audit.getAction(),
            createdAt: audit.getCreatedAt(),
        }
    }

    execute = async (actorId: string, organizationId: string)=> {
        const actor = await this.actorExists(actorId, organizationId);

        actor.isMember(actor.getRole());

        const audit = await this.auditEventReader.getByOrganization(organizationId);

        return audit.map(this.mapDto);
    }
}