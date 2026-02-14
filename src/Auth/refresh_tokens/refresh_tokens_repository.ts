import {Pool, PoolClient} from "pg";
import {TokenDTO} from "../DTO/token.dto.js";

export interface RefreshToken {
    create(data: {id: string, userId: string, tokenHash: string, expiresAt: Date}): Promise<void>
    findValidByHash(tokenHash: string): Promise<TokenDTO | null>
    revoke(id: string): Promise<void>
    revokeByHash(tokenHash: string): Promise<void>
    findByHash(tokenHash: string): Promise<TokenDTO | null>
}

export class RefreshTokensRepository implements RefreshToken {
    constructor(private readonly pgClient: Pool | PoolClient) {}

    private mapRow = (row: any): TokenDTO => {
        return {
            id: row.id,
            userId: row.user_id,
            tokenHash: row.token_hash,
            expiresAt: row.expires_at,
            revokedAt: row.revoked_at,
            createdAt: row.created_at,
        };
    }

    create = async (
        data: {
            id: string,
            userId: string,
            tokenHash: string,
            expiresAt: Date,
        }
    ) => {
        await this.pgClient.query(
            `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)`,
            [data.id, data.userId, data.tokenHash, data.expiresAt]
        );
    }

    findValidByHash = async (tokenHash: string): Promise<TokenDTO | null> => {
        const result = await this.pgClient.query(
            `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1`,
            [tokenHash]
        );
        const row = result.rows[0];
        return row ? this.mapRow(row) : null;
    }

    revoke = async (id: string) => {
        await this.pgClient.query(
            `UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1`,
            [id]
        );
    }

    revokeByHash = async (tokenHash: string) => {
        await this.pgClient.query(
            `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
            [tokenHash]
        );
    }

    findByHash = async (tokenHash: string): Promise<TokenDTO | null> => {
        const result = await this.pgClient.query(
            `SELECT * FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]
        )
        const row = result.rows[0];
        return row ? this.mapRow(row) : null;
    }


}