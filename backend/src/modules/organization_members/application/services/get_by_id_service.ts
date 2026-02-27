import {GetMemberByIdUseCase} from "../get_by_id_use_case.js";


export class GetMemberByIdService {
    constructor(private readonly getMemberByIdUC: GetMemberByIdUseCase) {}

    async executeTx(actorId: string, targetId: string, orgId: string) {
        const result = await this.getMemberByIdUC.execute(actorId, targetId, orgId);
        return result;
    }
}