import {CreateOrgServ} from "./services/create_organization_serv.js";
import {Request, RequestHandler, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";

export const CreateOrgBodySchema = z.object({
    name: z.string().min(3).max(255),
});

export type CreateOrgBody = z.infer<typeof CreateOrgBodySchema>;

export class CreateOrganizationController {
    constructor(private readonly createOrgServ: CreateOrgServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    createOrganizationCont = async (req: Request<{}, unknown, CreateOrgBody>, res: Response)=> {
        const userId = this.extractUserId(req);

        const {name} = req.body;

        const result = await this.createOrgServ.createOrgS(name, userId.sub);
        return res.status(201).json(result)
    };
}