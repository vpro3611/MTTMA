import {MembershipRepoPg} from "../organization_members_repository_realization/membership_repo_pg.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {UserNotFoundError} from "../errors/organization_members_repo_errors.js";


export class CheckMembershipUseCase {
    constructor(private readonly membershipRepo: MembershipRepoPg,
                private readonly userRepo: UserRepository) {}

    private async userExists(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }

    async execute(actorId: string, targetUserId: string) {
        const actor = await this.userExists(actorId);
        const target = await this.userExists(targetUserId);
        actor.ensureIsActive();
        target.ensureIsActive();
        return await this.membershipRepo.findRelations(targetUserId);
    }
}