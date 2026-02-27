import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint(
        "organization_invitations",
        "organization_invitations_organization_id_fkey"
    );

    // создаем новый с CASCADE
    pgm.addConstraint(
        "organization_invitations",
        "organization_invitations_organization_id_fkey",
        {
            foreignKeys: {
                columns: "organization_id",
                references: "organizations(id)",
                onDelete: "CASCADE",
            },
        })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint(
        "organization_invitations",
        "organization_invitations_organization_id_fkey"
    );

    pgm.addConstraint(
        "organization_invitations",
        "organization_invitations_organization_id_fkey",
        {
            foreignKeys: {
                columns: "organization_id",
                references: "organizations(id)",
                onDelete: "NO ACTION",
            },
        })
}
