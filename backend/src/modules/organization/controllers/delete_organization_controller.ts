import {DeleteOrganizationServ} from "./services/delete_organization_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";

export const DeleteOrganizationParamsSchema = z.object({
    orgId: z.string().uuid(),
})

export type DeleteOrganizationParams = z.infer<typeof DeleteOrganizationParamsSchema>;

export class DeleteOrganizationController {
    constructor(private readonly deleteOrgServ: DeleteOrganizationServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    DeleteOrganizationCont = async (req: Request<DeleteOrganizationParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;

        const result = await this.deleteOrgServ.deleteOrgS(userId.sub, orgId);

        return res.status(204).send();
    }
}