import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {OrganizationRepositoryPG} from "../../repository_realization/organization_repository.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {DeleteOrganizationUseCase} from "../../application/delete_organization_use_case.js";
import {DeleteOrganization} from "../../application/service/delete_organization.js";


export class DeleteOrganizationServ {
    constructor(private readonly txManager: TransactionManager) {}

    deleteOrgS = async (orgId: string, actorId: string) => {
        return await this.txManager.runInTransaction(async (client) => {
            const orgRepo = new OrganizationRepositoryPG(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);

            const deleteOrganizationUC = new DeleteOrganizationUseCase(orgRepo, orgMemberRepo);

            const deleteOrganizationProxy = new DeleteOrganization(deleteOrganizationUC);

            return await deleteOrganizationProxy.executeTx(orgId, actorId);
        });
    }
}