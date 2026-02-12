import {UserRepositoryPG} from "./modules/user/repository_realization/user_repository_pg.js";
import {pool} from "./db/pg_pool.js";
import {HasherBcrypt} from "../src/modules/user/infrastructure/hasher_bcrypt.js";
import {PasswordHasher} from "../src/modules/user/application/ports/password_hasher_interface.js";
import {ChangePasswordUseCase} from "../src/modules/user/application/change_pass_use_case.js";
import {ChangeUserEmailUseCase} from "../src/modules/user/application/change_user_email_use_case.js";
import {RegisterUseCase} from "../src/modules/user/application/register_use_case.js";
import {OrganizationRepositoryPG} from "./modules/organization/repository_realization/organization_repository.js";
import {CreateOrganizationUseCase} from "./modules/organization/application/create_organization_use_case.js";
import {RenameOrganizationUseCase} from "./modules/organization/application/rename_organization_use_case.js";
import {
    OrganizationTasksRepositoryPG
} from "./modules/organization_task/organization_tasks_repository/org_tasks_repo_realization.js";
import {
    OrganizationMemberRepositoryPG
} from "./modules/organization_members/organization_members_repository_realization/organization_member_repository.js";
import {AuditEventsRepositoryPg} from "./modules/audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AuditEventReaderPG} from "./modules/audit_events/repozitory_realization/audit_event_reader.js";
import {
    ChangeOrgTaskDescriptionUseCase
} from "./modules/organization_task/application/change_org_task_description_use_case.js";
import {ChangeOrgTaskStatusUseCase} from "./modules/organization_task/application/change_org_task_status_use_case.js";
import {ChangeOrgTaskTitleUseCase} from "./modules/organization_task/application/change_org_task_title_use_case.js";
import {CreateOrganizationTaskUseCase} from "./modules/organization_task/application/create_org_task_use_case.js";
import {DeleteTaskUseCase} from "./modules/organization_task/application/delete_task_use_case.js";
import {
    ChangeOrgMemberRoleUseCase
} from "./modules/organization_members/application/change_role_org_member_use_case.js";
import {FireOrgMemberUseCase} from "./modules/organization_members/application/fire_org_member_use_case.js";
import {DeleteOrganizationUseCase} from "./modules/organization/application/delete_organization_use_case.js";
import {AppendLogAuditEvents} from "./modules/audit_events/application/append_log_audit_events.js";
import {GetOrganizationAuditUseCase} from "./modules/audit_events/application/get_org_audit_use_case.js";
import {GetFilteredAuditOrgUseCase} from "./modules/audit_events/application/get_filtered_audit_org_use_case.js";
import {ChangeEmailService} from "./modules/user/application/service/change_email.js";
import {ChangePassService} from "./modules/user/application/service/change_pass.js";
import {RegisterService} from "./modules/user/application/service/register.js";
import {ChangeDescWithAudit} from "./modules/organization_task/application/service/change_desc_with_audit.js";
import {ChangeTaskStatusWithAudit} from "./modules/organization_task/application/service/change_status_with_audit.js";
import {ChangeTitleWithAudit} from "./modules/organization_task/application/service/change_title_with_audit.js";
import {CreateTaskWithAudit} from "./modules/organization_task/application/service/create_task_with_audit.js";
import {DeleteTaskWithAudit} from "./modules/organization_task/application/service/delete_task_with_audit.js";
import {
    ChangeRoleWithAuditUseCase
} from "./modules/organization_members/application/services/change_role_with_audit_use_case.js";
import {
    FireMemberWithAuditUseCase
} from "./modules/organization_members/application/services/fire_member_with_audit_use_case.js";
import {
    HireMemberWithAuditUseCase
} from "./modules/organization_members/application/services/hire_member_with_audit_use_case.js";
import {HireOrgMemberUseCase} from "./modules/organization_members/application/hire_org_member_use_case.js";
import {CreateOrganizationWithAudit} from "./modules/organization/application/service/create_with_audit.js";
import {DeleteOrganization} from "./modules/organization/application/service/delete_organization.js";
import {RenameWithAudit} from "./modules/organization/application/service/rename_with_audit.js";
import {GetAllAuditWithAudit} from "./modules/audit_events/application/service/get_audit_byId_with_audit.js";
import {GetFilterAuditWithAudit} from "./modules/audit_events/application/service/get_filter_audit_with_audit.js";

export function assembleContainer() {
    // TODO : REPOSITORIES (data access);
    // 1) user
    const userRepoPG = new UserRepositoryPG(pool);
    // 2) organization tasks
    const organizationTaskRepoPG = new OrganizationTasksRepositoryPG(pool);
    // 3) organization members
    const organizationMemberRepoPG = new OrganizationMemberRepositoryPG(pool);
    // 4) organizations
    const organizationRepoPG = new OrganizationRepositoryPG(pool);
    // 5) audit events (writer (appendToLog))
    const auditEventWriter = new AuditEventsRepositoryPg(pool)
    // 6) audit events (reader)
    const auditEventReader = new AuditEventReaderPG(pool);


    // infrastructure services
    const hasher: PasswordHasher = new HasherBcrypt();

    // TODO : USE CASES (application);
    // 1) users
    const changePassUC = new ChangePasswordUseCase(userRepoPG, hasher);
    const changeEmailUC = new ChangeUserEmailUseCase(userRepoPG);
    const registerUC = new RegisterUseCase(userRepoPG, hasher);
    // 2) tasks
    const changeTaskDescUC = new ChangeOrgTaskDescriptionUseCase(organizationTaskRepoPG, organizationMemberRepoPG);
    const changeTaskStatusUC = new ChangeOrgTaskStatusUseCase(organizationTaskRepoPG, organizationMemberRepoPG);
    const changeTaskTitleUC = new ChangeOrgTaskTitleUseCase(organizationTaskRepoPG, organizationMemberRepoPG);
    const createTaskUC = new CreateOrganizationTaskUseCase(organizationTaskRepoPG, organizationMemberRepoPG, organizationRepoPG);
    const deleteTasksUC = new DeleteTaskUseCase(organizationTaskRepoPG, organizationMemberRepoPG);
    // 3) organization_members
    const changeOrgMemberRoleUC = new ChangeOrgMemberRoleUseCase(organizationMemberRepoPG);
    const fireOrgMemberUC = new FireOrgMemberUseCase(organizationMemberRepoPG);
    const hireOrgMemberUC = new HireOrgMemberUseCase(organizationMemberRepoPG, userRepoPG);
    // 4) organizations
    const createOrganizationUC = new CreateOrganizationUseCase(organizationRepoPG, userRepoPG);
    const renameOrganizationUC = new RenameOrganizationUseCase(organizationRepoPG, organizationMemberRepoPG);
    const deleteOrganizationUC = new DeleteOrganizationUseCase(organizationRepoPG, organizationMemberRepoPG);
    // 5) audit events
    const appendToAuditUC = new AppendLogAuditEvents(auditEventWriter);
    const getOrganizationAuditUC = new GetOrganizationAuditUseCase(auditEventReader, organizationMemberRepoPG);
    const getFilteredAuditUC = new GetFilteredAuditOrgUseCase(auditEventReader, organizationMemberRepoPG);

    // TODO : SERVICES (application services);
    // 1) users
    const changeEmailService = new ChangeEmailService(changeEmailUC);
    const changePassService = new ChangePassService(changePassUC);
    const registerService = new RegisterService(registerUC);
    // 2) tasks
    const changeTaskDescService = new ChangeDescWithAudit(changeTaskDescUC, appendToAuditUC);
    const changeTaskStatusService = new ChangeTaskStatusWithAudit(changeTaskStatusUC, appendToAuditUC);
    const changeTaskTitleService = new ChangeTitleWithAudit(changeTaskTitleUC, appendToAuditUC);
    const createTaskService = new CreateTaskWithAudit(createTaskUC, appendToAuditUC);
    const deleteTaskService = new DeleteTaskWithAudit(deleteTasksUC, appendToAuditUC);
    // 3 organization members
    const changeOrgMemberRoleService = new ChangeRoleWithAuditUseCase(changeOrgMemberRoleUC, appendToAuditUC);
    const fireMemberService = new FireMemberWithAuditUseCase(fireOrgMemberUC, appendToAuditUC);
    const hireMemberService = new HireMemberWithAuditUseCase(hireOrgMemberUC, appendToAuditUC);
    // 4 organizations
    const createOrganizationService = new CreateOrganizationWithAudit(createOrganizationUC, appendToAuditUC);
    const deleteOrganizationService = new DeleteOrganization(deleteOrganizationUC);
    const renameOrganizationService = new RenameWithAudit(renameOrganizationUC, appendToAuditUC);
    // 5 audit events
    const getAuditByOrganizationService = new GetAllAuditWithAudit(getOrganizationAuditUC, appendToAuditUC);
    const getFilteredAuditService = new GetFilterAuditWithAudit(getFilteredAuditUC, appendToAuditUC);

    // TODO : RETURN ALL SERVICES
}