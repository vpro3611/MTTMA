import {ChangeOrgTaskStatusUseCase} from "../change_org_task_status_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {ChangeStatusDTO} from "../../DTO/change_status_dto.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class ChangeTaskStatusWithAudit {
    constructor(private readonly changeStatus: ChangeOrgTaskStatusUseCase,
                private readonly auditEvents: AppendLogAuditEvents
    ) {};

    async executeTx(dto: ChangeStatusDTO) {
        const task = await this.changeStatus.execute(dto);

        const audit = AuditEvent.create(
            dto.actorId,
            dto.orgId,
            AuditEventActions.TASK_STATUS_CHANGED,
        );
        await this.auditEvents.execute(audit);

        return task;
    }
}