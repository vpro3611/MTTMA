import {ViewOrganizationServ} from "./services/view_organization_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";

export const ViewOrganizationParamsSchema = z.object({
    orgId: z.string().uuid(),
})

export type ViewOrganizationParams = z.infer<typeof ViewOrganizationParamsSchema>;

export class ViewOrganizationController {
    constructor(private readonly viewOrganizationServ: ViewOrganizationServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    viewOrganizationCont = async (req: Request<ViewOrganizationParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;

        const result = await this.viewOrganizationServ.viewOrganizationS(userId.sub, orgId);

        return res.status(200).json(result);
    }
}