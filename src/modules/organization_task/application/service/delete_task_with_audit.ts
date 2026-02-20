import {DeleteTaskUseCase} from "../delete_task_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {DeleteTaskDTO} from "../../DTO/delete_task_dto.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class DeleteTaskWithAudit {
    constructor(private readonly deleteTask: DeleteTaskUseCase,
                private readonly auditEvents: AppendLogAuditEvents
    ) {}

    executeTx = async (dto: DeleteTaskDTO) => {
        const deletedTask = await this.deleteTask.execute(dto);

        const audit = AuditEvent.create(
            dto.actorId,
            dto.orgId,
            AuditEventActions.TASK_DELETED,
        )

        await this.auditEvents.execute(audit);

        return deletedTask;
    }
}