import {Pool, PoolClient} from "pg";
import {InvitationFullInfoRepository} from "../domain/ports/invitation_repo_interface.js";
import {InvitationView} from "../DTO/invitation_view.js";
import {DatabaseError} from "../errors/repo_errors.js";

export class UserInvitationRepoPg implements InvitationFullInfoRepository{
    constructor(private readonly pool : Pool | PoolClient) {}

    private mapToDTO(row: any): InvitationView {
        return {
            id: row.id,
            organizationId: row.organizationId,
            organizationName: row.organizationName,
            invitedByUserId: row.invitedByUserId,
            role: row.role,
            status: row.status,
            membersCount: Number(row.membersCount),
            createdAt: new Date(row.createdAt).toISOString(),
            expiredAt: new Date(row.expiredAt).toISOString(),
        };
    }


    async getFullInfoInvitation(invId:string, actorId: string): Promise<InvitationView | null> {
        try {
            const query = `
                SELECT i.id,
                       i.organization_id             AS "organizationId",
                       o.name                        AS "organizationName",
                       i.invited_by_user_id          AS "invitedByUserId",
                       i.role,
                       i.status,
                       i.created_at                  AS "createdAt",
                       i.expires_at                  AS "expiredAt",
                       COALESCE(mc.members_count, 0) AS "membersCount"
                FROM organization_invitations i
                         JOIN organizations o
                              ON o.id = i.organization_id
                         LEFT JOIN (SELECT organization_id,
                                           COUNT(*) AS members_count
                                    FROM organization_members
                                    GROUP BY organization_id) mc
                                   ON mc.organization_id = i.organization_id
                WHERE i.id = $1 AND i.invited_user_id = $2
                ORDER BY i.created_at DESC
            `;
            const result = await this.pool.query(query, [invId, actorId]);

            if (!result.rows.length) {
                return null;
            }

            const row = result.rows[0];

            return this.mapToDTO(row);
        } catch (error: unknown) {
            throw new DatabaseError();
        }
    }
}