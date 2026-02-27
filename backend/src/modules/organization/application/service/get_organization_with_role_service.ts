import {GetOrganizationWithRoleUseCase} from "../get_organization_with_role_use_case.js";


export class GetOrganizationWithRoleService {
    constructor(private readonly getOrgWithRole: GetOrganizationWithRoleUseCase) {}


    async executeTx(actorId: string, orgId: string) {
        const forReturn = await this.getOrgWithRole.execute(actorId, orgId);
        return forReturn;
    }
}