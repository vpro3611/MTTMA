import {Pool, PoolClient} from "pg";
import {SelectOrganizationUponMembershit} from "../domain/ports/organization_repo_interface.js";
import {Organization} from "../domain/organiztion_domain.js";
import {Name} from "../domain/name.js";


export class MyOrganizationsRepository implements SelectOrganizationUponMembershit {
    constructor(private readonly pool: Pool | PoolClient) {}

    private mapIt(row: any): Organization {
        return new Organization(
            row.id,
            Name.validate(row.name),
            row.created_at
        );
    }

    async myOrganizations(actorId: string): Promise<Organization[]> {
        const queryReq = `SELECT o.id, o.name, o.created_at
                        FROM organizations o
                        JOIN organization_members m
                          ON m.organization_id = o.id
                        WHERE m.user_id = $1
                        ORDER BY o.created_at DESC; 
                        `

        const result = await this.pool.query(queryReq, [actorId]);

        return result.rows.map((row) => this.mapIt(row));
    }

}