import {FireMemberServ} from "./services/fire_member_serv.js";
import {Request, Response} from "express";
import {z} from "zod";


export const FireMemberParamsSchema = z.object({
    targetUserId: z.string().uuid(),
    orgId: z.string().uuid(),
})

export type FireMemberParams = z.infer<typeof FireMemberParamsSchema>;

export class FireMemberController {
    constructor(private readonly fireMemberServ: FireMemberServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new Error();
        }
        return req.user;
    }

    fireMemberCont = async (req: Request<FireMemberParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {targetUserId, orgId} = req.params;

        const dto = {
            actorUserId: userId.sub,
            organizationId: orgId,
            targetUserId: targetUserId,
        }

        const result = await this.fireMemberServ.fireMemberS(dto);

        return res.status(204).send();
    }
}