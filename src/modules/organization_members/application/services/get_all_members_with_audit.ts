import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import { GetAllMembersUseCase } from "../get_all_members_use_case.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class GetAllMembersWithAudit {
    constructor(private readonly getAllMembersUseCase: GetAllMembersUseCase,
                private readonly writeAuditUseCase: AppendLogAuditEvents
    ) {};

    executeTx = async (actorId: string, organizationId: string) => {
        const membersList = await this.getAllMembersUseCase.execute(actorId, organizationId);

        const audit = AuditEvent.create(
            actorId,
            organizationId,
            AuditEventActions.LIST_ALL_MEMBERS,
        );

        await this.writeAuditUseCase.execute(audit);

        return membersList;
    }
}