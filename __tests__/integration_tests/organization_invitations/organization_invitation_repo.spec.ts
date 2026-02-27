import { Pool } from "pg";
import { InvitationRepositoryPG } from "../../../backend/src/modules/invitations/repository_realization/invitation_repository_pg.js";
import { Invitation } from "../../../backend/src/modules/invitations/domain/invitation_domain.js";
import { InvitationStatus } from "../../../backend/src/modules/invitations/domain/invitation_status.js";

describe("InvitationRepositoryPG (integration)", () => {

    let poolT: Pool;
    let repo: InvitationRepositoryPG;

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

        repo = new InvitationRepositoryPG(poolT);
    });

    beforeEach(async () => {
        await poolT.query("BEGIN");

        userId = crypto.randomUUID();
        inviterId = crypto.randomUUID();
        organizationId = crypto.randomUUID();

        // создаём зависимости
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
    // SAVE + GET BY ID
    // --------------------------------------------------

    it("should save invitation and retrieve it by id", async () => {
        const invitation = new Invitation(
            crypto.randomUUID(),
            organizationId,
            userId,
            inviterId,
            "MEMBER",
            InvitationStatus.PENDING,
            new Date(),
            new Date(Date.now() + 100000)
        );

        await repo.save(invitation);

        const result = await repo.getInvitationById(invitation.id);

        expect(result).not.toBeNull();
        expect(result!.id).toBe(invitation.id);
        expect(result!.getStatus()).toBe(InvitationStatus.PENDING);
    });

    it("should return null when invitation not found", async () => {
        const result = await repo.getInvitationById(crypto.randomUUID());
        expect(result).toBeNull();
    });

    // --------------------------------------------------
    // UPSERT
    // --------------------------------------------------

    it("should update invitation on save (upsert by id)", async () => {
        const id = crypto.randomUUID();

        const invitation = new Invitation(
            id,
            organizationId,
            userId,
            inviterId,
            "MEMBER",
            InvitationStatus.PENDING,
            new Date(),
            new Date()
        );

        await repo.save(invitation);

        const updated = new Invitation(
            id,
            organizationId,
            userId,
            inviterId,
            "ADMIN",
            InvitationStatus.ACCEPTED,
            invitation.getCreatedAt(),
            new Date()
        );

        await repo.save(updated);

        const result = await repo.getInvitationById(id);

        expect(result!.getAssignedRole()).toBe("ADMIN");
        expect(result!.getStatus()).toBe(InvitationStatus.ACCEPTED);
    });

    // --------------------------------------------------
    // FILTERS
    // --------------------------------------------------

    it("should filter invitations by user and status", async () => {
        const invitation = new Invitation(
            crypto.randomUUID(),
            organizationId,
            userId,
            inviterId,
            "MEMBER",
            InvitationStatus.PENDING,
            new Date(),
            new Date()
        );

        await repo.save(invitation);

        const result = await repo.getInvitationsFiltered({
            invited_user_id: userId,
            status: InvitationStatus.PENDING,
        });

        expect(result.length).toBe(1);
        expect(result[0].id).toBe(invitation.id);
    });

    // --------------------------------------------------
    // EXISTS PENDING
    // --------------------------------------------------

    it("should return true if pending invitation exists", async () => {
        const invitation = new Invitation(
            crypto.randomUUID(),
            organizationId,
            userId,
            inviterId,
            "MEMBER",
            InvitationStatus.PENDING,
            new Date(),
            new Date()
        );

        await repo.save(invitation);

        const exists = await repo.existsPending(userId, organizationId);

        expect(exists).toBe(true);
    });

    it("should return false if no pending invitation exists", async () => {
        const exists = await repo.existsPending(userId, organizationId);
        expect(exists).toBe(false);
    });

    // --------------------------------------------------
    // UNIQUE CONSTRAINT (partial index)
    // --------------------------------------------------

    it("should fail when creating duplicate pending invitation", async () => {
        const id1 = crypto.randomUUID();
        const id2 = crypto.randomUUID();

        const inv1 = new Invitation(
            id1,
            organizationId,
            userId,
            inviterId,
            "MEMBER",
            InvitationStatus.PENDING,
            new Date(),
            new Date()
        );

        const inv2 = new Invitation(
            id2,
            organizationId,
            userId,
            inviterId,
            "MEMBER",
            InvitationStatus.PENDING,
            new Date(),
            new Date()
        );

        await repo.save(inv1);

        await expect(repo.save(inv2)).rejects.toThrow();
    });

    // --------------------------------------------------
    // FOREIGN KEY
    // --------------------------------------------------

    it("should fail when saving invitation with invalid user", async () => {
        const invitation = new Invitation(
            crypto.randomUUID(),
            organizationId,
            crypto.randomUUID(), // несуществующий user
            inviterId,
            "MEMBER",
            InvitationStatus.PENDING,
            new Date(),
            new Date()
        );

        await expect(repo.save(invitation)).rejects.toThrow();
    });
});
