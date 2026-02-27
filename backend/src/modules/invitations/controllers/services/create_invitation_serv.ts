import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {InvitationRepositoryPG} from "../../repository_realization/invitation_repository_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {CreateInvitationUseCase} from "../../application/create_invitation_use_case.js";
import {CreateInvitationService} from "../../application/services/create_invitation_service.js";
import {OrgMemsRole} from "../../../organization_members/domain/org_members_role.js";


export class CreateInvitationServ {
    constructor(private readonly txManager: TransactionManager) {}

    // dto: {organizationId: string, invitedUserId: string, actorId: string, role?: OrgMemsRole},
    async createInvitationS(dto: {
        organizationId: string,
        invitedUserId: string,
        actorId: string,
        role?: OrgMemsRole,
    }) {
        return await this.txManager.runInTransaction(async (client) => {
            const invitationRepoWrite = new InvitationRepositoryPG(client);
            const memberRepo = new OrganizationMemberRepositoryPG(client);
            const userRepo = new UserRepositoryPG(client);

            const auditEventsRepo = new AuditEventsRepositoryPg(client);
            const writeAuditEvents = new AppendLogAuditEvents(auditEventsRepo);

            const createInvUC = new CreateInvitationUseCase(invitationRepoWrite, memberRepo, userRepo);
            const createInvProxy = new CreateInvitationService(createInvUC, writeAuditEvents);

            return await createInvProxy.executeTx(dto)
        })

    }
}