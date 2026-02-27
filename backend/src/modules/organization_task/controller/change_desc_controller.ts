import {ChangeDescServ} from "./services/change_desc_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {ChangeDescDTO} from "../DTO/change_desc_dto.js";
import {z} from "zod";

export const ChangeDescParamsSchema = z.object({
    orgId: z.string().uuid(),
    taskId: z.string().uuid(),
})

export const ChangeDescBodySchema = z.object({
    newDesc: z.string().min(1).max(500),
})

export type ChangeDescBody = z.infer<typeof ChangeDescBodySchema>;
export type ChangeDescParams = z.infer<typeof ChangeDescParamsSchema>;



export class ChangeDescController {
    constructor(private readonly changeDescServ: ChangeDescServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    changeDescCont = async (req: Request<ChangeDescParams, unknown, ChangeDescBody>, res:Response) => {
        const actorId = this.extractUserId(req);

        const {orgId, taskId } = req.params;

        const { newDesc } = req.body;

        const dto: ChangeDescDTO = {
            newDesc,
            actorId: actorId.sub,
            orgTaskId: taskId,
            orgId,
        };

        const result = await this.changeDescServ.changeDescS(dto);
        return res.status(200).json(result);
    }
}