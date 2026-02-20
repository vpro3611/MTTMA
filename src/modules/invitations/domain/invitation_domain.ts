import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";
import {InvitationStatus} from "./invitation_status.js";
import {InvitationNotPendingError} from "../errors/domain_errors.js";


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

    ensureIsPending() {
         if (this.status !== InvitationStatus.PENDING) {
             throw new InvitationNotPendingError();
         }
    }

    private static calculateExpiration(): Date {
         const date = new Date();
         date.setDate(date.getDate() + 7);
         return date;
    }

    static createInvitation(invitation : {
        organization_id: string,
        invited_user_id: string,
        invited_by_user_id: string,
        role: OrgMemsRole,
    }) {
         return new Invitation(
             crypto.randomUUID(),
             invitation.organization_id,
             invitation.invited_user_id,
             invitation.invited_by_user_id,
             invitation.role,
             "PENDING",
             new Date(),
             this.calculateExpiration(),
         );
    }

    setStatus(status : InvitationStatus) {
         this.ensureIsPending();
         this.status = status;
    }
     getOrganizationId = () =>  this.organization_id;
     getInvitedUserId = () =>  this.invited_user_id;
     getInvitedByUserId = () =>  this.invited_by_user_id;
     getAssignedRole = () =>  this.role;
     getStatus = () =>  this.status;
     getCreatedAt = () =>  this.createdAt;
     getExpiredAt = () =>  this.expiredAt;

}