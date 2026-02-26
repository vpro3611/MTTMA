import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../organization_members_repository_realization/organization_member_repository.js";
import {OrganizationRepositoryPG} from "../../../organization/repository_realization/organization_repository.js";
import {GetMemberByIdUseCase} from "../../application/get_by_id_use_case.js";
import {GetMemberByIdService} from "../../application/services/get_by_id_service.js";


export class GetMemberByIdServ {
    constructor(private readonly txManager: TransactionManager) {}

    async getMemberByIdS(actorId: string, targetId: string, orgId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const organizationRepo = new OrganizationRepositoryPG(client);

            const getMemberByIdUC = new GetMemberByIdUseCase(orgMemberRepo, organizationRepo);

            const getMemberByIdProxy = new GetMemberByIdService(getMemberByIdUC);

            return await getMemberByIdProxy.executeTx(actorId, targetId, orgId)
        })
    }
}