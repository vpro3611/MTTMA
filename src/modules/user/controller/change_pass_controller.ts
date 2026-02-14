import {ChangePassServ} from "./services/change_pass_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";

export class ChangePassController {
    constructor(private readonly changePassServ: ChangePassServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    changePassCont = async (req: Request, res: Response) => {
        const {old_pass, new_pass} = req.body;
        const userId = this.extractUserId(req);
        const user = await this.changePassServ.changePassS(userId.sub, old_pass, new_pass)
        res.status(200).json(user);
    }
}