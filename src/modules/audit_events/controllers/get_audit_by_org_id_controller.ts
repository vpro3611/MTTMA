import {GetAuditByIdServ} from "./services/get_audit_by_id_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";

export const GetAuditByOrgIdParamsSchema = z.object({
    orgId: z.string().uuid(),
})

export type GetAuditByOrgIdParams = z.infer<typeof GetAuditByOrgIdParamsSchema>;

export class GetAuditByOrgIdController {
    constructor(private readonly getAuditByOrgIdServ : GetAuditByIdServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getAuditByOrgIdCont = async (req: Request<GetAuditByOrgIdParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;

        const result = await this.getAuditByOrgIdServ.getAuditByOrgIdS(userId.sub, orgId);

        return res.status(200).json(result);
    }
}