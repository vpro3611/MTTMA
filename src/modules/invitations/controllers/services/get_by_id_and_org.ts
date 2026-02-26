import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {OrganizationRepositoryPG} from "../../../organization/repository_realization/organization_repository.js";
import {InvitationByIdRepository} from "../../domain/ports/invitation_repo_interface.js";
import {InvitationByIdAndOrgRepoPg} from "../../repository_realization/invitation_by_id_and_org_repo_pg.js";
import {GetByIdAndOrgUseCase} from "../../application/get_by_id_and_org_use_case.js";
import {GetByIdAndOrgService} from "../../application/services/get_by_id_and_org_service.js";


export class GetByIdAndOrgServ {
    constructor(private readonly txManager: TransactionManager) {}

    async getByIdAndOrgS(invId: string, orgId: string, actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const memberRepo = new OrganizationMemberRepositoryPG(client);
            const organizationRepo = new OrganizationRepositoryPG(client);
            const invitationRepo = new InvitationByIdAndOrgRepoPg(client);

            const getByIdAndOrgUC = new GetByIdAndOrgUseCase(invitationRepo, organizationRepo, memberRepo);
            const getByIdAndOrgProxy = new GetByIdAndOrgService(getByIdAndOrgUC);

            return await getByIdAndOrgProxy.executeTx(invId, orgId, actorId);
        })
    }
}