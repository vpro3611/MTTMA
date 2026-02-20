import {Request, Response} from "express";
import {z} from "zod";
import {AcceptInvitationServ} from "./services/accept_invitation_serv.js";
import {UserIdError} from "../../../http_errors/user_id_error.js";

export const AcceptInvitationParamsSchema = z.object({
    invitationId: z.string().uuid(),
})

export type AcceptInvitationParams = z.infer<typeof AcceptInvitationParamsSchema>;

export class AcceptInvitationController {
    constructor(private readonly acceptInvitationServ: AcceptInvitationServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    acceptInvitationCont = async (req: Request<AcceptInvitationParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {invitationId} = req.params;

        const acceptedInvitation = await this.acceptInvitationServ.acceptInvitationS(userId.sub, invitationId);

        return res.status(200).json(acceptedInvitation);
    }
}