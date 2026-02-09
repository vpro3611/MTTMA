import {Task} from "../task_domain.js";


export interface OrganizationTaskRepository {
    save(orgTask: Task): Promise<void>;
    delete(orgTaskId: string, organizationId: string): Promise<Task | null>;
    findById(orgTaskId: string, organizationId: string): Promise<Task | null>;
}