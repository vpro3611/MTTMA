import {CancelInvitationServ} from "./services/cancel_invitation_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";


export const CancelInvitationParamsSchema = z.object({
    invitationId: z.string().uuid(),
})

export type CancelInvitationParams = z.infer<typeof CancelInvitationParamsSchema>;

export class CancelInvitationController {
    constructor(private readonly cancelInvitationServ: CancelInvitationServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    cancelInvitationCont = async (req: Request<CancelInvitationParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {invitationId} = req.params;

        const canceledInvitation = await this.cancelInvitationServ.cancelInvitationS(userId.sub, invitationId);

        return res.status(200).json(canceledInvitation);
    }
}