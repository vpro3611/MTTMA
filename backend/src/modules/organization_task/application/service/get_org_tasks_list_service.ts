import {GetOrgTasksListUseCase} from "../get_org_tasks_list_use_case.js";
import {TaskFilters} from "../../DTO/task_filters.js";


export class GetOrgTasksListService {
    constructor(private readonly listTasksUseCase: GetOrgTasksListUseCase) {}


    async executeTx(organizationId: string, actorId: string, filters?: TaskFilters) {
        const tasks = await this.listTasksUseCase.execute(actorId, organizationId, filters);
        return tasks;
    }
}