import {GetAllOrgsWithRolesServ} from "./services/get_all_orgs_with_roles_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";


export class GetAllOrgsWithRolesController {
    constructor(private readonly getAllOrgsWithRolesServ: GetAllOrgsWithRolesServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getAllOrgsWithRolesCont = async (req: Request, res: Response) => {
        const userId = this.extractUserId(req);

        const result = await this.getAllOrgsWithRolesServ.getAllOrgsWithRolesS(userId.sub);

        return res.status(200).json(result);
    }
}