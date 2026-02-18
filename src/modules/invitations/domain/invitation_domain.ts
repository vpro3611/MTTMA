import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";
import {InvitationStatus} from "./invitation_status.js";


export class Invitation {
     constructor(
        public id: string,
        private organization_id: string,
        private invited_user_id: string,
        private invited_by_user_id: string,
        private role: OrgMemsRole,
        private status: InvitationStatus,
        private createdAt: Date,
        private expiredAt: Date,
    ) {}

    static createInvitation(invitation : {
        organization_id: string,
        invited_user_id: string,
        invited_by_user_id: string,
        role: OrgMemsRole,
        status: InvitationStatus,
        createdAt: Date,
        expiredAt: Date,
    }) {
         return new Invitation(
             crypto.randomUUID(),
             invitation.organization_id,
             invitation.invited_user_id,
             invitation.invited_by_user_id,
             invitation.role,
             invitation.status,
             invitation.createdAt,
             invitation.expiredAt,
         );
    }

     getOrganizationId = () =>  this.organization_id;
     getInvitedUserId = () =>  this.invited_user_id;
     getInvitedByUserId = () =>  this.invited_by_user_id;
     getAssignedRole = () =>  this.role;
     getStatus = () =>  this.status;
     getCreatedAt = () =>  this.createdAt;
     getExpiredAt = () =>  this.expiredAt;

}