import {InvitationReadRepository} from "../domain/ports/invitation_repo_interface.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {InvitationView} from "../DTO/invitation_view.js";
import {UserDoesNotExistError} from "../../organization_task/errors/repository_errors.js";


export class ViewUserInvitationsUseCase {
    constructor(private readonly invitationRepo: InvitationReadRepository,
                private readonly userRepo: UserRepository
    ) {}


    private async userExists(actorId: string) {
        const user = await this.userRepo.findById(actorId);
        if (!user) {
            throw new UserDoesNotExistError();
        }
        return user;
    }

    async execute(actorId: string): Promise<InvitationView[]> {
        const user = await this.userExists(actorId);

        user.ensureIsActive();

        return await this.invitationRepo.getUserInvitations(actorId);
    }
}