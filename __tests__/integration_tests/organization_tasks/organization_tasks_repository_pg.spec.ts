import { Pool } from "pg";
import { OrganizationTasksRepositoryPG } from "../../../src/modules/organization_task/organization_tasks_repository/org_tasks_repo_realization.js";
import { TaskTitle } from "../../../src/modules/organization_task/domain/task_title.js";
import { TaskDescription } from "../../../src/modules/organization_task/domain/task_description.js";
import { Task } from "../../../src/modules/organization_task/domain/task_domain.js";

describe("OrganizationTasksRepositoryPG (integration)", () => {
    let repo: OrganizationTasksRepositoryPG;
    let poolT: Pool;

    let ORG_ID: string;
    let USER_ID: string;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Must be in test environment");
        }

        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });

        repo = new OrganizationTasksRepositoryPG(poolT);
    });

    beforeEach(async () => {
        await poolT.query("BEGIN");

        ORG_ID = crypto.randomUUID();
        USER_ID = crypto.randomUUID();

        await poolT.query(
            `INSERT INTO organizations (id, name, created_at)
             VALUES ($1, 'Test Org', now())`,
            [ORG_ID]
        );

        await poolT.query(
            `INSERT INTO users (id, email, password_hash, status, created_at)
             VALUES ($1, 'user@test.com', 'hash', 'active', now())`,
            [USER_ID]
        );
    });

    afterEach(async () => {
        await poolT.query("ROLLBACK");
    });

    afterAll(async () => {
        await poolT.end();
    });

    it("should save and retrieve task by id", async () => {
        const task = Task.create(
            ORG_ID,
            TaskTitle.create("Task 1"),
            TaskDescription.create("Description"),
            USER_ID,
            USER_ID
        );

        await repo.save(task);

        const result = await repo.findById(task.id, ORG_ID);

        expect(result).not.toBeNull();
        expect(result!.id).toBe(task.id);
        expect(result!.getTitle().getValue()).toBe("Task 1");
    });

    it("should update task on save (upsert)", async () => {
        const task = Task.create(
            ORG_ID,
            TaskTitle.create("Old title"),
            TaskDescription.create("Old desc"),
            USER_ID,
            USER_ID
        );

        await repo.save(task);

        task.rename(TaskTitle.create("New title"));
        await repo.save(task);

        const result = await repo.findById(task.id, ORG_ID);
        expect(result!.getTitle().getValue()).toBe("New title");
    });

    it("should return null if task not found", async () => {
        const result = await repo.findById(crypto.randomUUID(), ORG_ID);
        expect(result).toBeNull();
    });

    it("should delete task and return it", async () => {
        const task = Task.create(
            ORG_ID,
            TaskTitle.create("To delete"),
            TaskDescription.create("Desc"),
            USER_ID,
            USER_ID
        );

        await repo.save(task);

        const deleted = await repo.delete(task.id, ORG_ID);

        expect(deleted).not.toBeNull();
        expect(deleted!.id).toBe(task.id);

        const after = await repo.findById(task.id, ORG_ID);
        expect(after).toBeNull();
    });

    it("should return null when deleting non-existing task", async () => {
        const res = await repo.delete(crypto.randomUUID(), ORG_ID);
        expect(res).toBeNull();
    });

    it("should fail if organization does not exist", async () => {
        const task = Task.create(
            crypto.randomUUID(),
            TaskTitle.create("Invalid"),
            TaskDescription.create("Desc"),
            USER_ID,
            USER_ID
        );

        await expect(repo.save(task)).rejects.toThrow();
    });

    it("should fail if assigned user does not exist", async () => {
        const task = Task.create(
            ORG_ID,
            TaskTitle.create("Invalid"),
            TaskDescription.create("Desc"),
            crypto.randomUUID(),
            USER_ID
        );

        await expect(repo.save(task)).rejects.toThrow();
    });
});
