import {DeleteTaskDTO} from "../DTO/delete_task_dto.js";
import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError, TargetNotAMemberError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {TaskNotFoundError} from "../errors/application_errors.js";


export class DeleteTaskUseCase {
    constructor(private readonly orgTaskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ){}
    execute = async (deleteDto: DeleteTaskDTO) => {

        const actor = await this.orgMemberRepo.findById(deleteDto.actorId, deleteDto.orgId);
        if (!actor) {
            throw new ActorNotAMemberError();
        }

        const task = await this.orgTaskRepo.findById(deleteDto.orgTaskId, deleteDto.orgId);
        if (!task) {
            throw new TaskNotFoundError();
        }

        const assignee = await this.orgMemberRepo.findById(task.getAssignedTo(), deleteDto.orgId);
        if (!assignee) {
            throw new TargetNotAMemberError();
        }

        if (actor.getRole() === "MEMBER" && deleteDto.actorId !== task.getCreatedBy()) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }

        if (actor.getRole() === "ADMIN" && assignee.getRole() === "ADMIN") {
            throw new OrganizationMemberInsufficientPermissionsError();
        }

        const deletedTask = await this.orgTaskRepo.delete(deleteDto.orgTaskId, deleteDto.orgId);
        if (!deletedTask) {
            throw new TaskNotFoundError();
        }

        return deletedTask;
    }
}