import { Pool } from "pg";
import crypto from "crypto";
import { OrgTaskRepoReader } from "../../../backend/src/modules/organization_task/organization_tasks_repository/org_task_repo_reader.js";
import { TaskStatus } from "../../../backend/src/modules/organization_task/domain/task_status.js";

describe("OrgTaskRepoReader (integration)", () => {

    let repo: OrgTaskRepoReader;
    let poolT: Pool;

    let organizationId: string;
    let otherOrganizationId: string;

    let user1: string;
    let user2: string;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must run in test environment");
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });

        repo = new OrgTaskRepoReader(poolT);
    });

    beforeEach(async () => {
        await poolT.query("BEGIN");

        organizationId = crypto.randomUUID();
        otherOrganizationId = crypto.randomUUID();

        user1 = crypto.randomUUID();
        user2 = crypto.randomUUID();

        // users
        await poolT.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES
                 ($1, 'u1@test.com', 'hash', 'active', NOW()),
                 ($2, 'u2@test.com', 'hash', 'active', NOW())`,
            [user1, user2]
        );

        // organizations (без created_by)
        await poolT.query(
            `INSERT INTO organizations (id, name, created_at)
             VALUES
                 ($1, $2, NOW()),
                 ($3, $4, NOW())`,
            [
                organizationId,
                "Test Org",
                otherOrganizationId,
                "Other Org"
            ]
        );
    });

    afterEach(async () => {
        await poolT.query("ROLLBACK");
    });

    afterAll(async () => {
        await poolT.end();
    });

    async function insertTask(data: {
        id?: string;
        orgId?: string;
        title: string;
        description: string;
        status: TaskStatus;
        assignedTo?: string;
        createdBy: string;
        createdAt: Date;
    }) {
        const id = data.id ?? crypto.randomUUID();

        await poolT.query(
            `INSERT INTO tasks
             (id, organization_id, title, description, status, assigned_to, created_by, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
                id,
                data.orgId ?? organizationId,
                data.title,
                data.description,
                data.status,
                data.assignedTo ?? null,
                data.createdBy,
                data.createdAt
            ]
        );

        return id;
    }

    it("should return only tasks from given organization", async () => {

        await insertTask({
            title: "Task 1",
            description: "Desc",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: new Date(),
        });

        await insertTask({
            orgId: otherOrganizationId,
            title: "Other Org Task",
            description: "Desc",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: new Date(),
        });

        const result = await repo.getOrgTasks(organizationId);

        expect(result).toHaveLength(1);
        expect(result[0].organizationId).toBe(organizationId);
    });

    it("should filter by title (ILIKE)", async () => {

        await insertTask({
            title: "Fix Login Bug",
            description: "Auth issue",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: new Date(),
        });

        await insertTask({
            title: "Create Dashboard",
            description: "UI",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: new Date(),
        });

        const result = await repo.getOrgTasks(organizationId, {
            title: "login"
        });

        expect(result).toHaveLength(1);
        expect(result[0].getTitle().getValue()).toContain("Login");
    });

    it("should filter by status strictly", async () => {

        await insertTask({
            title: "T1",
            description: "D",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: new Date(),
        });

        await insertTask({
            title: "T2",
            description: "D",
            status: TaskStatus.COMPLETED,
            createdBy: user1,
            createdAt: new Date(),
        });

        const result = await repo.getOrgTasks(organizationId, {
            status: TaskStatus.COMPLETED
        });

        expect(result).toHaveLength(1);
        expect(result[0].getStatus()).toBe(TaskStatus.COMPLETED);
    });

    it("should filter by date range correctly", async () => {

        const older = new Date("2023-01-01");
        const newer = new Date("2024-01-01");

        await insertTask({
            title: "Old",
            description: "D",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: older,
        });

        await insertTask({
            title: "New",
            description: "D",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: newer,
        });

        const result = await repo.getOrgTasks(organizationId, {
            createdFrom: new Date("2023-06-01"),
            createdTo: new Date("2024-12-31"),
        });

        expect(result).toHaveLength(1);
        expect(result[0].getTitle().getValue()).toBe("New");
    });

    it("should respect limit and offset with DESC ordering", async () => {

        const now = Date.now();

        await insertTask({
            title: "T1",
            description: "D",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: new Date(now - 3000),
        });

        await insertTask({
            title: "T2",
            description: "D",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: new Date(now - 2000),
        });

        await insertTask({
            title: "T3",
            description: "D",
            status: TaskStatus.TODO,
            createdBy: user1,
            createdAt: new Date(now - 1000),
        });

        const result = await repo.getOrgTasks(organizationId, {
            limit: 1,
            offset: 1,
        });

        expect(result).toHaveLength(1);
        expect(result[0].getTitle().getValue()).toBe("T2");
    });

    it("should combine multiple filters strictly", async () => {

        await insertTask({
            title: "Login Refactor",
            description: "Backend",
            status: TaskStatus.TODO,
            assignedTo: user1,
            createdBy: user1,
            createdAt: new Date(),
        });

        await insertTask({
            title: "Login Refactor",
            description: "Frontend",
            status: TaskStatus.COMPLETED,
            assignedTo: user2,
            createdBy: user1,
            createdAt: new Date(),
        });

        const result = await repo.getOrgTasks(organizationId, {
            title: "login",
            status: TaskStatus.TODO,
            assigneeId: user1
        });

        expect(result).toHaveLength(1);
        expect(result[0].getStatus()).toBe(TaskStatus.TODO);
        expect(result[0].getAssignedTo()).toBe(user1);
    });

});