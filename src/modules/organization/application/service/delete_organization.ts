import {DeleteOrganizationUseCase} from "../delete_organization_use_case.js";


export class DeleteOrganization {
    constructor(private readonly organization: DeleteOrganizationUseCase) {};

    executeTx = async (actorId: string, orgId: string) => {
        const deleted = await this.organization.execute(actorId, orgId);
        return deleted;
    }
}