import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {MembershipRepoPg} from "../../organization_members_repository_realization/membership_repo_pg.js";
import {CheckMembershipUseCase} from "../../application/check_membership_use_case.js";
import {CheckMembershipService} from "../../application/services/check_membershit_service.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";


export class CheckMembershipServ {
    constructor(private readonly txManager: TransactionManager) {}


    async checkMembershipS(actorId: string, targetUserId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const membershipRepo = new MembershipRepoPg(client);
            const userRepo = new UserRepositoryPG(client);
            const membershipUC = new CheckMembershipUseCase(membershipRepo, userRepo);

            const membershipProxy = new CheckMembershipService(membershipUC);

            return await membershipProxy.executeTx(actorId, targetUserId);
        })
    }
}