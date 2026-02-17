import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";
import {GetAllMembersServ} from "./services/get_all_members_serv.js";

export const GetAllMembersParamsSchema = z.object({
    orgId: z.string().uuid(),
})

export type GetAllMembersParams = z.infer<typeof GetAllMembersParamsSchema>;


export class GetAllMembersController {

    constructor(private readonly getAllMembersServ: GetAllMembersServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getAllMembersCont = async (req: Request<GetAllMembersParams>, res: Response)=> {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;

        const result = await this.getAllMembersServ.getAllMembersS(userId.sub, orgId);

        return res.status(200).json(result);
    }
}