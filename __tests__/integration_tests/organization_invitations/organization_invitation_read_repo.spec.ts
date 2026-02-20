import { Pool } from "pg";
import { InvitationReadRepositoryPG } from "../../../src/modules/invitations/repository_realization/invitation_read_repo_pg.js";

describe("InvitationReadRepositoryPG (integration)", () => {

    let poolT: Pool;
    let repo: InvitationReadRepositoryPG;

    let userId: string;
    let inviterId: string;
    let organizationId: string;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must be in test environment");
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });

        repo = new InvitationReadRepositoryPG(poolT);
    });

    beforeEach(async () => {
        await poolT.query("BEGIN");

        userId = crypto.randomUUID();
        inviterId = crypto.randomUUID();
        organizationId = crypto.randomUUID();

        // users
        await poolT.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES ($1, 'user@test.com', 'hash', 'active', NOW())`,
            [userId]
        );

        await poolT.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES ($1, 'inviter@test.com', 'hash', 'active', NOW())`,
            [inviterId]
        );

        // organization
        await poolT.query(
            `INSERT INTO organizations (id, name, created_at)
             VALUES ($1, 'Test Org', NOW())`,
            [organizationId]
        );
    });

    afterEach(async () => {
        await poolT.query("ROLLBACK");
    });

    afterAll(async () => {
        await poolT.end();
    });

    // --------------------------------------------------
    // BASIC FETCH
    // --------------------------------------------------

    it("should return invitation with organization name and members count", async () => {

        // создаём membership (2 участника)
        await poolT.query(
            `INSERT INTO organization_members (
                organization_id,
                user_id,
                role,
                joined_at
            )
             VALUES ($1, $2, $3, NOW())`,
            [organizationId, userId, 'MEMBER']
        );

        await poolT.query(
            `INSERT INTO organization_members (
                organization_id,
                user_id,
                role,
                joined_at
            )
             VALUES ($1, $2, $3, NOW())`,
            [organizationId, inviterId, 'ADMIN']
        );


        // создаём инвайт
        await poolT.query(
            `INSERT INTO organization_invitations (
                id,
                organization_id,
                invited_user_id,
                invited_by_user_id,
                role,
                status,
                created_at,
                expires_at
            )
            VALUES ($1,$2,$3,$4,'MEMBER','PENDING',NOW(),NOW())`,
            [crypto.randomUUID(), organizationId, userId, inviterId]
        );

        const result = await repo.getUserInvitations(userId);

        expect(result.length).toBe(1);
        expect(result[0].organizationName).toBe("Test Org");
        expect(result[0].membersCount).toBe(2);
        expect(result[0].role).toBe("MEMBER");
        expect(result[0].status).toBe("PENDING");
    });

    // --------------------------------------------------
    // ZERO MEMBERS CASE
    // --------------------------------------------------

    it("should return membersCount = 0 if no members exist", async () => {

        await poolT.query(
            `INSERT INTO organization_invitations (
                id,
                organization_id,
                invited_user_id,
                invited_by_user_id,
                role,
                status,
                created_at,
                expires_at
            )
            VALUES ($1,$2,$3,$4,'MEMBER','PENDING',NOW(),NOW())`,
            [crypto.randomUUID(), organizationId, userId, inviterId]
        );

        const result = await repo.getUserInvitations(userId);

        expect(result.length).toBe(1);
        expect(result[0].membersCount).toBe(0);
    });

    // --------------------------------------------------
    // MULTIPLE INVITATIONS + SORTING
    // --------------------------------------------------

    it("should return multiple invitations ordered by created_at desc", async () => {

        const id1 = crypto.randomUUID();
        const id2 = crypto.randomUUID();

        await poolT.query(
            `INSERT INTO organization_invitations (
                id,
                organization_id,
                invited_user_id,
                invited_by_user_id,
                role,
                status,
                created_at,
                expires_at
            )
            VALUES ($1,$2,$3,$4,'MEMBER','PENDING',NOW() - INTERVAL '1 day',NOW())`,
            [id1, organizationId, userId, inviterId]
        );

        await poolT.query(
            `INSERT INTO organization_invitations (
                id,
                organization_id,
                invited_user_id,
                invited_by_user_id,
                role,
                status,
                created_at,
                expires_at
            )
            VALUES ($1,$2,$3,$4,'ADMIN','ACCEPTED',NOW(),NOW())`,
            [id2, organizationId, userId, inviterId]
        );

        const result = await repo.getUserInvitations(userId);

        expect(result.length).toBe(2);
        expect(result[0].id).toBe(id2); // newest first
        expect(result[1].id).toBe(id1);
    });

    // --------------------------------------------------
    // EMPTY RESULT
    // --------------------------------------------------

    it("should return empty array when user has no invitations", async () => {
        const result = await repo.getUserInvitations(userId);
        expect(result).toEqual([]);
    });

});
