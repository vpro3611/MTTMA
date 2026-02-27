import { Pool } from "pg";
import { AuditEventsRepositoryPg } from "../../../backend/src/modules/audit_events/repozitory_realization/audit_events_repository_pg.js";
import { AuditEvent } from "../../../backend/src/modules/audit_events/domain/audit_event_domain.js";
import { AuditEventActions } from "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("AuditEventsRepositoryPg (integration)", () => {
    let repo: AuditEventsRepositoryPg;
    let poolT: Pool;

    let ORG_ID: string;
    let USER_ID: string;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must run in test environment");
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });

        repo = new AuditEventsRepositoryPg(poolT);
    });

    beforeEach(async () => {
        await poolT.query("BEGIN");

        ORG_ID = crypto.randomUUID();
        USER_ID = crypto.randomUUID();

        // FK prerequisites внутри транзакции
        await poolT.query(
            `
            INSERT INTO organizations (id, name, created_at)
            VALUES ($1, 'Test Org', NOW())
            `,
            [ORG_ID]
        );

        await poolT.query(
            `
            INSERT INTO users (id, email, password_hash, status, created_at)
            VALUES ($1, 'audit@test.com', 'hash', 'active', NOW())
            `,
            [USER_ID]
        );
    });

    afterEach(async () => {
        await poolT.query("ROLLBACK");
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
        expect(result.rows[0].action).toBe(
            AuditEventActions.ORG_MEMBER_HIRED
        );
    });
});
