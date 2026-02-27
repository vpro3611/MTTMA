import {CheckMembershipUseCase} from "../check_membership_use_case.js";


export class CheckMembershipService {
    constructor(private readonly checkMembershipUC: CheckMembershipUseCase) {}

    async executeTx(actorId: string, targetUserId: string) {
        const result = await this.checkMembershipUC.execute(actorId, targetUserId);
        return result;
    }
}