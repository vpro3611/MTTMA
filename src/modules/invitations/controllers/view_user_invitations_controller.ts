import {ViewUserInvitationsServ} from "./services/view_user_invitations_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";

export class ViewUserInvitationsController {
    constructor(private readonly viewUserInvitationsServ: ViewUserInvitationsServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    viewUserInvitationsCont = async (req: Request, res: Response) => {
        const userId = this.extractUserId(req);

        const result = await this.viewUserInvitationsServ.viewUserInvitationsS(userId.sub);

        return res.status(200).json(result);
    }

}