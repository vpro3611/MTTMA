/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    // EXTENSION
    pgm.createExtension("pgcrypto", { ifNotExists: true });

    // ENUMS
    pgm.createType("user_status", ["active", "banned", "suspended"]);
    pgm.createType("organization_role", ["OWNER", "ADMIN", "MEMBER"]);
    pgm.createType("task_status", ["TODO", "COMPLETED", "CANCELED", "IN_PROGRESS"]);

    // USERS
    pgm.createTable("users", {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        email: {
            type: "text",
            notNull: true,
            unique: true,
        },
        password_hash: {
            type: "text",
            notNull: true,
        },
        status: {
            type: "user_status",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
        },
    });

    // ORGANIZATIONS
    pgm.createTable("organizations", {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        name: {
            type: "text",
            notNull: true,
            unique: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
        },
    });

    // ORGANIZATION MEMBERS
    pgm.createTable("organization_members", {
        organization_id: {
            type: "uuid",
            notNull: true,
            references: "organizations",
            onDelete: "CASCADE",
        },
        user_id: {
            type: "uuid",
            notNull: true,
            references: "users",
            onDelete: "CASCADE",
        },
        role: {
            type: "organization_role",
            notNull: true,
        },
        joined_at: {
            type: "timestamp",
            notNull: true,
        },
    });

    pgm.addConstraint(
        "organization_members",
        "organization_members_pk",
        "PRIMARY KEY (organization_id, user_id)"
    );

    // TASKS

    pgm.createTable("tasks", {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        organization_id: {
            type: "uuid",
            notNull: true,
            references: "organizations",
            onDelete: "CASCADE",
        },
        title: {
            type: "text",
            notNull: true,
        },
        description: {
            type: "text",
        },
        status: {
            type: "task_status",
            notNull: true,
        },
        assigned_to: {
            type: "uuid",
            references: "users",
        },
        created_by: {
            type: "uuid",
            notNull: true,
            references: "users",
        },
        created_at: {
            type: "timestamp",
            notNull: true,
        },
    });


    // AUDIT
    pgm.createTable("audit_events", {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        actor_user_id: {
            type: "uuid",
            references: "users",
        },
        organization_id: {
            type: "uuid",
            references: "organizations",
        },
        action: {
            type: "text",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("audit_events");
    pgm.dropTable("tasks");
    pgm.dropTable("organization_members");
    pgm.dropTable("organizations");
    pgm.dropTable("users");

    pgm.dropType("task_status");
    pgm.dropType("organization_role");
    pgm.dropType("user_status");
};
