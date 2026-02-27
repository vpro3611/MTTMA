import { Pool } from "pg";
import { OrganizationMemberRepositoryPG } from "../../../src/modules/organization_members/organization_members_repository_realization/organization_member_repository.js";
import { OrganizationMember } from "../../../src/modules/organization_members/domain/organization_member_domain.js";
import {
    OrganizationMemberNotFoundError,
    OrganizationMemberPersistenceError,
    UserNotFoundError
} from "../../../src/modules/organization_members/errors/organization_members_repo_errors.js";

describe('OrganizationMemberRepositoryPG (integration)', () => {

    let repo: OrganizationMemberRepositoryPG;
    let poolT: Pool;

    let orgId: string;
    let userId: string;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Must run in test environment');
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });

        repo = new OrganizationMemberRepositoryPG(poolT);
    });

    beforeEach(async () => {
        await poolT.query('BEGIN');

        orgId = crypto.randomUUID();
        userId = crypto.randomUUID();

        await poolT.query(
            `INSERT INTO organizations (id, name, created_at)
             VALUES ($1, $2, NOW())`,
            [orgId, 'test org']
        );

        await poolT.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [
                userId,
                'member@test.com',
                'hashed-password',
                'active',
            ]
        );
    });

    afterEach(async () => {
        await poolT.query('ROLLBACK');
    });

    afterAll(async () => {
        await poolT.end();
    });

    /**
     * save
     */
    it('should save organization member', async () => {
        const member = OrganizationMember.hire(
            orgId,
            userId,
            'MEMBER'
        );

        await repo.save(member);

        const found = await repo.findById(userId, orgId);

        expect(found).not.toBeNull();
        expect(found!.getRole()).toBe('MEMBER');
    });

    it('should update role on duplicate save (ON CONFLICT DO UPDATE)', async () => {
        const member = OrganizationMember.hire(
            orgId,
            userId,
            'MEMBER'
        );

        await repo.save(member);

        const updatedMember = OrganizationMember.hire(
            orgId,
            userId,
            'ADMIN'
        );

        await repo.save(updatedMember);

        const found = await repo.findById(userId, orgId);

        expect(found).not.toBeNull();
        expect(found!.getRole()).toBe('ADMIN');
    });

    it('should throw OrganizationMemberPersistenceError if org does not exist', async () => {
        const member = OrganizationMember.hire(
            crypto.randomUUID(),
            userId,
            'MEMBER'
        );

        await expect(
            repo.save(member)
        ).rejects.toBeInstanceOf(
            OrganizationMemberPersistenceError
        );
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
        const member = OrganizationMember.hire(
            orgId,
            crypto.randomUUID(),
            'MEMBER'
        );

        await expect(
            repo.save(member)
        ).rejects.toBeInstanceOf(
            OrganizationMemberPersistenceError
        );
    });

    /**
     * findById
     */
    it('should return null if member not found', async () => {
        const result = await repo.findById(
            crypto.randomUUID(),
            orgId
        );

        expect(result).toBeNull();
    });

    it('should return member if exists', async () => {
        const member = OrganizationMember.hire(
            orgId,
            userId,
            'ADMIN'
        );

        await repo.save(member);

        const found = await repo.findById(userId, orgId);

        expect(found).not.toBeNull();
        expect(found!.getRole()).toBe('ADMIN');
    });

    /**
     * delete
     */
    it('should delete member and return it', async () => {
        const member = OrganizationMember.hire(
            orgId,
            userId,
            'MEMBER'
        );

        await repo.save(member);

        const deleted = await repo.delete(
            userId,
            orgId
        );

        expect(deleted.userId).toBe(userId);

        const after = await repo.findById(
            userId,
            orgId
        );

        expect(after).toBeNull();
    });

    it('should throw error when deleting non-existing member', async () => {
        await expect(
            repo.delete(userId, orgId)
        ).rejects.toBeInstanceOf(
            OrganizationMemberNotFoundError
        );
    });

    /**
     * getAllMembers
     */

    it('should return all members of organization', async () => {

        const userId2 = crypto.randomUUID();

        await poolT.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [
                userId2,
                'member2@test.com',
                'hashed-password',
                'active',
            ]
        );

        const member1 = OrganizationMember.hire(
            orgId,
            userId,
            'MEMBER'
        );

        const member2 = OrganizationMember.hire(
            orgId,
            userId2,
            'ADMIN'
        );

        await repo.save(member1);
        await repo.save(member2);

        const members = await repo.getAllMembers(orgId);

        expect(members).toHaveLength(2);

        const roles = members.map(m => m.getRole());

        expect(roles).toContain('MEMBER');
        expect(roles).toContain('ADMIN');
    });

    it('should return empty array if organization has no members', async () => {
        const members = await repo.getAllMembers(orgId);
        expect(members).toEqual([]);
    });

});