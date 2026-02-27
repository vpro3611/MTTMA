import {ChangeEmailService} from "../../application/service/change_email.js";
import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../repository_realization/user_repository_pg.js";
import {ChangeUserEmailUseCase} from "../../application/change_user_email_use_case.js";


export class ChangeEmailServ {
    constructor(private readonly txManager: TransactionManager) {}

    changeEmailS = async (userId: string, newEmail: string) => {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const changeEmailUC = new ChangeUserEmailUseCase(userRepo);
            const changeEmailProxy = new ChangeEmailService(changeEmailUC);

            return await changeEmailProxy.executeTx(userId, newEmail);
        })
    }
}