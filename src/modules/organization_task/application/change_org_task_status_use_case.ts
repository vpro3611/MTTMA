import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {ChangeStatusDTO} from "../DTO/change_status_dto.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError, TargetNotAMemberError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {TaskStatus} from "../domain/task_domain.js";
import {InvalidTaskStatusError, TaskNotFoundError} from "../errors/application_errors.js";


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



    execute = async (statusDto: ChangeStatusDTO) => {
        const orgMember = await this.orgMemberRepo.findById(statusDto.actorId, statusDto.orgId);
        if (!orgMember) {
            throw new ActorNotAMemberError()
        }

        const task = await this.orgTaskRepo.findById(statusDto.orgTaskId, statusDto.orgId);
        if (!task) {
            throw new TaskNotFoundError();
        }

        const assignee = await this.orgMemberRepo.findById(task.getAssignedTo(), statusDto.orgId);
        if (!assignee) {
            throw new TargetNotAMemberError();
        }

        if (orgMember.getRole() === "MEMBER" && statusDto.actorId !== task.getCreatedBy()) {
            throw new OrganizationMemberInsufficientPermissionsError()
        }

        if (orgMember.getRole() === "ADMIN" && assignee.getRole() === "ADMIN") {
            throw new OrganizationMemberInsufficientPermissionsError()
        }

        const parsedStatus = this.parseStatus(statusDto.newStatus);

        task.changeStatus(parsedStatus);

        await this.orgTaskRepo.save(task);

        return task;
    };
}