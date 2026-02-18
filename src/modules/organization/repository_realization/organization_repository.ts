import {OrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {Pool, PoolClient} from "pg";
import {Organization} from "../domain/organiztion_domain.js";
import {Name} from "../domain/name.js";
import {
    ForeignKeyViolationError,
    OrganizationAlreadyExistsError,
    OrganizationPersistenceError
} from "../errors/organization_repository_errors.js";


export class OrganizationRepositoryPG implements OrganizationRepository {
    constructor(private readonly pool: Pool | PoolClient) {}

    findById = async (id: string): Promise<Organization | null> => {
        try {
            const result = await this.pool.query("SELECT * FROM organizations WHERE id = $1", [id]);
            const row = result.rows[0];
            if (!row) {
                return null;
            }
            return new Organization(
                row.id,
                Name.validate(row.name),
                row.created_at
            );
        } catch {
            throw new OrganizationPersistenceError();
        }
    }

    findByName = async (name: Name): Promise<Organization | null> => {
        try {
            const result = await this.pool.query("SELECT * FROM organizations WHERE name = $1", [name.getValue()]);
            const row = result.rows[0];
            if (!row) {
                return null;
            }
            return new Organization(
                row.id,
                Name.validate(row.name),
                row.created_at
            );
        } catch {
            throw new OrganizationPersistenceError();
        }
    }

    save = async(organization: Organization): Promise<void> => {
        try {
            const result = await this.pool.query(
                `
                    INSERT INTO organizations (id, name, created_at)
                    VALUES ($1, $2, $3) ON CONFLICT (id)
            DO
                    UPDATE SET
                        name = EXCLUDED.name,
                        created_at = EXCLUDED.created_at
                `,
                [
                    organization.id,
                    organization.getName().getValue(),
                    organization.getCreatedAt(),
                ]
            );
        } catch (err: any) {
            if (err.code === '23505') {
                throw new OrganizationAlreadyExistsError();
            }
            throw new OrganizationPersistenceError();
        }
    }

    delete = async (organizationId: string): Promise<Organization | null> => {
        try {
            const result = await this.pool.query("DELETE FROM organizations WHERE id = $1 RETURNING *", [organizationId]);

            if (result.rowCount === 0) {
                return null;
            }

            const res = result.rows[0];

            return new Organization(
                res.id,
                Name.validate(res.name),
                res.created_at
            );
        } catch (err: any) {
            if (err.code === '23503') {
                throw new ForeignKeyViolationError();
            }
            throw new OrganizationPersistenceError();
        }
    }
}