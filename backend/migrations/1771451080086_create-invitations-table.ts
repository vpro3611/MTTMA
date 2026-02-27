import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("organization_invitations", {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        organization_id: {
            type: "uuid",
            notNull: true,
            references: '"organizations"(id)',
        },
        invited_user_id: {
            type: "uuid",
            notNull: true,
            references: '"users"(id)',
        },
        invited_by_user_id: {
            type: "uuid",
            notNull: true,
            references: '"users"(id)',
            onDelete: "RESTRICT",
        },
        role: {
            type: "varchar(50)",
            notNull: true,
        },
        status: {
            type: "varchar(20)", // PENDING | ACCEPTED | REJECTED | EXPIRED | CANCELLED
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
        },
        expires_at: {
            type: "timestamp",
            notNull: true,
        },
    });

    pgm.createIndex(
        "organization_invitations",
        ["organization_id", "invited_user_id"],
        {
            unique: true,
            where: "status = 'PENDING'",
            name: "organization_invitations_unique_pending",
        }
    );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("organization_invitations");
}
