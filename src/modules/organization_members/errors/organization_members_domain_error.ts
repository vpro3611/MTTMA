import {OrgMemsRole} from "../domain/org_members_role.js";


export class OrganizationMembersDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OrganizationMembersDomainError";
    }
}

export class OrganizationMemberInsufficientPermissionsError extends OrganizationMembersDomainError {
    constructor() {
        super("User does not have sufficient permissions to perform this action");
        this.name = "OrganizationMemberInsufficientPermissionsError";
    }
}

export class InvalidOrganizationMemberRoleError extends OrganizationMembersDomainError {
    constructor() {
        super("Invalid organization member role");
        this.name = "InvalidOrganizationMemberRoleError";
    }
}

export class ActorNotAMemberError extends OrganizationMembersDomainError {
    constructor() {
        super("Actor is not a member of this organization");
        this.name = "ActorNotAMemberError";
    }
}

export class TargetNotAMemberError extends OrganizationMembersDomainError {
    constructor() {
        super("Target is not a member of this organization");
        this.name = "TargetIsNotAMemberError";
    }
}

export class CannotPerformActionOnYourselfError extends OrganizationMembersDomainError {
    constructor() {
        super("Cannot perform action on yourself");
        this.name = "CannotPerformActionOnYourselfError";
    }
}

export class CannotAssignRole extends OrganizationMembersDomainError {
    constructor(role: OrgMemsRole) {
        super(`Cannot assign role ${role}`);
        this.name = "CannotAssignRole";
    }
}

export class OnlyOwnerCanAssign extends OrganizationMembersDomainError {
    constructor() {
        super("Only OWNER can assign roles to other users");
        this.name = "CannotAssignRoleToTarget";
    }
}