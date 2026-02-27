import {GetByIdAndOrgServ} from "./services/get_by_id_and_org.js";
import {Request, Response} from "express";
import {z} from "zod";
import {UserIdError} from "../../../http_errors/user_id_error.js";

export const GetByIdAndOrgParamsSchema = z.object({
    orgId: z.string().uuid(),
    invId: z.string().uuid(),
})

export type GetByIdAndOrgParams = z.infer<typeof GetByIdAndOrgParamsSchema>;

export class GetByIdAndOrgController {
    constructor(private readonly getByIdAndOrgServ: GetByIdAndOrgServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getByIdAndOrgCont = async (req: Request<GetByIdAndOrgParams>, res: Response) => {
        const userId = this.extractUserId(req);

        const {orgId, invId} = req.params;

        const result = await this.getByIdAndOrgServ.getByIdAndOrgS(invId, orgId, userId.sub);

        return res.status(200).json(result);
    }
}