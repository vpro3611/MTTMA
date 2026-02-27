import {ViewUserInvitationsUseCase} from "../view_user_invitations_use_case.js";


export class ViewUserInvitationsService {
    constructor(private readonly viewUserInvitationsUseCase: ViewUserInvitationsUseCase) {}


    async executeTx(actorId: string) {
        const userInvitations = await this.viewUserInvitationsUseCase.execute(actorId);

        return userInvitations;
    }
}