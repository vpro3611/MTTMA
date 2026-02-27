import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../repository_realization/user_repository_pg.js";
import {UserRepositoryReaderPg} from "../../repository_realization/user_repository_reader_pg.js";
import {GetAllUsersUseCase} from "../../application/get_all_users_use_case.js";
import {GetAllUsersService} from "../../application/service/get_all_users.js";


export class GetAllUsersServ {
    constructor(private readonly txManager: TransactionManager) {}

    async getAllUsersS (actorId: string, page: number, limit: number) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const userRepoRonly = new UserRepositoryReaderPg(client)
            const getAllUsersUC = new GetAllUsersUseCase(userRepo, userRepoRonly);
            const getAllUsersProxy = new GetAllUsersService(getAllUsersUC);

            return await getAllUsersProxy.executeTx(actorId, page, limit);
        })
    }
}