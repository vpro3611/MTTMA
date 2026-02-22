import {Pool, PoolClient} from "pg";
import {UserRepositoryReadOnly} from "../domain/ports/user_repo_interface.js";
import {User} from "../domain/user_domain.js";


export class UserRepositoryReaderPg implements UserRepositoryReadOnly{
    constructor(private readonly pool: Pool | PoolClient) {}

    private mapIt(row: any) : User {
        return new User(
            row.id,
            row.email,
            row.password,
            row.status,
            row.created_at,
        );
    }

    async getAll(page: number, limit: number): Promise<User[]> {
        const offest = (page - 1) * limit;

        const query = `SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`;

        const result = await this.pool.query(query, [limit, offest]);

        return result.rows.map(row => this.mapIt(row));
    }

}