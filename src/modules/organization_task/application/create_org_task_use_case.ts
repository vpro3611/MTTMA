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
import {OrganizationMember} from "../../organization_members/domain/organization_member_domain.js";
import {TaskPermissionPolicy} from "../domain/policies/task_permission_policy.js";
import {TaskDto} from "../DTO/return_dto/task_dto.js";


export class CreateOrganizationTaskUseCase {
    constructor(private readonly orgTaskRepo: OrganizationTaskRepository,
                private readonly orgMemberRepo: OrganizationMembersRepository,
                private readonly orgRepo: OrganizationRepository,
    ) {}

    private parseAssignee(assignedTo: string | undefined, createdBy: string): string  {
        return assignedTo ?? createdBy;
    }

    private async creatorExists(actorId: string, orgId: string): Promise<OrganizationMember> {
        const creator = await this.orgMemberRepo.findById(actorId, orgId);
        if (!creator) throw new ActorNotAMemberError();
        return creator;
    }

    private async assigneeExists(assigneeId: string, orgId: string): Promise<OrganizationMember> {
        const assignee = await this.orgMemberRepo.findById(assigneeId, orgId);
        if (!assignee) throw new TargetNotAMemberError();
        return assignee;
    }

    execute = async (createOrgTaskDto: CreateOrgTaskDataInputDTO) => {

        const toWhoWeAssign = this.parseAssignee(createOrgTaskDto.assignedTo, createOrgTaskDto.createdBy);

       // const existingOrg = await this.orgRepo.findById(createOrgTaskDto.organizationId);
       // if (!existingOrg) throw new OrganizationNotFoundError();

        const creator = await this.creatorExists(createOrgTaskDto.createdBy, createOrgTaskDto.organizationId);

        const assignee = await this.assigneeExists(toWhoWeAssign, createOrgTaskDto.organizationId);


        TaskPermissionPolicy.canChangeTaskElements(
            creator.getRole(),
            createOrgTaskDto.createdBy,
            toWhoWeAssign,
            assignee.getRole()
        );

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

        const dtoReturn: TaskDto = {
            id: taskCreated.id,
            organizationId: taskCreated.organizationId,
            title: taskCreated.getTitle().getValue(),
            description: taskCreated.getDescription().getValue(),
            status: taskCreated.getStatus(),
            assignedTo: taskCreated.getAssignedTo(),
            createdBy: taskCreated.getCreatedBy(),
            createdAt: taskCreated.getCreatedAt(),
        };

        return dtoReturn;
    }
}