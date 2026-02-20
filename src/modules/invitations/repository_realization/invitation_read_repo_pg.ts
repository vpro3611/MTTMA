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
                    i.role,
                    i.status,
                    o.name AS "organizationName",
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

            return result.rows.map(row => ({
                id: row.id,
                role: row.role,
                status: row.status,
                organizationName: row.organizationName,
                membersCount: Number(row.membersCount),
            }));

        } catch (error: any) {
            throw new DatabaseError();
        }
    }
}