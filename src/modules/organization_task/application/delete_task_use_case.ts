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
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";
import {Task} from "../domain/task_domain.js";
import {TaskPermissionPolicy} from "../domain/policies/task_permission_policy.js";
import {TaskDto} from "../DTO/return_dto/task_dto.js";


export class DeleteTaskUseCase {
    constructor(private readonly orgTaskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ){}

    private async orgMemberExists(actorId: string, orgId: string): Promise<OrganizationMember> {
        const existing = await this.orgMemberRepo.findById(actorId, orgId);
        if (!existing) {
            throw new ActorNotAMemberError();
        }
        return existing;
    }

    private async taskExists(taskId: string, orgId: string): Promise<Task> {
        const task = await this.orgTaskRepo.findById(taskId, orgId);
        if (!task) {
            throw new TaskNotFoundError();
        }
        return task;
    }

    private async assigneeExists(assigneeId: string, orgId: string): Promise<OrganizationMember> {
        const assignee = await this.orgMemberRepo.findById(assigneeId, orgId);
        if (!assignee) {
            throw new TargetNotAMemberError();
        }
        return assignee;
    }

    private async taskDeleted(orgTaskId: string, orgId: string): Promise<Task> {
        const deletedTask = await this.orgTaskRepo.delete(orgTaskId, orgId);
        if (!deletedTask) {
            throw new TaskNotFoundError();
        }
        return deletedTask;
    }

    execute = async (deleteDto: DeleteTaskDTO) => {

        const actor = await this.orgMemberExists(deleteDto.actorId, deleteDto.orgId);

        const task = await this.taskExists(deleteDto.orgTaskId, deleteDto.orgId);

        const assignee = await this.assigneeExists(task.getAssignedTo(), deleteDto.orgId);

        TaskPermissionPolicy.canChangeTaskElements(
            actor.getRole(),
            deleteDto.actorId,
            task.getCreatedBy(),
            assignee.getRole()
        );

        const taskForDelete = await this.taskDeleted(deleteDto.orgTaskId, deleteDto.orgId);

        const dtoReturn: TaskDto = {
            id: task.id,
            organizationId: task.organizationId,
            title: task.getTitle().getValue(),
            description: task.getDescription().getValue(),
            status: task.getStatus(),
            assignedTo: task.getAssignedTo(),
            createdBy: task.getCreatedBy(),
            createdAt: task.getCreatedAt(),
        };

        return dtoReturn;
    }
}