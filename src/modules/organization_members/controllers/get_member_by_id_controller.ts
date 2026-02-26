import {GetMemberByIdServ} from "./services/get_member_by_id_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";

export const GetMemberByIdParamsSchema = z.object({
    orgId: z.string().uuid(),
    targetUserId: z.string().uuid(),
})

export type GetMemberByIdParams = z.infer<typeof GetMemberByIdParamsSchema>;

export class GetMemberByIdController {
    constructor(private readonly getMemberByIdServ: GetMemberByIdServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getMemberByIdCont = async (req: Request<GetMemberByIdParams>, res: Response)=> {
        const userId = this.extractUserId(req);

        const {orgId, targetUserId} = req.params;

        const result = await this.getMemberByIdServ.getMemberByIdS(userId.sub, targetUserId, orgId);

        return res.status(200).json(result);
    }
}