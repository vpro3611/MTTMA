import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {ChangeDescDTO} from "../DTO/change_desc_dto.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError, TargetNotAMemberError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {TaskDescription} from "../domain/task_description.js";
import {TaskNotFoundError} from "../errors/application_errors.js";


export class ChangeOrgTaskDescriptionUseCase {
    constructor(private readonly orgTaskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ) {}

    execute = async (descDTO: ChangeDescDTO) => {

        const orgMember = await this.orgMemberRepo.findById(descDTO.actorId, descDTO.orgId);
        if (!orgMember) {
            throw new ActorNotAMemberError();
        }

        const task = await this.orgTaskRepo.findById(descDTO.orgTaskId, descDTO.orgId);
        if (!task) {
            throw new TaskNotFoundError();
        }

        const assignee = await this.orgMemberRepo.findById(task.getAssignedTo(), descDTO.orgId);
        if (!assignee) {
            throw new TargetNotAMemberError();
        }

        if (orgMember.getRole() === "MEMBER" && descDTO.actorId !== task.getCreatedBy()) {
            throw new OrganizationMemberInsufficientPermissionsError()
        }

        if (orgMember.getRole() === "ADMIN" && assignee.getRole() === "ADMIN") {
            throw new OrganizationMemberInsufficientPermissionsError()
        }

        const newDesc = TaskDescription.create(descDTO.newDesc);
        task.changeDescription(newDesc);

        await this.orgTaskRepo.save(task);

        return task;
    }
}