import {ChangeOrgTaskTitleUseCase} from "../change_org_task_title_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {ChangeTitleDTO} from "../../DTO/change_title_dto.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class ChangeTitleWithAudit {
    constructor(private readonly changeTitle: ChangeOrgTaskTitleUseCase,
                private readonly auditEvents: AppendLogAuditEvents
    ) {};

    async executeTx(dto: ChangeTitleDTO) {
        const task = await this.changeTitle.execute(dto);

        const audit = AuditEvent.create(
            dto.actorId,
            dto.orgId,
            AuditEventActions.TASK_TITLE_CHANGED,
        );
        await this.auditEvents.execute(audit);

        return task;
    }
}