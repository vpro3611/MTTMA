import {GetInvitationByIdUseCase} from "../get_inv_by_id_use_case.js";


export class GetInvitationByIdService {
    constructor(private readonly getInvitationById: GetInvitationByIdUseCase) {}

    async executeTx(invId: string, actorId: string) {
        const result = await this.getInvitationById.execute(invId, actorId);
        return result;
    }
}