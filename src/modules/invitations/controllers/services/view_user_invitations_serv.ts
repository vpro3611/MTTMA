import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {ViewUserInvitationsUseCase} from "../../application/view_user_invitations_use_case.js";
import {ViewUserInvitationsService} from "../../application/services/view_user_invitations_service.js";
import {InvitationReadRepositoryPG} from "../../repository_realization/invitation_read_repo_pg.js";


export class ViewUserInvitationsServ {
    constructor(private readonly txManager: TransactionManager) {}


    async viewUserInvitationsS(actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const invitationsRepoRead = new InvitationReadRepositoryPG(client)
            const userRepo = new UserRepositoryPG(client);


            const viewInvUC = new ViewUserInvitationsUseCase(invitationsRepoRead, userRepo);
            const viewInvProxy = new ViewUserInvitationsService(viewInvUC);

            return await viewInvProxy.executeTx(actorId);
        })
    }
}