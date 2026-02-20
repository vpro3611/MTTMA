import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {ChangeTitleDTO} from "../DTO/change_title_dto.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError, TargetNotAMemberError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {TaskTitle} from "../domain/task_title.js";
import {TaskNotFoundError} from "../errors/application_errors.js";
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";
import {Task} from "../domain/task_domain.js";
import {TaskPermissionPolicy} from "../domain/policies/task_permission_policy.js";
import {TaskDto} from "../DTO/return_dto/task_dto.js";


export class ChangeOrgTaskTitleUseCase {
    constructor(private readonly orgTaskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ) {}

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

    execute = async (titleDto: ChangeTitleDTO) => {

        const orgMember = await this.orgMemberExists(titleDto.actorId, titleDto.orgId);

        const task = await this.taskExists(titleDto.orgTaskId, titleDto.orgId);

        const assignee = await this.assigneeExists(task.getAssignedTo(), titleDto.orgId);

        TaskPermissionPolicy.canChangeTaskElements(
            orgMember.getRole(),
            titleDto.actorId,
            task.getCreatedBy(),
            assignee.getRole()
        )

        const newTitle = TaskTitle.create(titleDto.newTitle);

        task.rename(newTitle);

        await this.orgTaskRepo.save(task);

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