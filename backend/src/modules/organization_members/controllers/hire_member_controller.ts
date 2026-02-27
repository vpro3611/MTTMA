import {HireMemberServ} from "./services/hire_member_serv.js";
import {Request, Response} from "express";
import {z} from "zod";
import {OrgMemsRole} from "../domain/org_members_role.js";


export const HireMemberParamsSchema = z.object({
    orgId: z.string().uuid(),
    targetUserId: z.string().uuid(),
})

export const HireMemberBodySchema = z.object({
    role: z.enum([
        OrgMemsRole.OWNER,
        OrgMemsRole.ADMIN,
        OrgMemsRole.MEMBER,
    ]).optional(),
})

export type HireMemberParams = z.infer<typeof HireMemberParamsSchema>;
export type HireMemberBody = z.infer<typeof HireMemberBodySchema>;

export class HireMemberController {
    constructor(private readonly hireMemberServ: HireMemberServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new Error();
        }
        return req.user;
    }

    hireMemberCont = async (req: Request<HireMemberParams, unknown, HireMemberBody>, res: Response) => {
        const userId = this.extractUserId(req);

        const {role} = req.body;

        const {orgId, targetUserId} = req.params;

        const dto = {
            actorUserId: userId.sub,
            organizationId: orgId,
            targetUserId,
            role,
        }

        const result = await this.hireMemberServ.hireMemberS(dto);

        return res.status(201).json(result);
    }
}