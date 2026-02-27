import {DeleteTaskServ} from "./services/delete_task_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";
import {DeleteTaskDTO} from "../DTO/delete_task_dto.js";

export const DeleteTaskParamsSchema = z.object({
    orgId: z.string().uuid(),
    orgTaskId: z.string().uuid(),
})

export type DeleteTaskParams = z.infer<typeof DeleteTaskParamsSchema>;

export class DeleteTaskController {
    constructor(private readonly deleteTask: DeleteTaskServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    deleteTaskCont = async (req: Request<DeleteTaskParams>, res: Response) => {
        const actorId = this.extractUserId(req);

        const {orgId, orgTaskId} = req.params;

        const dto : DeleteTaskDTO = {
            orgTaskId,
            orgId,
            actorId: actorId.sub,
        }

        const result = await this.deleteTask.deleteTaskS(dto);
        return res.status(204).send();
    }


}