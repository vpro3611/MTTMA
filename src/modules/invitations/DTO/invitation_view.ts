import {InvitationStatus} from "../domain/invitation_status.js";


export type InvitationView = {
    id: string;
    role: string,
    status: string,
    organizationName: string,
    membersCount: number,
}