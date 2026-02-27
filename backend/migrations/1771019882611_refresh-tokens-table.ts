import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.sql(`CREATE TABLE refresh_tokens (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    pgm.sql(`CREATE INDEX idx_refresh_user_id ON refresh_tokens (user_id)`);
    pgm.sql(`CREATE INDEX idx_refresh_token_hash ON refresh_tokens (token_hash)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('refresh_tokens');
}
