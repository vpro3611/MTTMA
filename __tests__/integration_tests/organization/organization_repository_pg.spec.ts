import { Pool } from "pg";
import { OrganizationRepositoryPG } from "../../../src/modules/organization/repository_realization/organization_repository.js";
import { Organization } from "../../../src/modules/organization/domain/organiztion_domain.js";
import { Name } from "../../../src/modules/organization/domain/name.js";
import {
    OrganizationAlreadyExistsError,
} from "../../../src/modules/organization/errors/organization_repository_errors.js";
import {randomUUID} from "node:crypto";

describe('OrganizationRepositoryPG (integration)', () => {

    let repo: OrganizationRepositoryPG;
    let poolT: Pool;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Must run in test environment');
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });

        repo = new OrganizationRepositoryPG(poolT);
    });

    beforeEach(async () => {
        await poolT.query('BEGIN');
    });

    afterEach(async () => {
        await poolT.query('ROLLBACK');
    });

    afterAll(async () => {
        await poolT.end();
    });

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

    it('should return null when organization is not found by id', async () => {
        const result = await repo.findById(crypto.randomUUID());
        expect(result).toBeNull();
    });

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

    it('should return null when organization is not found by name', async () => {
        const result = await repo.findByName(
            Name.validate('unknown org')
        );

        expect(result).toBeNull();
    });

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

    it("should delete organization and return it", async () => {
        const organization = Organization.create(
            Name.validate('To delete')
        );
        await repo.save(organization);
        const deleted = await repo.delete(organization.id);
        expect(deleted).not.toBeNull();
        expect(deleted!.id).toBe(organization.id);
        const after = await repo.findById(organization.id);
        expect(after).toBeNull();
    })

    it("should NOT delete organization by id and return it if it does not exist", async () => {
        const organization = Organization.create(
            Name.validate('To delete')
        );
        expect(organization.getName().getValue()).toBe("To delete");
        await repo.save(organization);
        const randomId = randomUUID();
        const deleted = await repo.delete(randomId);
        expect(deleted).toBeNull();

        const after = await repo.findById(organization.id);
        expect(after).not.toBeNull();
    })
});
