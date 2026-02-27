import {ConflictError} from "../../../errors_base/errors_base.js";

export class InvitationNotPendingError extends ConflictError {
    constructor() {
        super("Error: Invitation is not pending");
        this.name = "InvitationNotPendingError";
    }
}