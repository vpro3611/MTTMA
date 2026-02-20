import {GetOrganizationAuditUseCase} from "../get_org_audit_use_case.js";
import {AppendLogAuditEvents} from "../append_log_audit_events.js";
import {AuditEvent} from "../../domain/audit_event_domain.js";
import {AuditEventActions} from "../../domain/audit_event_actions.js";


export class GetAllAuditWithAudit {
    constructor(private readonly getAuditEvents: GetOrganizationAuditUseCase,
                private readonly auditEventWrite: AppendLogAuditEvents
    ) {};

    executeTx = async (actorId: string, orgId: string) => {
        const audit = AuditEvent.create(actorId, orgId, AuditEventActions.GET_AUDIT_EVENT);

        await this.auditEventWrite.execute(audit);

        const auditEvents = await this.getAuditEvents.execute(actorId, orgId);

        return auditEvents;
    }
}