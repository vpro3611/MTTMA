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


export class ChangeOrgTaskTitleUseCase {
    constructor(private readonly orgTaskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ) {}

    execute = async (titleDto: ChangeTitleDTO) => {

        const orgMember = await this.orgMemberRepo.findById(titleDto.actorId, titleDto.orgId);
        if (!orgMember) {
            throw new ActorNotAMemberError()
        }

        const task = await this.orgTaskRepo.findById(titleDto.orgTaskId, titleDto.orgId);
        if (!task) {
            throw new TaskNotFoundError();
        }

        const assignee = await this.orgMemberRepo.findById(task.getAssignedTo(), titleDto.orgId);
        if (!assignee) {
            throw new TargetNotAMemberError();
        }

        if (orgMember.getRole() === "MEMBER" && titleDto.actorId !== task.getCreatedBy()) {
            throw new OrganizationMemberInsufficientPermissionsError()
        }

        if (orgMember.getRole() === "ADMIN" && assignee.getRole() === "ADMIN") {
            throw new OrganizationMemberInsufficientPermissionsError()
        }

        const newTitle = TaskTitle.create(titleDto.newTitle);

        task.rename(newTitle);

        await this.orgTaskRepo.save(task);

        return task;
    }
}