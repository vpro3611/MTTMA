import {OrganizationMembersRepository} from "../domain/ports/organization_memebers_repo_interface.js";
import {OrganizationMember} from "../domain/organization_member_domain.js";
import {
    OrganizationMemberAlreadyExistsError, OrganizationMemberNotFoundError, OrganizationMemberPersistenceError,
    OrganizationNotFoundError, UserNotFoundError
} from "../errors/organization_members_repo_errors.js";
import {Pool, PoolClient} from "pg";
import {Organization} from "../../organization/domain/organiztion_domain.js";


export class OrganizationMemberRepositoryPG implements OrganizationMembersRepository {
    constructor(private readonly pool: Pool | PoolClient) {}

    save = async (orgMember: OrganizationMember): Promise<void> => {
        try {
            await this.pool.query(
                `
            INSERT INTO organization_members (
                organization_id,
                user_id,
                role,
                joined_at
            )
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (organization_id, user_id)
            DO UPDATE SET
                role = EXCLUDED.role
            `,
                [
                    orgMember.organizationId,
                    orgMember.userId,
                    orgMember.getRole(),
                    orgMember.getJoinedAt(),
                ]
            );
        } catch (err: any) {
            if (err.code === '23505') {
                // composite PK (organization_id, user_id)
                throw new OrganizationMemberAlreadyExistsError();
            }

            if (err.code === '23503') {
                // foreign key violation
                if (err.constraint?.includes('organization')) {
                    throw new OrganizationMemberPersistenceError();
                }
                if (err.constraint?.includes('user')) {
                    throw new UserNotFoundError();
                }
            }

            throw new OrganizationMemberPersistenceError();
        }
    };

    delete = async (orgMemberId: string, organizationId: string): Promise<OrganizationMember> => {
        const result = await this.pool.query("DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2 RETURNING *", [organizationId, orgMemberId]);
        const res = result.rows[0];

        if (!res) {
            throw new OrganizationMemberNotFoundError();
        }

        return new OrganizationMember(
            res.organization_id,
            res.user_id,
            res.role,
            res.joined_at
        );

    }

    findById = async (orgMemberId: string, organizationId: string): Promise<OrganizationMember | null> => {
        try {
            const result = await this.pool.query("SELECT * FROM organization_members WHERE user_id = $1 AND organization_id = $2", [orgMemberId, organizationId]);
            const row = result.rows[0];

            if (!row) {
                return null;
            }

            return new OrganizationMember(
                row.organization_id,
                row.user_id,
                row.role,
                row.joined_at
            );
        } catch (err) {
            throw new OrganizationMemberPersistenceError();
        }
    }

    getAllMembers = async (organizationId: string): Promise<OrganizationMember[]> => {
        try {
            const result = await this.pool.query("SELECT * FROM organization_members WHERE organization_id = $1", [organizationId]);

            return result.rows.map(row =>
                new OrganizationMember(
                    row.organization_id,
                    row.user_id,
                    row.role,
                    row.joined_at,
                )
            );
        } catch (err) {
            throw new OrganizationNotFoundError();
        }
    }
}