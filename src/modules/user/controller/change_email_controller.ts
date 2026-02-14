
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {ChangeEmailServ} from "./services/change_email_serv.js";

export class ChangeEmailController {
    constructor(private readonly changeEmailServ: ChangeEmailServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    changeEmailCont = async (req: Request, res: Response) => {
        const { new_email } = req.body;
        const userId = this.extractUserId(req);
        const user = await this.changeEmailServ.changeEmailS(userId.sub, new_email);
        return res.status(200).json(user);
    }
}