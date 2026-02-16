import {ChangeStatusServ} from "./services/change_status_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {ChangeStatusDTO} from "../DTO/change_status_dto.js";
import {z} from "zod";

export const ChangeStatusParamsSchema = z.object({
    orgId: z.string().uuid(),
    taskId: z.string().uuid(),
})

export const ChangeStatusBodySchema = z.object({
    newStatus: z.string(),
})

export type ChangeStatusBody = z.infer<typeof ChangeStatusBodySchema>;
export type ChangeStatusParams = z.infer<typeof ChangeStatusParamsSchema>;


export class ChangeStatusController {
    constructor(private readonly changeStatusServ: ChangeStatusServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    changeStatusCont = async (req: Request<ChangeStatusParams, unknown, ChangeStatusBody>, res: Response) => {
        const actorId = this.extractUserId(req);

        const {orgId, taskId } = req.params;
        const { newStatus } = req.body;

        const dto: ChangeStatusDTO = {
            newStatus,
            actorId: actorId.sub,
            orgTaskId: taskId,
            orgId,
        }

        const result = await this.changeStatusServ.changeStatusS(dto);
        return res.status(200).json(result);
    }
}