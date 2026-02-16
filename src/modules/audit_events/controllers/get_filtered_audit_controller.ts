import {GetFilteredAuditServ} from "./services/get_filtered_audit_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";
import {AuditEventActions} from "../domain/audit_event_actions.js";
import {GetAuditEventQuery} from "../DTO/get_audit_event_query.js";

export const GetFilteredAuditParamsSchema = z.object({
    orgId: z.string().uuid(),
})

export const GetFilteredAuditQuerySchema = z.object({
    action: z.enum(AuditEventActions).optional(),
    actorUserId: z.string().uuid().optional(),

    from: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),

    to: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),

    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional(),
});

export type GetFilteredAuditParams = z.infer<typeof GetFilteredAuditParamsSchema>;
export type GetFilteredAuditQuery = z.infer<typeof GetFilteredAuditQuerySchema>;

export class GetFilteredAuditController {
    constructor(private readonly getFilterAuditServ : GetFilteredAuditServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getFilteredAuditCont = async (
        req: Request<GetFilteredAuditParams>, res: Response
    ) => {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;

        const parsedQuery = GetFilteredAuditQuerySchema.parse(req.query);

        const dto: GetAuditEventQuery = {
            actorId: userId.sub,
            orgId,
            filters: parsedQuery,
        }

        const result = await this.getFilterAuditServ.getFilteredAuditS(dto)

        return res.status(200).json(result);
    }
}
