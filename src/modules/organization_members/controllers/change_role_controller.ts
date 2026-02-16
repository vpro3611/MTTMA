import {ChangeRoleServ} from "./services/change_role_serv.js";
import {Request, Response} from "express";
import {z} from "zod";
import {UserIdError} from "../../../http_errors/user_id_error.js";


export const ChangeRoleBodySchema = z.object({
    role: z.enum([
        "ADMIN",
        "MEMBER",
        "OWNER",
    ]),
})

export const ChangeRoleParamsSchema = z.object({
    targetUserId: z.string().uuid(),
    orgId: z.string().uuid(),
})

export type ChangeRoleBody = z.infer<typeof ChangeRoleBodySchema>;
export type ChangeRoleParams = z.infer<typeof ChangeRoleParamsSchema>;

export class ChangeRoleController {
    constructor(private readonly changeRoleServ: ChangeRoleServ ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    changeRoleCont = async (req: Request<ChangeRoleParams, unknown, ChangeRoleBody>, res: Response) => {
        const userId = this.extractUserId(req);

        const role = req.body.role;

        const {targetUserId, orgId} = req.params;

        const dto = {
            actorUserId: userId.sub,
            organizationId: orgId,
            targetUserId: targetUserId,
            role: role,
        }

        const result = await this.changeRoleServ.changeRoleS(dto);

        return res.status(200).json(result);
    }
}