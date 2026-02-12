import {ChangePasswordUseCase} from "../change_pass_use_case.js";


export class ChangePassService {
    constructor(private readonly changePass: ChangePasswordUseCase) {}

    executeTx = async (userId: string, oldPass: string, newPass: string) => {
        const user = await this.changePass.execute(userId, oldPass, newPass)
        return user;
    }
}