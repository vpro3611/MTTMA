import {ChangeTitleServ} from "./services/change_title_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";
import {ChangeTitleDTO} from "../DTO/change_title_dto.js";

export const ChangeTitleParamsSchema = z.object({
    orgId: z.string().uuid(),
    taskId: z.string().uuid(),
})

export const ChangeTitleBodySchema = z.object({
    newTitle: z.string().min(1).max(255),
})

export type ChangeTitleBody = z.infer<typeof ChangeTitleBodySchema>;
export type ChangeTitleParams = z.infer<typeof ChangeTitleParamsSchema>;

export class ChangeTitleController {
    constructor(private readonly changeTitleServ: ChangeTitleServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    changeTitleCont = async (req: Request<ChangeTitleParams, unknown, ChangeTitleBody>, res: Response) => {
        const actorId = this.extractUserId(req);

        const {orgId, taskId } = req.params;

        const { newTitle } = req.body;

        const dto: ChangeTitleDTO = {
            newTitle,
            actorId: actorId.sub,
            orgTaskId: taskId,
            orgId,
        };

        const result = await this.changeTitleServ.changeTitleS(dto);

        res.status(200).json(result);
    }

}