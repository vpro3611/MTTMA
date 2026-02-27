import {RejectInvitationServ} from "./services/reject_invitation_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";


export const RejectInvitationParamsSchema = z.object({
    invitationId: z.string().uuid(),
})

export type RejectInvitationParams = z.infer<typeof RejectInvitationParamsSchema>;

export class RejectInvitationController {
    constructor(private readonly rejectInvitationServ: RejectInvitationServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    rejectInvitationCont = async (req: Request<RejectInvitationParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {invitationId} = req.params;

        const rejectedInvitation = await this.rejectInvitationServ.rejectInvitationS(userId.sub, invitationId);

        return res.status(200).json(rejectedInvitation);
    }
}