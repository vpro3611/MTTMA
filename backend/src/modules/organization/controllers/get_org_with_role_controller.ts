import {GetOrgWithRoleServ} from "./services/get_org_with_role_serv.js";
import {Request, Response} from "express";
import {z} from "zod";
import {UserIdError} from "../../../http_errors/user_id_error.js";

export const OrgIdParamsSchema = z.object({
    orgId: z.string().uuid(),
});

export type OrgIdParams = z.infer<typeof OrgIdParamsSchema>;

export class GetOrgWithRoleController {
    constructor(private readonly getOrgWithRoleServ: GetOrgWithRoleServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getOrgWithRoleCont = async (req: Request<OrgIdParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;

        const result = await this.getOrgWithRoleServ.getOrgWithRoleS(userId.sub, orgId);

        return res.status(200).json(result);
    }
}