import {AuditEventReader} from "../domain/ports/audit_event_reader_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {GetAuditEventQuery} from "../DTO/get_audit_event_query.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../organization_members/errors/organization_members_domain_error.js";


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

    execute = async (queryDto: GetAuditEventQuery) => {
        const actor = await this.orgMemberRepo.findById(queryDto.actorId, queryDto.orgId);
        if (!actor) {
            throw new ActorNotAMemberError();
        }

        if (actor.getRole() === "MEMBER") {
            throw new OrganizationMemberInsufficientPermissionsError();
        }

        const normalizedFilters = this.normalizeFilters(queryDto["filters"]);

        return await this.auditEventReader.getByOrganization(queryDto.orgId, normalizedFilters);
    }
}