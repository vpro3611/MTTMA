import {GetMyOrganizationsUseCase} from "../get_my_organizations_use_case.js";


export class GetMyOrganizationService {
    constructor(private readonly geMyOrg: GetMyOrganizationsUseCase) {}


    async executeTx(actorId: string) {
        const orgs = await this.geMyOrg.execute(actorId);
        return orgs;
    }
}