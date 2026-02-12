import {CreateOrganizationTaskUseCase} from "../create_org_task_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {CreateOrgTaskDataInputDTO} from "../../DTO/create_org_task_dto.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class CreateTaskWithAudit {
    constructor(private readonly createTaskUseCase: CreateOrganizationTaskUseCase,
                private readonly auditEvents: AppendLogAuditEvents
    ) {};

    executeTx = async (dto: CreateOrgTaskDataInputDTO) => {
        const task = await this.createTaskUseCase.execute(dto);

        const audit = AuditEvent.create(
            dto.createdBy,
            dto.organizationId,
            AuditEventActions.TASK_CREATED,
        )

        await this.auditEvents.execute(audit);

        return task;
    }
}