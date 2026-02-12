import {ChangeUserEmailUseCase} from "../change_user_email_use_case.js";


export class ChangeEmailService {
    constructor(private readonly changeEmail: ChangeUserEmailUseCase) {}

    executeTx = async (userId: string, newEmail: string) => {
        const user = await this.changeEmail.execute(userId, newEmail);
        return user;
    }

}