import {GetAllUsersServ} from "./services/get_all_users_serv.js";
import {Request, Response} from "express";
import {UserIdError} from "../../../http_errors/user_id_error.js";
import {z} from "zod";

export const GetAllUsersQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
})

export type GetAllUsersQuery = z.infer<typeof GetAllUsersQuerySchema>;

export class GetAllUsersController {
    constructor(private readonly getAllUsersS: GetAllUsersServ) {}

    private extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError();
        }
        return req.user;
    }

    getAllUsersCont = async (req: Request, res: Response) => {
        const userId = this.extractUserId(req);

        const {page, limit} = GetAllUsersQuerySchema.parse(req.query);

        const result = await this.getAllUsersS.getAllUsersS(userId.sub, page, limit);

        return res.status(200).json(result);
    }

}