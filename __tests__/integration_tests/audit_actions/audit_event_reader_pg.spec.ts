import { Pool } from "pg";
import { AuditEventReaderPG } from "../../../src/modules/audit_events/repozitory_realization/audit_event_reader.js";
import { AuditEventsRepositoryPg } from "../../../src/modules/audit_events/repozitory_realization/audit_events_repository_pg.js";
import { AuditEvent } from "../../../src/modules/audit_events/domain/audit_event_domain.js";
import { AuditEventActions } from "../../../src/modules/audit_events/domain/audit_event_actions.js";
import { AuditPersistenceError } from "../../../src/modules/audit_events/errors/audit_repo_errors.js";

describe("AuditEventReaderPG (integration)", () => {
    let poolT: Pool;
    let reader: AuditEventReaderPG;
    let writer: AuditEventsRepositoryPg;

    let ORG_ID: string;
    let OTHER_ORG_ID: string;
    let USER_ID: string;
    let OTHER_USER_ID: string;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must run in test environment");
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });

        reader = new AuditEventReaderPG(poolT);
        writer = new AuditEventsRepositoryPg(poolT);
    });

    beforeEach(async () => {
        await poolT.query("BEGIN");

        ORG_ID = crypto.randomUUID();
        OTHER_ORG_ID = crypto.randomUUID();
        USER_ID = crypto.randomUUID();
        OTHER_USER_ID = crypto.randomUUID();

        await poolT.query(
            `
                INSERT INTO organizations (id, name, created_at)
                VALUES ($1, 'org1', NOW()),
                       ($2, 'org2', NOW())
            `,
            [ORG_ID, OTHER_ORG_ID]
        );

        await poolT.query(
            `
                INSERT INTO users (id, email, password_hash, status, created_at)
                VALUES ($1, 'u1@test.com', 'hash', 'active', NOW()),
                       ($2, 'u2@test.com', 'hash', 'active', NOW())
            `,
            [USER_ID, OTHER_USER_ID]
        );
    });

    afterEach(async () => {
        await poolT.query("ROLLBACK");
    });

    afterAll(async () => {
        await poolT.end();
    });

    it("returns empty array when no events", async () => {
        const res = await reader.getByOrganization(ORG_ID);
        expect(res).toEqual([]);
    });

    it("returns events sorted by created_at DESC", async () => {
        const e1 = AuditEvent.create(USER_ID, ORG_ID, AuditEventActions.ORG_MEMBER_HIRED);
        await writer.append(e1);

        await new Promise(r => setTimeout(r, 10));

        const e2 = AuditEvent.create(USER_ID, ORG_ID, AuditEventActions.ORG_MEMBER_HIRED);
        await writer.append(e2);

        const res = await reader.getByOrganization(ORG_ID);

        expect(res).toHaveLength(2);
        expect(res[0].getCreatedAt().getTime())
            .toBeGreaterThan(res[1].getCreatedAt().getTime());
    });

    it("filters by action", async () => {
        await writer.append(
            AuditEvent.create(USER_ID, ORG_ID, AuditEventActions.ORG_MEMBER_HIRED)
        );

        await writer.append(
            AuditEvent.create(USER_ID, ORG_ID, AuditEventActions.ORG_MEMBER_FIRED)
        );

        const res = await reader.getByOrganization(ORG_ID, {
            action: AuditEventActions.ORG_MEMBER_HIRED,
        });

        expect(res).toHaveLength(1);
        expect(res[0].getAction()).toBe(AuditEventActions.ORG_MEMBER_HIRED);
    });

    it("filters by actorUserId", async () => {
        await writer.append(
            AuditEvent.create(USER_ID, ORG_ID, AuditEventActions.ORG_MEMBER_HIRED)
        );

        await writer.append(
            AuditEvent.create(OTHER_USER_ID, ORG_ID, AuditEventActions.ORG_MEMBER_HIRED)
        );

        const res = await reader.getByOrganization(ORG_ID, {
            actorUserId: OTHER_USER_ID,
        });

        expect(res).toHaveLength(1);
        expect(res[0].getActorId()).toBe(OTHER_USER_ID);
    });

    it("filters by from / to dates", async () => {
        const from = new Date();
        await new Promise(r => setTimeout(r, 10));

        const event = AuditEvent.create(
            USER_ID,
            ORG_ID,
            AuditEventActions.ORG_MEMBER_HIRED
        );

        await writer.append(event);

        await new Promise(r => setTimeout(r, 10));
        const to = new Date();

        const res = await reader.getByOrganization(ORG_ID, { from, to });

        expect(res).toHaveLength(1);
        expect(res[0].id).toBe(event.id);
    });

    it("applies limit and offset", async () => {
        for (let i = 0; i < 5; i++) {
            await writer.append(
                AuditEvent.create(USER_ID, ORG_ID, AuditEventActions.ORG_MEMBER_HIRED)
            );
        }

        const res = await reader.getByOrganization(ORG_ID, {
            limit: 2,
            offset: 1,
        });

        expect(res).toHaveLength(2);
    });

    it("returns empty array for other organization", async () => {
        await writer.append(
            AuditEvent.create(USER_ID, ORG_ID, AuditEventActions.ORG_MEMBER_HIRED)
        );

        const res = await reader.getByOrganization(OTHER_ORG_ID);
        expect(res).toEqual([]);
    });

    describe("getById", () => {
        it("returns audit event by id", async () => {
            const event = AuditEvent.create(
                USER_ID,
                ORG_ID,
                AuditEventActions.ORG_MEMBER_HIRED
            );

            await writer.append(event);

            const res = await reader.getById(event.id);

            expect(res).not.toBeNull();
            expect(res!.id).toBe(event.id);
            expect(res!.getAction()).toBe(AuditEventActions.ORG_MEMBER_HIRED);
        });

        it("returns null if event not found", async () => {
            const res = await reader.getById(crypto.randomUUID());
            expect(res).toBeNull();
        });
    });
});
