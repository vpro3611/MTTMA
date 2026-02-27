import {GetInvitationByIdServ} from "./services/get_inv_by_id_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";

export const GetInvitationByIdParamsSchema = z.object({
    invId: z.string().uuid(),
})

export type GetInvitationByIdParams = z.infer<typeof GetInvitationByIdParamsSchema>;

export class GetInvitationByIdController {
    constructor(private readonly getInvitationByIdServ: GetInvitationByIdServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getInvitationByIdCont = async (req: Request<GetInvitationByIdParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {invId} = req.params;

        const result = await this.getInvitationByIdServ.getInvitationByIdS(invId, userId.sub);

        return res.status(200).json(result);
    }
}