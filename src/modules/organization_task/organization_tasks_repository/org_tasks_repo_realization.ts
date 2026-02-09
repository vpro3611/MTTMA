import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {Pool} from "pg";
import {Task} from "../domain/task_domain.js";
import {TaskTitle} from "../domain/task_title.js";
import {TaskDescription} from "../domain/task_description.js";
import {
    OrganizationDoesNotExistError,
    TaskPersistenceError,
    UserDoesNotExistError
} from "../errors/repository_errors.js";


export class OrganizationTasksRepositoryPG implements OrganizationTaskRepository {
    constructor(private readonly pool: Pool) {}

    save = async (orgTask: Task) => {
        try {
            await this.pool.query(
                `
                    INSERT INTO tasks (id,
                                       organization_id,
                                       title,
                                       description,
                                       status,
                                       assigned_to,
                                       created_by,
                                       created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id)
            DO
                    UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        status = EXCLUDED.status,
                        assigned_to = EXCLUDED.assigned_to
                `,
                [
                    orgTask.id,
                    orgTask.organizationId,
                    orgTask.getTitle().getValue(),
                    orgTask.getDescription().getValue(),
                    orgTask.getStatus(),
                    orgTask.getAssignedTo(),
                    orgTask.getCreatedBy(),
                    orgTask.getCreatedAt(),
                ]
            )
        } catch (err: any) {
            if (err.code === '23503') {
                if (err.constraint?.includes('organization')) {
                    throw new OrganizationDoesNotExistError();
                }
                if (err.constraint?.includes('created_by')) {
                    throw new UserDoesNotExistError();
                }
                if (err.constraint?.includes('assigned_to')) {
                    throw new UserDoesNotExistError();
                }
            }
            throw new TaskPersistenceError();
        }
    }

    delete = async (orgTaskId: string, organizationId: string): Promise<Task | null> => {
        try {
            const res = await this.pool.query(`DELETE
                                               FROM tasks
                                               WHERE id = $1
                                                 AND organization_id = $2 RETURNING *`, [orgTaskId, organizationId]);
            const row = res.rows[0];

            if (!row) return null;

            return new Task(
                row.id,
                row.organization_id,
                TaskTitle.create(row.title),
                TaskDescription.create(row.description),
                row.status,
                row.assigned_to,
                row.created_by,
                row.created_at,
            )
        } catch (err) {
            throw new TaskPersistenceError();
        }
    }

    findById = async (orgTaskId: string, organizationId: string) => {
        try {
            const res = await this.pool.query(`SELECT *
                                               FROM tasks
                                               WHERE id = $1
                                                 AND organization_id = $2`, [orgTaskId, organizationId]);
            const row = res.rows[0];
            if (!row) return null;
            return new Task(
                row.id,
                row.organization_id,
                TaskTitle.create(row.title),
                TaskDescription.create(row.description),
                row.status,
                row.assigned_to,
                row.created_by,
                row.created_at,
            )
        } catch (err) {
            throw new TaskPersistenceError();
        }
    }
}