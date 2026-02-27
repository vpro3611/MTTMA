import {Pool, PoolClient} from "pg";
import {AuditEvent} from "../domain/audit_event_domain.js";
import {AuditPersistenceError} from "../errors/audit_repo_errors.js";


export class AuditEventsRepositoryPg {
    constructor(private readonly pool: Pool | PoolClient) {}


    append = async (event: AuditEvent) => {
        try {
            await this.pool.query(
                `
                INSERT INTO audit_events (id, actor_user_id, organization_id, action, created_at)
                VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    event.id,
                    event.getActorId(),
                    event.getOrganizationId(),
                    event.getAction(),
                    event.getCreatedAt(),
                ]
            );
        } catch  {
            throw new AuditPersistenceError();
        }
    }
}