import {User} from "../domain/user_domain.js";
import {UserRepository} from "../domain/ports/user_repo_interface.js";
import {Email} from "../domain/email.js";
import {Pool, PoolClient} from "pg";
import {Password} from "../domain/password.js";
import {
    UserAlreadyExistsError,
    UserPersistenceError,
} from "../errors/user_repository_errors.js";

export class UserRepositoryPG implements UserRepository {
    constructor(private readonly pool: Pool | PoolClient){}


    findById = async (id: string): Promise<User | null> => {
        try {
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
        } catch (e) {
            throw new UserPersistenceError();
        }
    }

    findByEmail = async (email: Email): Promise<User | null> => {
        try {
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
        } catch (e) {
            throw new UserPersistenceError();
        }
    }

    save = async (user: User): Promise<void> => {
        try {
            await this.pool.query(
                `
                    INSERT INTO users (id, email, password_hash, status, created_at)
                    VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id)
            DO
                    UPDATE SET
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
        } catch (e: any) {
            if (e.code === '23505') {
                throw new UserAlreadyExistsError();
            }
            throw new UserPersistenceError()
        }
    }
}