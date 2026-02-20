import { CreateInvitationServ } from "./services/create_invitation_serv.js";
import { Request, Response } from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";
import {OrgMemsRole} from "../../organization_members/domain/org_members_role.js";

export const CreateInvitationParamsSchema = z.object({
    orgId: z.string().uuid(),
    invitedUserId: z.string().uuid(),
})

export type CreateInvitationParams = z.infer<typeof CreateInvitationParamsSchema>;

export const CreateInvitationBodySchema = z.object({
    role: z.enum(Object.values(OrgMemsRole) as [string, ...string[]]).optional()
})

export type CreateInvitationBody = z.infer<typeof CreateInvitationBodySchema>;

export class CreateInvitationController {
    constructor(private readonly createInvitationServ: CreateInvitationServ) {}

    private extracUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    createInvitationCont = async (req: Request<CreateInvitationParams, unknown, CreateInvitationBody>, res: Response) => {
        const userId = this.extracUserId(req);

        const {orgId, invitedUserId} = req.params;

        const {role} = req.body;

        const dto = {
            actorId: userId.sub,
            organizationId: orgId,
            invitedUserId,
            role: role as OrgMemsRole,
        }

        const created = await this.createInvitationServ.createInvitationS(dto);

        res.status(201).json(created);
    }
}