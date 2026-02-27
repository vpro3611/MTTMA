import {OrganizationMembersRepositoryReadOnly} from "../domain/ports/organization_memebers_repo_interface.js";
import {Pool, PoolClient} from "pg";
import {AllOrgsWithRoles} from "../DTO/all_orgs_with_roles.js";


export class GetAllOrgsWithRolesPG implements OrganizationMembersRepositoryReadOnly {
    constructor(private readonly pool : Pool | PoolClient) {}

    async findAllMembersWithRoleByUserId(userId: string): Promise<AllOrgsWithRoles[]> {
        const query = `SELECT o.id as org_id, o.name, m.role FROM organization_members m JOIN organizations o ON o.id = m.organization_id WHERE m.user_id = $1`;

        const result = await this.pool.query(query, [userId]);

        return result.rows.map(row => (
            {
                orgId: row.org_id,
                name: row.name,
                role: row.role
            }
        ))
    }
}