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
import {AuditDto} from "../DTO/for_return/audit_dto.js";
import {AuditEvent} from "../domain/audit_event_domain.js";


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

    private toDto(event: AuditEvent): AuditDto {
        return {
            id: event.id,
            actorId: event.getActorId(),
            organizationId: event.getOrganizationId(),
            action: event.getAction(),
            createdAt: event.getCreatedAt(),
        };
    }


    execute = async (queryDto: GetAuditEventQuery): Promise<AuditDto[]> => {
        const actor = await this.actorExists(queryDto.actorId, queryDto.orgId);

        this.checkActorRole(actor.getRole());

        const normalizedFilters = this.normalizeFilters(queryDto["filters"]);

        const found = await this.auditEventReader.getByOrganizationFiltered(queryDto.orgId, normalizedFilters);

        return found.map(this.toDto);
    }
    /*
    export type AuditDto = {
        id: string,
        actorId: string,
        organizationId: string,
        action: string,
        createdAt: Date,
    }
     */
}