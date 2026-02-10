import {Pool} from "pg";
import {AuditEventsRepositoryPg} from "../../../src/modules/audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AuditEvent} from "../../../src/modules/audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../src/modules/audit_events/domain/audit_event_actions.js";
import {pool} from "../../../src/db/pg_pool.js";

describe("AuditEventsRepositoryPg (integration)", () => {
    let repo: AuditEventsRepositoryPg;
    let poolT: Pool;

    const ORG_ID = "00000000-0000-0000-0000-000000000001";
    const USER_ID = "00000000-0000-0000-0000-000000000002";

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must run in test environment");
        }

        poolT = pool;
        repo = new AuditEventsRepositoryPg(poolT);

        // FK prerequisites
        await poolT.query(
            `
            INSERT INTO organizations (id, name, created_at)
            VALUES ($1, 'Test Org23', NOW())
            ON CONFLICT DO NOTHING
            `,
            [ORG_ID]
        );

        await poolT.query(
            `
            INSERT INTO users (id, email, password_hash, status, created_at)
            VALUES ($1, 'audit@test.com', 'hash', 'active', NOW())
            ON CONFLICT DO NOTHING
            `,
            [USER_ID]
        );
    });

    afterEach(async () => {
        await poolT.query("TRUNCATE TABLE audit_events CASCADE");
        await poolT.query("TRUNCATE TABLE organizations CASCADE");
        await poolT.query("TRUNCATE TABLE users CASCADE");
    });

    afterAll(async () => {
        await poolT.end();
    });

    it("should append audit event", async () => {
        const event = AuditEvent.create(
            USER_ID,
            ORG_ID,
            AuditEventActions.ORG_MEMBER_HIRED,
        );

        await repo.append(event);

        const result = await poolT.query(
            "SELECT * FROM audit_events WHERE id = $1",
            [event.id]
        );

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].actor_user_id).toBe(USER_ID);
        expect(result.rows[0].organization_id).toBe(ORG_ID);
        expect(result.rows[0].action).toBe(AuditEventActions.ORG_MEMBER_HIRED);
    });
});
