import {OrganizationMember} from "../organization_member_domain.js";
import {AllOrgsWithRoles} from "../../DTO/all_orgs_with_roles.js";


export interface OrganizationMembersRepository {
    save(orgMember: OrganizationMember): Promise<void>;
    delete(orgMemberId: string, organizationId: string): Promise<OrganizationMember>;
    findById(orgMemberId: string, organizationId: string): Promise<OrganizationMember | null>;
    getAllMembers(organizationId: string): Promise<OrganizationMember[]>;
}

export interface OrganizationMembersRepositoryReadOnly {
    findAllMembersWithRoleByUserId(userId: string): Promise<AllOrgsWithRoles[]>;
}