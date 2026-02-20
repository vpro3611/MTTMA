import {AuditEventAction} from "../domain/audit_event_actions.js";


export type GetAuditEventQuery = {
    actorId: string,
    orgId: string,
    filters?: {
        action?: AuditEventAction,
        actorUserId?: string,
        from?: Date,
        to?: Date,
        limit?: number,
        offset?: number,
    };
}