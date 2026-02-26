import type {OrgMemsRole} from "../../../src/modules/organization_members/domain/org_members_role.ts";


export type OrganizationType = {
    id: string,
    name: string,
    createdAt: string,
}

export type OrganizationWithRole = {
    orgId: string,
    name: string,
    role: OrgMemsRole,
}