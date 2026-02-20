import {GetOrganizationInvitationsServ} from "./services/get_organization_invitations_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";

import { z } from "zod";
import { InvitationStatus } from "../domain/invitation_status.js";



export const GetOrganizationInvitationsParamsSchema = z.object({
    orgId: z.string().uuid(),
})

export const invitationFiltersQuerySchema = z
    .object({
        invited_user_id: z.string().uuid().optional(),

      //  organization_id: z.string().uuid().optional(),

        status: z.enum([
            InvitationStatus.PENDING,
            InvitationStatus.ACCEPTED,
            InvitationStatus.REJECTED,
            InvitationStatus.EXPIRED,
            InvitationStatus.CANCELED,
        ]).optional(),

        createdFrom: z
            .string()
            .transform((val) => new Date(val))
            .refine((date) => !isNaN(date.getTime()), {
                message: "Invalid createdFrom date",
            })
            .optional(),

        createdTo: z
            .string()
            .transform((val) => new Date(val))
            .refine((date) => !isNaN(date.getTime()), {
                message: "Invalid createdTo date",
            })
            .optional(),
    })
    .refine(
        (data) =>
            !data.createdFrom ||
            !data.createdTo ||
            data.createdFrom <= data.createdTo,
        {
            message: "createdFrom must be before createdTo",
            path: ["createdFrom"],
        }
    );

export type InvitationFiltersQuery = z.infer<typeof invitationFiltersQuerySchema>;


export type GetOrganizationInvitationsParams = z.infer<typeof GetOrganizationInvitationsParamsSchema>;

export class GetOrganizationInvitationsController {
    constructor(private readonly getOrgInvServ: GetOrganizationInvitationsServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getOrganizationInvitationsCont = async (req: Request<GetOrganizationInvitationsParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {orgId} = req.params;

        const parsedQuery = invitationFiltersQuerySchema.parse(req.query);

        const result = await this.getOrgInvServ.getOrganizationInvitationsS(userId.sub, orgId, parsedQuery);

        return res.status(200).json(result);
    }
}