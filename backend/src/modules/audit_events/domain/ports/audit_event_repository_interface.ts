import {AuditEvent} from "../audit_event_domain.js";

export interface AuditEventRepository {
    append(event: AuditEvent): Promise<void>;
}