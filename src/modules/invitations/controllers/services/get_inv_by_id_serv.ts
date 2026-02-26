import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {UserInvitationRepoPg} from "../../repository_realization/user_invitation_repo_pg.js";
import {GetInvitationByIdUseCase} from "../../application/get_inv_by_id_use_case.js";
import {GetInvitationByIdService} from "../../application/services/get_inv_by_id_service.js";


export class GetInvitationByIdServ {
    constructor(private readonly txManager: TransactionManager) {}

    async getInvitationByIdS(invId: string, actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const userInvitationRepo = new UserInvitationRepoPg(client);

            const getInvByIdUC = new GetInvitationByIdUseCase(userRepo, userInvitationRepo);
            const getInvByIdProxy = new GetInvitationByIdService(getInvByIdUC);

            return await getInvByIdProxy.executeTx(invId, actorId);
        })
    }
}