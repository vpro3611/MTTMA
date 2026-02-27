import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {ChangeStatusDTO} from "../DTO/change_status_dto.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError, TargetNotAMemberError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {Task} from "../domain/task_domain.js";
import {TaskStatus} from "../domain/task_status.js";
import {InvalidTaskStatusError, TaskNotFoundError} from "../errors/application_errors.js";
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";
import {TaskPermissionPolicy} from "../domain/policies/task_permission_policy.js";
import {TaskDto} from "../DTO/return_dto/task_dto.js";
import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";


export class ChangeOrgTaskStatusUseCase {
    constructor(private readonly orgTaskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ) {};

    private parseStatus(status: string): TaskStatus {
        if (
            status === "TODO" ||
            status === "IN_PROGRESS" ||
            status === "COMPLETED" ||
            status === "CANCELED"
        ) {
            return status;
        }

        throw new InvalidTaskStatusError(status);
    }

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

    execute = async (statusDto: ChangeStatusDTO) => {
        const orgMember = await this.orgMemberExists(statusDto.actorId, statusDto.orgId);

        const task = await this.taskExists(statusDto.orgTaskId, statusDto.orgId);

        const assignedTo = task.getAssignedTo();
        const assigneeRole = assignedTo
            ? (await this.assigneeExists(assignedTo, statusDto.orgId)).getRole()
            : OrgMemsRole.MEMBER;

        TaskPermissionPolicy.canChangeTaskElements(
            orgMember.getRole(),
            statusDto.actorId,
            task.getCreatedBy(),
            assigneeRole
        );

        const parsedStatus = this.parseStatus(statusDto.newStatus);

        task.changeStatus(parsedStatus);

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
    };
}