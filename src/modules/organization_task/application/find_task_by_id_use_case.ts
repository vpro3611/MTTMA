import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {TaskNotFoundError} from "../errors/application_errors.js";
import {Task} from "../domain/task_domain.js";
import {TaskDto} from "../DTO/return_dto/task_dto.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {ActorNotAMemberError} from "../../organization_members/errors/organization_members_domain_error.js";


export class FindTaskByIdUseCase {
    constructor(private readonly taskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,) {}

    private async findTask(orgTaskId: string, organizationId: string) {
        const task = await this.taskRepo.findById(orgTaskId, organizationId);
        if (!task) throw new TaskNotFoundError();
        return task;
    }

    private mapToDTO(task: Task): TaskDto {
        return {
            id: task.id,
            organizationId: task.organizationId,
            title: task.getTitle().getValue(),
            description: task.getDescription().getValue(),
            status: task.getStatus(),
            assignedTo: task.getAssignedTo(),
            createdBy: task.getCreatedBy(),
            createdAt: task.getCreatedAt(),
        }
    }

    private async actorIsMember(actorId: string, orgId: string) {
        const member = await this.orgMemberRepo.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError();
        }
        return member;
    }

    async execute(orgTaskId: string, organizationId: string, actorId: string) {
        const member = await this.actorIsMember(actorId, organizationId);

        const task = await this.findTask(orgTaskId, organizationId);
        return this.mapToDTO(task);
    }
}