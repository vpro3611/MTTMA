import {OrganizationTaskRepository} from "../domain/ports/org_tasks_repo_interface.js";
import {CreateOrgTaskDataInputDTO} from "../DTO/create_org_task_dto.js";
import {TaskTitle} from "../domain/task_title.js";
import {TaskDescription} from "../domain/task_description.js";
import {Task} from "../domain/task_domain.js";
import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {OrganizationRepository} from "../../organization/domain/ports/organization_repo_interface.js";
import {OrganizationNotFoundError} from "../../organization/errors/organization_repository_errors.js";
import {
    ActorNotAMemberError, OrganizationMemberInsufficientPermissionsError,
    TargetNotAMemberError
} from "../../organization_members/errors/organization_members_domain_error.js";


export class CreateOrganizationTaskUseCase {
    constructor(private readonly orgTaskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,
                private readonly orgRepo: OrganizationRepository,
    ) {}

    private parseAssignee(assignedTo: string | undefined, createdBy: string): string  {
        return assignedTo ?? createdBy;
    }

    execute = async (createOrgTaskDto: CreateOrgTaskDataInputDTO) => {

        const toWhoWeAssign = this.parseAssignee(createOrgTaskDto.assignedTo, createOrgTaskDto.createdBy);

        const existingOrg = await this.orgRepo.findById(createOrgTaskDto.organizationId);
        if (!existingOrg) throw new OrganizationNotFoundError();

        const creator = await this.orgMemberRepo.findById(createOrgTaskDto.createdBy, createOrgTaskDto.organizationId);
        if (!creator) throw new ActorNotAMemberError();

        const assignee = await this.orgMemberRepo.findById(toWhoWeAssign, createOrgTaskDto.organizationId);
        if (!assignee) throw new TargetNotAMemberError();

        if (creator.getRole() === "MEMBER" && toWhoWeAssign !== createOrgTaskDto.createdBy) {
            throw new OrganizationMemberInsufficientPermissionsError();
        }

        if (assignee.getRole() === "ADMIN" && creator.getRole() !== "OWNER") {
            throw new OrganizationMemberInsufficientPermissionsError();
        }

        const validTaskTitle = TaskTitle.create(createOrgTaskDto.title);
        const validTaskDescription = TaskDescription.create(createOrgTaskDto.description);

        const taskCreated = Task.create(
            createOrgTaskDto.organizationId,
            validTaskTitle,
            validTaskDescription,
            toWhoWeAssign,
            createOrgTaskDto.createdBy
        );

        await this.orgTaskRepo.save(taskCreated);

        return taskCreated;
    }
}