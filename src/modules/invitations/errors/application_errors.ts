import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";
import {AuthorizationError, ConflictError, NotFoundError, ValidationError} from "../../../errors_base/errors_base.js";

export class InvitationNotFound extends NotFoundError {
    constructor() {
        super("Invitation not found");
        this.name = "InvitationNotFound";
    }
}

export class InvitationOfDiffUser extends AuthorizationError {
    constructor() {
        super("Cannot accept invitation of different user");
        this.name = "InvitationOfDiffUser";
    }
}

export class UserAlreadyMember extends ConflictError {
    constructor() {
        super("User is already member of organization");
        this.name = "UserAlreadyMember";
    }
}

export class InvalidRoleInInvitation extends ValidationError {
    constructor(role: OrgMemsRole) {
        super(`Invalid role in invitation: ${role}`);
        this.name = "InvalidRoleInInvitation";
    }
}