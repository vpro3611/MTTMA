import { Pool } from "pg";
import { AuditEvent } from "../domain/audit_event_domain.js";
import { AuditEventReader } from "../domain/ports/audit_event_reader_interface.js";
import {AuditPersistenceError} from "../errors/audit_repo_errors.js";

export class AuditEventReaderPG implements AuditEventReader {
    constructor(private readonly pool: Pool) {}

    async getByOrganization(
        organizationId: string,
        filters?: {
            action?: string;
            actorUserId?: string;
            from?: Date;
            to?: Date;
            limit?: number;
            offset?: number;
        }
    ): Promise<AuditEvent[]> {
        try {
            const conditions: string[] = ["organization_id = $1"];
            const values: any[] = [organizationId];
            let idx = 2;

            if (filters?.action) {
                conditions.push(`action = $${idx++}`);
                values.push(filters.action);
            }

            if (filters?.actorUserId) {
                conditions.push(`actor_user_id = $${idx++}`);
                values.push(filters.actorUserId);
            }

            if (filters?.from) {
                conditions.push(`created_at >= $${idx++}`);
                values.push(filters.from);
            }

            if (filters?.to) {
                conditions.push(`created_at <= $${idx++}`);
                values.push(filters.to);
            }

            const limit = filters?.limit ?? 50;
            const offset = filters?.offset ?? 0;

            const query = `
                SELECT *
                FROM audit_events
                WHERE ${conditions.join(" AND ")}
                ORDER BY created_at DESC LIMIT $${idx++}
                OFFSET $${idx}
            `;

            values.push(limit, offset);

            const result = await this.pool.query(query, values);

            return result.rows.map(
                row =>
                    new AuditEvent(
                        row.id,
                        row.actor_user_id,
                        row.organization_id,
                        row.action,
                        row.created_at
                    )
            );
        } catch (err: any) {
            console.error(err);
            throw new AuditPersistenceError()
        }
    }

    async getById(id: string): Promise<AuditEvent | null> {
        try {
            const res = await this.pool.query(
                `SELECT *
                 FROM audit_events
                 WHERE id = $1`,
                [id]
            );

            const row = res.rows[0];
            if (!row) return null;

            return new AuditEvent(
                row.id,
                row.actor_user_id,
                row.organization_id,
                row.action,
                row.created_at
            );
        } catch (err: any) {
            console.error(err);
            throw new AuditPersistenceError();
        }
    }
}

