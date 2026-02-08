import { pool } from "../../src/db/pg_pool.js";
import { OrganizationMemberRepositoryPG } from "../../src/modules/organization_members/organization_members_repository_realization/organization_member_repository.js";
import { OrganizationMember } from "../../src/modules/organization_members/domain/organization_member_domain.js";
import {
    OrganizationMemberAlreadyExistsError,
    OrganizationMemberNotFoundError,
    OrganizationMemberPersistenceError,
} from "../../src/modules/organization_members/errors/organization_members_repo_errors.js";
import {
    OrganizationNotFoundError,
} from "../../src/modules/organization_members/errors/organization_members_repo_errors.js";
import {
    UserNotFoundError,
} from "../../src/modules/organization_members/errors/organization_members_repo_errors.js";

describe('OrganizationMemberRepositoryPG (integration)', () => {

    let repo: OrganizationMemberRepositoryPG;

    const orgId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    beforeAll(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Must run in test environment');
        }

        repo = new OrganizationMemberRepositoryPG(pool);

        // prerequisites
        await pool.query(
            `INSERT INTO organizations (id, name, created_at)
       VALUES ($1, $2, NOW())`,
            [orgId, 'test org']
        );

        await pool.query(
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
        await pool.query('TRUNCATE TABLE organization_members');
    });

    afterAll(async () => {
        await pool.query('TRUNCATE TABLE organization_members CASCADE');
        await pool.end();
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

    it('should throw error on duplicate member', async () => {
        const member = OrganizationMember.hire(
            orgId,
            userId,
            'MEMBER'
        );

        await repo.save(member);

        await expect(
            repo.save(member)
        ).rejects.toBeInstanceOf(
            OrganizationMemberAlreadyExistsError
        );
    });

    it('should throw OrganizationNotFoundError if org does not exist', async () => {
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

});
