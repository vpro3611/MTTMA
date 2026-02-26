import { Pool } from "pg";
import crypto from "crypto";

import { CreateOrgServ } from "../../../src/modules/organization/controllers/services/create_organization_serv.js";
import { TransactionManagerPg } from "../../../src/modules/transaction_manager/transaction_manager_pg.js";

describe("CreateOrgServ (integration)", () => {

    let pool: Pool;
    let service: CreateOrgServ;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must run in test environment");
        }

        pool = new Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });

        const txManager = new TransactionManagerPg(pool);
        service = new CreateOrgServ(txManager);
    });

    afterEach(async () => {
        // ⚠ порядок важен из-за FK
        await pool.query(`DELETE FROM organization_members`);
        await pool.query(`DELETE FROM audit_events`);
        await pool.query(`DELETE FROM organizations`);
        await pool.query(`DELETE FROM users`);
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should create organization and assign owner inside transaction", async () => {

        const userId = crypto.randomUUID();

        // prerequisite user
        await pool.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [
                userId,
                "owner@test.com",
                "hash",
                "active"
            ]
        );

        const organization = await service.createOrgS("Test Org", userId);

        // 1️⃣ организация создана
        const orgResult = await pool.query(
            `SELECT * FROM organizations WHERE id = $1`,
            [organization.id]
        );

        expect(orgResult.rows).toHaveLength(1);
        expect(orgResult.rows[0].name).toBe("Test Org");

        // 2️⃣ owner добавлен
        const memberResult = await pool.query(
            `SELECT * FROM organization_members
             WHERE organization_id = $1 AND user_id = $2`,
            [organization.id, userId]
        );

        expect(memberResult.rows).toHaveLength(1);
        expect(memberResult.rows[0].role).toBe("OWNER");

        // 3️⃣ аудит записан (если у тебя есть audit_events)
        const auditResult = await pool.query(
            `SELECT * FROM audit_events
             WHERE organization_id = $1`,
            [organization.id]
        );

        expect(auditResult.rows.length).toBeGreaterThan(0);
    });

});