import {User} from "../domain/user_domain.js";
import {UserRepository} from "../domain/ports/user_repo_interface.js";
import {Email} from "../domain/email.js";
import {Pool} from "pg";
import {Password} from "../domain/password.js";

export class UserRepositoryPG implements UserRepository {
    constructor(private readonly pool: Pool){}


    findById = async (id: string): Promise<User | null> => {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const row = result.rows[0];
        if (!row) {
            return null;
        }
        return new User(
            row.id,
            Email.create(row.email),
            Password.fromHash(row.password_hash),
            row.status,
            row.created_at
        );
    }

    findByEmail = async (email: Email): Promise<User | null> => {
        const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email.getValue()]);
        const row = result.rows[0];
        if (!row) {
            return null;
        }
        return new User(
            row.id,
            Email.create(row.email),
            Password.fromHash(row.password_hash),
            row.status,
            row.created_at
        )
    }

    save = async (user: User): Promise<void> => {
        await this.pool.query(
            `
            INSERT INTO users (id, email, password_hash, status, created_at) 
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id)
            DO UPDATE SET 
            email = EXCLUDED.email, 
            password_hash = EXCLUDED.password_hash, 
            status = EXCLUDED.status
            `,
            [
                user.id,
                user.getEmail().getValue(),
                user.getPasswordHash(),
                user.getStatus(),
                user.getCreatedAt()
            ]
        );
    }
}