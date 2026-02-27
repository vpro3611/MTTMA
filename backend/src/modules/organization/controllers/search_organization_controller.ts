import {SearchOrganizationServ} from "./services/search_organization_serv.js";
import {Request, Response} from "express";
import {z} from "zod";
import {UserIdError} from "../../../http_errors/user_id_error.js";


export const SearchOrganizationQuerySchema = z.object({
    query: z.string().min(1),

    createdFrom: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),

    createdTo: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),

    sortBy: z.enum(["createdAt", "membersCount"]).optional(),

    order: z.enum(["asc", "desc"]).optional(),

    limit: z.coerce.number().min(1).max(100).optional(),

    offset: z.coerce.number().min(0).optional(),
})

export class SearchOrganizationController {
    constructor(private readonly searchOrganizationS: SearchOrganizationServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    searchOrganizationCont = async (req: Request, res: Response) => {
        const user = this.extractUserId(req);

        const parsedQuery = SearchOrganizationQuerySchema.parse(req.query);

        const result = await this.searchOrganizationS.searchOrganizationS(user.sub, parsedQuery);

        return res.status(200).json(result);
    }
}