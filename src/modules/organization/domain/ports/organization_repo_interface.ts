import {Organization} from "../organiztion_domain.js";
import {Name} from "../name.js";
import {OrganizationSearchResultDto, SearchOrganizationCriteria} from "../../DTO/search_criteria.js";

export interface OrganizationRepository {
    findById(id: string): Promise<Organization | null>;
    findByName(name: Name): Promise<Organization | null>;
    save(organization: Organization): Promise<void>;
    delete(organizationId: string): Promise<Organization | null>;
}

export interface SearchOrganizationRepository {
    search(criteria: SearchOrganizationCriteria): Promise<OrganizationSearchResultDto[]>;
}