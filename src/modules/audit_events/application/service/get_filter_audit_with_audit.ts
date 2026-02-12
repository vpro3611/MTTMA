import {GetFilteredAuditOrgUseCase} from "../get_filtered_audit_org_use_case.js";
import {AppendLogAuditEvents} from "../append_log_audit_events.js";
import {GetAuditEventQuery} from "../../DTO/get_audit_event_query.js";
import {AuditEvent} from "../../domain/audit_event_domain.js";
import {AuditEventActions} from "../../domain/audit_event_actions.js";


export class GetFilterAuditWithAudit {
    constructor(private readonly filteredAudit: GetFilteredAuditOrgUseCase,
                private readonly writeAudit: AppendLogAuditEvents
    ) {};

    executeTx = async (queryDto: GetAuditEventQuery) => {
        const result = await this.filteredAudit.execute(queryDto)

        const audit = AuditEvent.create(
            queryDto.actorId,
            queryDto.orgId,
            AuditEventActions.GET_AUDIT_EVENTS_FILTERED
        );

        await this.writeAudit.execute(audit);

        return result;
    }
}
