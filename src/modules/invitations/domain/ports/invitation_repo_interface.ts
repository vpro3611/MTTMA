import {Invitation} from "../invitation_domain.js";
import {Filters} from "../../DTO/filters.js";
import {InvitationView} from "../../DTO/invitation_view.js";


export interface InvitationRepoInterface {
    getInvitationById(id: string): Promise<Invitation | null>;
    getInvitationsFiltered(filters: Filters): Promise<Invitation[]>;
    existsPending(userId: string, organizationId: string): Promise<boolean>;
    save(invitation: Invitation): Promise<void>;
}

export interface InvitationReadRepository {
    getUserInvitations(userId: string): Promise<InvitationView[]>;
}

export interface InvitationByIdRepository {
    getByIdAndOrgId(invId: string, orgId: string): Promise<Invitation | null>;
}