import {AuditEventReader} from "../domain/ports/audit_event_reader_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {GetAuditEventQuery} from "../DTO/get_audit_event_query.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";


export class GetFilteredAuditOrgUseCase {
    constructor(private readonly auditEventReader: AuditEventReader,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ) {}

    private normalizeFilters(filters?: GetAuditEventQuery["filters"]) {
        return {
            action: filters?.action,
            actorUserId: filters?.actorUserId,
            from: filters?.from,
            to: filters?.to,
            limit: Math.min(filters?.limit ?? 50, 100),
            offset: filters?.offset ?? 0,
        };
    }

    private async actorExists(actorId: string, orgId: string): Promise<OrganizationMember> {
        const existing = await this.orgMemberRepo.findById(actorId, orgId);
        if (!existing) {
            throw new ActorNotAMemberError();
        }
        return existing;
    }

    private checkActorRole(actorRole: string) {
        if (actorRole === "MEMBER") {
            throw new OrganizationMemberInsufficientPermissionsError();
        }
    }

    execute = async (queryDto: GetAuditEventQuery) => {
        const actor = await this.actorExists(queryDto.actorId, queryDto.orgId);

        this.checkActorRole(actor.getRole());

        const normalizedFilters = this.normalizeFilters(queryDto["filters"]);

        return await this.auditEventReader.getByOrganization(queryDto.orgId, normalizedFilters);
    }
}