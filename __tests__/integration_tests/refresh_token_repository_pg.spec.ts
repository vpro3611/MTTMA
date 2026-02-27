import { Pool } from "pg";
import crypto from "crypto";
import { RefreshTokensRepository } from "../../backend/src/Auth/refresh_tokens/refresh_tokens_repository.js";

describe("RefreshTokensRepository (integration)", () => {

    let repo: RefreshTokensRepository;
    let poolT: Pool;

    let userId: string;
    let tokenId: string;
    let tokenHash: string;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must run in test environment");
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });

        repo = new RefreshTokensRepository(poolT);
    });

    beforeEach(async () => {
        await poolT.query("BEGIN");

        userId = crypto.randomUUID();
        tokenId = crypto.randomUUID();
        tokenHash = crypto.randomUUID();

        // prerequisite user
        await poolT.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [
                userId,
                "refresh@test.com",
                "hashed-password",
                "active",
            ]
        );
    });

    afterEach(async () => {
        await poolT.query("ROLLBACK");
    });

    afterAll(async () => {
        await poolT.end();
    });

    /**
     * create
     */
    it("should create refresh token", async () => {

        const expiresAt = new Date(Date.now() + 100000);

        await repo.create({
            id: tokenId,
            userId,
            tokenHash,
            expiresAt,
        });

        const result = await poolT.query(
            `SELECT * FROM refresh_tokens WHERE id = $1`,
            [tokenId]
        );

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].user_id).toBe(userId);
        expect(result.rows[0].token_hash).toBe(tokenHash);
    });

    /**
     * findValidByHash
     */
    it("should return valid token", async () => {

        await repo.create({
            id: tokenId,
            userId,
            tokenHash,
            expiresAt: new Date(Date.now() + 100000),
        });

        const token = await repo.findValidByHash(tokenHash);

        expect(token).not.toBeNull();
        expect(token!.userId).toBe(userId);
    });

    it("should return null if token expired", async () => {

        await repo.create({
            id: tokenId,
            userId,
            tokenHash,
            expiresAt: new Date(Date.now() - 100000),
        });

        const token = await repo.findValidByHash(tokenHash);

        expect(token).toBeNull();
    });

    it("should return null if token revoked", async () => {

        await repo.create({
            id: tokenId,
            userId,
            tokenHash,
            expiresAt: new Date(Date.now() + 100000),
        });

        await repo.revoke(tokenId);

        const token = await repo.findValidByHash(tokenHash);

        expect(token).toBeNull();
    });

    /**
     * revoke
     */
    it("should revoke token by id", async () => {

        await repo.create({
            id: tokenId,
            userId,
            tokenHash,
            expiresAt: new Date(Date.now() + 100000),
        });

        await repo.revoke(tokenId);

        const result = await poolT.query(
            `SELECT revoked_at FROM refresh_tokens WHERE id = $1`,
            [tokenId]
        );

        expect(result.rows[0].revoked_at).not.toBeNull();
    });

    /**
     * revokeByHash
     */
    it("should revoke token by hash", async () => {

        await repo.create({
            id: tokenId,
            userId,
            tokenHash,
            expiresAt: new Date(Date.now() + 100000),
        });

        await repo.revokeByHash(tokenHash);

        const result = await poolT.query(
            `SELECT revoked_at FROM refresh_tokens WHERE id = $1`,
            [tokenId]
        );

        expect(result.rows[0].revoked_at).not.toBeNull();
    });

    /**
     * findByHash
     */
    it("should return token even if revoked or expired", async () => {

        await repo.create({
            id: tokenId,
            userId,
            tokenHash,
            expiresAt: new Date(Date.now() - 100000),
        });

        await repo.revoke(tokenId);

        const token = await repo.findByHash(tokenHash);

        expect(token).not.toBeNull();
        expect(token!.id).toBe(tokenId);
    });

    it("should return null if token not found", async () => {

        const token = await repo.findByHash("non-existent-hash");

        expect(token).toBeNull();
    });

});
