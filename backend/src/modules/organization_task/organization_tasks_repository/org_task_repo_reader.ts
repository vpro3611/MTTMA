import {Pool, PoolClient} from "pg";
import {TaskFilters} from "../DTO/task_filters.js";
import {TaskPersistenceError} from "../errors/repository_errors.js";
import {Task} from "../domain/task_domain.js";


export class OrgTaskRepoReader {
    constructor(private readonly pool: Pool | PoolClient) {}



    async getOrgTasks(
        organizationId: string,
        filters: TaskFilters = {}
    ) {
        try {
            const conditions: string[] = ["organization_id = $1"];
            const values: any[] = [organizationId];
            let idx = 2;

            if (filters.title) {
                conditions.push(`title ILIKE $${idx++}`);
                values.push(`%${filters.title}%`);
            }

            if (filters.description) {
                conditions.push(`description ILIKE $${idx++}`);
                values.push(`%${filters.description}%`);
            }

            if (filters.status) {
                conditions.push(`status = $${idx++}`);
                values.push(filters.status);
            }

            if (filters.assigneeId) {
                conditions.push(`assigned_to = $${idx++}`);
                values.push(filters.assigneeId);
            }

            if (filters.creatorId) {
                conditions.push(`created_by = $${idx++}`);
                values.push(filters.creatorId);
            }

            if (filters.createdFrom) {
                conditions.push(`created_at >= $${idx++}`);
                values.push(filters.createdFrom);
            }

            if (filters.createdTo) {
                const to = new Date(filters.createdTo);
                to.setDate(to.getDate() + 1);

                conditions.push(`created_at < $${idx++}`);
                values.push(to);
            }

            const limit = filters.limit ?? 20;
            const offset = filters.offset ?? 0;

            const query = `
                SELECT *
                FROM tasks
                WHERE ${conditions.join(" AND ")}
                ORDER BY created_at DESC
                    LIMIT $${idx++}
                OFFSET $${idx}
            `;

            values.push(limit, offset);

            const result = await this.pool.query(query, values);

            return result.rows.map(row =>
                Task.restore({
                    id: row.id,
                    organizationId: row.organization_id,
                    title: row.title,
                    description: row.description,
                    status: row.status,
                    assignedTo: row.assigned_to,
                    createdBy: row.created_by,
                    createdAt: row.created_at
                })
            );
        } catch {
            throw new TaskPersistenceError();
        }
    }
}