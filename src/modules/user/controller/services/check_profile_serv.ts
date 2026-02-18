import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../repository_realization/user_repository_pg.js";
import {CheckProfileUseCase} from "../../application/check_profile_use_case.js";
import {CheckProfileService} from "../../application/service/check_profile.js";


export class CheckProfileServ {
    constructor(private readonly txManager: TransactionManager) {}

    checkProfileS = async (actorId: string, targetUserId: string) => {
        return this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const checkProfileUC = new CheckProfileUseCase(userRepo);
            const checkProfileProxy = new CheckProfileService(checkProfileUC);

            return await checkProfileProxy.executeTx(actorId, targetUserId);
        })
    }
}