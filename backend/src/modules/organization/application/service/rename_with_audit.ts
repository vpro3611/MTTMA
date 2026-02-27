import {RenameOrganizationUseCase} from "../rename_organization_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class RenameWithAudit {
    constructor(private readonly organization: RenameOrganizationUseCase,
                private readonly auditEvents: AppendLogAuditEvents
    ) {};

    executeTx = async (orgId: string, newName: string, actorId: string) => {
        const organization = await this.organization.execute(orgId, newName, actorId);

        const auditEvent: AuditEvent = AuditEvent.create(
            actorId,
            orgId,
            AuditEventActions.ORGANIZATION_RENAMED
        );

        await this.auditEvents.execute(auditEvent);

        return organization;
    }
}