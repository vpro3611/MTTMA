import {ChangePassService} from "../../application/service/change_pass.js";
import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../repository_realization/user_repository_pg.js";
import {ChangePasswordUseCase} from "../../application/change_pass_use_case.js";
import {HasherBcrypt} from "../../infrastructure/hasher_bcrypt.js";


export class ChangePassServ {
    constructor(private readonly txManager: TransactionManager) {}

    changePassS = async (userId: string, oldPass: string, newPass: string)=> {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const hasher = new HasherBcrypt()
            const changePassUC = new ChangePasswordUseCase(userRepo, hasher);
            const changePassProxy = new ChangePassService(changePassUC);

            return await changePassProxy.executeTx(userId, oldPass, newPass);
        });
    }
}