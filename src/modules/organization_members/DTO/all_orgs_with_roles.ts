import {OrgMemsRole} from "../domain/org_members_role.js";


export type AllOrgsWithRoles = {
    orgId: string,
    name: string,
    role: OrgMemsRole,
}