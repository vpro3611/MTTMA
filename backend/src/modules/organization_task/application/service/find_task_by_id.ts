import {FindTaskByIdUseCase} from "../find_task_by_id_use_case.js";


export class FindTaskByIdService {
    constructor(private readonly findTaskByIdUseCase: FindTaskByIdUseCase) {}


    async executeTx(orgTaskId: string, organizationId: string, actorId: string) {
        const task = await this.findTaskByIdUseCase.execute(orgTaskId, organizationId, actorId);
        return task;
    }
}