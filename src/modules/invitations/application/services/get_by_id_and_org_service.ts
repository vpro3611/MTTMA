import {GetByIdAndOrgUseCase} from "../get_by_id_and_org_use_case.js";


export class GetByIdAndOrgService {
    constructor(private readonly getByIdAndOrg: GetByIdAndOrgUseCase) {}


    async executeTx (invId: string, orgId: string, actorId: string) {
        const result = await this.getByIdAndOrg.execute(invId, orgId, actorId);
        return result;
    }
}