import {Pool, PoolClient} from "pg";
import {DatabaseError, ForeignKeyError, UniqueConstraintError} from "../errors/repo_errors.js";
import {Invitation} from "../domain/invitation_domain.js";
import {InvitationByIdRepository} from "../domain/ports/invitation_repo_interface.js";


export class InvitationByIdAndOrgRepoPg implements InvitationByIdRepository{
    constructor(private readonly pool: Pool | PoolClient) {}

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

    async getByIdAndOrgId(invId: string, orgId: string) {
        try {
            const result = await this.pool.query("SELECT * FROM organization_invitations WHERE id = $1 AND organization_id = $2", [invId, orgId]);
            const row = result.rows[0];

            if (!row) {
                return null;
            }

            return this.mapToDomain(row);
        } catch (error: any) {
            //console.log(error);
            this.mapAndThrow(error);
        }
    }
}