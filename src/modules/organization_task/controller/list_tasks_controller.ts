import {ListTasksServ} from "./services/list_tasks_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {TaskStatus} from "../domain/task_status.js";
import {z} from "zod";


export const TaskFiltersQuerySchema = z.object({

    title: z.string()
        .trim()
        .min(1)
        .optional(),

    description: z.string()
        .trim()
        .min(1)
        .optional(),

    status: z.nativeEnum(TaskStatus)
        .optional(),

    assigneeId: z.string()
        .uuid()
        .optional(),

    creatorId: z.string()
        .uuid()
        .optional(),

    createdFrom: z.coerce.date()
        .optional(),

    createdTo: z.coerce.date()
        .optional(),

    limit: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(20),

    offset: z.coerce.number()
        .int()
        .min(0)
        .default(0),

}).refine(
    (data) => {
        if (data.createdFrom && data.createdTo) {
            return data.createdFrom <= data.createdTo;
        }
        return true;
    },
    {
        message: "createdFrom must be before or equal to createdTo",
        path: ["createdFrom"],
    }
);

export const TaskOrganizationIdParamSchema = z.object({
    orgId: z.string().uuid(),
})

export type TaskOrganizationIdParam = z.infer<typeof TaskOrganizationIdParamSchema>;

export type TaskFiltersQuery = z.infer<typeof TaskFiltersQuerySchema>;



export class ListTasksController {
    constructor(private readonly listTaskServ: ListTasksServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    listTasksCont = async (req: Request<TaskOrganizationIdParam>, res: Response) => {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;

        const parserQuery = TaskFiltersQuerySchema.parse(req.query);

        const result = await this.listTaskServ.listTasksS(orgId, userId.sub, parserQuery);

        return res.status(200).json(result);
    }
}