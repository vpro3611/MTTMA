import {Pool, PoolClient} from "pg";
import {InvitationView} from "../DTO/invitation_view.js";
import {DatabaseError} from "../errors/repo_errors.js";


export class InvitationReadRepositoryPG {
    constructor(private readonly pool : Pool | PoolClient) {}

    async getUserInvitations(userId: string): Promise<InvitationView[]> {
        try {
            const query = `
                SELECT 
                    i.id,
                    i.organization_id AS "organizationId",
                    o.name AS "organizationName",
                    i.invited_by_user_id AS "invitedByUserId",
                    i.role,
                    i.status,
                    i.created_at AS "createdAt",
                    i.expires_at AS "expiredAt",
                    COALESCE(mc.members_count, 0) AS "membersCount"
                FROM organization_invitations i
                JOIN organizations o 
                    ON o.id = i.organization_id
                LEFT JOIN (
                    SELECT 
                        organization_id, 
                        COUNT(*) AS members_count
                    FROM organization_members
                    GROUP BY organization_id
                ) mc 
                    ON mc.organization_id = i.organization_id
                WHERE i.invited_user_id = $1
                ORDER BY i.created_at DESC
            `;

            const result = await this.pool.query(query, [userId]);

            return result.rows.map((row: {
                id: string;
                organizationId: string;
                organizationName: string;
                invitedByUserId: string;
                role: string;
                status: string;
                createdAt: Date | null;
                expiredAt: Date | null;
                membersCount: string | number;
            }) => ({
                id: row.id,
                organizationId: row.organizationId,
                organizationName: row.organizationName,
                invitedByUserId: row.invitedByUserId,
                role: row.role,
                status: row.status,
                membersCount: Number(row.membersCount),
                createdAt: row.createdAt ? (row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt)) : "",
                expiredAt: row.expiredAt ? (row.expiredAt instanceof Date ? row.expiredAt.toISOString() : String(row.expiredAt)) : "",
            }));

        } catch (error: unknown) {
            throw new DatabaseError();
        }
    }
}