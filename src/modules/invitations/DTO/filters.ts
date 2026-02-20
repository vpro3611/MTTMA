import {InvitationStatus} from "../domain/invitation_status.js";

export type Filters = {
    invited_user_id?: string;
    organization_id?: string;
    status?: InvitationStatus;
    createdFrom?: Date,
    createdTo?: Date,
}