import {CheckMembershipServ} from "./services/check_memberhip_serv.js";
import {Request, Response} from "express";
import {z} from "zod";

export const MembershipParamsSchema = z.object({
    userId: z.string().uuid(),
})

export type MembershipParams = z.infer<typeof MembershipParamsSchema>;

export class CheckMembershitController {
    constructor(private readonly checkMembershipServ: CheckMembershipServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new Error();
        }
        return req.user;
    }

    checkMembershipCont = async (req: Request<MembershipParams>, res: Response) => {
        const actorId = this.extractUserId(req);

        const {userId} = req.params;

        const result = await this.checkMembershipServ.checkMembershipS(actorId.sub, userId);

        return res.status(200).json({hasOrganizations: result});
    }
}