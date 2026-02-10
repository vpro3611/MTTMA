import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {ChangeStatusDTO} from "../DTO/change_status_dto.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError, TargetNotAMemberError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {Task, TaskStatus} from "../domain/task_domain.js";
import {InvalidTaskStatusError, TaskNotFoundError} from "../errors/application_errors.js";
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";
import {TaskPermissionPolicy} from "../domain/policies/task_permission_policy.js";


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

        const assignee = await this.assigneeExists(task.getAssignedTo(), statusDto.orgId);

        TaskPermissionPolicy.canChangeTaskElements(
            orgMember.getRole(),
            statusDto.actorId,
            task.getCreatedBy(),
            assignee.getRole()
        );

        const parsedStatus = this.parseStatus(statusDto.newStatus);

        task.changeStatus(parsedStatus);

        await this.orgTaskRepo.save(task);

        return task;
    };
}