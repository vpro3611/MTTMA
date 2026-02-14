import {LoginUseCase} from "../login_use_case.js";


export class LoginService {
    constructor(private readonly loginUseCase: LoginUseCase) {}

    executeTx = async (email: string, password: string) => {
        const user = await this.loginUseCase.execute(email, password);
        return user;
    }
}