import {GetOrganizationInvitationUseCase} from "../get_organization_invitation_use_case.js";
import {Filters} from "../../DTO/filters.js";


export class GetOrganizationInvitationsService {
    constructor(private readonly getOrgInvitation: GetOrganizationInvitationUseCase) {}

    async executeTx(actorId: string, orgId: string, filters: Filters) {
        const invitations = await this.getOrgInvitation.execute(actorId, orgId, filters);

        return invitations;
    }
}