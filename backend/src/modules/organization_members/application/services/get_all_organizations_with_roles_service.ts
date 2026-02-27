import {GetAllOrganizationsWithRolesUseCase} from "../get_all_organizations_with_roles_use_case.js";


export class GetAllOrganizationsWithRolesService {
    constructor(private readonly getAllOrgsWithRolesUC: GetAllOrganizationsWithRolesUseCase) {}

    async executeTx(actorId: string) {
        const result = await this.getAllOrgsWithRolesUC.execute(actorId);
        return result;
    }
}