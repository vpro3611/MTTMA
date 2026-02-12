import {RegisterUseCase} from "../register_use_case.js";


export class RegisterService {
    constructor(private readonly userReg: RegisterUseCase) {}

    executeTx = async (email: string, password: string) => {
        const registeredUser = await this.userReg.execute(email, password);
        return registeredUser;
    }
}