import {CreateTaskServ} from "./services/create_task_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";
import {CreateOrgTaskDataInputDTO} from "../DTO/create_org_task_dto.js";

export const CreateTaskParamsSchema = z.object({
    orgId: z.string().uuid(),
})

export const CreateTaskBodySchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().min(1).max(500),
    assignedTo: z.string().uuid().optional(),
})

export type CreateTaskBody = z.infer<typeof CreateTaskBodySchema>;
export type CreateTaskParams = z.infer<typeof CreateTaskParamsSchema>;

export class CreateTaskController {
    constructor(private readonly createTaskServ: CreateTaskServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    createTaskCont = async (req: Request<CreateTaskParams, unknown, CreateTaskBody>, res: Response)=> {
        const actorId = this.extractUserId(req);
        const {orgId} = req.params;

        const {title, description, assignedTo} = req.body;

        const dto : CreateOrgTaskDataInputDTO = {
            organizationId: orgId,
            title,
            description,
            assignedTo,
            createdBy: actorId.sub,
        };

        const result = await this.createTaskServ.createTaskS(dto);

        return res.status(201).json(result);
    }
}