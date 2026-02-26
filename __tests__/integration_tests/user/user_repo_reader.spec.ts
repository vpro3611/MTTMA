import { Pool } from "pg";
import crypto from "crypto";
import { UserRepositoryReaderPg } from "../../../src/modules/user/repository_realization/user_repository_reader_pg.js";

describe("UserRepositoryReaderPg (integration)", () => {

    let repo: UserRepositoryReaderPg;
    let poolT: Pool;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must run in test environment");
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });

        repo = new UserRepositoryReaderPg(poolT);
    });

    beforeEach(async () => {
        await poolT.query("BEGIN");
    });

    afterEach(async () => {
        await poolT.query("ROLLBACK");
    });

    afterAll(async () => {
        await poolT.end();
    });

    /**
     * getAll
     */
    it("should return users ordered by created_at DESC", async () => {

        const user1 = crypto.randomUUID();
        const user2 = crypto.randomUUID();
        const user3 = crypto.randomUUID();

        await poolT.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES
             ($1, 'a@test.com', 'hash1', 'active', '2024-01-01'),
             ($2, 'b@test.com', 'hash2', 'active', '2024-02-01'),
             ($3, 'c@test.com', 'hash3', 'banned', '2024-03-01')`,
            [user1, user2, user3]
        );

        const result = await repo.getAll(1, 10);

        expect(result).toHaveLength(3);

        // Проверяем сортировку DESC
        expect(result[0].getEmail().getValue()).toBe("c@test.com");
        expect(result[1].getEmail().getValue()).toBe("b@test.com");
        expect(result[2].getEmail().getValue()).toBe("a@test.com");
    });

    it("should paginate correctly (page 1)", async () => {

        for (let i = 1; i <= 5; i++) {
            await poolT.query(
                `INSERT INTO users (id, email, password_hash, status, created_at)
                 VALUES ($1, $2, 'hash', 'active', NOW() + ($3 || ' seconds')::interval)`,
                [
                    crypto.randomUUID(),
                    `user${i}@test.com`,
                    i
                ]
            );
        }

        const result = await repo.getAll(1, 2);

        expect(result).toHaveLength(2);
    });

    it("should paginate correctly (page 2)", async () => {

        for (let i = 1; i <= 5; i++) {
            await poolT.query(
                `INSERT INTO users (id, email, password_hash, status, created_at)
                 VALUES ($1, $2, 'hash', 'active', NOW() + ($3 || ' seconds')::interval)`,
                [
                    crypto.randomUUID(),
                    `user${i}@test.com`,
                    i
                ]
            );
        }

        const result = await repo.getAll(2, 2);

        expect(result).toHaveLength(2);
    });

    it("should return empty array if no users", async () => {

        const result = await repo.getAll(1, 10);

        expect(result).toEqual([]);
    });

});