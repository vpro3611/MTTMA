import {GetMyOrgServ} from "./services/get_my_org_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";

export class GetMyOrgController {
    constructor(private readonly getMyOrgServ: GetMyOrgServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getMyOrgCont = async (req: Request, res: Response) => {
        const userId = this.extractUserId(req);

        const result = await this.getMyOrgServ.getMyOrgS(userId.sub);

        return res.status(200).json(result);
    }
}