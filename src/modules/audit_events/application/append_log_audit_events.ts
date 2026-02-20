import {AuditEvent} from "../domain/audit_event_domain.js";
import {AuditEventRepository} from "../domain/ports/audit_event_repository_interface.js";


export class AppendLogAuditEvents {
    constructor(private readonly auditEventsRepository: AuditEventRepository) {}

    execute = async (event: AuditEvent) => {
        await this.auditEventsRepository.append(event);
    }

}