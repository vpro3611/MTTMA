import {CreateOrganizationUseCase} from "../create_organization_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class CreateOrganizationWithAudit {
    constructor(private readonly organization: CreateOrganizationUseCase,
                private readonly auditEvents: AppendLogAuditEvents
    ) {};

    executeTx = async (name: string, actorId: string) => {
        const organization = await this.organization.execute(name, actorId);

        const audit = AuditEvent.create(
            actorId,
            organization.id,
            AuditEventActions.ORGANIZATION_CREATED
        );

        await this.auditEvents.execute(audit);

        return organization;
    }
}