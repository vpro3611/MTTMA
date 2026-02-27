import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {OrganizationRepositoryPG} from "../../repository_realization/organization_repository.js";
import {GetOrganizationWithRoleUseCase} from "../../application/get_organization_with_role_use_case.js";
import {GetOrganizationWithRoleService} from "../../application/service/get_organization_with_role_service.js";


export class GetOrgWithRoleServ {
    constructor(private readonly txManager: TransactionManager) {}


    async getOrgWithRoleS(actorId: string, orgId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const orgRpo = new OrganizationRepositoryPG(client);

            const getOrgWithRoleUC = new GetOrganizationWithRoleUseCase(orgRpo, orgMemberRepo);
            const getOrgWithRoleProxy = new GetOrganizationWithRoleService(getOrgWithRoleUC);

            return await getOrgWithRoleProxy.executeTx(actorId, orgId);
        })
    }
}