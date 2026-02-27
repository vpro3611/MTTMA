import {ChangeOrgTaskDescriptionUseCase} from "../change_org_task_description_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {ChangeDescDTO} from "../../DTO/change_desc_dto.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class ChangeDescWithAudit {
    constructor(private readonly taskDescUseCase: ChangeOrgTaskDescriptionUseCase,
                private readonly auditEvents: AppendLogAuditEvents,
    ) {};

    executeTx = async (dto: ChangeDescDTO) => {
        const changedTask = await this.taskDescUseCase.execute(dto);

        const audit = AuditEvent.create(
            dto.actorId,
            dto.orgId,
            AuditEventActions.TASK_DESCRIPTION_CHANGED,
        );

        await this.auditEvents.execute(audit);

        return changedTask;
    };
}