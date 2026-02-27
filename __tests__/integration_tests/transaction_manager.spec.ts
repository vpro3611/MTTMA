import { Pool } from "pg";
import { randomUUID } from "crypto";
import { TransactionManagerPg } from "../../backend/src/modules/transaction_manager/transaction_manager_pg.js";

describe("TransactionManagerPg (integration)", () => {

    let pool: Pool;
    let txManager: TransactionManagerPg;

    beforeAll(() => {
        pool = new Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });

        txManager = new TransactionManagerPg(pool);
    });

    afterEach(async () => {
        await pool.query('TRUNCATE organizations CASCADE;');
    })

    afterAll(async () => {
        await pool.end();
    });

    /**
     * Commit when work succeeds
     */
    it("should commit transaction if work succeeds", async () => {

        const id = randomUUID();

        await txManager.runInTransaction(async (client) => {
            await client.query(
                `INSERT INTO organizations (id, name, created_at)
                 VALUES ($1, $2, NOW())`,
                [id, "commit-test"]
            );
        });

        const result = await pool.query(
            `SELECT * FROM organizations WHERE id = $1`,
            [id]
        );

        expect(result.rows.length).toBe(1);
    });

    /**
     * Rollback when work throws
     */
    it("should rollback transaction if work throws", async () => {

        const id = randomUUID();

        await expect(
            txManager.runInTransaction(async (client) => {
                await client.query(
                    `INSERT INTO organizations (id, name, created_at)
                     VALUES ($1, $2, NOW())`,
                    [id, "rollback-test"]
                );

                throw new Error("force rollback");
            })
        ).rejects.toThrow("force rollback");

        const result = await pool.query(
            `SELECT * FROM organizations WHERE id = $1`,
            [id]
        );

        expect(result.rows.length).toBe(0);
    });

    /**
     * Rollback when SQL error occurs
     */
    it("should rollback if SQL query fails", async () => {

        const id = randomUUID();

        await expect(
            txManager.runInTransaction(async (client) => {

                await client.query(
                    `INSERT INTO organizations (id, name, created_at)
                     VALUES ($1, $2, NOW())`,
                    [id, "sql-error-test"]
                );

                // deliberate SQL error (missing column)
                await client.query(
                    `INSERT INTO organizations (id, non_existing_column)
                     VALUES ($1, $2)`,
                    [randomUUID(), "bad"]
                );
            })
        ).rejects.toThrow();

        const result = await pool.query(
            `SELECT * FROM organizations WHERE id = $1`,
            [id]
        );

        expect(result.rows.length).toBe(0);
    });

    /**
     * Should return result from work
     */
    it("should return value from work function", async () => {

        const value = await txManager.runInTransaction(async () => {
            return "success-value";
        });

        expect(value).toBe("success-value");
    });

    /**
     * Client must be released (implicit test)
     * If client.release() is not called,
     * repeated transactions will eventually exhaust pool.
     */
    it("should allow multiple sequential transactions (client released)", async () => {

        for (let i = 0; i < 5; i++) {
            const id = randomUUID();

            await txManager.runInTransaction(async (client) => {
                await client.query(
                    `INSERT INTO organizations (id, name, created_at)
                     VALUES ($1, $2, NOW())`,
                    [id, `multi-${i}`]
                );
            });
        }

        const result = await pool.query(
            `SELECT * FROM organizations WHERE name LIKE 'multi-%'`
        );

        expect(result.rows.length).toBeGreaterThanOrEqual(5);
    });

});
