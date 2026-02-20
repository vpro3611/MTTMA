import {ViewOrganizationUseCase} from "../view_organization_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class ViewOrganizationServiceWithAudit {
    constructor(private readonly viewOrgUseCase: ViewOrganizationUseCase,
                private readonly auditWrite: AppendLogAuditEvents
    ) {}

    async executeTx (actorId: string, organizationId: string) {
        const viewOrg = await this.viewOrgUseCase.execute(actorId, organizationId);

        const auditEvent = AuditEvent.create(
            actorId,
            organizationId,
            AuditEventActions.ORGANIZATION_VIEWED
        );

        await this.auditWrite.execute(auditEvent);

        return viewOrg;
    }
}