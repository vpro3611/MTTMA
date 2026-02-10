import {AuditEvent} from "../audit_event_domain.js";


export interface AuditEventReader {
    getByOrganization(
        orgId: string,
        filters?: {
            action?: string,
            actorUserId?: string,
            from?: Date,
            to?: Date,
            limit?: number,
            offset?: number,
        }): Promise<AuditEvent[]>;

    getById(id: string): Promise<AuditEvent | null>;
}