import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint('audit_events', 'audit_events_organization_id_fkey');

    pgm.addConstraint("audit_events", "audit_events_organization_id_fkey", {
        foreignKeys: {
            columns: "organization_id",
            references: "organizations(id)",
            onDelete: "CASCADE",
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint('audit_events', 'audit_events_organization_id_fkey');

    pgm.addConstraint("audit_events", "audit_events_organization_id_fkey", {
        foreignKeys: {
            columns: "organization_id",
            references: "organizations(id)",
        },
    });
}
