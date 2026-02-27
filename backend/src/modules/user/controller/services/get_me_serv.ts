import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../repository_realization/user_repository_pg.js";
import {GetMeUseCase} from "../../application/get_me_use_case.js";
import {GetMeService} from "../../application/service/get_me.js";


export class GetMeServ {
    constructor(private readonly txManager: TransactionManager) {}


    async getMeS(actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const getMeUC = new GetMeUseCase(userRepo);
            const getMeProxy = new GetMeService(getMeUC);

            return await getMeProxy.executeTx(actorId);
        })
    }
}