import {ChangePassServ} from "./services/change_pass_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import { z } from "zod";
import {TypedRequest} from "../../../Auth/declare_global_request.js";

// schema type
export type ChangePassInput = z.infer<typeof ChangePassSchema>;
// zod schema
export const ChangePassSchema = z.object({
    old_pass: z.string().min(10).max(255),
    new_pass: z.string().min(10).max(255),
})

export class ChangePassController {
    constructor(private readonly changePassServ: ChangePassServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    changePassCont = async (req: TypedRequest<ChangePassInput>, res: Response) => {
        const userId = this.extractUserId(req);

        const {old_pass, new_pass} = req.body;

        const user = await this.changePassServ.changePassS(userId.sub, old_pass, new_pass);

        res.status(200).json(user);
    }
}