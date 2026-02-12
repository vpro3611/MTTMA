import {AuditEvent} from "../audit_event_domain.js";


export interface AuditEventReader {
    getByOrganizationFiltered(
        orgId: string,
        filters?: {
            action?: string,
            actorUserId?: string,
            from?: Date,
            to?: Date,
            limit?: number,
            offset?: number,
        }): Promise<AuditEvent[]>;

    getByOrganization(id: string): Promise<AuditEvent[]>;
}