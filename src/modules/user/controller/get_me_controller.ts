
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {GetMeServ} from "./services/get_me_serv.js";

export class GetMeController {
    constructor(private readonly getMeServ: GetMeServ) {
    }
    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getMeCont = async (req: Request, res:Response) => {
        const userId = this.extractUserId(req);

        const result = await this.getMeServ.getMeS(userId.sub);
        return res.status(200).json(result);
    }
}