import {Invitation} from "../invitation_domain.js";
import {InvitationStatus} from "../invitation_status.js";
import {OrgMemsRole} from "../../../organization_members/domain/org_members_role.js";
import {Filters} from "../../DTO/filters.js";


export interface InvitationRepoInterface {
    getInvitationById(id: string): Promise<Invitation | null>;
    getInvitationsFiltered(filters: Filters): Promise<Invitation[]>;
    existsPending(userId: string, organizationId: string): Promise<boolean>;
    save(invitation: Invitation): Promise<void>;
}

