import {Organization} from "../organiztion_domain.js";
import {Name} from "../name.js";

export interface OrganizationRepository {
    findById(id: string): Promise<Organization | null>;
    findByName(name: Name): Promise<Organization | null>;
    save(organization: Organization): Promise<void>;
    delete(organizationId: string): Promise<Organization | null>;
}