import {
    OrganizationMemberRepositoryPG
} from "../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {ActorNotAMemberError} from "../../organization_members/errors/organization_members_domain_error.js";
import {OrganizationTasksRepositoryPG} from "../organization_tasks_repository/org_tasks_repo_realization.js";
import {OrganizationTaskReader} from "../domain/ports/org_tasks_repo_interface.js";
import {TaskFilters} from "../DTO/task_filters.js";
import {Task} from "../domain/task_domain.js";
import {TaskDto} from "../DTO/return_dto/task_dto.js";


export class GetOrgTasksListUseCase {
    constructor(private readonly orgMemberRepo: OrganizationMemberRepositoryPG,
                private readonly tasksRepo: OrganizationTaskReader) {}

    private async actorIsMember(actorId: string, orgId: string) {
        const member = await this.orgMemberRepo.findById(actorId, orgId);
        if (!member) {
            throw new ActorNotAMemberError();
        }
        return member;
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
        };

    }

    async execute(actorId: string, orgId: string, filter?: TaskFilters) {
        const member = await this.actorIsMember(actorId, orgId);

        const tasks = await this.tasksRepo.getOrgTasks(orgId, filter);

        const mapped = tasks.map(task => this.mapToDTO(task));

        return mapped;
    }
}