import {SearchOrganizationUseCase} from "../search_organization_use_case.js";
import {SearchOrganizationCriteria} from "../../DTO/search_criteria.js";


export class SearchOrganization {
    constructor(private readonly searchOrgUseCase: SearchOrganizationUseCase) {}

    async executeTx (actorId: string, criteria: SearchOrganizationCriteria) {
        const results = await this.searchOrgUseCase.execute(actorId, criteria);
        return results;
    }
}