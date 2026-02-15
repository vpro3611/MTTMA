
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {ChangeEmailServ} from "./services/change_email_serv.js";



import { z } from "zod";
import {TypedRequest} from "../../../Auth/declare_global_request.js";


type ChangeEmailInput = z.infer<typeof ChangeEmailSchema>;


export const ChangeEmailSchema = z.object({
    new_email: z.string().email().min(5).max(255)
})


export class ChangeEmailController {
    constructor(private readonly changeEmailServ: ChangeEmailServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    changeEmailCont = async (req: TypedRequest<ChangeEmailInput>, res: Response) => {
        const userId = this.extractUserId(req);

        const {new_email} = req.body;

        const user = await this.changeEmailServ.changeEmailS(userId.sub, new_email);

        return res.status(200).json(user);
    }
}