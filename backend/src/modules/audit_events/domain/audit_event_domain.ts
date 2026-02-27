import {AuditEventAction} from "./audit_event_actions.js";


export class AuditEvent {
    constructor(
        public readonly id: string,
        private readonly actorId: string,
        private readonly organizationId: string,
        private readonly action: AuditEventAction,
        private readonly createdAt: Date,
    ) {}

    static create(actorId: string, organizationId: string, action: AuditEventAction) {
        return new AuditEvent(
            crypto.randomUUID(),
            actorId,
            organizationId,
            action,
            new Date(),
        )
    }


    getActorId = () => this.actorId;
    getOrganizationId = () => this.organizationId;
    getAction = () => this.action;
    getCreatedAt = () => this.createdAt;
}

