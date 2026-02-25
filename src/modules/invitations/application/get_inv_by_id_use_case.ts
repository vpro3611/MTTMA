import {InvitationReadRepository, InvitationRepoInterface} from "../domain/ports/invitation_repo_interface.js";
import {InvitationNotFound} from "../errors/application_errors.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {UserNotFound} from "../../user/errors/user_repository_errors.js";
import {UserInvitationRepoPg} from "../repository_realization/user_invitation_repo_pg.js";


export class GetInvitationByIdUseCase {
    constructor(
                private readonly userRepo: UserRepository,
                private readonly userInvitationsRepo: UserInvitationRepoPg,
    ) {}



    private async userExists(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new UserNotFound();
        }
        return user;
    }

    private async getFullInfoInvitation(invId: string, actorId: string) {
        const fullInfoInvitation = await this.userInvitationsRepo.getFullInfoInvitation(invId, actorId)
        if (!fullInfoInvitation) {
            throw new InvitationNotFound();
        }
        return fullInfoInvitation;
    }

    async execute(invId: string, actorId: string) {
        const userExists = await this.userExists(actorId);

        userExists.ensureIsActive();

        const fullInfoInvitation = await this.getFullInfoInvitation(invId, actorId)

        return fullInfoInvitation;
    }
}