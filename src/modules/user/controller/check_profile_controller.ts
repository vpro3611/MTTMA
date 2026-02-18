import {CheckProfileServ} from "./services/check_profile_serv.js";
import {Request, Response} from "express";
import {z} from "zod";
import {UserIdError} from "../../../http_errors/user_id_error.js";

export const CheckProfileParamsSchema = z.object({
    targetUserId: z.string().uuid(),
})

export type CheckProfileParams = z.infer<typeof CheckProfileParamsSchema>;

export class CheckProfileController {
    constructor(private readonly checkProfileServ: CheckProfileServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    checkProfileCont = async (req: Request<CheckProfileParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {targetUserId} = req.params;

        const result = await this.checkProfileServ.checkProfileS(userId.sub, targetUserId);

        return res.status(200).json(result);
    }
}