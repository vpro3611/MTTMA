import {RenameOrganizationServ} from "./services/rename_organization_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";

export const RenameOrgBodySchema = z.object({
    newName: z.string().min(3).max(255),
})

export const RenameOrgParamsSchema = z.object({
    orgId: z.string().uuid(),
})

export type RenameOrgBody = z.infer<typeof RenameOrgBodySchema>;
export type RenameOrgParams = z.infer<typeof RenameOrgParamsSchema>;

export class RenameOrganizationController {
    constructor(private readonly renameOrgServ: RenameOrganizationServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    renameOrgCont = async (req: Request<RenameOrgParams, unknown, RenameOrgBody>, res: Response) => {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;
        const {newName} = req.body;

        const result = await this.renameOrgServ.renameOrgS(orgId, newName, userId.sub);

        return res.status(200).json(result);
    }
}