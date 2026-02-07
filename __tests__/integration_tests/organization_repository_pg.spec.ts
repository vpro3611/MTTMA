import { pool } from "../../src/db/pg_pool.js";
import { OrganizationRepositoryPG } from "../../src/modules/organization/repository_realization/organization_repository.js";
import { Organization } from "../../src/modules/organization/domain/organiztion_domain.js";
import { Name } from "../../src/modules/organization/domain/name.js";
import {
    OrganizationAlreadyExistsError,
    OrganizationPersistenceError,
} from "../../src/modules/organization/errors/organization_repository_errors.js";

describe('OrganizationRepositoryPG (integration)', () => {

    let repo: OrganizationRepositoryPG;

    beforeAll(() => {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Must run in test environment');
        }

        repo = new OrganizationRepositoryPG(pool);
    });

    afterEach(async () => {
        await pool.query('TRUNCATE TABLE organizations CASCADE');
    });

    afterAll(async () => {
        await pool.end();
    });

    /**
     * CASE 1
     * save → findById
     */
    it('should save organization and retrieve it by id', async () => {
        const organization = Organization.create(
            Name.validate('Acme Inc')
        );

        await repo.save(organization);

        const result = await repo.findById(organization.id);

        expect(result).not.toBeNull();
        expect(result!.id).toBe(organization.id);
        expect(result!.getName().getValue()).toBe('Acme Inc');
    });

    /**
     * CASE 2
     * findById → null if not exists
     */
    it('should return null when organization is not found by id', async () => {
        const result = await repo.findById(crypto.randomUUID());
        expect(result).toBeNull();
    });

    /**
     * CASE 3
     * save → findByName
     */
    it('should find organization by name', async () => {
        const organization = Organization.create(
            Name.validate('My Company')
        );

        await repo.save(organization);

        const result = await repo.findByName(
            Name.validate('My Company')
        );

        expect(result).not.toBeNull();
        expect(result!.id).toBe(organization.id);
    });

    /**
     * CASE 4
     * findByName → null if not exists
     */
    it('should return null when organization is not found by name', async () => {
        const result = await repo.findByName(
            Name.validate('unknown org')
        );

        expect(result).toBeNull();
    });

    /**
     * CASE 5
     * save updates existing organization by id (upsert)
     */
    it('should update organization name on save (upsert by id)', async () => {
        const organization = Organization.create(
            Name.validate('Old Name')
        );

        await repo.save(organization);

        organization.rename(
            Name.validate('new name')
        );

        await repo.save(organization);

        const result = await repo.findById(organization.id);

        expect(result!.getName().getValue()).toBe('new name');
    });

    /**
     * CASE 6
     * unique constraint on name
     */
    it('should throw OrganizationAlreadyExistsError when name is duplicated', async () => {
        const org1 = Organization.create(
            Name.validate('Unique Org')
        );

        const org2 = Organization.create(
            Name.validate('Unique Org')
        );

        await repo.save(org1);

        await expect(
            repo.save(org2)
        ).rejects.toBeInstanceOf(
            OrganizationAlreadyExistsError
        );
    });
});
