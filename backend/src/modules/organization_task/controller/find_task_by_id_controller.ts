import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";
import {FindTaskByIdServ} from "./services/find_by_id_serv.js";


export const FindTaskByIdParamsSchema = z.object({
    orgId: z.string().uuid(),
    orgTaskId: z.string().uuid(),
})

export type FindTaskByIdParams = z.infer<typeof FindTaskByIdParamsSchema>;

export class FindTaskByIdController {
    constructor(private readonly findTaskById: FindTaskByIdServ,) {
    }

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    findTaskByIdCont = async (req: Request<FindTaskByIdParams>, res: Response) => {
        const actorId = this.extractUserId(req);

        const {orgId, orgTaskId} = req.params;

        const result = await this.findTaskById.findTaskByIdS(orgTaskId, orgId, actorId.sub);

        return res.status(200).json(result);
    }
}