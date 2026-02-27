import {CheckProfileUseCase} from "../check_profile_use_case.js";


export class CheckProfileService {
    constructor(private readonly ownProfile: CheckProfileUseCase) {}

    executeTx = async (actorId: string, targetUserId: string) => {
        const ownProfile = await this.ownProfile.execute(actorId, targetUserId);
        return ownProfile;
    }
}