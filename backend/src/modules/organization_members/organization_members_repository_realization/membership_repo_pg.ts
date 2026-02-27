import {CheckForMembership} from "../domain/ports/organization_memebers_repo_interface.js";
import {Pool, PoolClient} from "pg";


export class MembershipRepoPg implements CheckForMembership{
    constructor(private readonly pool: Pool | PoolClient) {}

    async findRelations(userId: string): Promise<boolean> {
        const {rows} = await this.pool.query(
            `SELECT EXISTS (SELECT 1 FROM organization_members WHERE user_id = $1) AS "exists"`, [userId]
        )
        return rows[0].exists;
    }
}