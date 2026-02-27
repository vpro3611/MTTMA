import {Task} from "../task_domain.js";
import {TaskFilters} from "../../DTO/task_filters.js";


export interface OrganizationTaskRepository {
    save(orgTask: Task): Promise<void>;
    delete(orgTaskId: string, organizationId: string): Promise<Task | null>;
    findById(orgTaskId: string, organizationId: string): Promise<Task | null>;
}

export interface OrganizationTaskReader {
    getOrgTasks(organizationId: string, taskFilters?: TaskFilters): Promise<Task[]>;
}