import {GetAllUsersUseCase} from "../get_all_users_use_case.js";


export class GetAllUsersService {
    constructor(private readonly getAllUsersUC: GetAllUsersUseCase) {}


    async executeTx(actorId: string, page: number, limit: number) {
        const users = await this.getAllUsersUC.execute(actorId, page, limit);
        return users;
    }
}