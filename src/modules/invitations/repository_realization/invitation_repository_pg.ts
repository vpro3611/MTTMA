import {Invitation} from "../domain/invitation_domain.js";
import {InvitationRepoInterface} from "../domain/ports/invitation_repo_interface.js";
import {Pool, PoolClient} from "pg";
import {Filters} from "../DTO/filters.js";
import {DatabaseError, ForeignKeyError, UniqueConstraintError} from "../errors/errors.js";


export class InvitationRepositoryPG implements InvitationRepoInterface {
    constructor(private readonly pool: Pool | PoolClient) {}


    private mapToDomain(row: any): Invitation {
        return new Invitation(
            row.id,
            row.organization_id,
            row.invited_user_id,
            row.invited_by_user_id,
            row.role,
            row.status,
            row.created_at,
            row.expires_at,
        )
    }

    private mapAndThrow(error: any): never {
        switch (error.code) {
            case "23505":
                throw new UniqueConstraintError();

            case "23503":
                throw new ForeignKeyError();

            default:
                throw new DatabaseError();
        }
    }

    async getInvitationById(id: string): Promise<Invitation | null> {
        try {
            const queryResult = await this.pool.query("SELECT * FROM organization_invitations WHERE id = $1", [id]);
            const result = queryResult.rows[0];
            if (!result) {
                return null;
            }
            return this.mapToDomain(result);
        } catch (error: any) {
            this.mapAndThrow(error);
        }
    }


    async getInvitationsFiltered(filters: Filters): Promise<Invitation[]> {
        try {
            const conditions: string[] = [];
            const values: any[] = [];

            if (filters.invited_user_id) {
                values.push(filters.invited_user_id);
                conditions.push(`invited_user_id = $${values.length}`);
            }
            if (filters.organization_id) {
                values.push(filters.organization_id);
                conditions.push(`organization_id = $${values.length}`);
            }
            if (filters.status) {
                values.push(filters.status);
                conditions.push(`status = $${values.length}`);
            }
            if (filters.createdFrom) {
                values.push(filters.createdFrom);
                conditions.push(`created_at >= $${values.length}`);
            }
            if (filters.createdTo) {
                values.push(filters.createdTo);
                conditions.push(`created_at <= $${values.length}`);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

            const query = `
                SELECT *
                FROM organization_invitations
                ${whereClause}
                ORDER BY created_at DESC
            `;

            const result = await this.pool.query(query, values);

            return result.rows.map(this.mapToDomain);

        } catch (error: any) {
            this.mapAndThrow(error);
        }
    }

    async existsPending(userId: string, organizationId: string): Promise<boolean> {
        try {
            const conditions: string[] = [];
            const values: any[] = [];

            values.push(userId);
            conditions.push(`invited_user_id = $${values.length}`);

            values.push(organizationId);
            conditions.push(`organization_id = $${values.length}`);

            values.push("PENDING");
            conditions.push(`status = $${values.length}`);

            const query = `
                SELECT 1
                FROM organization_invitations
                WHERE ${conditions.join(" AND ")}
                LIMIT 1
            `;

            const result = await this.pool.query(query, values);

            return result.rowCount! > 0;
        } catch (error: any) {
            this.mapAndThrow(error);
        }
    }

    async save(invitation: Invitation): Promise<void> {
        try {
            const query = `
                INSERT INTO organization_invitations (
                    id,
                    organization_id,
                    invited_user_id,
                    invited_by_user_id,
                    role,
                    status,
                    created_at,
                    expires_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                ON CONFLICT (id)
                DO UPDATE SET
                    role = EXCLUDED.role,
                    status = EXCLUDED.status,
                    expires_at = EXCLUDED.expires_at
            `;

            const values = [
                invitation.id,
                invitation.getOrganizationId(),
                invitation.getInvitedUserId(),
                invitation.getInvitedByUserId(),
                invitation.getAssignedRole(),
                invitation.getStatus(),
                invitation.getCreatedAt(),
                invitation.getExpiredAt(),
            ];

            await this.pool.query(query, values);

        } catch (error: any) {
            this.mapAndThrow(error);
        }
    }
}